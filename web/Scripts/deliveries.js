let currentEmployee;

const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let allDeliveries = [];
let selectedDelivery = null;

//currency formatter
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const numberFormat = new Intl.NumberFormat('en-US');

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

    document.querySelector("#returnToDash").addEventListener('click', returnToDash);
    document.querySelector("#deliveriesTable").addEventListener('click', highlight);
    document.querySelector("#viewDetails").addEventListener('click', ()=>{
       sessionStorage.setItem("currentDelivery", JSON.stringify(selectedDelivery));
       window.location.href = "DeliveryDetails.html";
    });

    await loadAllDeliveries();
    buildTable(allDeliveries);
};

async function loadAllDeliveries(){
    let url = `../DeliveryService/`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    allDeliveries = await resp.json();
    console.log(allDeliveries);
}

function disableButtons(){
    document.querySelector("#viewDetails").disabled = true;
}

function buildTable(deliveries){
    disableButtons();
    let tableEle = document.querySelector("#deliveriesTable");
    deliveries.forEach((delivery)=>{
        const rowEle = document.createElement("tr");
        const deliveryIDEle = document.createElement("td");
        deliveryIDEle.innerHTML = delivery.deliveryID;
        rowEle.appendChild(deliveryIDEle);
        const statusEle = document.createElement("td");
        statusEle.innerHTML = delivery.status;
        rowEle.appendChild(statusEle);
        const numLocationsEle = document.createElement("td");
        numLocationsEle.innerHTML = delivery.numLocations;
        rowEle.appendChild(numLocationsEle);
        const distanceCostEle = document.createElement("td");
        distanceCostEle.innerHTML = currency.format(delivery.distanceCost);
        rowEle.appendChild(distanceCostEle);
        const weightEle = document.createElement("td");
        weightEle.innerHTML = numberFormat.format(delivery.weight);
        rowEle.appendChild(weightEle);
        const truckSizeEle = document.createElement("td");
        truckSizeEle.innerHTML = delivery.truckSize;
        rowEle.appendChild(truckSizeEle);
        const deliveryDateEle = document.createElement("td");
        deliveryDateEle.innerHTML = delivery.deliveryDate;
        rowEle.appendChild(deliveryDateEle);
        const pickupTimeEle = document.createElement("td");
        pickupTimeEle.innerHTML = delivery.pickupTime;
        rowEle.appendChild(pickupTimeEle);
        const deliveredTimeEle = document.createElement("td");
        deliveredTimeEle.innerHTML = delivery.deliveredTime;
        rowEle.appendChild(deliveredTimeEle);
        tableEle.appendChild(rowEle);
    });
}

function highlight(e){
    let trs = document.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#viewDetails").disabled = false;
        selectedDelivery = getSelectedDelivery();
    }
    else {
        disableButtons();
        selectedDelivery = null;
    }
}

function getSelectedDelivery(){
    let table = document.querySelector("#deliveriesTable");
    rows = table.querySelectorAll("tr");
    let selectedItem;
    let selectedIndex;
    for(let i = 0; i < rows.length; i++){
        row = rows[i];
        if(row.classList.contains("highlighted")){
            selectedItem = allDeliveries[i];
        }
    }
    return selectedItem;
}

function returnToDash(){
    window.location.href = "../dashboard.html";
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