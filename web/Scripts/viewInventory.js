let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let allItems = null;
let searchResults = null;

window.onload = async function () {
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

    await getAllItems();
};

//builds the add item table
function buildTable(items){
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
}

//Makes API call to get all items and stores them in the global variable
async function getAllItems(){
    let url = `../InventoryService/newOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentEmployee.siteID
    });
    allItems = await resp.json();
    searchResults = allItems
    buildTable(searchResults);
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
    }
    else {
        //
    }
}

//auto-complete search for add item
function itemSearch(){
    let query = document.querySelector("#itemSearch").value.trim();
    let results = [];
    allItems.forEach((item) => {
        let containsID = item.itemID === +query;
        let containsName = item.name.toUpperCase().includes(query.toUpperCase());
        if(containsID || containsName){
            results.push(item);
        }
    })
    searchResults = results;
    buildTable(searchResults);
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