/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Inventory;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author mattm
 */
public class InventoryAccessor {
    private static Connection conn = null;
    private static PreparedStatement getInventoryByID = null;
    
    private InventoryAccessor(){
        
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                getInventoryByID = conn.prepareStatement("call GetInventoryBySiteID(?)");
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
    
    public static ArrayList<Inventory> getInventoryByID(int siteID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getInventoryByID.setString(1, Integer.toString(siteID));
            rs = getInventoryByID.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Inventory To Add List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return inventory;
        }
        
        try {
            while (rs.next()) {
                Inventory item = new Inventory();
                item.setItemID(rs.getInt("itemID"));
                item.setName(rs.getString("name"));
                item.setItemQuantityOnHand(rs.getInt("quantity"));
                item.setReorderThreshold(rs.getInt("reorderThreshold"));
                item.setCaseSize(rs.getInt("caseSize"));
                inventory.add(item);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Inventory To Add List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return inventory;
    }
}
