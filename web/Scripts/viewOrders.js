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
    document.querySelector("#newSupplierOrder").addEventListener('click', newSupplierOrder);
    document.querySelector("#newEmergency").addEventListener('click', newEmergency);
    document.querySelector("#viewDetails").addEventListener('click', viewDetails);
    document.querySelector("#statusSelect").addEventListener('input', buildTable);
    document.querySelector("#cancelOrder").addEventListener('click', cancelOrder);
    document.querySelector("#processOnlineOrder").addEventListener('click', ()=>{
        let selected = getSelectedOrder();
        sessionStorage.setItem("currentOrderID", selected.transactionID);
        window.location.href = "ProcessOnlineOrder.html";
    });
    document.querySelector("#processOrder").addEventListener('click', ()=>{
        let selected = getSelectedOrder();
        sessionStorage.setItem("currentOrderID", selected.transactionID);
        window.location.href = "ProcessOrder.html";
    });
    document.querySelector("#fulfillOrder").addEventListener('click', ()=>{
        let selected = getSelectedOrder();
        sessionStorage.setItem("currentOrderID", selected.transactionID);
        window.location.href = "FulfillOrder.html";
    });
    document.querySelector("#receiveDelivery").addEventListener('click', ()=>{
        let selected = getSelectedOrder();
        sessionStorage.setItem("currentOrderID", selected.transactionID);
        window.location.href = "AcceptStoreOrder.html";
    });
    //unhide action buttons depending on user permission
    checkPermissions();
    await getOrderStatusList();
    await getAllOrders();
    await getAllSites();
};

async function newSupplierOrder(){
    //check if supplier order is open
    let url = `../TransactionService/isSupplierOrderOpen`;
    let resp = await fetch(url, {
        method: 'POST',
        body: origin
    });
    let isSupplierOrderOpen = await resp.json();
    if(isSupplierOrderOpen){
        alert("Error: Cannot create new supplier order while one is currently open.");
    }
    else {
        let newSupplierOrder = confirm(`Create a new supplier order?`);
        if(newSupplierOrder){
            await createNewSupplierOrder();
        }
    }
}

