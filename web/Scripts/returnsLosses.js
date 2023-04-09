let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let currentItem;

window.onload = async function(){
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
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
    
    document.querySelector("#typeSelect").addEventListener('input', typeSelectChange);
    document.querySelector("#processReturnLoss").addEventListener('submit', processReturnLoss);
    
    //load current item and display it
    currentItem = JSON.parse(sessionStorage.getItem("currentItem"));
    populateCurrentItem();
};

async function processReturnLoss(e){
    e.preventDefault();
    //get type
    let type = document.querySelector("#typeSelect").value;
    let confirmProcess = confirm(`Confirm ${type} for ${currentItem.name}?`);
    if(!confirmProcess){
        //exit function
        return;
    }
    //check for damaged return 
    let checkVal = document.querySelector("#returnCheck").checked; //true if returned into inventory, false if damaged.
    type = type == "Return" && !checkVal ? "Damage" : type; //change type to Damage if chosen
    
    //make submission to API
    await submitReturnLoss(type);
}

async function submitReturnLoss(type){
    //get notes
    let notes = document.querySelector("#notes").value;
    let items = [currentItem];
    let obj = {
        siteIDFrom: currentItem.siteID,
        transactionType: type,
        items: items,
        notes: notes
    };
    
    let url = `../TransactionService/returnLoss`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj)
    });
    let respText = await resp.json();
    if(respText){
        alert(`${type} recorded successfully for ${currentItem.name}.`);
        window.location.href = "ViewInventory.html";
    }
    else {
        alert("Something went wrong, please check server");
    }
}

//checks if return or loss, disables return to inventory checkbox accordingly
function typeSelectChange(){
    let value = document.querySelector("#typeSelect").value;
    let checkbox = document.querySelector("#returnCheck");
    if(value === "Return"){
        checkbox.disabled = false;
    }
    else {
        checkbox.checked = false;
        checkbox.disabled = true;
    }
}

//Loads all the data fields for the current item
function populateCurrentItem(){
    document.querySelector("#itemID").value = currentItem.itemID;
    document.querySelector("#name").value = currentItem.name;
    document.querySelector("#description").value = currentItem.description;
    document.querySelector("#quantity").value = currentItem.itemQuantityOnHand;
    document.querySelector("#sku").value = currentItem.sku;
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
