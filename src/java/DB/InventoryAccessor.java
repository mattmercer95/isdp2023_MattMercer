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
    private static PreparedStatement getAvailableInventory = null;
    private static PreparedStatement getWarehouseInventory = null;
    private static PreparedStatement getAllDetailedInventory = null;
    
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
                getAvailableInventory = conn.prepareStatement("call GetAvailableInventory(?)");
                getWarehouseInventory = conn.prepareStatement("call GetWarehouseInventory(?)");
                getAllDetailedInventory = conn.prepareStatement("SELECT * FROM inventory inner join item using (itemID)");
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
    
    public static ArrayList<Inventory> getWarehouseInventory(int txnID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getWarehouseInventory.setInt(1, txnID);
            rs = getWarehouseInventory.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Warehouse Inventory To Add List");
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
                item.setWeight(rs.getFloat("weight"));
                inventory.add(item);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Warehouse Inventory To Add List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return inventory;
    }
    
    public static ArrayList<Inventory> getAvailableInventory(int siteID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getAvailableInventory.setInt(1, siteID);
            rs = getAvailableInventory.executeQuery();
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
                item.setWeight(rs.getFloat("weight"));
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
    
    public static ArrayList<Inventory> getInventoryByID(int siteID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getInventoryByID.setInt(1, siteID);
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
                item.setWeight(rs.getFloat("weight"));
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
    
    public static ArrayList<Inventory> getAllDetailed(){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            rs = getAllDetailedInventory.executeQuery();
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
                item.setSiteID(rs.getInt("siteID"));
                item.setItemQuantityOnHand(rs.getInt("quantity"));
                item.setItemLocation(rs.getString("itemLocation"));
                item.setReorderThreshold(rs.getInt("reorderThreshold"));
                item.setName(rs.getString("name"));
                item.setSKU(rs.getString("sku"));
                item.setDescription(rs.getString("description"));
                item.setCategory(rs.getString("category"));
                item.setWeight(rs.getFloat("weight"));
                item.setCostPrice(rs.getFloat("costPrice"));
                item.setRetailPrice(rs.getFloat("retailPrice"));
                item.setSupplierID(rs.getInt("supplierID"));
                item.setActive(rs.getBoolean("active"));
                item.setNotes(rs.getString("notes"));
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
