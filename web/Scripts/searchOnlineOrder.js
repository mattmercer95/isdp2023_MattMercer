let onlineOrderIDs = [];

window.onload = async function(){
    await loadAllOnlineOrderIDs();
    document.querySelector("#search").addEventListener('submit', search);
};

function search(e){
    e.preventDefault();
    let foundID = -1
    let email = document.querySelector("#email").value;
    let orderID = +document.querySelector("#orderID").value;
    onlineOrderIDs.forEach((id)=>{
        if(+id.transactionID === orderID && id.email === email){
            foundID = id.transactionID;
        }
    });
    if(foundID > 0){
        sessionStorage.setItem("currentOnlineOrderID", foundID);
        window.location.href="ViewOnlineOrder.html";
    }
    else {
        alert("No open orders found");
    }
}

async function loadAllOnlineOrderIDs(){
    let url = "TransactionService/onlineOrderIDs";
    let resp = await fetch(url, {
        method: 'GET'
    });
    onlineOrderIDs = await resp.json();
}


