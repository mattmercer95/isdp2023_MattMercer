-- Bullseye DB SQL Script
-- SPRINT03 Test Script
-- March 13, 2023
-- 

-- *********************************************
-- ****       Populate Txn Data 	        ****
-- ****       FOR SPRINT 3 STUDENTS	        ****
-- *********************************************
-- 

use bullseyedb2023;
--
-- Insert test records into txn table
--
INSERT INTO txn (txnID, siteIDTo, siteIDFrom, status, shipDate, txnType,createdDate, notes)
VALUES
	(1001,6,1,'READY','2023-03-21','Store Order',CURDATE(),''),
	(1002,7,1,'READY','2023-03-21','Store Order',CURDATE(),'');

--
-- Insert test records into txnItems table
--
INSERT INTO txnitems (txnID, itemID, quantity)
VALUES
	(1001,10439,10),
	(1001,10748,5),
	(1002,10439,5);

--
-- Insert test records into inventory table
--
INSERT INTO inventory (itemID, quantity, siteID)
VALUES
	(10439,5,2),
	(10748,5,2);