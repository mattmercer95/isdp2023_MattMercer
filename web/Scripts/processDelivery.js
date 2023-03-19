let currentEmployee;

const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let currentDelivery = null;

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
    
    loadCurrentDelivery();
    await loadDeliveryTransactions();
    populateDetailsPanel();
    console.log(currentDelivery);
};

async function loadDeliveryTransactions(){
    let url = `../DeliveryService/getTransactionsByDelivery`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentDelivery.deliveryID)
    });
    let deliveryTransactions = await resp.json();
    currentDelivery.transactions = deliveryTransactions;
    console.log(currentDelivery);
}

//populates the delivery details panel at the top of the page
function populateDetailsPanel(){
    document.querySelector("#deliveryID").value = currentDelivery.deliveryID;
    document.querySelector("#shipDate").value = currentDelivery.deliveryDate;
    document.querySelector("#truckSize").value = currentDelivery.truckSize;
    document.querySelector("#numLocations").value = currentDelivery.numLocations;
    document.querySelector("#weight").value = numberFormat.format(currentDelivery.weight);
    document.querySelector("#distanceCost").value = numberFormat.format(currentDelivery.distanceCost);
    document.querySelector("#pickupTime").value = currentDelivery.pickupTime;
    document.querySelector("#deliveredTime").value = currentDelivery.deliveredTime;
}

function loadCurrentDelivery(){
    currentDelivery = JSON.parse(sessionStorage.getItem("currentDelivery"));
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