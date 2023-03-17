let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let currentOrder = null;
let allItems = null;
let searchResults = null;
let backorder = null;
let discrepancyFlag = false;
let warehouseInventory = [];
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
    document.querySelector("#createNewBackOrder").addEventListener('click', createNewBackOrder);
    document.querySelector("#addToBackOrder").addEventListener('click', populateModal);
    document.querySelector("#boNumCasesToAdd").addEventListener('input', adjustQuantities);
    document.querySelector("#saveChanges").addEventListener('click', saveChanges);
    document.querySelector("#approveOrder").addEventListener('click', approveOrder);
    document.querySelector("#rejectOrder").addEventListener('click', rejectOrder);
    await getCurrentOrder();
};

async function logTransaction(status){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = `${yyyy}-${mm}-${dd}`;
    let obj = {
        txnID: currentOrder.transactionID,
        txnType: (currentOrder.emergencyDelivery) ? 'Emergency' : 'Regular',
        status: status,
        txnDate: today,
        siteID: currentOrder.siteIDTo,
        employeeID: currentEmployee.employeeID
    }
    let url = (status === "RECEIVED") ? `../AuditService/received` : `../AuditService/rejected`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    console.log(await resp.text());
}

async function rejectOrder(){
    let confirmReject = confirm(`Confirm rejection of order #${currentOrder.transactionID}`);
    if(!confirmReject){
        return;
    }
    currentOrder.status = "REJECTED"
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(currentOrder)
    });
    let success = await resp.json();
    if(success){
        alert("Successfully Rejected Order");
        await logTransaction("REJECTED");
        window.location.href = "ViewOrders.html";
    }
}

async function approveOrder(){
    let confirmApprove = confirm(`Confirm receival of order #${currentOrder.transactionID}`);
    if(!confirmApprove){
        return;
    }
    currentOrder.status = "RECEIVED"
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(currentOrder)
    });
    let success = await resp.json();
    if(success){
        alert("Successfully Received Order");
        await logTransaction("RECEIVED");
        window.location.href = "ViewOrders.html";
    }
}

//saves the changes made to the back order
async function saveChanges() {
    let confirmSave = confirm("Add items to back order?");
    if (!confirmSave) {
        return;
    }
    let casesOrdered = +document.querySelector("#boNumCasesToAdd").value;
    let itemID = getSelectedOrderItem().itemID;
    let temp;
    currentOrder.items.forEach((item) => {
        if (item.itemID === itemID) {
            item.caseQuantityOrdered = item.caseQuantityOrdered - casesOrdered;
            temp = JSON.parse(JSON.stringify(item));
        }
    });

    if (backorder.items.length === 0) {
        temp.caseQuantityOrdered = casesOrdered;
        temp.txnID = backorder.transactionID;
        backorder.items.push(temp);
    } else {
        let notInList = true;
        backorder.items.forEach((item) => {
            if (item.itemID === itemID) {
                item.caseQuantityOrdered += casesOrdered;
                notInList = false;
            }
        });
        if (notInList) {
            temp.caseQuantityOrdered = casesOrdered;
            temp.txnID = backorder.transactionID;
            backorder.items.push(temp);
        }
    }
    //update both orders in database
    let success = await updateOrders(currentOrder, backorder);
    if(success){
        alert("Items successfully added to back order");
        window.location.href = "ProcessOrder.html";
    }
}

async function updateOrders(current, bo){
    let url = `../TransactionService/`;
    let resp1 = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(current)
    });
    let s1 = await resp1.json();
    let resp2 = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(bo)
    });
    return s1;
}

//adjusts the discrepancy when the up down is adjusted
function adjustQuantities() {
    //get values
    let selectedItem = getSelectedOrderItem();
    let numCasesToAddInput = document.querySelector("#boNumCasesToAdd");
    let discrepancyInput = document.querySelector("#boDiscrepancy");

    let caseSize = selectedItem.caseSize;
    let numCasesToAdd = numCasesToAddInput.value;
    let numItemsOrdered = document.querySelector("#boNumItemsOrdered").value;
    let numItemsAvailable = document.querySelector("#boNumItemsAvailable").value;
    let discrepancy = numItemsAvailable - numItemsOrdered;

    discrepancy = +discrepancy + (caseSize * numCasesToAdd);
    discrepancyInput.value = discrepancy;

    if (discrepancy < 0) {
        discrepancyInput.style.color = "red";
    } else {
        discrepancyInput.style.color = "green";
    }
}

