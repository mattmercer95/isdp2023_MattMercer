
/**
	Run this script after running the main bullseyedb2023_X.X.sql script
**/

/* -----------------------------
		Stored Procedures
   ------------------------------ 
*/ 

/*
Adds a transaction to an open delivery; Creates a new delivery if max weight is reached
*/
drop procedure if exists AddToDelivery;
DELIMITER //
create procedure AddToDelivery(in orderID int, in weightToAdd double)
BEGIN
    declare currDate datetime;
    declare currTotalWeight decimal(10,2);
    declare currDeliveryID integer;
    declare combinedWeight decimal(10,2);
    declare currVehicleType varchar(20);
    declare currDistance integer;
    declare distanceToAdd integer;
    declare curCostPerKM decimal(10,2);
    declare costPerKMToAdd decimal(10,2);
    declare currDistanceCost decimal(10,2);
    declare distanceCostToAdd decimal(10,2);

    
    /*Get the next available delivery with available weight room*/
    select shipDate, totalWeight, deliveryID 
    into currDate, currTotalWeight, currDeliveryID
    from txn inner join delivery using (deliveryID)
    where shipDate = (select shipDate from txn where txnID = orderID)
    order by totalWeight limit 1;
    
    /*check if combined weight exceeds the maximum truck size (20,000 kg)*/
    set combinedWeight := currTotalWeight + weightToAdd;
    if combinedWeight >= 20000 then
		/*Create a new delivery record*/
        start transaction;
		call GetVehicleByWeight(weightToAdd, currVehicleType);
        set currDistance := (select distanceFromWH from site inner join txn on site.siteID = txn.siteIDTo where txnID = orderID);
        set curCostPerKM := (select costPerKm from vehicle where vehicleType = currVehicleType);
        set currDistanceCost := currDistance * curCostPerKM;
		insert into delivery (distanceCost, vehicleType, notes, totalWeight) values (currDistanceCost, currVehicleType, null, weightToAdd);
        update txn set deliveryID = last_insert_id() where txnID = orderID;
        commit;
	else 
		/*Add transaction to delivery*/
        call GetVehicleByWeight(combinedWeight, currVehicleType);
        /*Adjust distance cost for the additional destination and/or change of truck type*/
        select sum(distanceFromWH) into currDistance 
			from txn inner join delivery using (deliveryID) inner join site on txn.siteIDTo = site.siteID 
			where deliveryID = currDeliveryID;
        set distanceToAdd := (select distanceFromWH from site inner join txn on site.siteID = txn.siteIDTo where txnID = orderID);
        set costPerKMToAdd := (select costPerKm from vehicle where vehicleType = currVehicleType);
        set distanceCostToAdd := (distanceToAdd + currDistance) * costPerKMToAdd;
        update delivery set distanceCost = distanceCostToAdd, vehicleType = currVehicleType, totalWeight = combinedWeight where deliveryID = currDeliveryID;
        update txn set deliveryID = currDeliveryID where txnID = orderID;
    end if;
    
END //
DELIMITER ;

/*
Gets the optimal vehicle by weight
*/
drop procedure if exists GetVehicleByWeight;
DELIMITER //
create procedure GetVehicleByWeight(in totalWeight double, out currentVehicleType varchar(20))
BEGIN
    set currentVehicleType := (select vehicleType from vehicle where maxWeight >= totalWeight and vehicleType != 'Courier' order by maxWeight limit 1);
END //
DELIMITER ;

/*
Creates a delivery record for a transaction if none is currently open
*/
drop procedure if exists OpenDelivery;
DELIMITER //
create procedure OpenDelivery(in orderID int, in inTotalWeight double)
BEGIN
    declare OpenDeliveriesOnDate integer;
    declare vehicleTypeSelected varchar(20);
    declare distance int;
    declare costPerKMSelected decimal(10,2);
    declare varDistanceCost decimal(10,2);
    
    set OpenDeliveriesOnDate := (select count(*) from txn where deliveryID is not null and shipDate = (select shipDate from txn where txnID = orderID));
    
    /*
    Add transaction to an already open delivery for that date
    */
    if OpenDeliveriesOnDate = 0 then
        start transaction;
		call GetVehicleByWeight(inTotalWeight, vehicleTypeSelected);
        set distance := (select distanceFromWH from site inner join txn on site.siteID = txn.siteIDTo where txnID = orderID);
        set costPerKMSelected := (select costPerKm from vehicle where vehicleType = vehicleTypeSelected);
        set varDistanceCost := distance * costPerKMSelected;
		insert into delivery (distanceCost, vehicleType, notes, totalWeight) values (varDistanceCost, vehicleTypeSelected, null, inTotalWeight);
        update txn set deliveryID = last_insert_id() where txnID = orderID;
        commit;
	/*
	Create a new delivery entry
    */
	else
		call AddToDelivery(orderID, inTotalWeight);
    end if;
END //
DELIMITER ;

/*
Creates a delivery record for an emergency order
*/
drop procedure if exists OpenEmergencyDelivery;
DELIMITER //
create procedure OpenEmergencyDelivery(in orderID int, in weight decimal(10,2))
BEGIN
	insert into delivery (distanceCost, vehicleType, notes, totalWeight) values (0.0, 'Courier', null, weight);
    update txn set deliveryID = last_insert_id() where txnID = orderID;
