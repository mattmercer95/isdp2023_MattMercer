drop procedure if exists GetEmployeeInfo;
DELIMITER //

create procedure GetEmployeeInfo(in id int)
BEGIN
	Select employeeID, username, firstName, lastName, email, employee.active, locked, permissionLevel as position, name as site
    from employee inner join posn using(positionID) inner join site using(siteID)
    where employeeID = id;
END //

