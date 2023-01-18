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
        window.location.href = "dashboard.html";
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


