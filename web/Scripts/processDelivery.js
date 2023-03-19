let currentEmployee;

const idleDurationMins = 15;
const redirectUrl = "../index.html";
let idleTimeout;

let currentDelivery = null;

const numberFormat = new Intl.NumberFormat('en-US');


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
    //initialize idle timeout
    resetIdleTimeout();
    
    document.querySelector("#downloadPDF").addEventListener('click', generatePDF);
    document.querySelector("#pickupDeliveryBtn").addEventListener('click', pickupDelivery);
    
    loadCurrentDelivery();
    await loadDeliveryTransactions();
    generateTransactionCards();
    populateTransactionCards();
    checkIfDelivered();
    checkIfReady();
    populateDetailsPanel();
    console.log(currentDelivery);
};

async function pickupDelivery(){
    let url = `../DeliveryService/pickupDelivery`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentDelivery)
    });
    let result = await resp.json();
    console.log(result);
}

function checkIfDelivered(){
    let transactionCards = document.querySelectorAll(".transaction-card");
    let transactions = currentDelivery.transactions;
    let index = 0;
    transactionCards.forEach((c)=>{
        let confirmBtn = c.querySelector("button");
        let currentTxn = transactions[index];
        if(currentTxn.status === "IN TRANSIT"){
            confirmBtn.disabled = false;
        }
        index++;
    });
    
}

function checkIfReady(){
    let ready = false;
    let transactions = currentDelivery.transactions;
    transactions.forEach((t)=>{
        if(t.status === "READY"){
            ready = true;
        }
    });
    if(ready){
        document.querySelector("#pickupDeliveryBtn").hidden = false;
    }
}

function generatePDF() {
    // Choose the element that your content will be rendered to.
    const element = document.getElementById('deliveryPDF');
    var opt = {
        margin:0,
        filename: `Delivery-${currentDelivery.deliveryID}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Choose the element and save the PDF for your user.
    html2pdf().set(opt).from(element).save();
}

function populateTransactionItems(id, items){
    const tableEle = document.querySelector("#Items"+id);
    let counter = 1;
    items.forEach((x)=>{
        let rowEle = document.createElement("tr");
        let lineItemCell = document.createElement("td");
        lineItemCell.innerHTML = counter;
        counter++;
        rowEle.appendChild(lineItemCell);
        let nameCell = document.createElement("td");
        nameCell.innerHTML = x.name;
        rowEle.appendChild(nameCell);
        let numCasesCell = document.createElement("td");
        numCasesCell.innerHTML = x.caseQuantityOrdered;
        rowEle.appendChild(numCasesCell);
        let numItems = document.createElement("td");
        numItems.innerHTML = x.caseQuantityOrdered * x.caseSize;
        rowEle.appendChild(numItems);
        let weightCell = document.createElement("td");
        weightCell.innerHTML = numberFormat.format(x.caseQuantityOrdered * x.caseSize * x.weight);
        rowEle.appendChild(weightCell);
        
        tableEle.appendChild(rowEle);
    });
}

function populateTransactionCards(){
    let transactions = currentDelivery.transactions;
    let transactionCards = document.querySelectorAll(".transaction-card");
    let counter = 0;
    transactions.forEach((t)=>{
        let addressEle = document.querySelector(`#address${t.transactionID}`);
        addressEle.value = t.destinationAddress;
        let titleEle = document.querySelector(`#Name${t.transactionID}`);
        titleEle.innerHTML = `Order #${t.transactionID} - ${t.destination}`;
        let statusEle = document.querySelector(`#Status${t.transactionID}`);
        statusEle.value = t.status;
        let weightEle = document.querySelector(`#Weight${t.transactionID}`);
        weightEle.value = numberFormat.format(t.totalWeight);
        let numItemsEle = document.querySelector(`#numItems${t.transactionID}`);
        numItemsEle.value = t.items.length;
        populateTransactionItems(t.transactionID, t.items);
    });
}

function generateTransactionCards(){
    let containerEle = document.querySelector("#cardContainer");
    let transactions = currentDelivery.transactions;
    transactions.forEach((t)=>{
        let transactionCard = `<div class= "card transaction-card page-break" id="${t.transactionID}Card"> <div class="card-body"> 
<div class="row justify-content-center"> <h3 class="card-title col" id="Name${t.transactionID}">
</h3> <button class="btn btn-success col-3 btnSpacing" id="confirm${t.transactionID}" disabled>Confirm Delivery</button></div> 
<div class="row"><div class="form-group"><label><b>Destination Address: </b></label><input id="address${t.transactionID}" class="form-control" readonly></div></div>
<div class="row"> <div class="form-group col"> <label><b>Status:</b></label> 
<input class="form-control" value="" id="Status${t.transactionID}" readonly> </div> <div class="form-group col"> 
<label><b>Total Weight (kg):</b></label> <input class="form-control" value="" id="Weight${t.transactionID}" readonly> 
</div> <div class="form-group col"> <label><b># Line Items:</b></label> <input class="form-control" value="" id="numItems${t.transactionID}" readonly> 
</div> </div> <table class="table table-bordered table-striped "> <thead> <tr> <th>#</th> 
<th>Item Name</th> <th># Cases</th> <th># Items</th> <th>Weight</th> </tr> </thead> 
<tbody id="Items${t.transactionID}"> </tbody> </table> </div> </div>`;
        containerEle.innerHTML += transactionCard;
    });
}

async function loadDeliveryTransactions(){
    let url = `../DeliveryService/getTransactionsByDelivery`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(currentDelivery.deliveryID)
    });
    let deliveryTransactions = await resp.json();
    currentDelivery.transactions = deliveryTransactions;
    console.log(currentDelivery);
}

//populates the delivery details panel at the top of the page
function populateDetailsPanel(){
    document.querySelector("#deliveryID").value = currentDelivery.deliveryID;
    document.querySelector("#shipDate").value = currentDelivery.deliveryDate;
    document.querySelector("#truckSize").value = currentDelivery.truckSize;
    document.querySelector("#numLocations").value = currentDelivery.numLocations;
    document.querySelector("#weight").value = numberFormat.format(currentDelivery.weight);
    document.querySelector("#distanceCost").value = numberFormat.format(currentDelivery.distanceCost);
    document.querySelector("#pickupTime").value = currentDelivery.pickupTime;
    document.querySelector("#deliveredTime").value = currentDelivery.deliveredTime;
}

function loadCurrentDelivery(){
    currentDelivery = JSON.parse(sessionStorage.getItem("currentDelivery"));
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