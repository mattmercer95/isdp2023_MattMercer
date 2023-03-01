/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author mattm
 */
public class Inventory {
    private int itemID, itemQuantityOnHand, reorderThreshold, caseSize, siteID, supplierID;
    private double weight, costPrice, retailPrice;
    private String name, notes, itemLocation, sku, description, category, siteName, supplierName;
    private boolean active;
    
    public Inventory(){
        
    }
    
    public int getReorderThreshold(){
        return this.reorderThreshold;
    }
    public int getItemID(){
        return this.itemID;
    }
    public int getSiteID(){
        return this.siteID;
    }
    
    public void setItemID(int itemID){
        this.itemID = itemID;
    }
    public void setItemQuantityOnHand(int itemQuantityOnHand){
        this.itemQuantityOnHand = itemQuantityOnHand;
    }
    
    public void setReorderThreshold(int reorderThreshold){
        this.reorderThreshold = reorderThreshold;
    }
    
    public void setCaseSize(int caseSize){
        this.caseSize = caseSize;
    }
    
    public void setSiteID(int siteID){
        this.siteID = siteID;
    }
    public void setSupplierID(int supplierID){
        this.siteID = siteID;
    }
    public void setName(String name){
        this.name = name;
    }
    public void setNotes(String notes){
        this.notes = notes;
    }
    public void setItemLocation(String itemLocation){
        this.itemLocation = itemLocation;
    }
    public void setSKU(String sku){
        this.sku = sku;
    }
    public void setDescription(String description){
        this.description = description;
    }
    public void setCategory(String category){
        this.category = category;
    }
    public void setWeight(double weight){
        this.weight = weight;
    }
    public void setCostPrice(double costPrice){
        this.costPrice = costPrice;
    }
    public void setRetailPrice(double retailPrice){
        this.retailPrice = retailPrice;
    }
    
    public void setActive(boolean active){
        this.active = active;
    }
    public void setSiteName(String siteName){
        this.siteName = siteName;
    }
    public void setSupplierName(String supplierName){
        this.supplierName = supplierName;
    }
}
