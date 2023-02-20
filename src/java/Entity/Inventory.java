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
    private int itemID, quantity, reorderThreshold, caseSize;
    private String name;
    
    public Inventory(){
        
    }
    
    public void setItemID(int itemID){
        this.itemID = itemID;
    }
    public void setQuantity(int quantity){
        this.quantity = quantity;
    }
    
    public void setReorderThreshold(int reorderThreshold){
        this.reorderThreshold = reorderThreshold;
    }
    
    public void setCaseSize(int caseSize){
        this.caseSize = caseSize;
    }
    
    public void setName(String name){
        this.name = name;
    }
    
}