async function createNewSupplierOrder(){
    let url = `../TransactionService/newSupplierOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: 1
    });
    let newOrderID = await resp.json();
    if(newOrderID > 0){
        //successful order creation
        sessionStorage.setItem("currentOrderID", newOrderID);
        await logTransaction(newOrderID, -1, 1);
        window.location.href = "CreateOrder.html";
    }
    else {
        alert("Error creating new order, check server status");
    }
}

async function cancelOrder(){
    console.log("hello");
    let selected = getSelectedOrder();
    let cancelConfirm = confirm("Cancel Order #" + selected.transactionID + "?");
    if(cancelConfirm){
        let url = `../TransactionService/cancelOrder`;
        let resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(selected)
        });
        let result = await resp.json();
        if(result){
            alert("Order successfully cancelled");
            window.location.href = "ViewOrders.html";
        }
        else {
            alert("Something went wrong, please check server");
        }
    }
}

async function newEmergency(){
    //get the site of origin
    let origin = (currentEmployee.positionID === 99999999) ? 
        document.querySelector("#siteSelect").value : currentEmployee.siteID;
    await newEmergencyOrder(origin);
}

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
        let panel = document.querySelector("#adminSiteSelect");
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
            if(site.siteID !== 2){
                let optionEle = document.createElement("option");
                optionEle.value = site.siteID;
                optionEle.innerHTML = site.name;
                optionEle.id = site.name;
                select.appendChild(optionEle);
            }
            
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
            await createNewOrder(origin, false);
        }
    }
}

async function logTransaction(orderID, emergencyOrder, origin){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let txnType;
    if(emergencyOrder === -1){
        txnType = "Supplier Order";
    }
    else {
        txnType = (emergencyOrder) ? 'Emergency' : 'Regular'
    }
    today = `${yyyy}-${mm}-${dd}`;
    let obj = {
        txnID: orderID,
        txnType: txnType,
        status: "NEW",
        txnDate: today,
        siteID: +origin,
        employeeID: currentEmployee.employeeID
    }
    console.log(obj);
    let url = `../AuditService/new`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    console.log(await resp.text());
    
}

//Makes API call to create a new order entry and redirects to the create order page.
async function createNewOrder(origin, emergency){
    let url = `../TransactionService/${(emergency) ? "newEmergencyStoreOrder" : "newStoreOrder"}`;
    let resp = await fetch(url, {
        method: 'POST',
        body: origin
    });
    let newOrderID = await resp.json();
    if(newOrderID > 0){
        //successful order creation
        //submit audit log
        await logTransaction(newOrderID, emergency, origin);
        sessionStorage.setItem("currentOrderID", newOrderID);
        window.location.href = "CreateOrder.html";
    }
    else {
        alert("Error creating new order, check server status");
    }
}

async function newEmergencyOrder(origin){
    let newOrder = confirm(`Create a new emergency store order?`);
    if(newOrder){
        //check if emergency order is open
        let url = `../TransactionService/isEmergencyOrderOpen`;
        let resp = await fetch(url, {
            method: 'POST',
            body: origin
        });
        let isEmergencyOrderOpen = await resp.json();
        if(isEmergencyOrderOpen){
            alert("Error: A New Emergency Order is already open");
        }
        else {
            await createNewOrder(origin, true);
        }
    }
}

//Makes API call to get all orders and stores them in the global variable
async function getAllOrders(){
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    orders = await resp.json();
    if(currentEmployee.positionID === 3){
        allOrders = [];
        orders.forEach((order)=>{
            if(currentEmployee.siteID === order.siteIDTo || currentEmployee.siteID === order.siteIDFrom){
                allOrders.push(order);
            }
        });
    }
    else {
        allOrders = orders;
    }
    buildTable();
}

//helper function to filter the order list
function filterByStatus(filter){
    let filteredList = [];
    allOrders.forEach((order) =>{
        switch(filter){
            case "ALL":
                filteredList.push(order);
                break;
            case "ALL OPEN":
                if(order.status !== "CLOSED" && order.status !== "CANCELLED" && order.status !== "REJECTED"){
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

function disableButtons(){
    document.querySelector("#viewDetails").disabled = true;
    document.querySelector("#processOrder").disabled = true;
    document.querySelector("#fulfillOrder").disabled = true;
    document.querySelector("#receiveDelivery").disabled = true;
}

//builds the order table
function buildTable(){
    disableButtons();
    let filtered = [];
    let filter = document.querySelector("#statusSelect").value.trim();
    filtered = filterByStatus(filter);
    const table = document.querySelector("#ordersTable");
    table.innerHTML = "";
    filtered.sort((a,b)=>{
        //Compares based on # of days, with a year rounded down to 360 (12 x 30) days
        let aPieces = a.shipDate.split("-");
        let aYear = +aPieces[0];
        let aMonth = parseInt(aPieces[1]);
        let aDay = parseInt(aPieces[2]);
        
        let bPieces = b.shipDate.split("-");
        let bYear = +bPieces[0];
        let bMonth = parseInt(bPieces[1]);
        let bDay = parseInt(bPieces[2]);
        
        let aValue = aYear * 360 + aMonth * 30 + aDay;
        let bValue = bYear * 360 + bMonth * 30 + bDay;
        
        return aValue - bValue;
    });
    
    //counter to track the first element
    let c = 0;
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
        const typePill = document.createElement("b");
        if(order.emergencyDelivery === true){
            typePill.style.color = "red";
            typePill.innerHTML = "Emergency";
        }
        else if(order.transactionType === "Back Order"){
            typePill.style.color = "blue";
            typePill.innerHTML = order.transactionType;
        }
        else if(order.transactionType === "Return"){
            typePill.innerHTML = "Return";
        }
        else if(order.transactionType === "Loss"){
            typePill.innerHTML = "Loss";
        }
        else if(order.transactionType === "Damage"){
            typePill.innerHTML = "Damage";
        }
        else if(order.transactionType === "Supplier Order"){
            typePill.innerHTML = "Supplier Order";
        }
        else {
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
        else if(order.status === "CLOSED" || order.status === "CANCELLED" || order.status === "REJECTED"){
            statusPill.classList.add("text-bg-secondary");
        }
        else if(order.status === "SUBMITTED"){
            statusPill.classList.add("text-bg-warning");
        }
        else if(order.status === "SUBMITTED"){
            statusPill.classList.add("text-bg-warning");
        }
        else if(order.status === "BACKORDER"){
            statusPill.classList.add("text-bg-dark");
        }
        else {
            statusPill.classList.add("text-bg-primary");
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
        
        if(c === 0 && filtered.length > 0){
            row.classList.add("highlighted");
            document.querySelector("#viewDetails").disabled = false;
            let firstOrderStatus = filtered[0].status;
            switch(firstOrderStatus){
                case "SUBMITTED":
                    document.querySelector("#processOrder").disabled = false;
                    break;
                case "RECEIVED":
                    document.querySelector("#fulfillOrder").disabled = false;
                    break;
                case "DELIVERED":
                    document.querySelector("#receiveDelivery").disabled = false;
                    break;
                default:
                    break;
            }
        }
        //add row to table
        table.appendChild(row);
        c++;
    });
    filteredOrders = filtered;
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    permissions.forEach((permission)=>{
        if(permission === "CREATESTOREORDER"){
            document.querySelector("#newOrder").hidden = false;
            document.querySelector("#newEmergency").hidden = false;
        }
        if(permission === "RECEIVESTOREORDER"){
            document.querySelector("#processOrder").hidden = false;
        }
        if(permission === "ACCEPTSTOREORDER"){
            document.querySelector("#receiveDelivery").hidden = false;
            document.querySelector("#processOnlineOrder").hidden = false;
        }
        if(permission === "FULFILSTOREORDER"){
            document.querySelector("#fulfillOrder").hidden = false;
        }
        if(permission === "MODIFYRECORD"){
            document.querySelector("#cancelOrder").hidden = false;
        }
        if(permission === "CREATESUPPLIERORDER"){
            document.querySelector("#newSupplierOrder").hidden = false;
        }
    });
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
        document.querySelector("#viewDetails").disabled = false;
        let selected = getSelectedOrder();
        if(selected.status === "SUBMITTED" || selected.status === "BACKORDER"){
            if(selected.transactionType !== "Supplier Order"){
                document.querySelector("#processOrder").disabled = false;
                document.querySelector("#fulfillOrder").disabled = true;               
            }
            else {
                document.querySelector("#processOrder").disabled = true;
            }
        }
        else if(selected.status === "RECEIVED"){
            document.querySelector("#fulfillOrder").disabled = false;
            document.querySelector("#processOrder").disabled = true;
        }
        else {
            document.querySelector("#processOrder").disabled = true;
            document.querySelector("#fulfillOrder").disabled = true;
        }
        if(selected.status === "DELIVERED"){
            document.querySelector("#receiveDelivery").disabled = false;
        }
        else {
            document.querySelector("#receiveDelivery").disabled = true;
        }
        if(selected.destination === "Curbside" && selected.status === "PROCESSING"){
            document.querySelector("#processOnlineOrder").disabled = false;
        }
        else {
            document.querySelector("#processOnlineOrder").disabled = true;
        }
        let openOrder = selected.status === "NEW" || selected.status === "SUBMITTED" || selected.status === "RECEIVED" || selected.status === "PROCESSING" || selected.status === "BACKORDER";
        if(openOrder){
            document.querySelector("#cancelOrder").disabled = false;
        }
        else {
            document.querySelector("#cancelOrder").disabled = true;
        }
    }
    else {
        disableButtons();
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