function populateModal() {
    let selectedItem = getSelectedOrderItem();
    document.querySelector("#boNumCasesToAdd").value = 1;
    document.querySelector("#boItemID").value = selectedItem.itemID;
    document.querySelector("#boItemName").value = selectedItem.name;
    document.querySelector("#boCaseSize").value = selectedItem.caseSize;
    let numItemsOrdered = selectedItem.caseSize * selectedItem.caseQuantityOrdered;
    document.querySelector("#boNumItemsOrdered").value = numItemsOrdered;
    let numItemsAvailable = +document.querySelector("#available" + selectedItem.itemID).innerHTML;
    document.querySelector("#boNumItemsAvailable").value = numItemsAvailable;
    let discrepancy = numItemsAvailable - numItemsOrdered;
    let discrepEle = document.querySelector("#boDiscrepancy");
    discrepEle.value = discrepancy;
    if (discrepancy < 0) {
        discrepEle.style.color = "red";
    } else {
        discrepEle.style.color = "green";
    }

    adjustQuantities();
}

//Helper function to get the selected order item from the order table
function getSelectedOrderItem() {
    let table = document.querySelector("#orderTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for (let i = 0; i < rows.length; i++) {
        row = rows[i];
        if (row.classList.contains("highlighted")) {
            selectedItem = cart[i];
        }
    }
    return selectedItem;
}

async function createNewBackOrder() {
    let orderConfirm = confirm("Create a new back order for this retail location?");
    if (!confirm) {
        return;
    }
    let url = `../TransactionService/newBackOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentOrder.siteIDTo
    });
    let temp = await resp.json();
    backorder = (temp.transactionID === 0) ? null : temp;
    if (backorder !== null) {
        alert(`Successfully created back order # ${backorder.transactionID}\n\nDestination: ${backorder.destination}\nShip Date: ${backorder.shipDate}`);
    } else {
        alert("Error creating back order, please check server");
    }
    refreshBackOrderControls();
}

