/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author mattm
 */
public class Item {
    private int itemID, supplierID, caseSize;
    private String name, sku, description, category, notes;
    private double weight, costPrice, retailPrice;
    private boolean active;
    
    public Item(){
        
    }
    
    public Item(int itemID, String name, String sku, String description, String category,
            double weight, double costPrice, double retailPrice, int supplierId, boolean active,
            String notes, int caseSize){
        this.itemID = itemID;
        this.supplierID = supplierID;
        this.caseSize = caseSize;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.category = category;
        this.notes = notes;
        this.weight = weight;
        this.costPrice = costPrice;
        this.retailPrice = retailPrice;
        this.active = active;
    }
    
    public int getItemID(){
        return this.itemID;
    }
    public String getSKU(){
        return this.sku;
    }
    public int getSupplierID(){
        return this.supplierID;
    }
    public int getCaseSize(){
        return this.caseSize;
    }
    public String getName(){
        return this.name;
    }
    public String getDescription(){
        return this.description;
    }
    public String getCategory(){
        return this.category;
    }
    public String getNotes(){
        return this.notes;
    }
    public double getWeight(){
        return this.weight;
    }
    public double getCostPrice(){
        return this.costPrice;
    }
    public double getRetailPrice(){
        return this.retailPrice;
    }
    public boolean isActive(){
        return this.active;
    }

}
