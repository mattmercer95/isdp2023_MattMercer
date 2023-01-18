window.onload = function () {
    // add event handlers for buttons
    document.querySelector("#signIn").addEventListener("submit", signIn);
    //add event for visable password toggle
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    document.querySelector("#resetPasswordLink").addEventListener("click", resetPassword);
};

async function resetPassword(e){
    e.preventDefault();
    //get username
    let username = document.querySelector("#username").value;
    if(username === ""){
        alert("Please enter a username to reset their password");
        return;
    }
    validUser = await validateUsername(username);
    if(validUser){
        sessionStorage.setItem("resetPasswordUser", username);
        window.location.href = "resetPassword.html";
    }
    else {
        alert(`${username} is not a valid username`);
        return;
    }
}

async function validateUsername(username){
    let url = `UsernameValidationService/validate`;
    let resp = await fetch(url, {
        method: 'POST',
        body: username,
    });
    return await resp.json();
}

function toggleVisiblePassword(){
    let password = document.querySelector("#password");
    // toggle the type attribute
    let type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
}
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
            //display error message if there is one
            alert(login.errorMessage);
        }
        else {
            //successfull login, store emp info in storage and direct user to dashboard
            sessionStorage.setItem("employeeInfo", JSON.stringify(login.employee));
            window.location.href = "dashboard.html";
        }
    }
    catch(err){
        alert("Error Connecting to Database");
        console.log(err);
    }
}

