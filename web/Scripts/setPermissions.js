const idleDurationMins = 15;
const redirectUrl = "../index.html";
let selectedEmployee;
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

    document.querySelector("#removePermission").disabled = true;
    document.querySelector("#removePermission").addEventListener("click", removePermission);
    document.querySelector("#addPermission").addEventListener("click", addPermission);
    document.querySelector("#permissionTable").addEventListener('click', highlight);
    
    await loadSelectedEmployee();
    //initialize idle timeout
    resetIdleTimeout();
};

async function removePermission(){
    let cell = document.querySelector(".highlighted").firstChild;
    let permissionToRemove = cell.innerHTML;
    let url = "../UserService/removePermission";
    let obj = {
        employeeID: selectedEmployee.employeeID,
        permission: permissionToRemove,
    };
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj),
    });
    let success = await resp.json();
    if(success === true){
        alert(`Permission ${permissionToRemove} successfully removed for user ${selectedEmployee.username}`);
        await loadSelectedEmployee();
    }
    else {
        alert("Error remove permission");
    }
}

async function addPermission(){
    let permissionToAdd = document.querySelector("#permissionsToAdd").value;
    if(permissionToAdd === ""){
        return;
    }
    let url = "../UserService/addPermission";
    let obj = {
        employeeID: selectedEmployee.employeeID,
        permission: permissionToAdd,
    };
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj),
    });
    let success = await resp.json();
    if(success === true){
        alert(`Permission ${permissionToAdd} successfully added for user ${selectedEmployee.username}`);
        await loadSelectedEmployee();
    }
    else {
        alert("Error adding permission");
    }
}

function highlight(e){
    let trs = document.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
        document.querySelector("#removePermission").disabled = false;
    }
    else {
        document.querySelector("#removePermission").disabled = true;
    }
}

async function loadSelectedEmployee(){
    selectedEmployee = JSON.parse(sessionStorage.getItem('selectedEmployee'));
    let heading = document.querySelector("#permissionsHeading");
    heading.innerHTML = `Permissions for ${selectedEmployee.username} (Employee #${selectedEmployee.employeeID})`;
    let selectedEmpID = selectedEmployee.employeeID;
    //get the permissions for this employee
    let url = "../UserService/permissions";
    let resp = await fetch(url, {
        method: 'POST',
        body: selectedEmpID,
    });
    buildTable(await resp.json());
    await buildSelector();
}

function buildTable(permissionList){
    const tableBody = document.querySelector("#permissionTable");
    tableBody.innerHTML = '';
    permissionList.forEach((permission) => {
        const rowEle = document.createElement("tr");
        const permissionCell = document.createElement("td");
        permissionCell.innerHTML = permission;
        rowEle.appendChild(permissionCell);
        tableBody.appendChild(rowEle);
    });
}

async function buildSelector(){
    let url = "../UserService/permissionsToAdd";
    let resp = await fetch(url, {
        method: 'POST',
        body: selectedEmployee.employeeID,
    });
    let permissions = await resp.json();
    const selector = document.querySelector("#permissionsToAdd");
    selector.innerHTML = '';
    permissions.forEach((permission)=>{
        const optionEle = document.createElement("option");
        optionEle.innerHTML = permission;
        selector.appendChild(optionEle);
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
