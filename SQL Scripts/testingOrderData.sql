insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, emergencyDelivery)
values (4, 1, 'NEW', '2023-02-13', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(5, 1, 'NEW', '2023-02-13', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(6, 1, 'NEW', '2023-02-14', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(7, 1, 'NEW', '2023-02-15', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(8, 1, 'NEW', '2023-02-16', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(9, 1, 'NEW', '2023-02-17', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0),
(10, 1, 'NEW', '2023-02-18', 'Store Order', 'ABCDEFGHIJKLM', '2023-02-08', 0);

insert into txnitems (txnID, itemID, quantity)
values (1,10000,10),
(1,10020,5),
(1,10100,6);