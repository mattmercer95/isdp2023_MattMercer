drop trigger if exists default_permissions;
delimiter //
create trigger default_permissions
after insert
on employee for each row
begin
if new.positionID = 99999999 then
	insert into user_permission(employeeID, permissionID) values
		(new.employeeID, 'ACCEPTSTOREORDER'),
        (new.employeeID, 'ADDITEMTOBACKORDER'),
        (new.employeeID, 'ADDNEWPRODUCT'),
        (new.employeeID, 'ADDSITE'),
        (new.employeeID, 'ADDSUPPLIER'),
        (new.employeeID, 'ADDUSER'),
        (new.employeeID, 'CREATEBACKORDER'),
        (new.employeeID, 'CREATELOSS'),
        (new.employeeID, 'CREATEPERMISSION'),
        (new.employeeID, 'CREATEREPORT'),
        (new.employeeID, 'CREATESTOREORDER'),
        (new.employeeID, 'CREATESUPPLIERORDER'),
        (new.employeeID, 'DELETELOCATION'),
        (new.employeeID, 'DELETEUSER'),
        (new.employeeID, 'DELIVERY'),
        (new.employeeID, 'EDITINVENTORY'),
        (new.employeeID, 'EDITITEM'),
        (new.employeeID, 'EDITPRODUCT'),
        (new.employeeID, 'EDITSITE'),
        (new.employeeID, 'EDITUSER'),
        (new.employeeID, 'FULFILSTOREORDER'),
        (new.employeeID, 'MODIFYRECORD'),
        (new.employeeID, 'MOVEINVENTORY'),
        (new.employeeID, 'PREPARESTOREORDER'),
        (new.employeeID, 'PROCESSRETURN'),
        (new.employeeID, 'READUSER'),
        (new.employeeID, 'RECEIVESTOREORDER'),
        (new.employeeID, 'SETPERMISSION'),
        (new.employeeID, 'VIEWORDERS');
elseif new.positionID = 1  or new.positionID = 2 then
	insert into user_permission(employeeID, permissionID) values
		(new.employeeID, 'CREATEREPORT'),
        (new.employeeID, 'READUSER'),
        (new.employeeID, 'DELIVERY'),
        (new.employeeID, 'VIEWORDERS');
elseif new.positionID = 3 then
	insert into user_permission(employeeID, permissionID) values
		(new.employeeID, 'CREATELOSS'),
		(new.employeeID, 'CREATEREPORT'),
        (new.employeeID, 'CREATESTOREORDER'),
        (new.employeeID, 'DELIVERY'),
        (new.employeeID, 'MOVEINVENTORY'),
        (new.employeeID, 'PROCESSRETURN'),
        (new.employeeID, 'RECEIVESTOREORDER'),
        (new.employeeID, 'VIEWORDERS');
end if;
end; //
delimiter ;


