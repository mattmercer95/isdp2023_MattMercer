
/**
	Run this script after running the main bullseyedb2023_X.X.sql script
**/

/* -----------------------------
		Stored Procedures
   ------------------------------ 
*/ 

/*
Gets the inventory from the warehouse based on items in a transaction. Used to determine back orders.
*/
drop procedure if exists GetWarehouseInventory;
DELIMITER //
create procedure GetWarehouseInventory(in orderID int)
BEGIN
	Select itemID, name, quantity, reorderThreshold, caseSize, weight   
    from inventory inner join item using (itemID) 
    where siteID = 1 and active = true
    and itemID in (select distinct itemID from txnitems where txnID = orderID);
END //
DELIMITER ;

/*
Gets the transaction details by transaction id
*/
drop procedure if exists GetTransactionByID;
DELIMITER //
create procedure GetTransactionByID(in orderID int)
BEGIN
	select *, (select name from site where siteIDTo = siteID) as destination, (select name as origin from site where siteIDFrom = siteID) as origin from txn where txnID = orderID;
END //
DELIMITER ;

/*
Gets the back order transaction details by site id
*/
drop procedure if exists GetCurrentBackOrder;
DELIMITER //
create procedure GetCurrentBackOrder(in id int)
BEGIN
	select *, (select name from site where siteIDTo = siteID) as destination, (select name as origin from site where siteIDFrom = siteID) as origin from txn 
    where siteIDTo = id and status = 'BACKORDER' and txnType = 'Back Order';
END //
DELIMITER ;

/*
Creates a new back order transaction and returns the info
*/
drop procedure if exists CreateNewBackOrder;
DELIMITER //
create procedure CreateNewBackOrder(in id int, in orderDate date)
BEGIN
	start transaction;
    call GetNextDeliveryDate(id, @nextShipDate);
    set @nextShipDate = DATE_ADD(@nextShipDate, INTERVAL 7 DAY);
	insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery)
		values(id, 1, 'BACKORDER', @nextShipDate, 'Back Order', 'X', orderDate, null, false);
	commit;
    call GetCurrentBackOrder(id);
END //
DELIMITER ;

/*
Gets the items for a transaction by transactionID
*/
drop procedure if exists GetTransactionItemsByID;
DELIMITER //
create procedure GetTransactionItemsByID(in orderID int)
BEGIN
	select siteIDTo into @storeID from txn where txnID = orderID;
	select * from txnitems inner join item using (itemID) inner join inventory using (itemID) where txnID = orderID and siteID = @storeID;
END //
DELIMITER ;

/*
Gets the next delivery date for a store location
*/
drop procedure if exists GetNextDeliveryDate;
DELIMITER //
create procedure GetNextDeliveryDate(in storeID int, out nextShipDate date)
BEGIN
	select dayOfWeekID into @dayID from site where siteID = storeID;
    SELECT date(DATE_ADD(NOW(), INTERVAL if( @dayID > WEEKDAY(NOW()) , (@dayID - WEEKDAY(NOW())) ,  (7 - WEEKDAY(NOW())) + @dayID) DAY)) into nextShipDate;
END //
DELIMITER ;

/*
Creates a store order and adds the inventory items that are below the threshold
*/
drop procedure if exists CreateNewStoreOrder;
DELIMITER //
create procedure CreateNewStoreOrder(in storeID int, in orderDate date, in emg tinyint)
BEGIN
	start transaction;
    call GetNextDeliveryDate(storeID, @nextShipDate);
	insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery)
		values(storeID, 1, 'NEW', @nextShipDate, 'Store Order', 'X', orderDate, null, emg);
	select LAST_INSERT_ID() into @orderID;
    if emg = false then
		insert into txnitems (txnID, itemID, quantity)
			select @orderID, itemID, ceiling((reorderThreshold - quantity) / caseSize) 
			from inventory inner join item using (itemID)
			where quantity < reorderThreshold and active = true and siteID = storeID;
	end if;
	commit;
    select @orderID;
END //
DELIMITER ;

/*
Returns how many emergency store orders are NEW for a location
*/
drop procedure if exists GetOpenEmergencyStoreOrderCount;
DELIMITER //
create procedure GetOpenEmergencyStoreOrderCount(in id int)
BEGIN
    select count(*) as ordersOpen 
    from txn 
    where status = 'NEW' 
    and siteIDTO = id 
    and emergencyDelivery = true;
END //
DELIMITER ;

/*
Returns how many regular store orders are open for a location
*/
drop procedure if exists GetOpenStoreOrderCount;
DELIMITER //
create procedure GetOpenStoreOrderCount(in id int)
BEGIN
    select count(*) as ordersOpen 
    from txn 
    where status not in ('CLOSED', 'REJECTED', 'BACKORDER') 
    and siteIDTO = id 
    and emergencyDelivery = false;
END //
DELIMITER ;

/*
Returns all retail locations
*/
drop procedure if exists GetAllRetailLocations;
DELIMITER //
create procedure GetAllRetailLocations()
BEGIN
    SELECT siteID, name 
    from site 
    where siteType = 'Retail';
END //
DELIMITER ;

/*
Retrieves the availbible inventory for a particular site
*/
drop procedure if exists GetAvailableInventory;
DELIMITER //
create procedure GetAvailableInventory(in id int)
BEGIN
    Select itemID, name, quantity, reorderThreshold, caseSize, weight   
    from inventory inner join item using (itemID)
    where siteID = id and active = true
    and itemID not in (select distinct itemID from txnitems inner join txn using(txnID) where status not in ('CLOSED', 'CANCELLED', 'REJECTED') and siteIDTo = id);
END //
DELIMITER ;

