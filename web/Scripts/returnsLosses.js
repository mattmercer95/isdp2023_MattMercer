let currentItem;

window.onload = async function(){
    currentItem = JSON.parse(sessionStorage.getItem("currentItem"));
    populateCurrentItem();
    console.log(currentItem);
};

//Loads all the data fields for the current item
function populateCurrentItem(){
    document.querySelector("#itemID").value = currentItem.itemID;
}


