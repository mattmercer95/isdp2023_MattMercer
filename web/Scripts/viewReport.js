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
    const element = document.getElementById(`card${reportType}`);
    console.log(`card${reportType}`);
    var opt = {
        margin:0,
        filename: `${reportType} Report ${Date.now()}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
