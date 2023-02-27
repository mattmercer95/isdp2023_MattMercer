let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let locations = null;
let editFlag = false;

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
    
    //reset idleTimeouts for clicking, moving the mouse, or typing
    document.addEventListener('click', resetIdleTimeout, false);
    document.addEventListener('mousemove', resetIdleTimeout, false);
    document.addEventListener('keydown', resetIdleTimeout, false);
    document.querySelector("#saveChanges").addEventListener('click', saveChanges);
    //initialize idle timeout
    resetIdleTimeout();
    checkPermissions();
    await loadAllLocations();
    buildAccordion();
    if(editFlag){
        addEditEvents();
    }
};

async function saveChanges(){
    let name = document.querySelector("#nameEdit").value;
    let phone = document.querySelector("#phoneEdit").value;
    let distanceFromWH = document.querySelector("#distanceEdit").value;
    let postalCode = document.querySelector("#postalCodeEdit").value;
    let deliveryDay = document.querySelector("#deliveryDayEdit").value;
    let address = document.querySelector("#addressEdit").value;
    let address2 = document.querySelector("#address2Edit").value;
    let city = document.querySelector("#cityEdit").value;
    let province = document.querySelector("#provinceEdit").value;
    let country = document.querySelector("#countryEdit").value;
    
    //get current location
    let accordionCollapseList = document.querySelectorAll(".accordion-collapse");
    let currentLocation;
    let i = 0;
    accordionCollapseList.forEach((x)=>{
        if(x.classList.contains("show")){
            currentLocation = locations[i];
        }
        i++;
    });
    
    //change fields of current Location
    currentLocation.name = name;
    currentLocation.phone = phone;
    currentLocation.distanceFromWH = distanceFromWH;
    currentLocation.postalCode = postalCode;
    currentLocation.dayOfWeek = deliveryDay;
    currentLocation.address = address;
    if(address2 !== ""){
       currentLocation.address2 = address2; 
    }
    currentLocation.city = city;
    currentLocation.province = province;
    currentLocation.country = country;
    
    console.log(currentLocation);
    
}

function addEditEvents(){
    let editButtons = document.querySelectorAll(".editButton");
    let i = 0;
    editButtons.forEach((button)=>{
        button.addEventListener('click', edit);
        i++;
    });
}

function edit(e){
    let inputs = e.target.parentElement.parentElement.lastChild;
    //populate Modal
    populateModal(inputs);
}

function populateModal(inputs){
    document.querySelector("#nameEdit").value = inputs.querySelector(".LocationName").value;
    document.querySelector("#phoneEdit").value = inputs.querySelector(".Phone").value;
    document.querySelector("#postalCodeEdit").value = inputs.querySelector(".PostalCode").value;
    document.querySelector("#deliveryDayEdit").value = inputs.querySelector(".DeliveryDay").value
    let distanceInput = inputs.querySelector(".DistancefromWarehouse");
    if(distanceInput === null){
        document.querySelector("#distanceEdit").disabled = true;
        document.querySelector("#distanceEdit").value = 0;
    }
    else {
        document.querySelector("#distanceEdit").disabled = false;
        document.querySelector("#distanceEdit").value = distanceInput.value;
    }
    document.querySelector("#addressEdit").value = inputs.querySelector(".Address").value;
    let address2Input = inputs.querySelector(".Address2");
    if(address2Input === null){
        document.querySelector("#address2Edit").value = "";
    }
    else {
        document.querySelector("#address2Edit").value = address2Input.value;
    }
    document.querySelector("#cityEdit").value = inputs.querySelector(".City").value;
    document.querySelector("#provinceEdit").value = inputs.querySelector(".Province").value;
    document.querySelector("#countryEdit").value = inputs.querySelector(".Country").value;
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    let createFlag = false;
    permissions.forEach((permission) =>{
        if(permission === "EDITSITE"){
            editFlag = true;
        }
    });
}

async function loadAllLocations(){
    let url = `../SiteService/allDetailed`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    locations = await resp.json();
}

function buildAccordion(){
    let accordionEle = document.querySelector("#locationAccordian");
    accordionEle.innerHTML = "";
    locations.forEach((location)=>{
        newAccordionObject(accordionEle, location);
    });
    loadContent(accordionEle);
}

function loadContent(){
    let elements = document.querySelectorAll(".accordion-body");
    let locationIndex = 0;
    elements.forEach((e) =>{
        let current = locations[locationIndex];
        locationIndex++;
        
        if(editFlag){
            const editButtonString = `<div class='row'><button type="button" class="btn btn-warning editButton" data-bs-toggle="modal" data-bs-target="#editLocationModal">Edit Location</button></div>`;
            e.innerHTML += editButtonString;
        }
        const row = document.createElement("div");
        row.classList.add("row", "justify-content-center");
        const col1 = document.createElement("div");
        col1.classList.add("col");
        const col2 = document.createElement("div");
        col2.classList.add("col");
        
        //Column1
        let locDiv = createInput(current, "Location Name", current.name);
        col1.appendChild(locDiv);
        let phoneDiv = createInput(current, "Phone", current.phone);
        col1.appendChild(phoneDiv);
        if(current.dayOfWeek !== "SATURDAY"){
            let distanceDiv = createInput(current, "Distance from Warehouse", current.distanceFromWH);
            col1.appendChild(distanceDiv);
        }
        let postalDiv = createInput(current, "Postal Code", current.postalCode);
        col1.appendChild(postalDiv);
        let dayDiv = createInput(current, "Delivery Day", current.dayOfWeek);
        col1.appendChild(dayDiv);
        row.appendChild(col1);
        
        //Column 2
        let addressDiv = createInput(current, "Address", current.address);
        col2.appendChild(addressDiv);
        if(typeof current.address2 !== 'undefined'){
            let address2Div = createInput(current, "Address 2", current.address2);
            col2.appendChild(address2Div);
        }
        let cityDiv = createInput(current, "City", current.city);
        col2.appendChild(cityDiv);
        let provinceDiv = createInput(current, "Province", current.province);
        col2.appendChild(provinceDiv);
        let countryDiv = createInput(current, "Country", current.country);
        col2.appendChild(countryDiv);
        row.appendChild(col2);

        e.appendChild(row);

    });
}

function createInput(current, label, value){
    let newDiv = document.createElement("div");
    newDiv.classList.add("form-group");
    let newLabel = document.createElement("label");
    newLabel.innerHTML = `<b>${label}:</b>`;
    let newInput = document.createElement("input");
    newInput.classList.add("form-control");
    newInput.value = value;
    newInput.id = current.name + label;
    newInput.classList.add(label.replace(/\s/g, ''));
    newInput.disabled = true;
    newDiv.appendChild(newLabel);
    newDiv.appendChild(newInput);
    return newDiv;
}

function newAccordionObject(accordionEle, location){
    const accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion-item");
    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.id = `heading${location.siteID}`;
    let buttonString = `<button class="accordion-button collapsed" type="button"`+ 
        `data-bs-toggle="collapse" data-bs-target="#collapse${location.siteID}"` + 
        `aria-expanded="true" aria-controls="collapse${location.siteID}">${location.name}</button>`;
    accordionHeader.innerHTML = buttonString;
    accordionDiv.appendChild(accordionHeader);
    const collapseString = ` <div id="collapse${location.siteID}" class="accordion-collapse collapse"` + 
        ` aria-labelledby="heading${location.siteID}" data-bs-parent="#${accordionEle.id}">` +
        `<div class="accordion-body id=body${location.siteID}"></div></div>`;
    accordionDiv.innerHTML += collapseString;
    accordionEle.appendChild(accordionDiv);
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

