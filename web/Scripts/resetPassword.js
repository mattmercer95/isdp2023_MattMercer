window.onload = function () {
    //load user into username field
    document.querySelector("#username").value = sessionStorage.getItem("resetPasswordUser");
    document.querySelector("#togglePassword").addEventListener("click", toggleVisiblePassword);
    document.querySelector("#togglePasswordConfirm").addEventListener("click", toggleVisiblePasswordConfirm);
    document.querySelector("#cancel").addEventListener("click", cancel);
    document.querySelector("#resetPasswordForm").addEventListener("submit", resetPassword);
};

function resetPassword(e){
    e.preventDefault();
    alert("Reset");
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


