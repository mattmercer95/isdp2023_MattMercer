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

    document.querySelector("#itemsTable").addEventListener('click', itemHighlight);
    document.querySelector("#orderTable").addEventListener('click', orderHighlight);
    document.querySelector("#itemSearch").addEventListener('input', itemSearch);
    document.querySelector("#removeItem").addEventListener('click', removeItem);
    document.querySelector("#orderSave").addEventListener('click', saveOrder);
    document.querySelector("#add").addEventListener('click', addItem);
    document.querySelector("#orderSubmit").addEventListener('click', submitOrder);
    //unhide action buttons depending on user permission
    
    await getCurrentOrder();
    await getAllItems();
    checkPermissions();
};

async function logTransaction(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = `${yyyy}-${mm}-${dd}`;
    let obj = {
        txnID: currentOrder.transactionID,
        txnType: (currentOrder.emergencyDelivery) ? 'Emergency' : 'Regular',
        status: "SUBMITTED",
        txnDate: today,
        siteID: currentOrder.siteIDTo,
        employeeID: currentEmployee.employeeID
    }
    let url = `../AuditService/new`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    console.log(await resp.text());
    
}

async function submitOrder(){
    //save total items, weight, and cart
    currentOrder.quantity = +document.querySelector("#totalQtyOrdered").value;
    currentOrder.totalWeight = +document.querySelector("#totalWeight").value;
    currentOrder.shipDate = document.querySelector("#shipDate").value;
    currentOrder.items = cart;
    let confirmSubmit = confirm(`Submit Order #${currentOrder.transactionID} for processing?\n\nShip Date: ${currentOrder.shipDate}\nTotal Items: ${currentOrder.quantity}\nTotal Weight: ${currentOrder.totalWeight}`);
    if(!confirmSubmit){
        return;
    }
    if(cart.length === 0){
        alert("Error: Order must contain at least 1 item to be submitted");
        return;
    }
    let url = `../TransactionService/submit`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentOrder)
    });
    result = await resp.text();
    if(result){
        alert(`Order #${currentOrder.transactionID} submitted successfully`);
        logTransaction();
        window.location.href = "ViewOrders.html";
    }
    else {
        alert("Something went wrong submitting order. Please contact admin.");
    }
}

async function saveOrder(){
    //save total items, weight, and cart
    currentOrder.quantity = +document.querySelector("#totalQtyOrdered").value;
    currentOrder.totalWeight = +document.querySelector("#totalWeight").value;
    currentOrder.shipDate = document.querySelector("#shipDate").value;
    currentOrder.items = cart;
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(currentOrder)
    });
    result = await resp.text();
    if(result){
        alert(`Sucessfully saved order #${currentOrder.transactionID}`);
    }
    else {
        alert("Something went wrong saving order. Check Server.");
    }
}

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
    document.querySelector("#totalWeight").value = currentOrder.totalWeight.toFixed(2);
    
    let typeLabel = document.querySelector("#typeLabel");
    const typeBadge = document.createElement("span");
    typeBadge.classList.add("badge");
    if(currentOrder.emergencyDelivery){
        typeBadge.classList.add("text-bg-danger");
        typeBadge.innerHTML = "Emergency";
    }
    else if(currentOrder.transactionType === "Back Order"){
        typeBadge.classList.add("bg-dark");
        typeBadge.innerHTML = currentOrder.transactionType;
    }
    else {
        typeBadge.classList.add("text-bg-primary");
        typeBadge.innerHTML = "Regular";
    }
    typeLabel.appendChild(typeBadge);
   
    //load cart
    cart = currentOrder.items;
    buildCart();
}

//removes an item from the order and returns it to the item list
function removeItem(){
    //get selected item to remove
    let itemToRemove = getSelectedOrderItem();
    //remove item from cart
    let index;
    let counter = 0;
    cart.forEach((item) =>{
       if(item.itemID === itemToRemove.itemID){
           index = counter;
       } 
       counter++;
    });
    cart.splice(index, 1);
    //add item to allItems
    allItems.push(itemToRemove);
    //sort and rebuild
    allItems.sort((a,b) => a.itemID - b.itemID);
    alert(`Item ${itemToRemove.name} removed from order`);
    //check for emergency order item limit
    if(currentOrder.emergencyDelivery && cart.length < 5){
        document.querySelector("#emergencyItemLimitAlert").hidden = true;
        document.querySelector("#addItemToOrder").disabled = false;
    }
    document.querySelector("#removeItem").disabled = true;
    buildTable(allItems);
    buildCart();
    updatePanel();
}