END //
DELIMITER ;

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
	select *, (select name from site where siteIDTo = siteID) as destination, 
    (select name as origin from site where siteIDFrom = siteID) as origin,
    (select concat(address, " ", city, ", ", provinceID) from site where siteIDFrom = siteID) as address
    from txn where txnID = orderID;
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
Gets all Deliveries
*/
drop procedure if exists GetAllDeliveries;
DELIMITER //
create procedure GetAllDeliveries()
BEGIN
	select deliveryID, status, count(siteIDTo) as numLocations, distanceCost, totalWeight, shipDate, deliveryStart, deliveryEnd, vehicleType 
    from delivery inner join txn using (deliveryID)  
	group by deliveryID;
END //
DELIMITER ;

drop procedure if exists GetDeliveryByShipDate;
DELIMITER //
create procedure GetDeliveryByShipDate(in inShipDate date)
BEGIN
	select deliveryID, status, count(siteIDTo) as numLocations, distanceCost, totalWeight, shipDate, deliveryStart, deliveryEnd, vehicleType 
    from delivery inner join txn using (deliveryID) where shipDate = inShipDate 
	group by deliveryID;
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
Gets the online ids for all open orders
*/
drop procedure if exists GetOpenOnlineIDs;
DELIMITER //
create procedure GetOpenOnlineIDs()
BEGIN
	select txnID, SUBSTRING_INDEX(SUBSTRING_INDEX(notes, ':', 2), ':', -1) as email from txn where siteIDTo = 11 and status in ('PROCESSING', 'READY');
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
	insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, notes)
		values(storeID, 1, 'NEW', @nextShipDate, 'Store Order', 'X', orderDate, null, emg, "x");
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
Creates a supplier order and adds the inventory items that are below the threshold
*/
drop procedure if exists CreateNewSupplierOrder;
DELIMITER //
create procedure CreateNewSupplierOrder(in storeID int, in orderDate date, in emg tinyint)
BEGIN
	start transaction;
    call GetNextDeliveryDate(storeID, @nextShipDate);
	insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, notes)
		values(storeID, 1, 'NEW', @nextShipDate, 'Supplier Order', 'X', orderDate, null, emg, "x");
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
    where status not in ('CLOSED', 'REJECTED', 'BACKORDER', 'CANCELLED') 
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
    SELECT siteID, name, address, address2, city, provinceID
    from site 
    where siteType = 'Retail' and siteID not in (2, 11);
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
Retrieves the availbible inventory for an online order
*/
drop procedure if exists GetAvailableOnlineInventory;
DELIMITER //
create procedure GetAvailableOnlineInventory(in id int)
BEGIN
    Select itemID, name, quantity, retailPrice, category, description  
    from inventory inner join item using (itemID)
    where siteID = id and active = true;
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
    Select siteID, name from site;
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
Retreives orders assoicated with a delivery
*/
drop procedure if exists GetOrdersByDeliveryID;
DELIMITER //
create procedure GetOrdersByDeliveryID(in inDeliveryID int)
BEGIN
    Select txnID, site.address, site.address2, site.city, site.provinceID, 
    site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, 
    deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and deliveryID = inDeliveryID 
    group by txnID;
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
drop procedure if exists GetAllOrdersInDateRange;
DELIMITER //
create procedure GetAllOrdersInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order"
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetAllBackordersInDateRange;
DELIMITER //
create procedure GetAllBackordersInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Back Order"
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetSupplierOrdersInDateRange;
DELIMITER //
create procedure GetSupplierOrdersInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Supplier Order" and siteIDTo = 1
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetReturnsLossDamageInDateRange;
DELIMITER //
create procedure GetReturnsLossDamageInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType in ("Damage", "Loss", "Return")
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetReturnsLossDamageInDateRangeBySite;
DELIMITER //
create procedure GetReturnsLossDamageInDateRangeBySite(in inStartDate date, in inEndDate date, in inSiteID int)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType in ("Damage", "Loss", "Return") and siteIDTo = inSiteID
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetOrdersInDateRangeBySite;
DELIMITER //
create procedure GetOrdersInDateRangeBySite(in inStartDate date, in inEndDate date, in inSiteID int)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order" and siteIDTo = inSiteID
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetBackordersInDateRangeBySite;
DELIMITER //
create procedure GetBackordersInDateRangeBySite(in inStartDate date, in inEndDate date, in inSiteID int)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Back Order" and siteIDTo = inSiteID
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetAllRegularOrdersInDateRange;
DELIMITER //
create procedure GetAllRegularOrdersInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order" and emergencyDelivery = false
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetRegularOrdersInDateRangeBySite;
DELIMITER //
create procedure GetRegularOrdersInDateRangeBySite(in inStartDate date, in inEndDate date, in inSiteID int)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order" and siteIDTo = inSiteID and emergencyDelivery = false
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetAllEmergencyOrdersInDateRange;
DELIMITER //
create procedure GetAllEmergencyOrdersInDateRange(in inStartDate date, in inEndDate date)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order" and emergencyDelivery = true
    group by txnID;
