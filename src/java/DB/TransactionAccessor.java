/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.OnlineOrderID;
import Entity.Transaction;
import Entity.TransactionItem;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author mattm
 */
public class TransactionAccessor {
    private static Connection conn = null;
    private static PreparedStatement getAllTransactions = null;
    private static PreparedStatement getAllOpenStoreOrders = null;
    private static PreparedStatement getAllOpenEmergencyStoreOrders = null;
    private static PreparedStatement createNewStoreOrder = null;
    private static PreparedStatement getTransactionByID = null;
    private static PreparedStatement getTransactionItems = null;
    private static PreparedStatement updateTransaction = null;
    private static String insertTxnItems = null;
    private static PreparedStatement dropTxnItems = null;
    private static PreparedStatement getOrderStatusList = null;
    private static PreparedStatement getZeroItemTransactions = null;
    private static PreparedStatement getCurrentBackOrder = null;
    private static PreparedStatement createNewBackOrder = null;
    private static PreparedStatement moveInventoryOnReceived = null;
    private static PreparedStatement getTransactionsByDeliveryID = null;
    private static PreparedStatement changeStatusToDelivered = null;
    private static PreparedStatement moveInventoryFromTruckToStore = null;
    private static PreparedStatement newOnlineOrder = null;
    private static PreparedStatement moveInventoryFromStoreToCurb = null;
    private static PreparedStatement getOnlineOrderIDs = null;
    private static PreparedStatement moveInventoryFromCurb = null;
    private static PreparedStatement cancelTransaction = null;
    
    private TransactionAccessor(){
        //no instant
    }
    
