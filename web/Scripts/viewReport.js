let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let currentReport;
let reportType;

window.onload = async function(){
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
    resetIdleTimeout();
    document.querySelector("#downloadPDF").addEventListener('click', generatePDF);
    
    await loadReportType();
    
};

function generatePDF(){
    // Choose the element that your content will be rendered to.
    let type = reportType.replace(/\s/g, '');
    const element = document.getElementById(`card${type}`);
    var opt = {
        margin:0,
        filename: `${type} Report ${Date.now()}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    // Choose the element and save the PDF for your user.
    html2pdf().set(opt).from(element).save();
}

async function getRoute(deliveryID){
    let url = `../DeliveryService/getRoute`;
    let resp = await fetch(url, {
        method: 'POST',
        body: deliveryID
    });
    let response = await resp.json();
    return response;
}

async function loadDeliveryReport(){
    //load data panel
    document.querySelector("#cardDelivery").hidden = false;
    //populate data panel
    document.querySelector("#drDeliveryID").value = currentReport.deliveryID;
    document.querySelector("#drDeliveryDate").value = currentReport.deliveryDate;
    document.querySelector("#drNumLocations").value = currentReport.numLocations;
    document.querySelector("#drTruckSize").value = currentReport.truckSize;
    document.querySelector("#drWeight").value = currentReport.weight;
    document.querySelector("#drDistanceCost").value = currentReport.distanceCost;
    //populate route table
    let route = await getRoute(currentReport.deliveryID);
    let routeTable = document.querySelector("#drRouteTable");
    for(let i = 0; i < route.length + 1; i++){
        let rowEle = document.createElement("tr");
        let numCell = document.createElement("td");
        numCell.innerHTML = i+1;
        rowEle.appendChild(numCell);
        let locationCell = document.createElement("td");
        let location;
        if(i === 0){
            //from warehouse
            location = `FROM Warehouse TO ${route[i].location}`;
            locationCell.innerHTML = location;
            rowEle.appendChild(locationCell);
            let addressEle = document.createElement("td");
            addressEle.innerHTML = route[0].address;
            rowEle.appendChild(addressEle);
            let distanceEle = document.createElement("td");
            distanceEle.innerHTML = route[0].distanceFromWH;
            rowEle.appendChild(distanceEle);
            let orderIDEle = document.createElement("td");
            orderIDEle.innerHTML = route[0].orderID;
            rowEle.appendChild(orderIDEle);
        }
        else if(i === (route.length)){
            //Return trip
            location = `RETURN TRIP FROM ${route[i-1].location}`;
            locationCell.innerHTML = location;
            rowEle.appendChild(locationCell);
            let addressEle = document.createElement("td");
            addressEle.innerHTML = "438 Grandview Avenue, Saint John, NB";
            rowEle.appendChild(addressEle);
            let distanceEle = document.createElement("td");
            distanceEle.innerHTML = route[i-1].distanceFromWH;
            rowEle.appendChild(distanceEle);
            let orderIDEle = document.createElement("td");
            orderIDEle.innerHTML = "N/A";
            rowEle.appendChild(orderIDEle);
        }
        else {
            location = `FROM ${route[i-1].location} TO ${route[i].location}`;
            locationCell.innerHTML = location;
            rowEle.appendChild(locationCell);
            let addressEle = document.createElement("td");
            addressEle.innerHTML = route[i].address;
            rowEle.appendChild(addressEle);
            let distanceEle = document.createElement("td");
            distanceEle.innerHTML = route[i].distanceFromWH - route[i-1].distanceFromWH;
            rowEle.appendChild(distanceEle);
            let orderIDEle = document.createElement("td");
            orderIDEle.innerHTML = route[i].orderID;
            rowEle.appendChild(orderIDEle);
        }
       
        routeTable.appendChild(rowEle);
    }
    console.log(route);
}

async function loadInventoryReport(){
    //load data panel
    document.querySelector("#cardInventory").hidden = false;
    //populate inventory table
    let table = document.querySelector("#invItemsTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#invLocation").innerHTML = currentlocation;
    const date = new Date();
    document.querySelector("#invDate").innerHTML = date;
    currentReport.forEach((item)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = item.itemID;
        row.appendChild(idCell);
        const activeCell = document.createElement("td");
        const activeBadge = document.createElement("span");
        activeBadge.classList.add("badge");
        if(item.active){
            activeBadge.innerHTML = "Active";
            activeBadge.classList.add("text-bg-success");
        }
        else {
            activeBadge.innerHTML = "Inactive";
            activeBadge.classList.add("text-bg-danger");
        }
        activeCell.appendChild(activeBadge);
        row.appendChild(activeCell);
        const siteCell = document.createElement("td");
        siteCell.innerHTML = item.siteName;
        row.appendChild(siteCell);
        const nameCell = document.createElement("td");
        row.appendChild(nameCell);
        const descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = item.description;
        row.appendChild(descriptionCell);
        const catCell = document.createElement("td");
        catCell.innerHTML = item.category;
        row.appendChild(catCell);
        const weightCell = document.createElement("td");
        weightCell.innerHTML = item.weight.toFixed(2);
        row.appendChild(weightCell);
        const costCell = document.createElement("td");
        costCell.innerHTML = item.costPrice.toFixed(2);
        row.appendChild(costCell);
        const retailCell = document.createElement("td");
        retailCell.innerHTML = item.retailPrice.toFixed(2);
        row.appendChild(retailCell);
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

async function loadRegularOrderReport(){
    //load data panel
    document.querySelector("#cardRegularOrder").hidden = false;
    //populate inventory table
    let table = document.querySelector("#roOrdersTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#roLocation").innerHTML = currentlocation;
    document.querySelector("#roStart").innerHTML = sessionStorage.getItem("reportStart");
    document.querySelector("#roEnd").innerHTML = sessionStorage.getItem("reportEnd");
    currentReport.forEach((order)=>{
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
        //add row to table
        table.appendChild(row);
    });
}

async function loadEmergencyOrderReport(){
    //load data panel
    document.querySelector("#cardEmergencyOrder").hidden = false;
    //populate inventory table
    let table = document.querySelector("#eoOrdersTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#eoLocation").innerHTML = currentlocation;
    document.querySelector("#eoStart").innerHTML = sessionStorage.getItem("reportStart");
    document.querySelector("#eoEnd").innerHTML = sessionStorage.getItem("reportEnd");
    currentReport.forEach((order)=>{
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
        //add row to table
        table.appendChild(row);
    });
}

async function loadBackorderReport(){
    //load data panel
    document.querySelector("#cardBackorder").hidden = false;
    //populate inventory table
    let table = document.querySelector("#boOrdersTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#boLocation").innerHTML = currentlocation;
    document.querySelector("#boStart").innerHTML = sessionStorage.getItem("reportStart");
    document.querySelector("#boEnd").innerHTML = sessionStorage.getItem("reportEnd");
    currentReport.forEach((order)=>{
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
        //add row to table
        table.appendChild(row);
    });
}

async function loadUserReport(){
    //load data panel
    document.querySelector("#cardUser").hidden = false;
    //populate inventory table
    let table = document.querySelector("#userTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    let date = new Date();
    document.querySelector("#userDate").innerHTML = date;
    currentReport.forEach((emp)=>{
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const boldID = document.createElement("b");
        boldID.innerHTML = emp.employeeID;
        idCell.appendChild(boldID);
        row.appendChild(idCell);
        const usernameCell = document.createElement("td");
        usernameCell.innerHTML = emp.username;
        row.appendChild(usernameCell);
        const firstNameCell = document.createElement("td");
        firstNameCell.innerHTML = emp.firstName;
        row.appendChild(firstNameCell);
        const lastNameCell = document.createElement("td");
        lastNameCell.innerHTML = emp.lastName;
        row.appendChild(lastNameCell);
        const emailCell = document.createElement("td");
        emailCell.innerHTML = emp.email;
        row.appendChild(emailCell);
        const activeCell = document.createElement("td");
        const activeSpan = document.createElement("span");
        if(emp.active === true){
            activeSpan.classList.add("badge", "bg-success");
        }
        else {
            activeSpan.classList.add("badge", "bg-danger");
        }
        activeSpan.innerHTML = emp.active;
        activeCell.appendChild(activeSpan);
        row.appendChild(activeCell);
        const positionCell = document.createElement("td");
        positionCell.innerHTML = emp.position;
        row.appendChild(positionCell);
        const siteCell = document.createElement("td");
        siteCell.innerHTML = emp.site;
        row.appendChild(siteCell);
        table.appendChild(row);
    });
}

async function loadAuditReport(){
    //load data panel
    document.querySelector("#cardAudit").hidden = false;
    //populate inventory table
    let table = document.querySelector("#audTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#audStart").innerHTML = sessionStorage.getItem("reportStart");
    document.querySelector("#audEnd").innerHTML = sessionStorage.getItem("reportEnd");
    currentReport.forEach((item)=>{
        let row = document.createElement("tr");
        let idCell = document.createElement("td");
        idCell.innerHTML = item.txnAuditID;
        row.appendChild(idCell);
        let dateCell = document.createElement("td");
        dateCell.innerHTML = item.txnDate;
        row.appendChild(dateCell);
        let txnIDCell = document.createElement("td");
        txnIDCell.innerHTML = +item.txnID === 0 ? "-" : item.txnID;
        row.appendChild(txnIDCell);
        let typeCell = document.createElement("td");
        typeCell.innerHTML = item.txnType;
        row.appendChild(typeCell);
        let statusCell = document.createElement("td");
        statusCell.innerHTML = item.status;
        row.appendChild(statusCell);
        let empCell = document.createElement("td");
        empCell.innerHTML = item.employeeName === "Admin Admin" ? "Admin" : item.employeeName;
        row.appendChild(empCell);
        let posCell = document.createElement("td");
        posCell.innerHTML = item.position;
        row.appendChild(posCell);
        let locCell = document.createElement("td");
        locCell.innerHTML = item.siteName;
        row.appendChild(locCell);
        table.appendChild(row);
    });
}

async function loadReturnsDamagesLossesReport(){
    //load data panel
    document.querySelector("#cardReturnsDamageLoss").hidden = false;
    //populate inventory table
    let table = document.querySelector("#boOrdersTable");
    let currentlocation = sessionStorage.getItem("reportLocation");
    document.querySelector("#rdlLocation").innerHTML = currentlocation;
    document.querySelector("#rdlStart").innerHTML = sessionStorage.getItem("reportStart");
    document.querySelector("#rdlEnd").innerHTML = sessionStorage.getItem("reportEnd");
    let returnsTable = document.querySelector("#returnTable");
    buildSubTable(returnsTable, currentReport.returns);
    let damagesTable = document.querySelector("#damageTable");
    buildSubTable(damagesTable, currentReport.damage);
    let lossTable = document.querySelector("#lossTable");
    buildSubTable(lossTable, currentReport.loss);
}

function buildSubTable(table, data){
    data.forEach((item)=>{
        let row = document.createElement("tr");
        let idCell = document.createElement("td");
        idCell.innerHTML = item.transactionID;
        row.appendChild(idCell);
        let dateCell = document.createElement("td");
        dateCell.innerHTML = item.shipDate;
        row.appendChild(dateCell);
        let locationCell = document.createElement("td");
        locationCell.innerHTML = item.destination;
        row.appendChild(locationCell);
        let typeCell = document.createElement("td");
        typeCell.innerHTML = item.transactionType;
        row.appendChild(typeCell);
        let statusCell = document.createElement("td");
        statusCell.innerHTML = item.status;
        row.appendChild(statusCell);
        let itemIDCell = document.createElement("td");
        itemIDCell.innerHTML = item.itemID;
        row.appendChild(itemIDCell);
        let itemNameCell = document.createElement("td");
        itemNameCell.innerHTML = item.itemName;
        row.appendChild(itemNameCell);
        table.appendChild(row);
    });
}

async function loadStoreOrderReport(){
    //load data panel
    document.querySelector("#cardStoreOrder").hidden = false;
    let currentOrder = currentReport;
    //populate inventory table
    let table = document.querySelector("#soOrderTable");
    document.querySelector("#soOrderID").value = currentOrder.transactionID;
    document.querySelector("#soCreationDate").value = currentOrder.createdDate;
    document.querySelector("#soOriginSite").value = "Warehouse";
    document.querySelector("#soDestinationSite").value = currentOrder.destination;
    document.querySelector("#soStatus").value = currentOrder.status;
    document.querySelector("#soShipDate").value = currentOrder.shipDate;
    document.querySelector("#soDeliveryID").value = (currentOrder.deliveryID === 0) ? "N/A" : currentOrder.deliveryID;
    document.querySelector("#soTotalQtyOrdered").value = currentOrder.quantity;
    document.querySelector("#soTotalWeight").value = currentOrder.totalWeight.toFixed(2);
    
    let typeLabel = document.querySelector("#soTypeLabel");
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
    buildSOCart(cart);
}

function buildSOCart(card){
    const table = document.querySelector("#soOrderTable");
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
        qtyUpDown.disabled = true;
        qtyOrderedCell.appendChild(qtyUpDown);
        row.appendChild(qtyOrderedCell);
        //add row to table
        table.appendChild(row);
    });
}

async function loadSupplierOrderReport(){
    //load data panel
    document.querySelector("#cardSupplierOrder").hidden = false;
    let currentOrder = currentReport.order;
    //populate inventory table
    let table = document.querySelector("#soOrderTable");
    document.querySelector("#supOrderID").value = currentOrder.transactionID;
    document.querySelector("#supCreationDate").value = currentOrder.createdDate;
    document.querySelector("#soOriginSite").value = "Warehouse";
    document.querySelector("#supDestinationSite").value = currentOrder.destination;
    document.querySelector("#supStatus").value = currentOrder.status;
    document.querySelector("#supShipDate").value = currentOrder.shipDate;
    document.querySelector("#soDeliveryID").value = (currentOrder.deliveryID === 0) ? "N/A" : currentOrder.deliveryID;
    document.querySelector("#supTotalQtyOrdered").value = currentOrder.quantity;
    document.querySelector("#supTotalWeight").value = currentOrder.totalWeight.toFixed(2);
    await buildSupplierCards();
}

async function buildSupplierCards(){
    let contacts = currentReport.contacts;
    let containerEle = document.querySelector("#supplierCards");
    contacts.forEach((t)=>{
        let transactionCard = `<div class= "card transaction-card page-break" id="Card"> <div class="card-body"> 
<div class="row justify-content-center"> <h3 class="card-title col" id="Name">${t.name}
</h3></div> 
<div class="row"><div class="form-group col"><label><b>Contact:  </b>${t.contact}</label></div>
<div class="form-group col"><label><b>Phone:  </b>${t.phone}</label></div></div>
<div class="row"> <div class="form-group col"> <label><b>Address:   </b>${t.address}</label></div> 
</div> <table class="table table-bordered table-striped "> <thead> <tr> <th>#</th> 
<th>Item Name</th> <th># Cases</th> <th># Items</th> <th>Weight</th> </tr> </thead> 
<tbody id="${t.supplierID}Items"> </tbody> </table> </div> </div>`;
        containerEle.innerHTML += transactionCard;
    });
    await loadSupplierOrderItems(contacts);
}

async function loadSupplierOrderItems(contacts){
    let url = `../TransactionService/getItemsBySupplier`;
    contacts.forEach(async (c)=>{
        console.log(c.supplierID);
        let items = await supplierOrderItemsAPI(c.supplierID, currentReport.orderID);
        console.log(items);
    });
}

async function supplierOrderItemsAPI(supplierID, orderID){
    let url = `../TransactionService/getItemsBySupplier`;
    console.log(supplierID + "," + orderID);
    let resp = await fetch(url, {
        method: 'POST',
        body: supplierID + "," + orderID
    });
    return await resp.json();
}
async function loadReportType(){
    reportType = sessionStorage.getItem("reportType");
    currentReport = JSON.parse(sessionStorage.getItem("currentReport"));
    console.log(currentReport);
    switch(reportType){
        case "Delivery":
            await loadDeliveryReport();
            break;
        case "Inventory":
            await loadInventoryReport();
            break;
        case "Regular Order":
            await loadRegularOrderReport();
            break;
        case "Emergency Order":
            await loadEmergencyOrderReport();
            break;
        case "User":
            await loadUserReport();
            break;
        case "Backorder":
            await loadBackorderReport();
            break;
        case "Audit":
            await loadAuditReport();
            break;
        case "Returns Damages Losses":
            await loadReturnsDamagesLossesReport();
            break;
        case "Store Order":
            await loadStoreOrderReport();
            break;
        case "Shipping Receipt":
            await loadStoreOrderReport();
            break;
        case "Supplier Order":
            await loadSupplierOrderReport();
            break;
        default:
            break;
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
    window.location.href = "index.html";
}
