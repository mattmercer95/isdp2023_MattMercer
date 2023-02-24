/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

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
                createNewStoreOrder = conn.prepareStatement("call CreateNewStoreOrder(?,?)", PreparedStatement.RETURN_GENERATED_KEYS);
                getTransactionByID = conn.prepareStatement("call GetTransactionByID(?)");
                getTransactionItems = conn.prepareStatement("call GetTransactionItemsByID(?)");
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
                    item.setSiteID(rs.getInt("siteID"));
                    item.setItemQuantityOnHand(rs.getInt(16));
                    item.setReorderThreshold(rs.getInt("reorderThreshold"));
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
                    result.setCreatedDate(createdDateString.substring(0, createdDateString.length() - 9));
                    result.setDeliveryID(rs.getInt("deliveryID"));
                    result.setEmergencyDelivery(rs.getBoolean("emergencyDelivery"));
                    result.setDestination(rs.getString("destination"));
                    result.setOrigin(rs.getString("origin"));
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
    
    public static int createNewStoreOrder(int siteID){
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
