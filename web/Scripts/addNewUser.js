let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;
let allUsernames;
const passwordRegex = /^[A-Za-z](?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

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
    //password toggler
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    //username & email generation
    document.querySelector("#firstName").addEventListener("input", generateCredentials);
    document.querySelector("#lastName").addEventListener("input", generateCredentials);
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

function validatePassword(password){
    if(password.match(passwordRegex)){
        return true;
    }
    else {
        return false;
    }
}

async function saveNewUser(e){
    e.preventDefault();
    //gather info from form
    const password = document.querySelector("#password").value;
    if(!validatePassword(password)){
        alert("Error: Password must be 8-15 characters long,  start with a letter, and contain at least: 1 addional lowercase letter, 1 additional uppercase letter, 1 number, and 1 special character");
        return;
    }
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
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

//generates a username and email based on the first and last name entered
function generateCredentials(){
    //get the value of the first and last names
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    let username = (firstName.charAt(0) + lastName).toLowerCase();
    //Loop through users and ensure username is unique
    let validUser = false;
    let userCounter = 1;
    while(!validUser){
        validUser = true;
        allUsernames.forEach((user) => {
            if(user === username){
                validUser = false;
                username = (firstName.charAt(0) + lastName).toLowerCase() + userCounter;
                userCounter++;
            }
        });
    }
    //set the value of the username and email fields
    document.querySelector("#username").value = username;
    document.querySelector("#email").value = username + "@bullseye.ca";
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


