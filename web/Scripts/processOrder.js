let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let currentOrder = null;
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

    document.querySelector("#orderTable").addEventListener('click', orderHighlight);
    
    await getCurrentOrder();
};

async function getCurrentOrder(){
    let orderID = sessionStorage.getItem("currentOrderID");
    let url = `../TransactionService/getDetails`;
    let resp = await fetch(url, {
        method: 'POST',
        body: orderID
    });
    currentOrder = await resp.json();
    //populate info panel
    document.querySelector("#orderID").value = currentOrder.transactionID;
    document.querySelector("#creationDate").value = currentOrder.createdDate;
    document.querySelector("#originSite").value = currentOrder.origin;
    document.querySelector("#destinationSite").value = currentOrder.destination;
    document.querySelector("#status").value = currentOrder.status;
    document.querySelector("#shipDate").value = currentOrder.shipDate;
    document.querySelector("#deliveryID").value = (currentOrder.deliveryID === 0) ? "N/A" : currentOrder.deliveryID;
    document.querySelector("#totalQtyOrdered").value = currentOrder.quantity;
    document.querySelector("#totalWeight").value = currentOrder.totalWeight;
    
    let typeLabel = document.querySelector("#typeLabel");
    const typeBadge = document.createElement("span");
    typeBadge.classList.add("badge");
    if(currentOrder.emergencyDelivery){
        typeBadge.classList.add("text-bg-danger");
        typeBadge.innerHTML = "Emergency";
    }
    else {
        typeBadge.classList.add("text-bg-primary");
        typeBadge.innerHTML = "Regular";
    }
    typeLabel.appendChild(typeBadge);
    
    if(currentOrder.status === "SUBMITTED"){
        document.querySelector("#processOrderPanel").hidden = false;
    }
    //load cart
    cart = currentOrder.items;
    buildCart();
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
        const weightCell = document.createElement("td");
        weightCell.innerHTML = (item.weight * item.caseQuantityOrdered * item.caseSize);
        weightCell.id = `weight${item.itemID}`;
        row.appendChild(weightCell);
        const qtyOrderedCell = document.createElement("td");
        qtyOrderedCell.innerHTML = item.caseQuantityOrdered;
        row.appendChild(qtyOrderedCell);
        const qtyCell = document.createElement("td");
        qtyCell.innerHTML = item.itemQuantityOnHand;
        row.appendChild(qtyCell);
        const reorderCell = document.createElement("td");
        reorderCell.innerHTML = item.reorderThreshold;
        row.appendChild(reorderCell);
        const caseSizeCell = document.createElement("td");
        caseSizeCell.innerHTML = item.caseSize;
        row.appendChild(caseSizeCell);
        const itemsOrderedCell = document.createElement("td");
        itemsOrderedCell.id = "qty" + item.itemID;
        itemsOrderedCell.innerHTML = `<b>${item.caseSize * item.caseQuantityOrdered}</b>`;
        row.appendChild(itemsOrderedCell);
        
        //add row to table
        table.appendChild(row);
    });
}

function orderHighlight(e){
    const table = document.querySelector("#orderTable");
    let trs = table.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
    }
    else {
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
