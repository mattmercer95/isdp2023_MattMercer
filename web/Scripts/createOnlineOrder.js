let allLocations = [];

window.onload = async function(){
    await loadAllLocations();
};

async function loadAllLocations(){
    let url = "SiteService/retailLocations";
    let resp = await fetch(url, {
        method: 'GET'
    });
    allLocations = await resp.json();
    console.log(allLocations);
}


