

let currentEmployee;
let allEmployees;

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
    //unhide action buttons depending on user permission
    checkPermissions();
    await getCurrentOrder();
    await getAllItems();
};

async function saveOrder(){
    //save total items, weight, and cart
    currentOrder.quantity = +document.querySelector("#totalQtyOrdered").value;
    currentOrder.totalWeight = +document.querySelector("#totalWeight").value;
    currentOrder.items = cart;
    console.log(currentOrder);
    let url = `../TransactionService/`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(currentOrder)
    });
    result = await resp.text();
    console.log(result);
}

async function getCurrentOrder(){
    let orderID = sessionStorage.getItem("currentOrderID");
    let url = `../TransactionService/getDetails`;
    let resp = await fetch(url, {
        method: 'POST',
        body: orderID
    });
    currentOrder = await resp.json();
    console.log(currentOrder);
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
    console.log(selectedItem);
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
        console.log(caseNum);
        cart[cartIndex].caseQuantityOrdered = caseNum;
        cartIndex++;
        let itemQty = +qtyNum.innerHTML;
        totalQty += itemQty;
        let wNum = +cells[2].innerHTML;
        totalWeight += wNum;
    });
    document.querySelector("#totalQtyOrdered").value = totalQty;
    document.querySelector("#totalWeight").value = totalWeight;
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
    let url = `../InventoryService`;
    let resp = await fetch(url, {
        method: 'POST',
        body: currentOrder.siteIDTo
    });
    allItems = await resp.json();
    console.log(allItems);
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
    //TODO: enable buttons based on permission
    console.log(permissions);
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
