insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, emergencyDelivery)
values (5, 1, 'NEW', '2023-02-13', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(6, 1, 'NEW', '2023-02-14', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(7, 1, 'NEW', '2023-02-15', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(8, 1, 'NEW', '2023-02-16', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(9, 1, 'NEW', '2023-02-17', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(10, 1, 'NEW', '2023-02-18', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0);

insert into txnitems (txnID, itemID, quantity)
values (1,10000,10),
(1,10020,5),
(1,10100,6);

insert into txnitems (txnID, itemID, quantity)
values (2,10000,10),
(2,10020,5),
(2,10100,6),
(3,10000,10),
(3,10020,5),
(3,10100,6),
(4,10000,10),
(4,10020,5),
(4,10100,6),
(5,10000,10),
(5,10020,5),
(5,10100,6),
(6,10000,10),
(6,10020,5),
(6,10100,6);

update inventory set quantity = 0 where siteID = 4 and itemID in (10000, 10001, 10002, 10003, 10004);

insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, emergencyDelivery)
values (4, 1, 'CLOSED', '2005-02-13', 'Store Order', 'ABCDEFGHIJKLM', '2005-02-08', 0);
