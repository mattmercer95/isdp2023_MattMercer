let currentEmployee;
let allEmployees;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let allOrders = null;
let filteredOrders = [];
let allSites = null;
let orderStatusList = null;

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

    document.querySelector("#returnToDash").addEventListener('click', returnToDash);
    document.querySelector("#ordersTable").addEventListener('click', highlight);
    document.querySelector("#newOrder").addEventListener('click', newOrder);
    document.querySelector("#viewDetails").addEventListener('click', viewDetails);
    document.querySelector("#statusSelect").addEventListener('input', buildTable);
    //unhide action buttons depending on user permission
    checkPermissions();
    await getOrderStatusList();
    await getAllOrders();
    await getAllSites();
};

async function getOrderStatusList(){
    let url = `../TransactionService/orderStatusList`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    orderStatusList = await resp.json();
    orderStatusList.push("ALL");
    orderStatusList.push("ALL OPEN");
    orderStatusList.sort();
    let statusSelector = document.querySelector("#statusSelect");
    orderStatusList.forEach((status) =>{
        const optionEle = document.createElement("option");
        optionEle.value = status;
        optionEle.innerHTML = status;
        if(status === "ALL OPEN"){
            optionEle.selected = true;
        }
        statusSelector.appendChild(optionEle);
    });
}

function viewDetails(){
    let selectedOrder = getSelectedOrder();
    sessionStorage.setItem("currentOrderID", selectedOrder.transactionID);
    window.location.href = "CreateOrder.html";
}

//Helper function to get the selected order from the  table
function getSelectedOrder(){
    let table = document.querySelector("#ordersTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 0; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = filteredOrders[i];
        }
    }
    return selectedItem;
}

//Event for loading all the sites into the admin site select
async function getAllSites(){
    if(currentEmployee.positionID === 99999999){
        //unhide the select panel
        let panel = document.querySelector("#adminSitePanel");
        panel.hidden = false;
        //get the select element
        let select = document.querySelector("#siteSelect");
        select.innerHTML = "";
        //make API call to get all sites
        let url = `../SiteService/retailLocations`;
        let resp = await fetch(url, {
            method: 'GET'
        });
        allSites = await resp.json();
        //load all sites into the select input
        allSites.forEach((site)=>{
            let optionEle = document.createElement("option");
            optionEle.value = site.siteID;
            optionEle.innerHTML = site.name;
            optionEle.id = site.name;
            select.appendChild(optionEle);
        });
    }
}

//Event for clicking new order button. Checks if new order can be created. 
async function newOrder(){
    //get the site of origin
    let origin = (currentEmployee.positionID === 99999999) ? 
        document.querySelector("#siteSelect").value : currentEmployee.siteID;
    //check if store order is open
    let url = `../TransactionService/isOrderOpen`;
    let resp = await fetch(url, {
        method: 'POST',
        body: origin
    });
    let isOrderOpen = await resp.json();
    if(isOrderOpen){
        let emergencyOrder = confirm("Warning: A store order is already open for the current location. Create an Emergency Order?");
        if(emergencyOrder){
            //Create a new emergency order
            await newEmergencyOrder(origin);
        }
    }
    else {
        let newOrder = confirm(`Create a new store order?`);
        if(newOrder){
            await createNewOrder(origin);
        }
    }
}

//Makes API call to create a new order entry and redirects to the create order page.
async function createNewOrder(origin){
    let url = `../TransactionService/newStoreOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: origin
    });
    let newOrderID = await resp.json();
    if(newOrder > 0){
        //successful order creation
        sessionStorage.setItem("currentOrderID", newOrderID);
        window.location.href = "CreateOrder.html";
    }
    else {
        alert("Error creating new order, check server status");
    }
}

async function newEmergencyOrder(origin){
    //check if emergency order is open
    let url = `../TransactionService/isEmergencyOrderOpen`;
    let resp = await fetch(url, {
        method: 'POST',
        body: origin
    });
    let isEmergencyOrderOpen = await resp.json();
}

//Makes API call to get all orders and stores them in the global variable
async function getAllOrders(){
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    allOrders = await resp.json();
    buildTable();
}

//helper function to filter the order list
function filterByStatus(filter){
    console.log(filter);
    let filteredList = [];
    allOrders.forEach((order) =>{
        switch(filter){
            case "ALL":
                filteredList.push(order);
                break;
            case "ALL OPEN":
                if(order.status !== "CLOSED" && order.status !== "CANCELLED"){
                    filteredList.push(order);
                }
                break;
            default:
                if(order.status === filter){
                    filteredList.push(order);
                }
                break;
        }
    });
    return filteredList;
}

//builds the order table
function buildTable(){
    let filtered = [];
    let filter = document.querySelector("#statusSelect").value.trim();
    filtered = filterByStatus(filter);
    const table = document.querySelector("#ordersTable");
    table.innerHTML = "";
    filtered.forEach((order)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const boldID = document.createElement("b");
        boldID.innerHTML = order.transactionID;
        idCell.appendChild(boldID);
        row.appendChild(idCell);
        const locationCell = document.createElement("td");
        locationCell.innerHTML = order.destination;
        row.appendChild(locationCell);
        const typeCell = document.createElement("td");
        const typePill = document.createElement("span");
        typePill.classList.add("badge");
        if(order.emergencyOrder){
            typePill.classList.add("text-bg-danger");
            typePill.innerHTML = "Emergency";
        }
        else {
            typePill.classList.add("text-bg-primary");
            typePill.innerHTML = "Regular";
        }
        typeCell.appendChild(typePill);
        row.appendChild(typeCell);
        const statusCell = document.createElement("td");
        const statusPill = document.createElement("span");
        statusPill.classList.add("badge");
        if(order.status === "NEW"){
            statusPill.classList.add("text-bg-success");
        }
        else if(order.status === "CLOSED" || order.status === "CANCELLED"){
            statusPill.classList.add("text-bg-secondary");
        }
        else if(order.status === "SUBMITTED"){
            statusPill.classList.add("text-bg-warning");
        }
        else {
            statusPill.classList.add("text-bg-info");
        }
        statusPill.innerHTML = order.status;
        statusCell.appendChild(statusPill);
        row.appendChild(statusCell);
        const itemsCell = document.createElement("td");
        itemsCell.innerHTML = order.quantity;
        row.appendChild(itemsCell);
        const weightCell = document.createElement("td");
        weightCell.innerHTML = order.totalWeight;
        row.appendChild(weightCell);
        const deliveryDateCell = document.createElement("td");
        deliveryDateCell.innerHTML = order.shipDate;
        row.appendChild(deliveryDateCell);
        //add row to table
        table.appendChild(row);
    });
    filteredOrders = filtered;
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    //TODO: enable buttons based on permission
}

function returnToDash(){
    window.location.href = "../dashboard.html";
}

function highlight(e){
    let trs = document.querySelectorAll("tr");
    console.log(trs);
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#viewDetails").disabled = false;
    }
    else {
        document.querySelector("#viewDetails").disabled = true;
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


