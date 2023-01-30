const passwordRegex = /^[A-Za-z](?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
window.onload = function () {
    //load user into username field
    document.querySelector("#username").value = sessionStorage.getItem("resetPasswordUser");
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    document.querySelector("#togglePasswordConfirm").addEventListener("click", toggleVisiblePasswordConfirm);
    document.querySelector("#cancel").addEventListener("click", cancel);
    document.querySelector("#resetPasswordForm").addEventListener("submit", resetPassword);
};

async function resetPassword(e){
    e.preventDefault();
    //get the password and password confirm
    let password = document.querySelector("#password").value;
    if(!validatePassword(password)){
        alert("Error: Password must be 8-15 characters long,  start with a letter, and contain at least: 1 additional lowercase letter, 1 additional uppercase letter, 1 number, and 1 special character");
        return;
    }
    
    let passwordConfirm = document.querySelector("#passwordConfirm").value;
    //check for passwords matching
    if(password !== passwordConfirm){
        alert("Passwords must match");
        return;
    }
    
    //Make API call to reset password, returns a log in response object 
    let username = document.querySelector("#username").value; 
    let obj = {
        username: username,
        password: password,
    }
    let url = `PasswordResetService/reset`;
    let resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(obj),
    });
    let response = await resp.json();
    
    if(response.errorMessage){
        alert(response.errorMessage);
    }
    else{
        sessionStorage.setItem("employeeInfo", JSON.stringify(response.employee));
        alert("Password successfully reset");
        //get permissions
        let url = `UserService/permissions`;
        let resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(response.employee.employeeID)
        });
        sessionStorage.setItem("permissions", await resp.text());
        window.location.href = "dashboard.html";
    }
}

function validatePassword(password){
    if(password.match(passwordRegex)){
        console.log("hello");
        return true;
    }
    else {
        return false;
    }
}

function toggleVisiblePassword(){
    let password = document.querySelector("#password");
    // toggle the type attribute
    let type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
}
function toggleVisiblePasswordConfirm(){
    let password = document.querySelector("#passwordConfirm");
    // toggle the type attribute
    let type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
}
function cancel(){
    sessionStorage.setItem("resetPasswordUser", null);
    window.location.href = "index.html";
}


