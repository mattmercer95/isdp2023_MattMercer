let currentOrder = null;

//currency formatter
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.onload = async function(){
    await loadCurrentOrder();
    populateOrder();
    document.querySelector("#downloadPDF").addEventListener('click', generatePDF);
};

function generatePDF() {
    // Choose the element that your content will be rendered to.
    const element = document.getElementById('orderPDF');
    var opt = {
        margin:0,
        filename: `OnlineOrder-${currentOrder.transactionID}`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Choose the element and save the PDF for your user.
    html2pdf().set(opt).from(element).save();
}

function populateLineItems(cart){
    const table = document.querySelector("#orderTable");
    table.innerHTML = "";
    cart.forEach((item)=>{
        //create row and data cells
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.innerHTML = item.name;
        row.appendChild(nameCell);
        const categoryCell = document.createElement("td");
        categoryCell.innerHTML = item.category;
        row.appendChild(categoryCell);
        const descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = item.description;
        row.appendChild(descriptionCell);
        const priceCell = document.createElement("td");
        priceCell.innerHTML = currency.format(item.retailPrice);
        priceCell.id = `price${item.itemID}`;
        row.appendChild(priceCell);
        
        const qtyOrderedCell = document.createElement("td");
        qtyOrderedCell.innerHTML = item.caseQuantityOrdered;
        row.appendChild(qtyOrderedCell);
        const totalPriceCell = document.createElement("td");
        totalPriceCell.innerHTML = currency.format(item.retailPrice * item.caseQuantityOrdered);
        totalPriceCell.id = `totalPrice${item.itemID}`;
        row.appendChild(totalPriceCell);
        
        //add row to table
        table.appendChild(row);
    });
}

function getCustFromNotes(notes){
    let pieces = notes.split(":");
    let customer = {
        name: pieces[0],
        email: pieces[1],
        phone: pieces[2]
    }
    return customer;
}

function calculateTotals(items){
    let subtotal = 0.0;
    items.forEach((i)=>{
        subtotal += (+i.retailPrice * +i.caseQuantityOrdered);
    });
    let HST = 0.15 * subtotal;
    let total = subtotal + HST;
    
    document.querySelector("#subTotal").innerHTML = currency.format(subtotal);
    document.querySelector("#HST").innerHTML = currency.format(HST);
    document.querySelector("#total").innerHTML = currency.format(total);
}

function populateOrder(){
    document.querySelector("#location").value = currentOrder.origin;
    document.querySelector("#address").value = currentOrder.destinationAddress;
    let customer = getCustFromNotes(currentOrder.notes);
    document.querySelector("#name").value = customer.name;
    document.querySelector("#email").value = customer.email;
    document.querySelector("#phone").value = customer.phone;
    document.querySelector("#status").value = currentOrder.status;
    calculateTotals(currentOrder.items);
    populateLineItems(currentOrder.items);
}

async function loadCurrentOrder(){
    let id = sessionStorage.getItem("currentOnlineOrderID")
    let url = "TransactionService/getDetails";
    let resp = await fetch(url, {
        method: 'POST',
        body: id
    });
    currentOrder = await resp.json();
}


