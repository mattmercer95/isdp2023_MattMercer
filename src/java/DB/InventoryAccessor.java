/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Inventory;
import Entity.Item;
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
    private static PreparedStatement getDetailedInventoryBySite = null;
    private static PreparedStatement updateThreshold = null;
    private static PreparedStatement updateItemDetails = null;
    private static PreparedStatement getOnlineInventory = null;
    private static PreparedStatement addNewProduct = null;
    
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
                getAllDetailedInventory = conn.prepareStatement("SELECT inventory.*, item.*, site.name as siteName FROM inventory inner join item using (itemID) inner join site using(siteID)");
                getDetailedInventoryBySite = conn.prepareStatement("SELECT inventory.*, item.*, site.name as siteName FROM inventory inner join item using (itemID) inner join site using(siteID) where siteID = ?");
                updateThreshold = conn.prepareStatement("update inventory set reorderThreshold = ? where itemID = ? and siteID = ?");
                updateItemDetails = conn.prepareStatement("update item set name = ?, sku = ?, description = ?, category = ?, weight = ?, costPrice = ?, retailPrice = ?, supplierID = ?, active = ?, notes = ?, caseSize = ? where itemID = ?");
                getOnlineInventory = conn.prepareStatement("call GetAvailableOnlineInventory(?)");
                addNewProduct = conn.prepareStatement("insert into item (name, sku, description, category, weight, costPrice, retailPrice, supplierID, active, notes, caseSize)"
                        + "values (?, ?, ?, ?, ?, ?, ?, ?, true, null, ?)");
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
    
    public static boolean addNewProduct(Item item){
        boolean result = false;
        
        try{
            if (!init())
                return result;
            addNewProduct.setString(1, item.getName());
            addNewProduct.setString(2, item.getSKU());
            addNewProduct.setString(3, item.getDescription());
            addNewProduct.setString(4, item.getCategory());
            addNewProduct.setDouble(5, item.getWeight());
            addNewProduct.setDouble(6, item.getCostPrice());
            addNewProduct.setDouble(7, item.getRetailPrice());
            addNewProduct.setInt(8, item.getSupplierID());
            addNewProduct.setInt(9, item.getCaseSize());
            int rc = addNewProduct.executeUpdate();
            if(rc > 0){
                //successful call
                result = true;
            }
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Adding New Product");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
    }
    
    public static ArrayList<Inventory> getOnlineInventory(int siteID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getOnlineInventory.setInt(1, siteID);
            rs = getOnlineInventory.executeQuery();
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
                item.setRetailPrice(rs.getDouble("retailPrice"));
                item.setCategory(rs.getString("category"));
                item.setDescription(rs.getString("description"));
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
    
    public static boolean updateItemDetails(Item item){
        boolean result = false;
        
        int rc;
        try{
            if (!init())
                return result;
            updateItemDetails.setString(1, item.getName());
            updateItemDetails.setString(2, item.getSKU());
            updateItemDetails.setString(3, item.getDescription());
            updateItemDetails.setString(4, item.getCategory());
            updateItemDetails.setDouble(5, item.getWeight());
            updateItemDetails.setDouble(6, item.getCostPrice());
            updateItemDetails.setDouble(7, item.getRetailPrice());
            updateItemDetails.setInt(8, item.getSupplierID());
            updateItemDetails.setBoolean(9, item.isActive());
            updateItemDetails.setString(10, item.getNotes());
            updateItemDetails.setInt(11, item.getCaseSize());
            updateItemDetails.setInt(12, item.getItemID());
            rc = updateItemDetails.executeUpdate();
            result = rc > 0 ? true : false;
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error updating Item Details");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
    }
    
    public static boolean updateThreshold(Inventory item){
        boolean result = false;
        
        int rc;
        try{
            if (!init())
                return result;
            updateThreshold.setInt(1, item.getReorderThreshold());
            updateThreshold.setInt(2, item.getItemID());
            updateThreshold.setInt(3, item.getSiteID());
            rc = updateThreshold.executeUpdate();
            result = rc > 0 ? true : false;
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Inventory To Add List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        return result;
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
    
    public static ArrayList<Inventory> getDetailedInventoryBySite(int siteID){
        ArrayList<Inventory> inventory = new ArrayList<Inventory>();
        
        ResultSet rs;
        try{
            if (!init())
                return inventory;
            getDetailedInventoryBySite.setInt(1, siteID);
            rs = getDetailedInventoryBySite.executeQuery();
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
                item.setSiteName(rs.getString("siteName"));
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
                item.setSiteName(rs.getString("siteName"));
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
