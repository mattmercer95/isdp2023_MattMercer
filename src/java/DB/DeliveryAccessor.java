/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Delivery;
import Entity.Transaction;
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
    private static PreparedStatement getAllDeliveries = null;
    
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
                getAllDeliveries = conn.prepareStatement("call GetAllDeliveries()");
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
                temp.setStatus(rs.getString("status"));
                temp.setNumLocations(rs.getInt("numLocations"));
                temp.setDistanceCost(rs.getDouble("distanceCost"));
                temp.setWeight(rs.getDouble("totalWeight"));
                temp.setTruckSize(rs.getString("vehicleType"));
                String shipDateString = rs.getString("shipDate");
                temp.setDeliveryDate(shipDateString.substring(0, shipDateString.length() - 9));
                String pickupTime = (rs.getDate("deliveryStart") == null) ? "N/A" : rs.getDate("deliveryStart").toString();
                temp.setPickupTime(pickupTime);
                String deliveredTime = (rs.getDate("deliveryEnd") == null) ? "N/A" : rs.getDate("deliveryEnd").toString();
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
    

