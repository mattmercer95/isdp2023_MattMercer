let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let allItems = null;
let searchResults = null;
let loader = null;
let currentSite = null;

window.onload = async function () {
    loader = document.querySelector("#loading");
    //set current employee global to the user that logged in
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
    //load name and title on the nav bar
    let nameTitleElement = document.querySelector("#nameTitle");
    let nameTitle = (currentEmployee.employeeID === 1) ? "System Admin" : 
            `${currentEmployee.firstName} ${currentEmployee.lastName}, 
            ${currentEmployee.position}`;
    nameTitleElement.innerHTML = nameTitle + ` - ${currentEmployee.site}`;
    
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);
    //initialize idle timeout
    resetIdleTimeout();

    document.querySelector("#itemsTable").addEventListener('click', itemHighlight);
    document.querySelector("#itemSearch").addEventListener('input', itemSearch);
    document.querySelector("#siteSelect").addEventListener('input', updateSite);
    document.querySelector("#btnEditThreshold").addEventListener('click', editThreshold);
    document.querySelector("#roSaveChanges").addEventListener('click', updateThreshold);
    document.querySelector("#detailsSaveChanges").addEventListener('click', updateDetails);
    document.querySelector("#btnEditItemDetails").addEventListener('click', editDetails);
    
    checkPermissions();
    await getAllItems();
};

async function editDetails(){
    //populate modal
    let selected = getSelectedItem();
    console.log(selected);
    document.querySelector("#detailsActive").checked = selected.active;
    document.querySelector("#detailsName").value = selected.name;
    document.querySelector("#detailsDesc").value = selected.description;
    document.querySelector("#detailsCat").value = selected.category;
    if(typeof selected.notes !== 'undefined'){
        document.querySelector("#detailsNotes").value = selected.notes;
    }
    document.querySelector("#detailsCaseSize").value = selected.caseSize;
    document.querySelector("#detailsWeight").value = selected.weight.toFixed(2);
    document.querySelector("#detailsCost").value = selected.costPrice.toFixed(2);
    document.querySelector("#detailsPrice").value = selected.retailPrice.toFixed(2);
}   

async function updateDetails(){
    let confirmDet = confirm("Save changes to Item Details?");
    if(!confirmDet){
        return;
    }
    //get values
    let selected = getSelectedItem();
    let newName = document.querySelector("#detailsName").value;
    let newNotes = document.querySelector("#detailsNotes").value;
    let newActive = document.querySelector("#detailsActive").checked;
    let newDesc = document.querySelector("#detailsDesc").value;
    let newCat = document.querySelector("#detailsCat").value;
    let newCS = document.querySelector("#detailsCaseSize").value;
    let newWeight = document.querySelector("#detailsWeight").value;
    let newCost = document.querySelector("#detailsCost").value;
    let newPrice = document.querySelector("#detailsPrice").value;
    //recreate an item object for API
    let obj = {
        itemID: selected.itemID,
        name: newName,
        sku: selected.sku,
        description: newDesc,
        category: newCat,
        weight: newWeight,
        costPrice: newCost,
        retailPrice: newPrice,
        supplierID: selected.supplierID,
        active: newActive,
        notes: newNotes,
        caseSize: newCS
    }
    //Make API call
    let url = `../InventoryService/updateItemDetails`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(obj)
    });
    success = await resp.json();
    if(success){
        alert("Item Details successfully updated");
        let modal = document.querySelector("#editDetailsModal   ");
        let modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide()
        await updateSite();
    }
    else {
        alert("Something went wrong, please check server");
    }
}

async function updateThreshold(){
    let confirmRO = confirm("Save changes to Reorder Threshold?");
    if(!confirmRO){
        return;
    }
    //get values
    let selected = getSelectedItem();
    let newThreshold = document.querySelector("#roNum").value;
    //recreate an inventory object for API
    let obj = {
        itemID: selected.itemID,
        siteID: selected.siteID,
        quantity: selected.quantity,
        itemLocation: selected.itemLocation,
        reorderThreshold: newThreshold
    }
    //Make API call
    let url = `../InventoryService/updateThreshold`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(obj)
    });
    success = await resp.json();
    if(success){
        alert("Reorder Threshold successfully updated");
        let modal = document.querySelector("#editThresholdModal");
        let modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide()
        await updateSite();
    }
    else {
        alert("Something went wrong, please check server");
    }
    
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    let positionID = currentEmployee.positionID;
    if(positionID === 3 || positionID === 4 || positionID === 99999999){
        document.querySelector("#btnEditThreshold").classList.remove("d-none");
    }
    permissions.forEach((p)=>{
        if(p === "EDITITEM"){
            document.querySelector("#btnEditItemDetails").classList.remove("d-none");
        }
    });
}

async function editThreshold(){
    //populate modal
    let selected = getSelectedItem();
    document.querySelector("#roLocation").innerHTML = selected.siteName;
    document.querySelector("#roItemID").innerHTML = selected.itemID;
    document.querySelector("#roName").innerHTML = selected.name;
    document.querySelector("#roNum").value = selected.reorderThreshold;
}

//Helper function to get the selected item from the add items table
function getSelectedItem(){
    let table = document.querySelector("#itemsTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 0; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = searchResults[i];
        }
    }
    return selectedItem;
}