async function getCurrentBackOrder() {
    let url = `../TransactionService/backOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentOrder.siteIDTo
    });
    let temp = await resp.json();
    backorder = (temp.transactionID === 0) ? null : temp;
    refreshBackOrderControls();
}

function refreshBackOrderControls() {
    if (backorder === null) {
        document.querySelector("#createNewBackOrder").hidden = false;
        document.querySelector("#addToBackOrder").hidden = true;
    } else {
        document.querySelector("#createNewBackOrder").hidden = true;
        document.querySelector("#addToBackOrder").hidden = false;
    }
}

async function getWarehouseInventory() {
    let url = `../InventoryService/warehouse`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentOrder.transactionID
    });
    warehouseInventory = await resp.json();
}
async function getCurrentOrder() {
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
    document.querySelector("#totalWeight").value = currentOrder.totalWeight.toFixed(2);

    let typeLabel = document.querySelector("#typeLabel");
    const typeBadge = document.createElement("span");
    typeBadge.classList.add("badge");
    if (currentOrder.emergencyDelivery) {
        typeBadge.classList.add("text-bg-danger");
        typeBadge.innerHTML = "Emergency";
    } else if (currentOrder.status === "BACKORDER") {
        typeBadge.classList.add("bg-dark");
        typeBadge.innerHTML = "BACKORDER";
    } else {
        typeBadge.classList.add("text-bg-primary");
        typeBadge.innerHTML = "Regular";
    }
    typeLabel.appendChild(typeBadge);

    if (currentOrder.status === "SUBMITTED") {
        document.querySelector("#processOrderPanel").hidden = false;
    }
    //load cart
    cart = currentOrder.items;
    //load warehouse inventory 
    await getWarehouseInventory();
    await getCurrentBackOrder();
    checkPermissions();
    buildCart();
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    let createFlag = false;
    permissions.forEach((permission) =>{
        if(permission === "RECEIVESTOREORDER"){
            createFlag = true;
        }
    });
    let submitButton = document.querySelector("#orderSubmit");
    if(createFlag){
        document.querySelector("#processOrderPanel").hidden = false;
    }
    if(currentOrder.status === "NEW"){
        submitButton.disabled = false;
    }
}
function buildCart() {
    const table = document.querySelector("#orderTable");
    table.innerHTML = "";
    indexCounter = 0;
    cart.forEach((item) => {
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = item.itemID;
        row.appendChild(idCell);
        const nameCell = document.createElement("td");
        nameCell.innerHTML = item.name;
        row.appendChild(nameCell);
        const weightCell = document.createElement("td");
        weightCell.innerHTML = (item.weight * item.caseQuantityOrdered * item.caseSize).toFixed(2);
        weightCell.id = `weight${item.itemID}`;
        row.appendChild(weightCell);
        const qtyOrderedCell = document.createElement("td");
        qtyOrderedCell.innerHTML = item.caseQuantityOrdered;
        row.appendChild(qtyOrderedCell);
        const caseBackOrderCell = document.createElement("td");
        if (backorder === null || backorder.items.length === 0) {
            caseBackOrderCell.innerHTML = 0;
        } else {
            let temp = 0;
            backorder.items.forEach((x) => {
                if (x.itemID === item.itemID) {
                    temp = x.caseQuantityOrdered;
                }
            });
            caseBackOrderCell.innerHTML = temp;
        }
        row.appendChild(caseBackOrderCell);
        const caseSizeCell = document.createElement("td");
        caseSizeCell.innerHTML = item.caseSize;
        row.appendChild(caseSizeCell);
        const itemsOrderedCell = document.createElement("td");
        itemsOrderedCell.id = "qty" + item.itemID;
        let numItemsOrdered = item.caseSize * item.caseQuantityOrdered;
        itemsOrderedCell.innerHTML = numItemsOrdered;
        row.appendChild(itemsOrderedCell);
        const qtyCell = document.createElement("td");
        let numItemsAvailable = warehouseInventory[indexCounter].itemQuantityOnHand;
        qtyCell.innerHTML = numItemsAvailable;
        qtyCell.id = "available" + item.itemID;
        row.appendChild(qtyCell);
        const discrepencyCell = document.createElement("td");
        discrepencyCell.id = `discrepency${item.itemID}`;
        let discrepancy = numItemsAvailable - numItemsOrdered;
        if (discrepancy < 0) {
            discrepancyFlag = true;
            const discrepancyBadge = document.createElement("span");
            discrepancyBadge.classList.add("badge", "text-bg-danger");
            discrepancyBadge.innerHTML = discrepancy;
            discrepencyCell.appendChild(discrepancyBadge);
        } else {
            discrepencyCell.innerHTML = "-";
        }
        row.appendChild(discrepencyCell);

        //add row to table
        table.appendChild(row);
        indexCounter++;
    });
    if(discrepancyFlag){
        document.querySelector("#approveOrder").disabled = true;
        document.querySelector("#discrepancyAlert").hidden = false;
    }
}

function orderHighlight(e) {
    const table = document.querySelector("#orderTable");
    let trs = table.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if (target.tagName === "TR") {
        target.classList.add("highlighted");
        let cells = target.querySelectorAll("td");
        let itemWithDiscrepancy = cells[cells.length - 1].firstChild.tagName === "SPAN";
        if (itemWithDiscrepancy) {
            document.querySelector("#addToBackOrder").disabled = false;
        } else {
            document.querySelector("#addToBackOrder").disabled = true;
        }
    } else {
        document.querySelector("#addToBackOrder").disabled = true;
    }
}

function resetIdleTimeout() {
    //clears current timeout
    if (idleTimeout)
        clearTimeout(idleTimeout);
    //set new timeout which will redirect after x amount of minutes
    idleTimeout = setTimeout(logout, idleDurationMins * 60 * 1000);
}

//removes current employee from session storage and redirects user to sign-in page
async function logout() {
    let url = `../LogOutService/logout`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentEmployee)
    });
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "../index.html";
}
