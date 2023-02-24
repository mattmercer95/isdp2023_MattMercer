/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class TransactionItem {
    private int itemID, txnID, caseQuantityOrdered, caseSize, siteID, itemQuantityOnHand, reorderThreshold;
    private String name;
    private double weight;
    
    public TransactionItem(){
    
    }
    
    public double getWeight(){
        return this.weight;
    }
    
    public int getItemQuantityOnHand(){
        return this.itemQuantityOnHand;
    }
    
    public int getCaseQuantityOrdered(){
        return this.caseQuantityOrdered;
    }
    
    public int getCaseSize(){
        return this.caseSize;
    }
    public void setItemID(int itemID){
        this.itemID = itemID;
    }
    public void setTxnID(int txnID){
        this.txnID = txnID;
    }
    public void setCaseQuantityOrdered(int caseQuantityOrdered){
        this.caseQuantityOrdered = caseQuantityOrdered;
    }
    public void setCaseSize(int caseSize){
        this.caseSize = caseSize;
    }
    public void setSiteID(int siteID){
        this.siteID = siteID;
    }
    public void setItemQuantityOnHand(int itemQuantityOnHand){
        this.itemQuantityOnHand = itemQuantityOnHand;
    }
    public void setReorderThreshold(int reorderThreshold){
        this.reorderThreshold = reorderThreshold;
    }
    public void setName(String name){
        this.name = name;
    }
    public void setWeight(double weight){
        this.weight = weight;
    }
}
