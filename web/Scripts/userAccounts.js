let currentEmployee;
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
    console.log(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
    document.querySelector("#allEmployeeesTable").addEventListener('click', highlight);
    //get all employee info and display into table
    buildEmployeeTable();
};

function highlight(e){
    let trs = document.querySelectorAll("tr");
    for (let i = 0; i < trs.length; i++) {
        trs[i].classList.remove("highlighted");
    }
    let target = e.target.parentElement;
    if(target.tagName === "TR"){
        target.classList.add("highlighted");
    }
    
}

async function buildEmployeeTable(){
    //get the tbody element
    let tableBody = document.querySelector("#allEmployeeesTable");
    //make API call to get employee data
    let employeeData = await getAllEmployeeData();
    console.log(employeeData);
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
    return await resp.json();
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


