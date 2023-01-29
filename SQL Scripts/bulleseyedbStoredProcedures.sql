/**
Run this script after running the main bullseyedb2023_X.X.sql script
**/

/*
Retrieves just the name and ID for all sites
*/
drop procedure if exists GetAllSiteNamesIDs;
DELIMITER //
create procedure GetAllSiteNamesIDs()
BEGIN
    Select siteID, name from site
    where siteID not in (
		select siteID from site where siteID = 9999);
END //
DELIMITER ;

/*
Retrieves all relevent information for the Employee.java object
*/
drop procedure if exists GetAllEmployeeInfo;
DELIMITER //
create procedure GetAllEmployeeInfo()
BEGIN
    Select employeeID, username, password, firstName, lastName, email, employee.active, locked, permissionLevel as position, employee.positionID, name as site, employee.siteID
    from employee inner join posn using(positionID) inner join site using(siteID);
END //
DELIMITER ;

/*
Retrieves relevent information for the Employee.java object
*/
drop procedure if exists GetEmployeeInfo;
DELIMITER //
create procedure GetEmployeeInfo(in user varchar(32))
BEGIN
    Select employeeID, username, firstName, lastName, email, employee.active, locked, positionID, permissionLevel as position, name as site, employee.siteID
    from employee inner join posn using(positionID) inner join site using(siteID)
    where username = user;
END //
DELIMITER ;

/*
Retrieves relevent permissions based on employeeID. Helper procedure for creating Employee.java objects
*/
drop procedure if exists GetPermissionsByID;
DELIMITER //
create procedure GetPermissionsByID(in id int)
BEGIN
    Select permissionID from user_permission
    where employeeID = id;
END //
DELIMITER ;