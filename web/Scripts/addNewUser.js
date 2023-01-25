let currentEmployee;
const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;
let allUsernames;

window.onload = async function () {
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
    //load data for select menus
    await loadSelectMenus();
    await getAllUsernames();
};

async function getAllUsernames(){
    
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


