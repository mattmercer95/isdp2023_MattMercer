window.onload = function () {
    // add event handlers for buttons
    document.querySelector("#signIn").addEventListener("submit", signIn);
};

async function signIn(e){
    e.preventDefault();
    let data; 
    try {
        //get sign-in info from user
        let username = document.querySelector("#username").value;
        username = username.trim();
        let password = document.querySelector("#password").value;
        
        let obj = {
            username: username,
            password: password,
        }
        
        let url = `LogInService/login`;
        let resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(obj)
        });
        let login = await resp.json();
        if(login.errorMessage){
            alert(login.errorMessage);
        }
        else {
            console.log(login.employee);
        }
    }
    catch(err){
        alert("Error Connecting to Database");
        console.log(err);
    }
}

