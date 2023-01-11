let currentEmployee;
window.onload = function () {
    //set current employee global to the user that logged in
    currentEmployee = JSON.parse(sessionStorage.getItem("employeeInfo"));
    //load name and title on the nav bar
    let nameTitle = document.querySelector("#nameTitle");
    nameTitle.innerHTML = `${currentEmployee.firstName} ${currentEmployee.lastName}, ${currentEmployee.position}`;
    //add event for logout button
    document.querySelector("#logoutLink").addEventListener("click", logout);
    console.log(currentEmployee);
};

//removes current employee from session storage and redirects user to sign-in page
function logout(){
    sessionStorage.setItem("employeeInfo", null);
    window.location.href = "index.html";
}


