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
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);
    //initialize idle timeout
    resetIdleTimeout();
    console.log(new Date().toISOString().slice(0, 19).replace('T', ' '));
};

function resetIdleTimeout(){
    //clears current timeout
    if(idleTimeout) clearTimeout(idleTimeout);
    //set new timeout which will redirect after x amount of minutes
    idleTimeout = setTimeout(logout, idleDurationMins * 60 * 1000);
}

//removes current employee from session storage and redirects user to sign-in page
function logout(){
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "index.html";
}


