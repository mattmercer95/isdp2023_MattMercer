let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "index.html";
let idleTimeout;

window.onload = function () {
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
    document.querySelector("#userAccounts").addEventListener('click', ()=>{
        window.location.href = "Dashboard/UserAccounts.html";
    });
    document.querySelector("#locations").addEventListener('click', ()=>{
        window.location.href = "Dashboard/ViewLocations.html";
    });
    document.querySelector("#orders").addEventListener('click', ()=>{
        window.location.href = "Dashboard/ViewOrders.html";
    });
    document.querySelector("#inventory").addEventListener('click', ()=>{
        window.location.href = "Dashboard/ViewInventory.html";
    });
    //initialize idle timeout
    resetIdleTimeout();
    checkPermissions();
};

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    permissions.forEach((p)=>{
        if(p === "READUSER"){
            document.querySelector("#userAccounts").hidden = false;
        }
//        if(p === "CREATEREPORT"){
//            document.querySelector("#reports").hidden = false;
//        }
        if(p === "VIEWORDERS" || p === "DELIVERY"){
            document.querySelector("#orders").hidden = false;
        }
    });
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


