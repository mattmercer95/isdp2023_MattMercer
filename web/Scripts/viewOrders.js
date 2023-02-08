let currentEmployee;
let allEmployees;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let allOrders = null;

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
    document.querySelector("#ordersTable").addEventListener('click', highlight);
    //unhide action buttons depending on user permission
    checkPermissions();
    await getAllOrders();
};

//Makes API call to get all orders and stores them in the global variable
async function getAllOrders(){
    let url = `../TransactionService`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    allOrders = await resp.json();
    buildTable();
}

//builds the order table
function buildTable(){
    console.log(allOrders);
    const table = document.querySelector("#ordersTable");
    allOrders.forEach((order)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const locationCell = document.createElement("td");
        locationCell.innerHTML = order.location;
        row.appendChild(locationCell);
        const statusCell = document.createElement("td");
        statusCell.innerHTML = order.status;
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

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    //TODO: enable buttons based on permission
    console.log(permissions);
}

function returnToDash(){
    window.location.href = "../dashboard.html";
}

function highlight(e){
    let trs = document.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#setPermissions").disabled = false;
        document.querySelector("#editUser").disabled = false;
        document.querySelector("#deleteUser").disabled = false;
    }
    else {
        document.querySelector("#setPermissions").disabled = true;
        document.querySelector("#editUser").disabled = true;
        document.querySelector("#deleteUser").disabled = true;
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