async function updateSite(){
    let table = document.querySelector("#itemsTable");
    table.hidden = true;
    await displayLoading();
    currentSite = +document.querySelector("#siteSelect").value;
    //disabled edit buttons
    document.querySelector("#btnEditThreshold").disabled = true;
    document.querySelector("#btnEditItemDetails").disabled = true;
    
    let url = currentSite === -1 ? `../InventoryService/allDetailed` : `../InventoryService/detailedBySite`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentSite
    });
    allItems = await resp.json();
    itemSearch();
    await itemSearch();
    await hideLoading();
    table.hidden = false;
}
// showing loading
async function displayLoading() {
    loader.classList.add("display");
    // to stop loading after some time
    setTimeout(() => {
        loader.classList.remove("display");
    }, 5000);
}

// hiding loading 
async function hideLoading() {
    loader.classList.remove("display");
}

//builds the add item table
async function buildTable(items){
    await displayLoading();
    //get search value for highlighting
    let query = document.querySelector("#itemSearch").value;
    const table = document.querySelector("#itemsTable");
    table.innerHTML = "";
    items.forEach((item)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = item.itemID;
        row.appendChild(idCell);
        const siteCell = document.createElement("td");
        siteCell.innerHTML = item.siteName;
        row.appendChild(siteCell);
        const nameCell = document.createElement("td");
        //check for search term highlighting
        if(query !== ""){
            let text = item.name;
            let re = new RegExp(query, "gi");
            let newText = text.replace(re, function(str){
                return "<mark>" + str + "</mark>";
            });
            nameCell.innerHTML = newText;
        }
        else {
            nameCell.innerHTML = item.name;
        }
        row.appendChild(nameCell);
        const descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = item.description;
        row.appendChild(descriptionCell);
        const catCell = document.createElement("td");
        catCell.innerHTML = item.category;
        row.appendChild(catCell);
        const weightCell = document.createElement("td");
        weightCell.innerHTML = item.weight.toFixed(2);
        row.appendChild(weightCell);
        const costCell = document.createElement("td");
        costCell.innerHTML = item.costPrice.toFixed(2);
        row.appendChild(costCell);
        const retailCell = document.createElement("td");
        retailCell.innerHTML = item.retailPrice.toFixed(2);
        row.appendChild(retailCell);
        const qtyCell = document.createElement("td");
        qtyCell.innerHTML = item.itemQuantityOnHand;
        row.appendChild(qtyCell);
        const reorderCell = document.createElement("td");
        reorderCell.innerHTML = item.reorderThreshold;
        row.appendChild(reorderCell);
        const caseSizeCell = document.createElement("td");
        caseSizeCell.innerHTML = item.caseSize;
        row.appendChild(caseSizeCell);
        //add row to table
        table.appendChild(row);
    });
     await hideLoading();
}

//Makes API call to get all items and stores them in the global variable
async function getAllItems(){
    await displayLoading();
    await loadSelector();
    let siteID = currentEmployee.siteID;
    let url = `../InventoryService/detailedBySite`;
    let resp = await fetch(url, {
        method: 'POST',
        body: siteID
    });
    allItems = await resp.json();
    itemSearch();
//    searchResults = allItems
    await hideLoading();
    await buildTable(searchResults);
    
}

async function loadSelector(allItems){
    //get site list
    let url = `../SiteService/`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    allSites = await resp.json();
    populateSiteSelector(allSites);
}

function populateSiteSelector(allSites){
    let selector = document.querySelector("#siteSelect");
    const optionAllEle = document.createElement("option");
    optionAllEle.value = "-1";
    optionAllEle.innerHTML = "All";
    selector.appendChild(optionAllEle);
    currentSite = currentEmployee.siteID;
    allSites.forEach((site)=>{
        const optionEle = document.createElement("option");
        optionEle.value = String(site.siteID);
        optionEle.innerHTML = site.name;
        if(site.siteID === currentSite){
            optionEle.selected = true;
        }
        selector.appendChild(optionEle);
    });
}

function itemHighlight(e){
    const table = document.querySelector("#itemsTable");
    let trs = table.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#btnEditThreshold").disabled = false;
        //make sure button is only enabled for that manager's site
        checkValidSite();
        document.querySelector("#btnEditItemDetails").disabled = false;
    }
    else {
        document.querySelector("#btnEditThreshold").disabled = true;
        document.querySelector("#btnEditItemDetails").disabled = true;
    }
}

function checkValidSite(){
    let positionID = currentEmployee.positionID;
    if(positionID === 3){
        let selectedSite = +document.querySelector("#siteSelect").value;
        if(selectedSite !== currentEmployee.siteID){
            document.querySelector("#btnEditThreshold").disabled = true;
        }
    }
}

//auto-complete search for add item
async function itemSearch(){
    let query = document.querySelector("#itemSearch").value.trim();
    let results = [];
    allItems.forEach((item) => {
        let correctSite = (currentSite === -1) ? true : item.siteID === currentSite;
        let containsID = item.itemID === +query;
        let containsName = item.name.toUpperCase().includes(query.toUpperCase());
        let containsDescription = item.description.toUpperCase().includes(query.toUpperCase());
        let containsTerm = containsID || containsName;
        if(containsTerm && correctSite){
            results.push(item);
        }
    })
    searchResults = results;
    await buildTable(searchResults);
}

function resetIdleTimeout(){
    //clears current timeout
    if(idleTimeout) clearTimeout(idleTimeout);
    //set new timeout which will redirect after x amount of minutes
    idleTimeout = setTimeout(logout, idleDurationMins * 60 * 1000);
}

//removes current employee from session storage and redirects user to sign-in page
async function logout(){
    let url = `../LogOutService/logout`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentEmployee)
    });
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "../index.html";
}