

let currentEmployee;
let allEmployees;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";


let allItems = null;
let searchResults = null;
let cart = [];

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
    document.querySelector("#orderTable").addEventListener('click', orderHighlight);
    document.querySelector("#itemSearch").addEventListener('input', itemSearch);
    document.querySelector("#add").addEventListener('click', addItem);
    //unhide action buttons depending on user permission
    checkPermissions();
    await getAllItems();
};

function addItem(){
    let selectedItem = getSelectedItem();
    //add selecteditem to cart
    cart.push(selectedItem);
    buildCart();
    alert(`${selectedItem.name} added to order`);
    //get index of item in allItems to remove it
    let index;
    let counter = 0;
    allItems.forEach((item) =>{
       if(item.itemID === selectedItem.itemID){
           index = counter;
       } 
       counter++;
    });
    //remove item from all items
    allItems.splice(index, 1);
    //rebuild search table
    itemSearch();
    //deactivate add button
    document.querySelector("#add").disabled = true;
}

function buildCart(){
    const table = document.querySelector("#orderTable");
    table.innerHTML = "";
    cart.forEach((item)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = item.itemID;
        row.appendChild(idCell);
        const nameCell = document.createElement("td");
        nameCell.innerHTML = item.name;
        row.appendChild(nameCell);
        const qtyCell = document.createElement("td");
        qtyCell.innerHTML = item.quantity;
        row.appendChild(qtyCell);
        const reorderCell = document.createElement("td");
        reorderCell.innerHTML = item.reorderThreshold;
        row.appendChild(reorderCell);
        const qtyOrderedCell = document.createElement("td");
        qtyOrderedCell.innerHTML = "#";
        row.appendChild(qtyOrderedCell);
        //add row to table
        table.appendChild(row);
    });
}

//Helper function to get the selected item from the add items table
function getSelectedItem(){
    let table = document.querySelector("#itemsTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 1; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = searchResults[i];
        }
    }
    return selectedItem;
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

//Makes API call to get all items and stores them in the global variable
async function getAllItems(){
    let url = `../InventoryService`;
    let resp = await fetch(url, {
        method: 'POST',
        body: 4
    });
    allItems = await resp.json();
    searchResults = allItems
    buildTable(searchResults);
}

//builds the order table
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
        qtyCell.innerHTML = item.quantity;
        row.appendChild(qtyCell);
        const reorderCell = document.createElement("td");
        reorderCell.innerHTML = item.reorderThreshold;
        row.appendChild(reorderCell);
        //add row to table
        table.appendChild(row);
    });
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    //TODO: enable buttons based on permission
    console.log(permissions);
}

function itemHighlight(e){
    console.log(e);
    const table = document.querySelector("#itemsTable");
    let trs = table.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#add").disabled = false;
    }
    else {
        document.querySelector("#add").disabled = true;
    }
}

function orderHighlight(e){
    console.log(e);
    const table = document.querySelector("#orderTable");
    let trs = table.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
    }
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
