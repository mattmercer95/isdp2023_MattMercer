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
    nameTitleElement.innerHTML = nameTitle;
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);

    await loadSelectedEmployee();
    //initialize idle timeout
    resetIdleTimeout();
};

async function loadSelectedEmployee(){
    let selectedEmpID = JSON.parse(sessionStorage.getItem('selectedEmployee')).employeeID;
    console.log(selectedEmpID);
    //get the permissions for this employee
    let url = "../UserService/permissions";
    let resp = await fetch(url, {
        method: 'POST',
        body: selectedEmpID,
    });
    buildTable(await resp.json());
}

function buildTable(permissionList){
    const tableBody = document.querySelector("#permissionTable");
    permissionList.forEach((permission) => {
        const rowEle = document.createElement("tr");
        const permissionCell = document.createElement("td");
        permissionCell.innerHTML = permission;
        rowEle.appendChild(permissionCell);
        tableBody.appendChild(rowEle);
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
    let url = `../LogOutService/logout`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentEmployee)
    });
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "../index.html";
}