END //
DELIMITER ;

drop procedure if exists GetEmergencyOrdersInDateRangeBySite;
DELIMITER //
create procedure GetEmergencyOrdersInDateRangeBySite(in inStartDate date, in inEndDate date, in inSiteID int)
BEGIN
    Select txnID, site.name as Location, siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, sum(quantity * caseSize) as quantity, sum(weight * quantity * caseSize) as totalWeight
    from txn inner join txnitems using (txnID) inner join item using (itemID) inner join site where siteIDTo = siteID and createdDate between inStartDate and inEndDate and txnType = "Store Order" and siteIDTo = inSiteID and emergencyDelivery = true
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
Updates pickuptime for a delivery
*/
drop procedure if exists SetDeliveryPickupTime;
DELIMITER //
create procedure SetDeliveryPickupTime(in id int)
BEGIN
	update delivery set deliveryStart = now() where deliveryID = id;
END //
DELIMITER ;

/*
Updates pickuptime for a delivery
*/
drop procedure if exists SetDeliveredTime;
DELIMITER //
create procedure SetDeliveredTime(in id int)
BEGIN
	update delivery set deliveryEnd = now() where deliveryID = id;
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

/*
Moves inventory from the warehouse bay onto the truck
*/
drop procedure if exists MoveInventoryFromBayToTruck;
DELIMITER //
create procedure MoveInventoryFromBayToTruck(in orderID int, in curQty int, in curItem int, in locationID int)
BEGIN
	update inventory set quantity = quantity - curQty where itemID = curItem and siteID = 2;
	update inventory set quantity = quantity + curQty, itemLocation = orderID where itemID = curItem and siteID = 9999;
    select row_count() into @rc;
    if @rc = 0 then
		insert into inventory (itemID, siteID, quantity, itemLocation, reorderThreshold) values(curItem, 9999, curQty, orderID, 0);
    end if;
END //
DELIMITER ;

/*
Moves inventory from the truck to store
*/
drop procedure if exists MoveInventoryFromTruckToStore;
DELIMITER //
create procedure MoveInventoryFromTruckToStore(in orderID int, in curQty int, in curItem int, in locationID int)
BEGIN
	update inventory set quantity = quantity - curQty where itemID = curItem and siteID = 9999;
	update inventory set quantity = quantity + curQty, itemLocation = 'Stock' where itemID = curItem and siteID = locationID;
    select row_count() into @rc;
--     if @rc = 0 then
-- 		insert into inventory (itemID, siteID, quantity, itemLocation, reorderThreshold) values(curItem, 9999, curQty, orderID, 0);
--    end if;
END //
DELIMITER ;

/*
Moves inventory from store to curbside
*/
drop procedure if exists MoveInventoryFromStoreToCurb;
DELIMITER //
create procedure MoveInventoryFromStoreToCurb(in orderID int, in curQty int, in curItem int, in locationID int)
BEGIN
	update inventory set quantity = quantity - curQty where itemID = curItem and siteID = locationID;
	update inventory set quantity = quantity + curQty where itemID = curItem and siteID = 11;
    select row_count() into @rc;
    if @rc = 0 then
		insert into inventory (itemID, siteID, quantity, itemLocation, reorderThreshold) values(curItem, 11, curQty, orderID, 0);
	end if;
END //
DELIMITER ;

/*
Moves inventory from curbside
*/
drop procedure if exists MoveInventoryFromCurb;
DELIMITER //
create procedure MoveInventoryFromCurb(in orderID int, in curQty int, in curItem int)
BEGIN
	update inventory set quantity = quantity - curQty where itemID = curItem and siteID = 11;
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

drop trigger if exists add_new_product;
delimiter //
create trigger add_new_product
after insert
on item for each row
begin
	DECLARE curSiteID INTEGER DEFAULT 0;
	DECLARE finished INTEGER DEFAULT 0;
	DEClARE curSite 
			CURSOR FOR 
				SELECT siteID FROM site where siteID not in (1,2,3,11,9999);
	DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET finished = 1;

	insert into inventory(itemID, siteID, quantity, itemLocation, reorderThreshold) values (new.itemID, 1, 25, 'Shelf', 25);

	Open curSite;
	getSite: LOOP
		FETCH curSite into curSiteID;
        IF finished = 1 then
			LEAVE getSite;
        end if;
        insert into inventory(itemID, siteID, quantity, itemLocation, reorderThreshold) values (new.itemID, curSiteID, 0, 'Shelf', 5);
	end loop getSite;
    close curSite;
end; //
delimiter ;

drop view if exists auditReport;
create view auditReport as 
SELECT txnaudit.*, employee.firstName, employee.lastName, posn.permissionLevel, site.name
FROM bullseyedb2023.txnaudit inner join employee using (employeeID) inner join posn using (positionID) inner join site using(siteID)
order by txnAuditID;


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
ALTER TABLE txn modify notes varchar(255) NULL;
alter table delivery add deliveryStart datetime null, add deliveryEnd datetime null;
alter table delivery add totalWeight decimal(10,2);