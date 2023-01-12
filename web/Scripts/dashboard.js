let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "index.html";
let idleTimeout;

window.onload = function () {
    //set current employee global to the user that logged in
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
    //load name and title on the nav bar
    let nameTitle = document.querySelector("#nameTitle");
    nameTitle.innerHTML = `${currentEmployee.firstName} ${currentEmployee.lastName}, ${currentEmployee.position}`;
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    console.log(currentEmployee);
    document.querySelector("#testingButton").addEventListener("click", testing);
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);
    //initialize idle timeout
    resetIdleTimeout();
};

function testing(){
    console.log("Testing button clicked");
}

function resetIdleTimeout(){
    console.log("idle timer reset");
    //clears current timeout
    if(idleTimeout) clearTimeout(idleTimeout);
    //set new timeout which will redirect after x amount of minutes
    //idleTimeout = setTimeout(() => location.href = redirectUrl, idleDurationMins * 60000);
    idleTimeout = setTimeout(logout, idleDurationMins * 60 * 1000);
}

//removes current employee from session storage and redirects user to sign-in page
function logout(){
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "index.html";
}


