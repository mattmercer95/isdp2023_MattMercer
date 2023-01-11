drop procedure if exists GetPermissionsByID;
DELIMITER //

create procedure GetPermissionsByID(in id int)
BEGIN
	Select permissionID from user_permission
    where employeeID = id;
END //

call GetPermissionsByID(1);