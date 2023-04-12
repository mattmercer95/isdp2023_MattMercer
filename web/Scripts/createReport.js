let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

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
    
    document.querySelector("#reportSelect").addEventListener('input', toggleInputs);
    document.querySelector("#frmCreateReport").addEventListener('submit', submitReport);
    resetIdleTimeout();
    await loadLocations();
    toggleInputs();
};

async function loadLocations(){
    let url = `../SiteService/retailLocations`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    let locations = await resp.json();
    let selector = document.querySelector("#locationSelect");
    
    locations.forEach((l)=>{
        let optionEle = document.createElement("option");
        optionEle.value = l.siteID + "," + l.name;
        optionEle.innerHTML = l.name;
        selector.appendChild(optionEle);
    });
    let currentSite = currentEmployee.siteID;
    let options = selector.querySelectorAll("option");
    options.forEach((o)=>{
        let csv = o.value;
        let pieces = csv.split(",");
        let siteID = +pieces[0];
        if(siteID === currentSite){
            o.selected = true;
        }
    });
}

async function deliveryReportAPI(date){
    let url = `../DeliveryService/deliveryReport`;
    let resp = await fetch(url, {
        method: 'POST',
        body: date
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.deliveryID == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitDeliveryReport(){
    //get date
    let date = document.querySelector("#singleDate").value;
    let report = await deliveryReportAPI(date);
    if(report.success){
        sessionStorage.setItem("reportType", "Delivery");
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        window.location.href = "ViewReport.html";
    }
    else {
        alert("Error: No delivery reports found for this date.");
    }
}

async function storeOrderReportAPI(startDate, endDate, location){
    let url = `../TransactionService/storeOrderReport`;
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate + ":" + location 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitStoreOrderReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let location = +pieces[0];
    let report = await storeOrderReportAPI(startDate, endDate, location);
    if(report.success){
        let value = document.querySelector("#reportSelect").value;
        report.type = (value === "shippingReceipt") ? "Shipping Receipt" : "Store Order";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportLocation", pieces[1]);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "SelectReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No store orders found in this date range.");
    }
}

async function submitShippingReceiptReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let report = await storeOrderReportAPI(startDate, endDate, 0);
    if(report.success){
        report.type = "shippingReceiptReport";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        //window.location.href = "SelectReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No store orders found in this date range.");
    }
}

async function inventoryReportAPI(location){
    let url = "../InventoryService/";
    if(+location === 0){
        url += "allDetailed";
    }
    else {
        url += "detailedBySite";
    }
    let resp = await fetch(url, {
        method: 'POST',
        body: location 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitInventoryReport(){
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let report = await inventoryReportAPI(+pieces[0]);
    if(report.success){
        report.type = "Inventory";
        report.location = location;
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportLocation", pieces[1]);
        window.location.href = "ViewReport.html";
    }
    else {
        alert("Error: No store orders found in this date range.");
    }
}

async function regularOrderReportAPI(startDate, endDate, location){
    let url = "../TransactionService/regularOrders";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate + ":" + location 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitRegularOrderReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let location = +pieces[0];
    let report = await regularOrderReportAPI(startDate, endDate, location);
    if(report.success){
        report.type = "Regular Order";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportLocation", pieces[1]);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No regular store orders found in this date range.");
    }
}

async function emergencyOrderReportAPI(startDate, endDate, location){
    let url = "../TransactionService/emergencyOrders";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate + ":" + location 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitEmergencyOrderReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let location = +pieces[0];
    let report = await emergencyOrderReportAPI(startDate, endDate, location);
    if(report.success){
        report.type = "emergencyOrderReport";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", "Emergency Order");
        sessionStorage.setItem("reportLocation", pieces[1]);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No emergency store orders found in this date range.");
    }
}

async function userReportAPI(){
    let url = "../UserService/all";
    let resp = await fetch(url, {
        method: 'GET'
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitUserReport(){
    let report = await userReportAPI();
    if(report.success){
        report.type = "User";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: Something went wrong, please check server.");
    }
}

async function backorderReportAPI(startDate, endDate, location){
    let url = "../TransactionService/backorders";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate + ":" + location 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitBackorderReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let location = +pieces[0];
    let report = await backorderReportAPI(startDate, endDate, location);
    if(report.success){
        report.type = "Backorder";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportLocation", pieces[1]);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No backorders found in this date range.");
    }
}

async function supplierOrderReportAPI(startDate, endDate){
    let url = "../TransactionService/supplierOrders";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate 
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitSupplierOrderReport(){
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let report = await supplierOrderReportAPI(startDate, endDate);
    if(report.success){
        report.type = "Supplier Order";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "SelectReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No supplier orders found in this date range.");
    }
}

async function submitReturnsDamageLossReport(){
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let locationCSV = document.querySelector("#locationSelect").value;
    let pieces = locationCSV.split(",");
    let report = await returnsDamageLossReportAPI(startDate, endDate, +pieces[0]);
    if(report.success){
        report.type = "Returns Damages Losses";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportLocation", pieces[1]);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
        window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No Returns/Damage/Loss records found in this date range.");
    }
}

async function returnsDamageLossReportAPI(startDate, endDate, location){
    let url = "../TransactionService/returnsDamageLoss";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate + ":" + location
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitAuditReport(){
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let report = await auditReportAPI(startDate, endDate);
    if(report.success){
        report.type = "Audit";
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        sessionStorage.setItem("reportType", report.type);
        sessionStorage.setItem("reportStart", startDate);
        sessionStorage.setItem("reportEnd", endDate);
            window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No audit records found in this date range.");
    }
}

async function auditReportAPI(startDate, endDate){
    let url = "../AuditService/report";
    let resp = await fetch(url, {
        method: 'POST',
        body: startDate + ":" + endDate
    });
    let reportData = await resp.json();
    let report = {
        success: (reportData.length == 0) ? false : true,
        reportData: reportData
    }
    return report;
}

async function submitReport(e){
    e.preventDefault();
    let value = document.querySelector("#reportSelect").value;
    switch(value){
        case "deliveryReport":
            await submitDeliveryReport();
            break;
        case "storeOrder":
            await submitStoreOrderReport();
            break;
        case "shippingReceipt":
            await submitStoreOrderReport(); //Going to use the same, user picks which order to view on the next screen
            break;
        case "inventory":
            await submitInventoryReport();
            break;
        case "orders":
            await submitRegularOrderReport();
            break;
        case "emergencyOrders":
            await submitEmergencyOrderReport();
            break;
        case "users":
            await submitUserReport();
            break;
        case "backorders":
            await submitBackorderReport();
            break;
        case "supplierOrder":
            await submitSupplierOrderReport();
            break;
        case "lossDamageReturn":
            await submitReturnsDamageLossReport();
            break;
        case "audit":
            await submitAuditReport();
            break;
        default:
            break;
    }
}

async function toggleInputs(){
    hideAllInputs();
    let value = document.querySelector("#reportSelect").value;
    switch(value){
        case "deliveryReport":
            toggleSingleDate();
            break;
        case "storeOrder":
            toggleLocationRow();
            toggleDateRange();
            break;
        case "shippingReceipt":
            toggleDateRange();
            break;
        case "inventory":
            toggleLocationRow();
            break;
        case "orders":
            toggleLocationRow();
            toggleDateRange();
            break;
        case "emergencyOrders":
            toggleLocationRow();
            toggleDateRange();
            break;
        case "users":
            break;
        case "backorders":
            toggleLocationRow();
            toggleDateRange();
            break;
        case "supplierOrder":
            toggleDateRange();
            break;
        case "lossDamageReturn":
            toggleLocationRow();
            toggleDateRange();
            break;
        case "audit":
            toggleDateRange();
            break;
        default:
            break;
    }
}

function toggleDateRange(){
    document.querySelector("#dateRangeRow").hidden = false;
    document.querySelector("#startDate").required = true;
    document.querySelector("#endDate").required = true;
}

function toggleSingleDate(){
    document.querySelector("#singleDateRow").hidden = false;
    document.querySelector("#singleDate").required = true;
}

function toggleLocationRow(){
    document.querySelector("#locationRow").hidden = false;
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

function hideAllInputs(){
    document.querySelector("#locationRow").hidden = true;
    document.querySelector("#singleDate").value = "";
    document.querySelector("#singleDate").required = false;
    document.querySelector("#singleDateRow").hidden = true;
    document.querySelector("#startDate").value = "";
    document.querySelector("#endDate").value = "";
    document.querySelector("#startDate").required = false;
    document.querySelector("#endDate").required = false;
    document.querySelector("#dateRangeRow").hidden = true;
}
