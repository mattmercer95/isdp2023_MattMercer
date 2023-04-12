let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let orders;

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
    document.querySelector("#returnToReports").addEventListener('click',()=>{
        window.location.href="CreateReport.html";
    });
    document.querySelector("#viewReport").addEventListener('click', viewReport);
    buildTable();
};

async function loadStoreOrder(selectedOrder){
    let orderItems = await getOrderItems(selectedOrder.transactionID);
    selectedOrder.items = orderItems;
    sessionStorage.setItem("currentReport", JSON.stringify(selectedOrder));
    window.location.href = "ViewReport.html";
}

async function getOrderItems(id){
    console.log(id);
    let url = `../TransactionService/getItems`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(id)
    });
    return await resp.json();
}

async function loadSupplierOrder(selectedOrder){
    let supplierContacts = await getSupplierContacts(selectedOrder.transactionID);
    let report = {
        orderID: selectedOrder.transactionID,
        order: selectedOrder,
        contacts: supplierContacts
    }
    sessionStorage.setItem("currentReport", JSON.stringify(report));
    window.location.href = "ViewReport.html";
}

async function getSupplierContacts(id){
    let url = `../SupplierService/contactsByTxn`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(id)
    });
    return await resp.json();
}

async function viewReport(){
    let selectedOrder = getSelectedOrder();
    console.log(selectedOrder);
    let type = sessionStorage.getItem("reportType");
    switch(type){
        case "Store Order":
            await loadStoreOrder(selectedOrder);
            break;
        case "Shipping Receipt":
            await loadStoreOrder(selectedOrder);
            break;
        case "Supplier Order":
            await loadSupplierOrder(selectedOrder);
            break;
        default:
            break;
    }
}

function getSelectedOrder(){
    let table = document.querySelector("#ordersTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 0; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = orders[i];
        }
    }
    return selectedItem;
}

function highlight(e){
    let trs = document.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#viewReport").disabled = false;
        
    }
    else {
        document.querySelector("#viewReport").disabled = true;
    }
}

function buildTable(){
    orders = JSON.parse(sessionStorage.getItem("currentReport"));
    let table = document.querySelector("#ordersTable");
    table.addEventListener('click', highlight);
    console.log(orders);
    orders.forEach((order)=>{
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
        deliveryDateCell.innerHTML = order.createdDate;
        row.appendChild(deliveryDateCell);
        //add row to table
        table.appendChild(row);
    });
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
