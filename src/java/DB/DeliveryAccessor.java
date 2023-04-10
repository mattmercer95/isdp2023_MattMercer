/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Delivery;
import Entity.Item;
import Entity.Transaction;
import Entity.TransactionItem;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class DeliveryAccessor {
    private static Connection conn = null;
    private static PreparedStatement openDelivery = null;
    private static PreparedStatement openEmergencyDelivery = null;
    private static PreparedStatement getAllDeliveries = null;
    private static PreparedStatement pickupDelivery = null;
    private static PreparedStatement moveInventoryFromBayToTruck = null;
    private static PreparedStatement setDeliveredTime = null;
    private static PreparedStatement getDeliveryByShipDate = null;

    private DeliveryAccessor(){
        
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                openDelivery = conn.prepareStatement("call OpenDelivery(?,?)");
                openEmergencyDelivery = conn.prepareStatement("call OpenEmergencyDelivery(?, ?)");
                getAllDeliveries = conn.prepareStatement("call GetAllDeliveries()");
                pickupDelivery = conn.prepareStatement("call SetDeliveryPickupTime(?)");
                moveInventoryFromBayToTruck = conn.prepareStatement("call MoveInventoryFromBayToTruck(?,?,?,?)");
                setDeliveredTime = conn.prepareStatement("call SetDeliveredTime(?)");
                getDeliveryByShipDate = conn.prepareStatement("call GetDeliveryByShipDate(?)");
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
    
    public static Delivery getDeliveryByShipDate(String shipDate) {
        Delivery result = null;
        ResultSet rs;
        try{
            if (!init())
                return result;
            getDeliveryByShipDate.setString(1, shipDate);
            rs = getDeliveryByShipDate.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Delivery");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        try {
            rs.next();
            result = new Delivery();
            result.setDeliveryID(rs.getInt("deliveryID"));
            result.setNumLocations(rs.getInt("numLocations"));
            result.setDistanceCost(rs.getDouble("distanceCost"));
            result.setWeight(rs.getDouble("totalWeight"));
            result.setTruckSize(rs.getString("vehicleType"));
            String shipDateString = rs.getString("shipDate");
            result.setDeliveryDate(shipDateString.substring(0, shipDateString.length() - 9));
            String pickupTime = (rs.getTime("deliveryStart") == null) ? "N/A" : rs.getTime("deliveryStart").toString();
            result.setPickupTime(pickupTime);
            String deliveredTime = (rs.getTime("deliveryEnd") == null) ? "N/A" : rs.getTime("deliveryEnd").toString();
            result.setDeliveredTime(deliveredTime);
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Delivery Object");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        return result;
    }
    
    public static boolean pickupDelivery(Delivery d){
        boolean result = false;
        
        //move items from warehouse bay to the truck, update 
        ArrayList<Transaction> transactions = d.getTransactions();
        try {
            if (!init()) {
                return result;
            }
            for(Transaction t: transactions){
                //move items to truck
                ArrayList<TransactionItem> items = t.getItems();
                for(TransactionItem i : items){
                    moveInventoryFromBayToTruck.setInt(1, t.getTransactionID());
                    moveInventoryFromBayToTruck.setInt(2, i.getCaseQuantityOrdered() * i.getCaseSize());
                    moveInventoryFromBayToTruck.setInt(3, i.getItemID());
                    moveInventoryFromBayToTruck.setInt(4, t.getSiteIDTo());
                    moveInventoryFromBayToTruck.executeUpdate();
                }
                //set transaction status as In Transit
                PreparedStatement updateStatusInTransit = conn.prepareStatement("update txn set status = 'IN TRANSIT' where txnID = ?");
                updateStatusInTransit.setInt(1, t.getTransactionID());
                updateStatusInTransit.executeUpdate();
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Moving items to truck");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        //set pickup time
        try {
            if (!init()) {
                return result;
            }
            pickupDelivery.setInt(1, d.getDeliveryID());
            int rc = pickupDelivery.executeUpdate();
            //if it made it this far, and is true, the entire function was successful
            if(rc > 0) result = true;
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error picking up Delivery");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        
        return result;
    }
    
    public static boolean completeDelivery(Delivery d){
        boolean result = false;
        try {
            if (!init()) {
                return result;
            }
            setDeliveredTime.setInt(1, d.getDeliveryID());
            int rc = setDeliveredTime.executeUpdate();
            //if it made it this far, and is true, the entire function was successful
            if(rc > 0) result = true;
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Completing Delivery");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        return result;
    }
    
    public static void openDelivery(Transaction t){
        try {
            if (!init()) {
                return;
            }
            openDelivery.setInt(1, t.getTransactionID());
            openDelivery.setDouble(2, t.getTotalWeight());
            openDelivery.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating new Back Order Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return;
        }

    }
    
    public static void openEmergencyDelivery(Transaction t){
        try {
            if (!init()) {
                return;
            }
            openEmergencyDelivery.setInt(1, t.getTransactionID());
            openEmergencyDelivery.setDouble(2, t.getTotalWeight());
            openEmergencyDelivery.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error Creating new Emergency Delivery");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return;
        }

    }
    
    public static ArrayList<Delivery> getAllDeliveries(){
        ArrayList<Delivery> deliveries = new ArrayList<Delivery>();
        
        ResultSet rs;
        try{
            if (!init())
                return deliveries;
            rs = getAllDeliveries.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return deliveries;
        }
        
        try {
            while (rs.next()) {
                Delivery temp = new Delivery();
                temp.setDeliveryID(rs.getInt("deliveryID"));
                temp.setStatus("OPEN");
                temp.setNumLocations(rs.getInt("numLocations"));
                temp.setDistanceCost(rs.getDouble("distanceCost"));
                temp.setWeight(rs.getDouble("totalWeight"));
                temp.setTruckSize(rs.getString("vehicleType"));
                String shipDateString = rs.getString("shipDate");
                temp.setDeliveryDate(shipDateString.substring(0, shipDateString.length() - 9));
                String pickupTime = (rs.getTime("deliveryStart") == null) ? "N/A" : rs.getTime("deliveryStart").toString();
                temp.setPickupTime(pickupTime);
                String deliveredTime = (rs.getTime("deliveryEnd") == null) ? "N/A" : rs.getTime("deliveryEnd").toString();
                temp.setDeliveredTime(deliveredTime);
                deliveries.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Transaction List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return deliveries;
    }

}
    

