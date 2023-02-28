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
    document.querySelector("#addNewLocation").addEventListener('click', addNewLocation);
    //initialize idle timeout
    resetIdleTimeout();
    checkPermissions();
    await loadAllLocations();
    await loadSiteTypes();
    buildAccordion();
    if(editFlag){
        addEditEvents();
    }
    await loadProvinces();
};

async function addNewLocation(){
    console.log(locations[0]);
    let confirmNew = confirm("Add new location?");
    if(!confirmNew){
        //cancel
        return;
    }
    
    let name = document.querySelector("#nameAdd").value;
    let phone = document.querySelector("#phoneAdd").value;
    let distanceFromWH = +document.querySelector("#distanceAdd").value;
    let postalCode = document.querySelector("#postalCodeAdd").value;
    let deliveryDayID = +document.querySelector("#deliveryDayAdd").value;
    let deliveryDay = getDayOfWeek(deliveryDayID);
    let siteType = document.querySelector("#addSiteType").value;
    let address = document.querySelector("#addressAdd").value;
    let address2 = document.querySelector("#address2Add").value;
    let city = document.querySelector("#cityAdd").value;
    let provinceSelect = document.querySelector("#addProvinceSelect");
    let provinceID = provinceSelect.value;
    let country = document.querySelector("#countryAdd").value;
    
    let newLocation = {
        active: true,
        address: address,
        address2: address2,
        city: city,
        country: country,
        dayOfWeekID: deliveryDayID,
        dayOfWeek: deliveryDay,
        distanceFromWH: distanceFromWH,
        name: name,
        phone: phone,
        postalCode: postalCode,
        province: null,
        provinceID: provinceID,
        siteType: siteType,
        siteID: -1
    };
    
    let url = "../SiteService/new";
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(newLocation)
    });
    let success = await resp.json();
}

function getDayOfWeek(x){
    let result;
    switch(x){
        case 0:
            result = "MONDAY";
            break;
        case 1:
            result = "TUESDAY";
            break;
        case 2:
            result = "WEDNESDAY";
            break;
        case 3:
            result = "THURSDAY";
            break;
        case 4:
            result = "FRIDAY";
            break;
        case 5:
            result = "SATURDAY";
            break;
        case 6:
            result = "SUNDAY";
            break;
        default:
            break;
    }
    return result;
}

async function loadSiteTypes(){
    let url = "../SiteService/typeList";
    let resp = await fetch(url, {
        method: 'GET'
    });
    let typeList = await resp.json();
    let editSite = document.querySelector("#editSiteType");
    let addSite = document.querySelector("#addSiteType");
    
    typeList.forEach((type)=>{
        const editOptionEle = document.createElement("option");
        editOptionEle.value = type;
        editOptionEle.innerHTML = type;
        editSite.appendChild(editOptionEle);
        const addOptionEle = document.createElement("option");
        addOptionEle.value = type;
        addOptionEle.innerHTML = type;
        addSite.appendChild(addOptionEle);
    });
}

async function loadProvinces(){
    let url = "../SiteService/provinceList";
    let resp = await fetch(url, {
        method: 'GET'
    });
    let provinceList = await resp.json();
    let editProvinceSelect = document.querySelector("#editProvinceSelect");
    let addProvinceSelect = document.querySelector("#addProvinceSelect");
    
    provinceList.forEach((province)=>{
        const editOptionEle = document.createElement("option");
        editOptionEle.value = province.code;
        editOptionEle.innerHTML = province.name;
        editProvinceSelect.appendChild(editOptionEle);
        const addOptionEle = document.createElement("option");
        addOptionEle.value = province.code;
        addOptionEle.innerHTML = province.name;
        addProvinceSelect.appendChild(addOptionEle);
    });
    
    
}

async function saveChanges(){
    let confirmChanges = confirm("Save changes to location?");
    if(!confirmChanges){
        //cancel
        return;
    }
    let name = document.querySelector("#nameEdit").value;
    let phone = document.querySelector("#phoneEdit").value;
    let distanceFromWH = document.querySelector("#distanceEdit").value;
    let postalCode = document.querySelector("#postalCodeEdit").value;
    let deliveryDayID = document.querySelector("#deliveryDayEdit").value;
    let deliveryDay = getDayOfWeek(deliveryDayID);
    let siteType = document.querySelector("#editSiteType").value;
    let address = document.querySelector("#addressEdit").value;
    let address2 = document.querySelector("#address2Edit").value;
    let city = document.querySelector("#cityEdit").value;
    let provinceSelect = document.querySelector("#editProvinceSelect");
    let provinceID = provinceSelect.value;
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
    currentLocation.dayOfWeekID = deliveryDayID;
    currentLocation.dayOfWeek = deliveryDay;
    currentLocation.siteType = siteType;
    currentLocation.address = address;
    if(address2 !== ""){
       currentLocation.address2 = address2; 
    }
    currentLocation.city = city;
    currentLocation.provinceID = provinceID;
    currentLocation.country = country;
    
    await updateSite(currentLocation);
    
}

async function updateSite(currentLocation){
    let url = `../SiteService/`;
    let resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(currentLocation)
    });
    let result = await resp.text();
    if(result){
        alert(`${currentLocation.name} record updated succesfully`);
        window.location.href = "ViewLocations.html";
    }
    else {
        alert("Error updating location. Please check server.");
    }
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
    let typeSelect = document.querySelector("#editSiteType");
    let typeOptions = typeSelect.querySelectorAll("option");
    let originalType = inputs.querySelector(".Type").value;
    typeOptions.forEach((option)=>{
        if(option.innerHTML === originalType){
            option.selected = true;
        }
    });
    document.querySelector("#addressEdit").value = inputs.querySelector(".Address").value;
    let address2Input = inputs.querySelector(".Address2");
    if(address2Input === null){
        document.querySelector("#address2Edit").value = "";
    }
    else {
        document.querySelector("#address2Edit").value = address2Input.value;
    }
    document.querySelector("#cityEdit").value = inputs.querySelector(".City").value;
    let provinceSelect = document.querySelector("#editProvinceSelect");
    let provinceOptions = provinceSelect.querySelectorAll("option");
    let originalProvince = inputs.querySelector(".Province").value;
    provinceOptions.forEach((option)=>{
        if(option.innerHTML === originalProvince){
            option.selected = true;
        }
    });
    document.querySelector("#countryEdit").value = inputs.querySelector(".Country").value;
}

function checkPermissions(){
    let permissions = JSON.parse(sessionStorage.getItem("permissions"));
    console.log(permissions);
    permissions.forEach((permission) =>{
        if(permission === "EDITSITE"){
            editFlag = true;
        }
        if(permission === "ADDSITE"){
            console.log("found");
            console.log(document.querySelector("#btnAddNewSite"));
            document.querySelector("#btnAddNewSite").classList.remove("d-none");
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
            const editButtonString = `<button type="button" class="btn btn-warning editButton" data-bs-toggle="modal" data-bs-target="#editLocationModal">Edit Location</button>`;
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
        let typeDiv = createInput(current, "Type", current.siteType);
        col2.appendChild(typeDiv);
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

