let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

window.onload = async function(){
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
    //initialize idle timeout
    resetIdleTimeout();
    
    document.querySelector("#frmAddNewProduct").addEventListener('submit', submitNewProduct);
    
    await loadSupplierSelect();
};

async function submitNewProduct(e){
    e.preventDefault();
    let submitConfirm = confirm("Confirm addition of new product?");
    if(!submitConfirm){
        //abort
        return;
    }
    //get fully formed item object from data fields
    let item = createItemObj();
    //make API call to add new product
    let result = await insertNewProduct(item);
    if(result){
        alert("New product added successfully!");
        window.location.href = "ViewInventory.html";
    }
    else {
        alert("Something went wrong, please check server");
    }
}

async function insertNewProduct(item){
    let url = `../InventoryService/addNewProduct`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(item)
    });
    let response = await resp.json();
    return response;
}

function createItemObj(){ 
    let obj = {
        name: document.querySelector("#name").value,
        sku: document.querySelector("#sku").value,
        description: document.querySelector("#description").value,
        category: document.querySelector("#categorySelect").value,
        weight: document.querySelector("#weight").value,
        costPrice: document.querySelector("#costPrice").value,
        retailPrice: document.querySelector("#retailPrice").value,
        supplierID: document.querySelector("#supplierSelect").value,
        caseSize: document.querySelector("#caseSize").value
    };
    return obj;
}

async function getAllSuppliers(){
    let url = `../SupplierService`;
    let resp = await fetch(url, {
        method: 'GET'
    });
    let response = await resp.json();
    return response;
}

async function loadSupplierSelect(){
    let suppliers = await getAllSuppliers();
    let selector = document.querySelector("#supplierSelect");
    suppliers.forEach((supplier)=>{
        console.log(supplier);
        let optionEle = document.createElement("option");
        optionEle.value = supplier.supplierID;
        optionEle.innerHTML = supplier.name;
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


