let allLocations = [];
let currentInventory = [];
let searchResults = [];
let cart = [];
let subTotal = 0.0;

//currency formatter
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.onload = async function(){
    await loadAllLocations();
    populateSiteSelector();
    document.querySelector("#siteSelect").addEventListener('input', selectSite);
    await selectSite();
    document.querySelector("#itemSearch").addEventListener('input', itemSearch);
    document.querySelector("#add").addEventListener('click', addItem);
    document.querySelector("#itemsTable").addEventListener('click', itemHighlight);
    resetSubtotal();
};

function updateSubtotal(){
    const table = document.querySelector("#orderTable");
    let rows = table.querySelectorAll("tr");
    subTotal = 0.0
    rows.forEach((row)=>{
        let cells = row.querySelectorAll("td");
        let totalItemPriceCell = cells[6];
        let totalItemPrice = totalItemPriceCell.innerHTML;
        subTotal += Number(totalItemPrice.replace(/[^0-9.-]+/g,""));
    });
    let HST = subTotal * 0.15;
    let total = subTotal + HST;
    document.querySelector("#subTotal").innerHTML = currency.format(+subTotal);
    document.querySelector("#HST").innerHTML = currency.format(+HST);
    document.querySelector("#total").innerHTML = currency.format(+total);
}

function resetSubtotal(){
    document.querySelector("#subTotal").innerHTML = currency.format(0);
    document.querySelector("#HST").innerHTML = currency.format(0);
    document.querySelector("#total").innerHTML = currency.format(0);
}

function buildCart(){
    const table = document.querySelector("#orderTable");
    table.innerHTML = "";
    cart.forEach((item)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.innerHTML = item.name;
        row.appendChild(nameCell);
        const categoryCell = document.createElement("td");
        categoryCell.innerHTML = item.category;
        row.appendChild(categoryCell);
        const descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = item.description;
        row.appendChild(descriptionCell);
        const priceCell = document.createElement("td");
        priceCell.innerHTML = currency.format(item.retailPrice);
        priceCell.id = `price${item.itemID}`;
        row.appendChild(priceCell);
        const qtyonHandCell = document.createElement("td");
        qtyonHandCell.innerHTML = item.itemQuantityOnHand - 1;
        qtyonHandCell.id = `qtyOnHand${item.itemID}`;
        row.appendChild(qtyonHandCell);
        const qtyOrderedCell = document.createElement("td");
        const qtyUpDown = document.createElement("input");
        qtyUpDown.type = "number";
        qtyUpDown.classList.add("form-control");
        qtyUpDown.increment = 1;
        qtyUpDown.min = 1;
        qtyUpDown.id = `qty${item.itemID}`;
        qtyUpDown.value = item.itemQuantity;
        //Changes the quantity of items ordered based on their case size
        qtyUpDown.addEventListener('input', function(){
           //updatetotal price cell
           const pCell = document.querySelector("#totalPrice" + item.itemID);
           let itemsOrderedCell = document.querySelector(`#qty${item.itemID}`);
           let itemsInStock = item.itemQuantityOnHand;
           let itemsOrdered = itemsOrderedCell.value;
           let itemsAvailable = itemsInStock - itemsOrdered
           if(itemsAvailable < 0){
               itemsOrderedCell.value = itemsInStock;
               document.querySelector(`#qtyOnHand${item.itemID}`).innerHTML = 0;
               return
           }
           else {
               document.querySelector(`#qtyOnHand${item.itemID}`).innerHTML = itemsAvailable;
           }
           let totalItemPrice = itemsOrdered * item.retailPrice;
           pCell.innerHTML = currency.format(totalItemPrice);
           //update subtotal
           updateSubtotal();
        });
        qtyOrderedCell.appendChild(qtyUpDown);
        row.appendChild(qtyOrderedCell);
        const totalPriceCell = document.createElement("td");
        totalPriceCell.innerHTML = currency.format(item.retailPrice);
        totalPriceCell.id = `totalPrice${item.itemID}`;
        row.appendChild(totalPriceCell);
        
        //add row to table
        table.appendChild(row);
    });
}

function addItem(){
    let selectedItem = getSelectedItem();
    selectedItem.itemQuantity = 1;
    //add selecteditem to cart
    cart.push(selectedItem);
    cart.sort((a,b) => a.itemID - b.itemID);
    //adjust total weight and item quantity
    subTotal += selectedItem.retailPrice;
    buildCart();
    alert(`${selectedItem.name} added to order`);
    //get index of item in allItems to remove it
    let index;
    let counter = 0;
    currentInventory.forEach((item) =>{
       if(item.itemID === selectedItem.itemID){
           index = counter;
       } 
       counter++;
    });
    //remove item from all items
    currentInventory.splice(index, 1);
    //rebuild search table
    itemSearch();
    //deactivate add button
    document.querySelector("#add").disabled = true;
    updateSubtotal();
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

function searchHighlight(query, term, cell){
    if(query !== ""){
        let text = term;
        let re = new RegExp(query, "gi");
        let newText = text.replace(re, function(str){
            return "<mark>" + str + "</mark>";
        });
        cell.innerHTML = newText;
    }
    else {
        cell.innerHTML = term;
    }
}

//auto-complete search for add item
function itemSearch(){
    let query = document.querySelector("#itemSearch").value.trim();
    let results = [];
    currentInventory.forEach((item) => {
        let containsCategory = item.category.toUpperCase().includes(query.toUpperCase());
        let containsName = item.name.toUpperCase().includes(query.toUpperCase());
        if(containsCategory || containsName){
            results.push(item);
        }
    })
    searchResults = results;
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
        const nameCell = document.createElement("td");
        //check for search term highlighting
        searchHighlight(query, item.name, nameCell);
        row.appendChild(nameCell);
        const categoryCell = document.createElement("td");
        searchHighlight(query, item.category, categoryCell);
        row.appendChild(categoryCell);
        const descriptionCell = document.createElement("td");
        searchHighlight(query, item.description, descriptionCell);
        row.appendChild(descriptionCell);
        const qtyCell = document.createElement("td");
        qtyCell.innerHTML = item.itemQuantityOnHand;
        row.appendChild(qtyCell);
        const priceCell = document.createElement("td");
        priceCell.innerHTML = item.retailPrice;
        row.appendChild(priceCell);
        //add row to table
        table.appendChild(row);
    });
}

async function loadCurrentInventory(siteID){
    let url = "InventoryService/onlineInventory";
    let resp = await fetch(url, {
        method: 'POST',
        body: siteID
    });
    currentInventory = await resp.json();
    searchResults = currentInventory;
    buildTable(searchResults);
}

async function selectSite(){
    let siteID = document.querySelector("#siteSelect").value;
    allLocations.forEach((site)=>{
        if(+siteID === +site.siteID){
            let addressEle = document.querySelector("#address");
            addressEle.value = site.address;
        }
    });
    await loadCurrentInventory(+siteID);
    document.querySelector("#orderTable").innerHTML = "";
    resetSubtotal();
    cart = [];
}

function populateSiteSelector(){
    let siteSelector = document.querySelector("#siteSelect");
    allLocations.forEach((site) => {
        const optionEle = document.createElement("option");
        optionEle.value = site.siteID;
        optionEle.innerHTML = site.name;
        siteSelector.appendChild(optionEle);
    });
}

async function loadAllLocations(){
    let url = "SiteService/retailLocations";
    let resp = await fetch(url, {
        method: 'GET'
    });
    allLocations = await resp.json();
}


