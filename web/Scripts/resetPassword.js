window.onload = function () {
    //load user into username field
    document.querySelector("#username").value = sessionStorage.getItem("resetPasswordUser");
};


