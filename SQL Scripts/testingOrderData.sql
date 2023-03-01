update inventory set quantity = 0 where siteID = 4 and itemID in (10000, 10001, 10002, 10003, 10004);
update inventory set quantity = 0 where siteID = 5 and itemID in (10010, 10020, 10030, 10040, 10050);
update inventory set quantity = 0 where siteID = 6 and itemID in (10100, 10200, 10300, 10400, 10500);
update inventory set quantity = 0 where siteID = 7 and itemID in (10000, 10001, 10002, 10003, 10004);
update inventory set quantity = 0 where siteID = 8 and itemID in (10010, 10020, 10030, 10040, 10050);
update inventory set quantity = 0 where siteID = 9 and itemID in (10100, 10200, 10300, 10400, 10500);

insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, emergencyDelivery)
values (4, 1, 'CLOSED', '2005-02-13', 'Store Order', 'ABCDEFGHIJKLM', '2005-02-08', 0);