/*
Retrieves the inventory for a particular site
*/
drop procedure if exists GetInventoryBySiteID;
DELIMITER //
create procedure GetInventoryBySiteID(in id int)
BEGIN
    Select itemID, name, quantity, reorderThreshold, caseSize, weight   
    from inventory inner join item using (itemID)
    where siteID = id and active = true
    and itemID not in (select distinct itemID from txnitems inner join txn using(txnID) where status not in ('CLOSED', 'CANCELLED', 'REJECTED') and siteIDTo = id);
END //
DELIMITER ;

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
    Select employeeID, username, firstName, lastName, email, employee.active, locked, permissionLevel as position, employee.positionID, name as site, employee.siteID
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

/*
Retrieves the permissions not currently held by user
*/
drop procedure if exists GetPermissionsToAdd;
DELIMITER //
create procedure GetPermissionsToAdd(in id int)
BEGIN
    Select permissionID from permission
    where permissionID not in (
		select permissionID from user_permission where employeeID = id);
END //
DELIMITER ;

/*
Retreives the Information needed to display orders
*/
drop procedure if exists GetAllOrders;
DELIMITER //
create procedure GetAllOrders()
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID
    group by txnID;
END //
DELIMITER ;

/*
Retreives the Information needed to display orders
*/
drop procedure if exists GetZeroItemOrders;
DELIMITER //
create procedure GetZeroItemOrders()
BEGIN
    select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery
    from txn inner join site where siteIDTo = siteID and txnID not in (select distinct txnID from txnitems)
    group by txnID;
END //
DELIMITER ;

/*
Updates inventory count on Received order
*/
drop procedure if exists UpdateReceivedCount;
DELIMITER //
create procedure UpdateReceivedCount(in orderID int, in curQty int, in curItem int, in locationID int)
BEGIN
	update inventory set quantity = quantity - curQty where itemID = curItem and siteID = 1;
	update inventory set quantity = quantity + curQty, itemLocation = orderID where itemID = curItem and siteID = 2;
    select row_count() into @rc;
    if @rc = 0 then
		insert into inventory (itemID, siteID, quantity, itemLocation, reorderThreshold) values(curItem, 2, curQty, orderID, 0);
    end if;
END //
DELIMITER ;

/* -----------------------------
			Triggers
   ------------------------------ 
*/ 
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

/*
	Add day of week numbers to locations
*/
alter table site add dayOfWeekID int;
update site set dayOfWeekID = 0 where dayOfWeek = 'MONDAY';
update site set dayOfWeekID = 1 where dayOfWeek = 'TUESDAY';
update site set dayOfWeekID = 2 where dayOfWeek = 'WEDNESDAY';
update site set dayOfWeekID = 3 where dayOfWeek = 'THURSDAY';
update site set dayOfWeekID = 4 where dayOfWeek = 'FRIDAY';
update site set dayOfWeekID = 5 where dayOfWeek = 'SATURDAY';
update site set dayOfWeekID = 6 where dayOfWeek = 'SUNDAY';

/* -----------------------------
		Inserts/Misc
   ------------------------------ 
*/

/*
	Hash the default passwords
*/
alter table employee modify column password varchar(64) NOT NULL;
update employee set password = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" where employeeID = 1;
update employee set password = "3e61a5116573c12f045070b4a0bb2fa905e4439680e874e8330df62c9991d155" where employeeID = 1000;
update employee set password = "137a7cc92a86173b78d10e2558fde529fd584322668fbc93684fa190d9e8207c" where employeeID = 1001;
update employee set password = "82b084f320a2c977585ec19926d7ef45db24ad7456603a8aec434dae7400f411" where employeeID = 1002;
update employee set password = "5d7d0229af8b23d8b6fe043185c3729e67f11dd18c54af7da3da7403590ceac0" where employeeID = 1003;
update employee set password = "a48192e99cff9350caec8eabefdaf55f82d4a83f382fa6619b751941fbba3713" where employeeID = 1004;
update employee set password = "29ff53213445806bd82f32b31d130ec8dc90b07c2a17b645e8cfd92bb709914c" where employeeID = 1005;
update employee set password = "d8c88d71e299c7e3a15548c36b6b204decccdfb1833c798a26a21378e480cdcf" where employeeID = 1006;
update employee set password = "dc4fa5b9efaa457f39314e9e049d6cf59712eeba25fc6bf4db89c1fec7add9c4" where employeeID = 1007;
update employee set password = "c35302d8a3f9b91bba01963cb5debf54614d98d4cedc4056de414b23c4741a5e" where employeeID = 1008;
update employee set password = "5286bdef503ae2ba3e8e392a396c73f58ef04592b8af8c37129e0a5b0d13dcc1" where employeeID = 1009;
update employee set password = "ea4b7f2cc945c19ec7deac00026a21d7e09fc42d159273d426814d62b31f59f0" where employeeID = 1010;
update employee set password = "2f50eb161ff5f489ac65987ac310ae8ac35ce288b7995e0d99af31646cd66692" where employeeID = 1012;
update employee set password = "fa4010b05409d31cd1b5c573257635abea40971c2ccf6a9f64e9a911e4611082" where employeeID = 1013;
update employee set password = "3c69196823c39c3636ddcffeb53433c56f1ab67ee2de4a73d7d45823eb59f1c7" where employeeID = 1014;
update employee set password = "279781e5bb67acf9e591f90ce75e4e695acea62e846ffadef947c78daf7d63bf" where employeeID = 1015;

/*
	Add transaction types
*/
insert into txntype(txnType) values('Password Reset');
insert into txnstatus(statusName, statusDescription) values('ASSEMBLED', 'Order prepared by warehouse and rdy for delivery');