    //Helper function for getting the current time in the MySQL datetime format
    private static String getCurrentTimeStamp(){
        java.util.Date dt = new java.util.Date();
        java.text.SimpleDateFormat sdf = 
             new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(dt);
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                getAllTransactions = conn.prepareStatement("call GetAllOrders()");
                getAllOpenStoreOrders = conn.prepareStatement("call GetOpenStoreOrderCount(?)");
                getAllOpenEmergencyStoreOrders = conn.prepareStatement("call GetOpenEmergencyStoreOrderCount(?)");
                createNewStoreOrder = conn.prepareStatement("call CreateNewStoreOrder(?,?,?)", PreparedStatement.RETURN_GENERATED_KEYS);
                getTransactionByID = conn.prepareStatement("call GetTransactionByID(?)");
                getTransactionItems = conn.prepareStatement("call GetTransactionItemsByID(?)");
                updateTransaction = conn.prepareStatement("update txn set status = ?, shipDate = ? where txnID = ?");
                dropTxnItems = conn.prepareStatement("delete from txnitems where txnID = ?");
                getOrderStatusList = conn.prepareStatement("select statusName from txnstatus");
                getZeroItemTransactions = conn.prepareStatement("call GetZeroItemOrders()");
                getCurrentBackOrder = conn.prepareStatement("call GetCurrentBackOrder(?)");
                createNewBackOrder = conn.prepareStatement("call CreateNewBackOrder(?,?)");
                moveInventoryOnReceived = conn.prepareStatement("call UpdateReceivedCount(?, ?, ?, ?)");
                getTransactionsByDeliveryID = conn.prepareStatement("call GetOrdersByDeliveryID(?)");
                changeStatusToDelivered = conn.prepareStatement("update txn set status = 'DELIVERED' where txnID = ?");
                moveInventoryFromTruckToStore = conn.prepareStatement("call MoveInventoryFromTruckToStore(?,?,?,?)");
                newOnlineOrder = conn.prepareStatement("insert into txn (siteIDTo, siteIDFrom, status, shipDate, txnType, barCode, createdDate, deliveryID, emergencyDelivery, notes)"
                        + " values (?,?,?,?,?,'X',?,null,false, ?)", PreparedStatement.RETURN_GENERATED_KEYS);
                moveInventoryFromStoreToCurb = conn.prepareStatement("call MoveInventoryFromStoreToCurb(?, ?, ?, ?)");
                getOnlineOrderIDs = conn.prepareStatement("call GetOpenOnlineIDs()");
                moveInventoryFromCurb = conn.prepareStatement("call MoveInventoryFromCurb(?,?,?)");
                cancelTransaction = conn.prepareStatement("update txn set status = 'CANCELLED' where txnID = ?");
                return true;
            } catch (SQLException ex) {
                System.err.println("************************");
                System.err.println("** Error preparing SQL");
                System.err.println("** " + ex.getMessage());
                System.err.println("************************");
                conn = null;
            }
        System.out.println("Connection was null");
        return false;
    }
    
    public static boolean cancelTransaction(Transaction t){
        boolean result = false;
        
        try {
            if (!init()) {
                return result;
            }
            //move items to store
            cancelTransaction.setInt(1, t.getTransactionID());
            int rc = cancelTransaction.executeUpdate();
            if(rc > 0){
                result = true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Cancelling Order");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
    }
    
    public static ArrayList<OnlineOrderID> getOnlineOrderIDs(){
        ArrayList<OnlineOrderID> orderIDs = new ArrayList<OnlineOrderID>();
        
        ResultSet rs;
        try{
            if (!init())
                return orderIDs;
            rs = getOnlineOrderIDs.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Online Order IDs");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return orderIDs;
        }
        
        try {
            while (rs.next()) {
                OnlineOrderID temp = new OnlineOrderID();
                temp.setTransactionID(rs.getInt("txnID"));
                temp.setEmail(rs.getString("email"));
                orderIDs.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Online Order IDs");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return orderIDs;
    }
    
    public static int newOnlineOrder(Transaction t){
        int result = -1;

        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            newOnlineOrder.setInt(1, t.getSiteIDTo());
            newOnlineOrder.setInt(2, t.getSiteIDFrom());
            newOnlineOrder.setString(3, t.getStatus());
            newOnlineOrder.setString(4, t.getShipDate());
            newOnlineOrder.setString(5, t.getTransactionType());
            newOnlineOrder.setString(6, t.getCreatedDate());
            newOnlineOrder.setString(7, t.getNotes());
            newOnlineOrder.executeUpdate();
            rs = newOnlineOrder.getGeneratedKeys();
            rs.next();
            result = rs.getInt(1);
            t.setTransactionID(result);
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating Online Order");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        try {
            ArrayList<TransactionItem> items = t.getTransactionItems();
            insertTxnItems = "insert into txnitems (txnID, itemID, quantity) values";
            int counter = 0;
            for(TransactionItem item : items){
                if(counter > 0){
                    insertTxnItems += ",";
                }
                counter++;
                insertTxnItems += "(" + t.getTransactionID() + ", " +
                        item.getItemID() + ", " + item.getQuantity() + ")";
                moveInventoryFromStoreToCurb.setInt(1, result);
                moveInventoryFromStoreToCurb.setInt(2, item.getQuantity());
                moveInventoryFromStoreToCurb.setInt(3, item.getItemID());
                moveInventoryFromStoreToCurb.setInt(4, t.getSiteIDFrom());
                moveInventoryFromStoreToCurb.executeUpdate();
            }
            PreparedStatement insertTxnItemsStmt = conn.prepareStatement(insertTxnItems);
            insertTxnItemsStmt.executeUpdate();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error inserting Online Order items");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static boolean completeOnlineTransaction(Transaction t){
        boolean result = false;
        
        //remove items from curbside 
        try {
            if (!init()) {
                return result;
            }
            //move items to store
            ArrayList<TransactionItem> items = t.getItems();
            for(TransactionItem i : items){
                moveInventoryFromCurb.setInt(1, t.getTransactionID());
                moveInventoryFromCurb.setInt(2, i.getCaseQuantityOrdered());
                moveInventoryFromCurb.setInt(3, i.getItemID());
                moveInventoryFromCurb.executeUpdate();
            }
            //set transaction status as In Transit
            PreparedStatement updateStatusClosed = conn.prepareStatement("update txn set status = 'CLOSED' where txnID = ?");
            updateStatusClosed.setInt(1, t.getTransactionID());
            int rc = updateStatusClosed.executeUpdate();
            if(rc > 0){
                result = true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Compling Online Order");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
    }
    
    public static boolean completeTransaction(Transaction t){
        boolean result = false;
        
        //move items from truck to store, update 
        try {
            if (!init()) {
                return result;
            }
            //move items to store
            ArrayList<TransactionItem> items = t.getItems();
            for(TransactionItem i : items){
                moveInventoryFromTruckToStore.setInt(1, t.getTransactionID());
                moveInventoryFromTruckToStore.setInt(2, i.getCaseQuantityOrdered() * i.getCaseSize());
                moveInventoryFromTruckToStore.setInt(3, i.getItemID());
                moveInventoryFromTruckToStore.setInt(4, t.getSiteIDTo());
                moveInventoryFromTruckToStore.executeUpdate();
            }
            //set transaction status as In Transit
            PreparedStatement updateStatusInTransit = conn.prepareStatement("update txn set status = 'CLOSED' where txnID = ?");
            updateStatusInTransit.setInt(1, t.getTransactionID());
            int rc = updateStatusInTransit.executeUpdate();
            if(rc > 0){
                result = true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Moving items to Store");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
    }
    
    public static boolean changeStatusToDelivered(int transactionID){
        boolean result = false;
        try{
            if (!init())
                return result;
            changeStatusToDelivered.setInt(1,transactionID);
            int rc = changeStatusToDelivered.executeUpdate();
            if(rc > 0){
                result = true;
            }
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error updating Transaction status to Delivered");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        return result;
    }
    
    public static ArrayList<Transaction> getOrdersByDeliveryID(int deliveryID){
        ArrayList<Transaction> transactions = new ArrayList<Transaction>();
        
        ResultSet rs;
        try{
            if (!init())
                return transactions;
            getTransactionsByDeliveryID.setInt(1,deliveryID);
            rs = getTransactionsByDeliveryID.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return transactions;
        }
        
        try {
            while (rs.next()) {
                Transaction temp = new Transaction();
                temp.setTransactionID(rs.getInt("txnID"));
                temp.setDestination(rs.getString("Location"));
                String address2 = (rs.getString("site.address2") == null) ? "" : rs.getString("site.address2");
                String destinationAddress = rs.getString("site.address") + " " + address2 + " " + rs.getString("site.city") + ", " + rs.getString("provinceID");
                temp.setDestinationAddress(destinationAddress);
                temp.setSiteIDTo(rs.getInt("siteIDTo"));
                temp.setSiteIDFrom(rs.getInt("siteIDFrom"));
                temp.setStatus(rs.getString("status"));
                temp.setShipDate(rs.getDate("shipDate").toString());
                temp.setTransactionType(rs.getString("txnType"));
                temp.setBarCode(rs.getString("barCode"));
                temp.setCreatedDate(rs.getDate("createdDate").toString());
                temp.setDeliveryID(rs.getInt("deliveryID"));
                temp.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                temp.setQuantity(rs.getInt("quantity"));
                temp.setTotalWeight(rs.getInt("totalWeight"));
                transactions.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return transactions;
    }
    public static Transaction createNewBackOrder(int siteID){
        Transaction result = null;
        
        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            createNewBackOrder.setInt(1, siteID);
            String timestamp = getCurrentTimeStamp();
            createNewBackOrder.setString(2, timestamp);
            rs = createNewBackOrder.executeQuery();
            result = new Transaction();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating new Back Order Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                result.setTransactionID(rs.getInt("txnID"));
                result.setSiteIDTo(rs.getInt("siteIDTo"));
                result.setSiteIDFrom(rs.getInt("siteIDFrom"));
                result.setStatus(rs.getString("status"));
                String shipDateString = rs.getString("shipDate");
                result.setShipDate(shipDateString.substring(0, shipDateString.length() - 9));
                result.setTransactionType(rs.getString("txnType"));
                String createdDateString = rs.getString("createdDate");
                result.setCreatedDate(createdDateString.substring(0, createdDateString.length() - 9));
                result.setDeliveryID(rs.getInt("deliveryID"));
                result.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                result.setDestination(rs.getString("destination"));
                result.setOrigin(rs.getString("origin"));
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating new Back Order Transaction object");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    
    public static Transaction getCurrentBackOrder(int siteID){
        Transaction result = null;
        
        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getCurrentBackOrder.setInt(1, siteID);
            rs = getCurrentBackOrder.executeQuery();
            result = new Transaction();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Retrieving Back Order Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                result = new Transaction();
                result.setTransactionID(rs.getInt("txnID"));
                result.setSiteIDTo(rs.getInt("siteIDTo"));
                result.setSiteIDFrom(rs.getInt("siteIDFrom"));
                result.setStatus(rs.getString("status"));
                String shipDateString = rs.getString("shipDate");
                result.setShipDate(shipDateString.substring(0, shipDateString.length() - 9));
                result.setTransactionType(rs.getString("txnType"));
                String createdDateString = rs.getString("createdDate");
                result.setCreatedDate(createdDateString.substring(0, createdDateString.length() - 9));
                result.setDeliveryID(rs.getInt("deliveryID"));
                result.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                result.setDestination(rs.getString("destination"));
                result.setOrigin(rs.getString("origin"));
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating Back Order Transaction object");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static ArrayList<String> getOrderStatusList(){
        ArrayList<String> orderStatusList = new ArrayList<String>();

        ResultSet rs;
        try {
            if (!init()) {
                return orderStatusList;
            }
            rs = getOrderStatusList.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Getting Order Status List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return orderStatusList;
        }

        try {
            while (rs.next()) {
                orderStatusList.add(rs.getString("statusName"));
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Populating Order Status List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return orderStatusList;
    }
    
    public static boolean updateTransaction(Transaction t){
        boolean result = false;

        //update txn table
        int rc1;
        try {
            if (!init()) {
                return result;
            }
            updateTransaction.setString(1, t.getStatus());
            updateTransaction.setString(2, t.getShipDate());
            updateTransaction.setInt(3, t.getTransactionID());
            rc1 = updateTransaction.executeUpdate();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error updating txn table");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        boolean b1 = rc1 > 0;

        //drop old txnitems table
        int rc2 = 0;
        try {
            dropTxnItems.setInt(1, t.getTransactionID());
            rc2 = dropTxnItems.executeUpdate();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error dropping txnitems");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        boolean b2 = rc2 > 0;
        
        boolean b3 = true;
        if(!t.getStatus().equals("REJECTED")){
            //update txnitems table
            int rc3 = 0;
            try {
                ArrayList<TransactionItem> items = t.getTransactionItems();
                insertTxnItems = "insert into txnitems (txnID, itemID, quantity) values";
                int counter = 0;
                for(TransactionItem item : items){
                    if(counter > 0){
                        insertTxnItems += ",";
                    }
                    counter++;
                    insertTxnItems += "(" + item.getTransactionID() + ", " +
                            item.getItemID() + ", " + item.getCaseQuantityOrdered() + ")";
                }
                System.out.println(insertTxnItems);
                PreparedStatement insertTxnItemsStmt = conn.prepareStatement(insertTxnItems);
                rc3 = insertTxnItemsStmt.executeUpdate();
            } catch (SQLException ex) {
                System.err.println("************************");
                System.err.println("** Error inserting txnitems");
                System.err.println("** " + ex.getMessage());
                System.err.println("************************");
            }
            b3 = rc3 > 0;
        }
        
        try {
            //check for what type of inventory movement we need
            if(t.getStatus().equals("RECEIVED")){
                ArrayList<TransactionItem> items = t.getItems();
                for(TransactionItem item : items){
                    moveInventoryOnReceived.setInt(1, item.getTransactionID());
                    moveInventoryOnReceived.setInt(2, item.getCaseQuantityOrdered() * item.getCaseSize());
                    moveInventoryOnReceived.setInt(3, item.getItemID());
                    moveInventoryOnReceived.setInt(4, t.getSiteIDTo());
                    
                    int rc = moveInventoryOnReceived.executeUpdate();
                    System.out.println(rc);
                }
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Moving Iventory on Received");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        result = (b1 && b2 && b3) ? true : false;
        
        return result;
    }
    
    public static ArrayList<TransactionItem> getTransactionItems(int transactionID){
        ArrayList<TransactionItem> result = null;
        
        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getTransactionItems.setInt(1, transactionID);
            rs = getTransactionItems.executeQuery();
            result = new ArrayList<TransactionItem>();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Retrieving Transaction Items");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                if(result != null){
                    TransactionItem item = new TransactionItem();
                    item.setItemID(rs.getInt("itemID"));
                    item.setTxnID(rs.getInt("txnID"));
                    item.setCaseQuantityOrdered(rs.getInt(3));
                    item.setName(rs.getString("name"));
                    item.setWeight(rs.getFloat("weight"));
                    item.setCaseSize(rs.getInt("caseSize"));
                    item.setCategory(rs.getString("category"));
                    item.setDescription(rs.getString("description"));
                    item.setSiteID(rs.getInt("siteID"));
                    item.setItemQuantityOnHand(rs.getInt(16));
                    item.setReorderThreshold(rs.getInt("reorderThreshold"));
                    item.setRetailPrice(rs.getDouble("retailPrice"));
                    result.add(item);
                };
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Populating Transaction Item list");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static Transaction getTransactionByID(int transactionID){
        Transaction result = null;
        
        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getTransactionByID.setInt(1, transactionID);
            rs = getTransactionByID.executeQuery();
            result = new Transaction();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Retrieving Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                if(result != null){
                    result.setTransactionID(rs.getInt("txnID"));
                    result.setSiteIDTo(rs.getInt("siteIDTo"));
                    result.setSiteIDFrom(rs.getInt("siteIDFrom"));
                    result.setStatus(rs.getString("status"));
                    String shipDateString = rs.getString("shipDate");
                    result.setShipDate(shipDateString.substring(0, shipDateString.length() - 9));
                    result.setTransactionType(rs.getString("txnType"));
                    String createdDateString = rs.getString("createdDate");
                    result.setDestinationAddress(rs.getString("address"));
                    result.setCreatedDate(createdDateString.substring(0, createdDateString.length() - 9));
                    result.setDeliveryID(rs.getInt("deliveryID"));
                    result.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                    result.setDestination(rs.getString("destination"));
                    result.setOrigin(rs.getString("origin"));
                    result.setNotes(rs.getString("notes"));
                };
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating Transaction object");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static int createNewStoreOrder(int siteID, boolean type){
        int result = -1;

        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            createNewStoreOrder.setInt(1, siteID);
            //create date of order creation
            String timestamp = getCurrentTimeStamp();
            createNewStoreOrder.setString(2, timestamp);
            createNewStoreOrder.setBoolean(3, type);
            rs = createNewStoreOrder.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating New Store Order");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                result = rs.getInt(1);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating New Store Order");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static boolean isOrderOpen(int siteID){
        boolean result = true;

        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getAllOpenStoreOrders.setInt(1, siteID);
            rs = getAllOpenStoreOrders.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                int ordersOpen = rs.getInt("ordersOpen");
                result = (ordersOpen == 0) ? false : true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static boolean isEmergencyOrderOpen(int siteID){
        boolean result = true;

        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getAllOpenEmergencyStoreOrders.setInt(1, siteID);
            
            rs = getAllOpenEmergencyStoreOrders.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Emergency Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                int ordersOpen = rs.getInt("ordersOpen");
                result = (ordersOpen == 0) ? false : true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Emergency Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
    }
    
    public static ArrayList<Transaction> getZeroItemTransactions(){
        ArrayList<Transaction> transactions = new ArrayList<Transaction>();
        
        ResultSet rs;
        try{
            if (!init())
                return transactions;
            rs = getZeroItemTransactions.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Zero-item Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return transactions;
        }
        
        try {
            while (rs.next()) {
                Transaction temp = new Transaction();
                temp.setTransactionID(rs.getInt("txnID"));
                temp.setDestination(rs.getString("Location"));
                temp.setSiteIDTo(rs.getInt("siteIDTo"));
                temp.setSiteIDFrom(rs.getInt("siteIDFrom"));
                temp.setStatus(rs.getString("status"));
                temp.setShipDate(rs.getDate("shipDate").toString());
                temp.setTransactionType(rs.getString("txnType"));
                temp.setBarCode(rs.getString("barCode"));
                temp.setCreatedDate(rs.getDate("createdDate").toString());
                temp.setDeliveryID(rs.getInt("deliveryID"));
                temp.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                transactions.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Zero-item Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return transactions;
    }
    
    public static ArrayList<Transaction> getAllTransactions(){
        ArrayList<Transaction> transactions = new ArrayList<Transaction>();
        
        ResultSet rs;
        try{
            if (!init())
                return transactions;
            rs = getAllTransactions.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return transactions;
        }
        
        try {
            while (rs.next()) {
                Transaction temp = new Transaction();
                temp.setTransactionID(rs.getInt("txnID"));
                temp.setDestination(rs.getString("Location"));
                temp.setSiteIDTo(rs.getInt("siteIDTo"));
                temp.setSiteIDFrom(rs.getInt("siteIDFrom"));
                temp.setStatus(rs.getString("status"));
                temp.setShipDate(rs.getDate("shipDate").toString());
                temp.setTransactionType(rs.getString("txnType"));
                temp.setBarCode(rs.getString("barCode"));
                temp.setCreatedDate(rs.getDate("createdDate").toString());
                temp.setDeliveryID(rs.getInt("deliveryID"));
                temp.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                temp.setQuantity(rs.getInt("quantity"));
                temp.setTotalWeight(rs.getInt("totalWeight"));
                transactions.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return transactions;
    }
}
