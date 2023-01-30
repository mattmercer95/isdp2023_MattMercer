let currentEmployee;
let employeeToEdit;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;
let allUsernames;

window.onload = async function () {
    //store the employee to edit
    employeeToEdit = JSON.parse(sessionStorage.getItem('selectedEmployee'));
    console.log(employeeToEdit);
    //set current employee global to the user that logged in
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
    //load name and title on the nav bar
    let nameTitleElement = document.querySelector("#nameTitle");
    let nameTitle = (currentEmployee.employeeID === 1) ? "System Admin" : 
            `${currentEmployee.firstName} ${currentEmployee.lastName}, 
            ${currentEmployee.position}`;
    nameTitleElement.innerHTML = nameTitle;
    //fill input fields with current data
    loadEmployeeToEdit();
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    //password toggler
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    //save button action
    document.querySelector("#addNewUserForm").addEventListener("submit", saveNewUser);
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);
    //initialize idle timeout
    resetIdleTimeout();
    //load data for select menus
    await loadSelectMenus();
    //load usernames to use when validating new username
    await getAllUsernames();
};

function loadEmployeeToEdit(){
    //load heading
    document.querySelector("#heading").innerHTML = `Edit User #${employeeToEdit.employeeID}`;
    //load fields
    document.querySelector("#firstName").value = employeeToEdit.firstName;
    document.querySelector("#lastName").value = employeeToEdit.lastName;
    document.querySelector("#email").value = employeeToEdit.email;
    document.querySelector("#username").value = employeeToEdit.username;
    document.querySelector("#password").value = employeeToEdit.password;
    document.querySelector("#active").checked = employeeToEdit.active;
}

async function saveNewUser(e){
    e.preventDefault();
    //gather info from form
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const position = document.querySelector("#position").value;
    const site = document.querySelector("#site").value;
    const active = document.querySelector("#active").checked;
    
    let newUser = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
        positionID: position,
        siteID: site,
        active: active
    }
    
    let url = "../UserService/addNewUser";
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(newUser),
    });
    responseObj = await resp.json();
    alert(responseObj.message)
    if(responseObj.success === true){
        window.location.href="UserAccounts.html";
    }
}

//Funtion that toggles the visibility of the password
function toggleVisiblePassword(){
    let password = document.querySelector("#password");
    // toggle the type attribute
    let type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    // toggle the icon
    this.classList.toggle("bi-eye");
}

//Helper function that makes an API call to get all usernames
async function getAllUsernames(){
    let url = "../UserService/allUsernames";
    let resp = await fetch(url, {
        method: 'GET',
    });
    allUsernames = await resp.json();
}

async function loadSelectMenus(){
    //get data for positions
    await populatePositions();
    await populateSites();
}

async function populateSites(){
    let url = "../SiteService";
    let resp = await fetch(url, {
        method: 'GET',
    });
    const sites = await resp.json();
    const siteSelect = document.querySelector("#site");
    sites.forEach((site) => {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", site.siteID);
        optionElement.innerHTML = site.name;
        siteSelect.appendChild(optionElement);
    });
}

async function populatePositions(){
    let url = "../PositionService";
    let resp = await fetch(url, {
        method: 'GET',
    });
    const positions = await resp.json();
    const positionSelect = document.querySelector("#position");
    positions.forEach((position) => {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", position.positionID);
        optionElement.innerHTML = position.positionTitle;
        positionSelect.appendChild(optionElement);
    });
}

//Resets the idle timer
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


