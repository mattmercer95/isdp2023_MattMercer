/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Transaction;
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
    
    private TransactionAccessor(){
        //no instant
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
                getAllOpenEmergencyStoreOrders = conn.prepareStatement("call call GetOpenEmergencyStoreOrderCount(?)");
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
                temp.setLocation(rs.getString("Location"));
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
