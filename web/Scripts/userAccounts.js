let currentEmployee;
let allEmployees;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

window.onload = function () {
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
    //initialize idle timeout
    resetIdleTimeout();
    document.querySelector("#setPermissions").addEventListener("click", setPermissions);
    document.querySelector("#setPermissions").disabled = true;
    document.querySelector("#editUser").disabled = true;
    document.querySelector("#deleteUser").disabled = true;
    document.querySelector("#editUser").addEventListener("click", () =>{
        let selected = getSelectedEmployee();
        sessionStorage.setItem('selectedEmployee', JSON.stringify(selected));
        window.location.href = "EditUser.html";
    });
    document.querySelector("#deleteUser").addEventListener("click", deleteUser);
    document.querySelector("#returnToDash").addEventListener('click', returnToDash);
    document.querySelector("#allEmployeeesTable").addEventListener('click', highlight);
    //unhide action buttons depending on user permission
    checkPermissions();
    //get all employee info and display into table
    buildEmployeeTable();
};

async function deleteUser(){
    let selected = getSelectedEmployee();
    
    let url = `../UserService/` + selected.employeeID;
    let resp = await fetch(url, {
        method: 'DELETE'
    });
    let result = await resp.json();
    console.log(result);
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    permissions.forEach((p)=>{
        if(p === "ADDUSER"){
            document.querySelector("#addNewUser").hidden = false;
        }
        if(p === "EDITUSER"){
            document.querySelector("#editUser").hidden = false;
        }
        if(p === "DELETEUSER"){
            document.querySelector("#deleteUser").hidden = false;
        }
        if(p === "SETPERMISSION"){
            document.querySelector("#setPermissions").hidden = false;
        }
    });
}

function setPermissions(){
    //get the currently selected employee object
    let selected = getSelectedEmployee();
    sessionStorage.setItem('selectedEmployee', JSON.stringify(selected));
    window.location.href = "SetPermissions.html";
}

function getSelectedEmployee(){
    let rows = document.querySelectorAll("tr");
    let empIndex;
    for(let i = 0; i < rows.length; i++){
        let classList = rows[i].classList;
        if(classList.contains('highlighted')){
            empIndex = i-1;
        }
    }
    return allEmployees[empIndex];
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

async function buildEmployeeTable(){
    //get the tbody element
    let tableBody = document.querySelector("#allEmployeeesTable");
    //make API call to get employee data
    let employeeData = await getAllEmployeeData();
    //populate table
    employeeData.forEach((emp) =>{
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = emp.employeeID;
        row.appendChild(idCell);
        const usernameCell = document.createElement("td");
        usernameCell.innerHTML = emp.username;
        row.appendChild(usernameCell);
        const firstNameCell = document.createElement("td");
        firstNameCell.innerHTML = emp.firstName;
        row.appendChild(firstNameCell);
        const lastNameCell = document.createElement("td");
        lastNameCell.innerHTML = emp.lastName;
        row.appendChild(lastNameCell);
        const emailCell = document.createElement("td");
        emailCell.innerHTML = emp.email;
        row.appendChild(emailCell);
        const activeCell = document.createElement("td");
        activeCell.innerHTML = emp.active;
        row.appendChild(activeCell);
        const positionCell = document.createElement("td");
        positionCell.innerHTML = emp.position;
        row.appendChild(positionCell);
        const siteCell = document.createElement("td");
        siteCell.innerHTML = emp.site;
        row.appendChild(siteCell);
        tableBody.appendChild(row);
    });
}

async function getAllEmployeeData(){
    let url = `../UserService/all`;
    let resp = await fetch(url, {
        method: 'GET',
    });
    let data = await resp.json();
    await data.sort(function(a, b) { 
        return a.employeeID - b.employeeID;
    })
    allEmployees = data;
    return data;
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


