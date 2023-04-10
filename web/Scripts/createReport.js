let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "index.html";
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
    toggleInputs();
};

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
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        //window.location.href = "ViewReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No delivery reports found for this date.");
    }
}

async function storeOrderReportAPI(startDate, endDate){
    let url = `../TransactionService/storeOrderReport`;
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

async function submitStoreOrderReport(){
    //get date range
    let startDate = document.querySelector("#startDate").value;
    let endDate = document.querySelector("#endDate").value;
    let report = await storeOrderReportAPI(startDate, endDate);
    if(report.success){
        sessionStorage.setItem("currentReport", JSON.stringify(report.reportData));
        //window.location.href = "SelectReport.html";
        console.log(report.reportData);
    }
    else {
        alert("Error: No store orders found in this date range.");
    }
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
            break;
        case "inventory":
            break;
        case "orders":
            break;
        case "emergencyOrders":
            break;
        case "users":
            break;
        case "backorders":
            break;
        case "supplierOrder":
            break;
        case "lossDamageReturn":
            break;
        case "audit":
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
    let url = `LogOutService/logout`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentEmployee)
    });
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "index.html";
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
