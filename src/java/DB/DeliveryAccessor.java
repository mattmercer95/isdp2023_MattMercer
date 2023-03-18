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
 * @author Matt
 */
public class DeliveryAccessor {
    private static Connection conn = null;
    private static PreparedStatement openDelivery = null;
    
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
}
