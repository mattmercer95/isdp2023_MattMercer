let currentEmployee;
let employeeToEdit;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;
let allUsernames;

window.onload = async function () {
    //store the employee to edit
    employeeToEdit = JSON.parse(sessionStorage.getItem('selectedEmployee'));
    //set current employee global to the user that logged in
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
    //load name and title on the nav bar
    let nameTitleElement = document.querySelector("#nameTitle");
    let nameTitle = (currentEmployee.employeeID === 1) ? "System Admin" : 
            `${currentEmployee.firstName} ${currentEmployee.lastName}, 
            ${currentEmployee.position}`;
    nameTitleElement.innerHTML = nameTitle + ` - ${currentEmployee.site}`;
    //fill input fields with current data
    loadEmployeeToEdit();
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    //password toggler
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    document.querySelector("#togglePasswordConfirm").addEventListener("click", toggleVisiblePasswordConfirm);
    //save button action
    document.querySelector("#addNewUserForm").addEventListener("submit", saveEdits);
    //change password click event
    document.querySelector("#changePassword").addEventListener("click", ()=>{
        let checked = document.querySelector("#changePassword").checked;
        if(checked === true){
            document.querySelector("#newPassDiv").hidden = false;
            document.querySelector("#newPassConfirmDiv").hidden = false;
        }
        else {
            document.querySelector("#newPassDiv").hidden = true;
            document.querySelector("#newPassConfirmDiv").hidden = true;
        }
    });
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
    //load fields, selector fields will be loaded on the selector builder
    document.querySelector("#firstName").value = employeeToEdit.firstName;
    document.querySelector("#lastName").value = employeeToEdit.lastName;
    document.querySelector("#email").value = employeeToEdit.email;
    document.querySelector("#username").value = employeeToEdit.username;
    document.querySelector("#active").checked = employeeToEdit.active;
}

async function saveEdits(e){
    e.preventDefault();
    //gather info from form
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const changePassword = document.querySelector("#changePassword").checked;
    const password = changePassword ? document.querySelector("#password").value : null;
    const position = document.querySelector("#position").value;
    const site = document.querySelector("#site").value;
    const active = document.querySelector("#active").checked;
    const locked = document.querySelector("#locked").checked;
    const employeeID = employeeToEdit.employeeID;
    
    let validData = validateCredentials(username, password);
    
    console.log(validData);
    if(validData === true){
        let editedUser = {
            employeeID: employeeID,
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password,
            positionID: position,
            siteID: site,
            active: active,
            locked: locked
        }
        console.log(editedUser);
        let url = "../UserService";
        let resp = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(editedUser),
        });
        responseObj = await resp.json();
        if(responseObj.success === true){
            alert("Successfully edited info for employee #" + employeeID);
            window.location.href="UserAccounts.html";
        }
        else {
            alert(responseObj.message);
        }
    }
    
}

function validateCredentials(username, password){
    let originalUsername = employeeToEdit.username;
    let validUser = true;
    allUsernames.forEach((u)=>{
        if(u === username && username !== originalUsername){
            validUser = false;
        }
    });
    //exit function and alert user for invalid username
    if(validUser === false){
        alert(`Error: username ${username} already taken`);
        return;
    }
    //check password, get confirmed password
    if(password !== null){
        let passwordConfirm = document.querySelector("#passwordConfirm").value;
        //exit function and alert user for passwords not matching
        if(password !== passwordConfirm){
            console.log(password);
            console.log(passwordConfirm);
            alert(`Error: Entered Passwords Do Not Match`);
            return;
        }
        else{
            return validUser;
        }
    }
    return validUser;
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

function toggleVisiblePasswordConfirm(){
    let password = document.querySelector("#passwordConfirm");
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
    let url = "../SiteService/";
    let resp = await fetch(url, {
        method: 'GET',
    });
    const sites = await resp.json();
    const siteSelect = document.querySelector("#site");
    sites.forEach((site) => {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", site.siteID);
        optionElement.innerHTML = site.name;
        if(site.name === employeeToEdit.site){
            optionElement.selected = true;
        }
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
        if(position.positionTitle === employeeToEdit.position){
            optionElement.selected = true;
        }
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