function addItem(){
    let selectedItem = getSelectedItem();
    //add selecteditem to cart
    selectedItem.caseQuantityOrdered = 1;
    //add transaction id
    selectedItem.txnID = +document.querySelector("#orderID").value;
    cart.push(selectedItem);
    cart.sort((a,b) => a.itemID - b.itemID);
    //adjust total weight and item quantity
    let curQty = +document.querySelector("#totalQtyOrdered").value;
    let curWeight = +document.querySelector("#totalWeight").value;
    let qtyOrdered = selectedItem.caseQuantityOrdered * selectedItem.caseSize;
    curQty += qtyOrdered;
    curWeight += (selectedItem.weight * qtyOrdered);
    document.querySelector("#totalQtyOrdered").value = curQty;
    document.querySelector("#totalWeight").value = curWeight;
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
    //check for emergency order item limit
    if(currentOrder.emergencyDelivery && cart.length >= 5){
        document.querySelector("#emergencyItemLimitAlert").hidden = false;
        document.querySelector("#addItemToOrder").disabled = true;
    }
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
        weightCell.innerHTML = (item.weight * item.caseQuantityOrdered * item.caseSize).toFixed(2);
        weightCell.id = `weight${item.itemID}`;
        row.appendChild(weightCell);
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
        const qtyOrderedCell = document.createElement("td");
        const qtyUpDown = document.createElement("input");
        qtyUpDown.type = "number";
        qtyUpDown.classList.add("form-control");
        qtyUpDown.increment = 1;
        qtyUpDown.min = 1;
        qtyUpDown.id = `cases${item.itemID}`;
        qtyUpDown.value = item.caseQuantityOrdered;
        if(currentOrder.status !== "NEW"){
            qtyUpDown.disabled = true;
        }
        //Changes the quantity of items ordered based on their case size
        qtyUpDown.addEventListener('input', function(){
           //update items ordered
           const cell = document.querySelector("#qty" + item.itemID);
           const casesOrdered = document.querySelector(`#cases${item.itemID}`).value;
           let itemsOrdered = +casesOrdered * +item.caseSize;
           cell.innerHTML = `<b>${itemsOrdered}</b>`;
           //update weight
           const wCell = document.querySelector("#weight" + item.itemID);
           let weight = itemsOrdered * item.weight;;
           wCell.innerHTML = weight;
           //update panel info
           updatePanel();
        });
        qtyOrderedCell.appendChild(qtyUpDown);
        row.appendChild(qtyOrderedCell);
        //add row to table
        table.appendChild(row);
    });
}

//Updates the total quantity of the order in the info panel
function updatePanel(){
    //get table 
    let table = document.querySelector("#orderTable");
    let rows = table.querySelectorAll("tr");
    let totalQty = 0;
    let totalWeight = 0;
    let cartIndex = 0;
    rows.forEach((row) =>{
        let cells = row.querySelectorAll("td");
        let qtyCell = cells[6];
        let qtyNum = qtyCell.querySelector("b");
        let caseCell = cells[7];
        let caseNum = caseCell.querySelector("input").value;
        cart[cartIndex].caseQuantityOrdered = caseNum;
        cartIndex++;
        let itemQty = +qtyNum.innerHTML;
        totalQty += itemQty;
        let wNum = +cells[2].innerHTML;
        totalWeight += wNum;
    });
    document.querySelector("#totalQtyOrdered").value = totalQty;
    document.querySelector("#totalWeight").value = totalWeight.toFixed(2);
}

//Helper function to get the selected order item from the order table
function getSelectedOrderItem(){
    let table = document.querySelector("#orderTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 0; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = cart[i];
        }
    }
    return selectedItem;
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
    let url = `../InventoryService/newOrder`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentOrder.siteIDTo
    });
    allItems = await resp.json();
    searchResults = allItems
    buildTable(searchResults);
}

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

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    let createFlag = false;
    permissions.forEach((permission) =>{
        if(permission === "CREATESTOREORDER"){
            createFlag = true;
        }
    });
    let submitButton = document.querySelector("#orderSubmit");
    if(createFlag && currentOrder.status === "NEW"){
        console.log("has permission");
        document.querySelector("#newOrderPanel").hidden = false;
    }
    if(currentOrder.status === "NEW"){
        submitButton.disabled = false;
    }
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
        document.querySelector("#add").disabled = false;
    }
    else {
        document.querySelector("#add").disabled = true;
    }
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
        document.querySelector("#removeItem").disabled = false;
    }
    else {
        document.querySelector("#removeItem").disabled = true;
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
