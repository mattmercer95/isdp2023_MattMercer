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
create procedure CreateNewStoreOrder(in storeID int, in orderDate date)
BEGIN
	start transaction;
    call GetNextDeliveryDate(storeID, @nextShipDate);
	insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery)
		values(storeID, 1, 'NEW', @nextShipDate, 'Store Order', 'X', orderDate, null, false);
    insert into txnitems (txnID, itemID, quantity)
		select LAST_INSERT_ID(), itemID, ceiling((reorderThreshold - quantity) / caseSize) 
        from inventory inner join item using (itemID)
        where quantity < reorderThreshold;
	commit;
END //
DELIMITER ;

alter table site add dayOfWeekID int;
update site set dayOfWeekID = 0 where dayOfWeek = 'MONDAY';
update site set dayOfWeekID = 1 where dayOfWeek = 'TUESDAY';
update site set dayOfWeekID = 2 where dayOfWeek = 'WEDNESDAY';
update site set dayOfWeekID = 3 where dayOfWeek = 'THURSDAY';
update site set dayOfWeekID = 4 where dayOfWeek = 'FRIDAY';
update site set dayOfWeekID = 5 where dayOfWeek = 'SATURDAY';
update site set dayOfWeekID = 6 where dayOfWeek = 'SUNDAY';