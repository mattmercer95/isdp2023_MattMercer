let currentEmployee;

let idleTimeout;
const idleDurationMins = 15;
const redirectUrl = "../index.html";

let currentOrder = null;

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
    
    document.querySelector("#downloadPDF").addEventListener('click', generatePDF);
    //initialize idle timeout
    resetIdleTimeout();

    await getCurrentOrder();
};

function generatePDF() {
    // Choose the element that your content will be rendered to.
    const element = document.getElementById('orderPDF');
    var opt = {
        margin:0,
        filename: `Order-${currentOrder.transactionID}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Choose the element and save the PDF for your user.
    html2pdf().set(opt).from(element).save();
}
                        
async function getCurrentOrder() {
    let orderID = sessionStorage.getItem("currentOrderID");
    let url = `../TransactionService/getDetails`;
    let resp = await fetch(url, {
        method: 'POST',
        body: orderID
    });
    currentOrder = await resp.json();
    //populate info panel
    document.querySelector("#orderID").value = currentOrder.transactionID;
    document.querySelector("#creationDate").value = currentOrder.createdDate;
    document.querySelector("#originSite").value = currentOrder.origin;
    document.querySelector("#destinationSite").value = currentOrder.destination;
    document.querySelector("#status").value = currentOrder.status;
    document.querySelector("#shipDate").value = currentOrder.shipDate;
    document.querySelector("#deliveryID").value = (currentOrder.deliveryID === 0) ? "N/A" : currentOrder.deliveryID;
    document.querySelector("#totalQtyOrdered").value = currentOrder.quantity;
    document.querySelector("#totalWeight").value = currentOrder.totalWeight.toFixed(2);

    let typeLabel = document.querySelector("#typeLabel");
    const typeBadge = document.createElement("span");
    typeBadge.classList.add("badge");
    if (currentOrder.emergencyDelivery) {
        typeBadge.classList.add("text-bg-danger");
        typeBadge.innerHTML = "Emergency";
    } else if (currentOrder.status === "BACKORDER") {
        typeBadge.classList.add("bg-dark");
        typeBadge.innerHTML = "BACKORDER";
    } else {
        typeBadge.classList.add("text-bg-primary");
        typeBadge.innerHTML = "Regular";
    }
    typeLabel.appendChild(typeBadge);

    //load cart
    cart = currentOrder.items;
    buildCart();
}

function buildCart() {
    const table = document.querySelector("#orderTable");
    table.innerHTML = "";
    indexCounter = 0;
    cart.forEach((item) => {
        //create row and data cells
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.innerHTML = item.itemID;
        row.appendChild(idCell);
        const nameCell = document.createElement("td");
        nameCell.innerHTML = item.name;
        row.appendChild(nameCell);
        const weightCell = document.createElement("td");
        weightCell.innerHTML = (item.weight * item.caseQuantityOrdered * item.caseSize).toFixed(2);
        weightCell.id = `weight${item.itemID}`;
        row.appendChild(weightCell);
        const qtyOrderedCell = document.createElement("td");
        qtyOrderedCell.innerHTML = item.caseQuantityOrdered;
        row.appendChild(qtyOrderedCell);
        const checkCell = document.createElement("td");
        const check = document.createElement("input");
        check.type = "checkbox";
        check.id = item.itemID;
        check.style.width="20px";
        check.style.height="20px";
        checkCell.appendChild(check);
        checkCell.classList.add("form-check-input");
        row.appendChild(checkCell);

        //add row to table
        table.appendChild(row);
        indexCounter++;
    });
    updateCheckboxEvents(table);
}

function updateCheckboxEvents(table){
    const checkboxList = table.querySelectorAll("input");
    checkboxList.forEach((check)=>{
        check.addEventListener('input', isComplete);
    });
    
}

function isComplete(){
    const table = document.querySelector("#orderTable");
    const checkboxList = table.querySelectorAll("input");
    let complete = true;
    checkboxList.forEach((check)=>{
        if(!check.checked){
            complete = false;
        }
    });
    document.querySelector("#completeFulfillment").disabled = !complete;
}

function resetIdleTimeout() {
    //clears current timeout
    if (idleTimeout)
        clearTimeout(idleTimeout);
    //set new timeout which will redirect after x amount of minutes
    idleTimeout = setTimeout(logout, idleDurationMins * 60 * 1000);
}

//removes current employee from session storage and redirects user to sign-in page
async function logout() {
    let url = `../LogOutService/logout`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentEmployee)
    });
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "../index.html";
}