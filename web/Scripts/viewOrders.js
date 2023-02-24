let currentEmployee;
let allEmployees;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let allOrders = null;
let allSites = null;
let siteIndex = {};

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
    //unhide action buttons depending on user permission
    checkPermissions();
    await getAllOrders();
    await getAllSites();
};

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
        console.log(allSites);
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

//builds the order table
function buildTable(){
    console.log(allOrders);
    const table = document.querySelector("#ordersTable");
    allOrders.forEach((order)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const locationCell = document.createElement("td");
        locationCell.innerHTML = order.location;
        row.appendChild(locationCell);
        const statusCell = document.createElement("td");
        statusCell.innerHTML = order.status;
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
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
    }
    else {
        //TODO: enable and disable buttons
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


