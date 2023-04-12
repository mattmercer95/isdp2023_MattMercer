/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

import java.util.ArrayList;

/**
 *
 * @author mattm
 */
public class Transaction {
    private int transactionID, siteIDTo, siteIDFrom, deliveryID, quantity, itemID;
    private double totalWeight;
    private String origin, destination, destinationAddress, status, shipDate, transactionType, barCode, 
            createdDate, notes, itemName;
    private boolean emergencyDelivery;
    private ArrayList<TransactionItem> items;

    public boolean isEmergencyDelivery() {
        return emergencyDelivery;
    }

    public void setItemID(int itemID) {
        this.itemID = itemID;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public Transaction(){
        //empty constructor
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }
    
    public Transaction(int transactionID, int siteIDTo, int siteIDFrom,
            String status, String shipDate, String transactionType, String barCode,
            String createdDate, int deliveryID, boolean emergencyDelivery, int quantity,
            double totalWeight, ArrayList<TransactionItem> items){
        this.transactionID = transactionID;
        this.siteIDTo = siteIDTo;
        this.siteIDFrom = siteIDFrom;
        this.deliveryID = deliveryID;
        this.quantity = quantity;
        this.totalWeight = totalWeight;
        this.status = status;
        this.shipDate = shipDate;
        this.transactionType = transactionType;
        this.barCode = barCode;
        this.createdDate = createdDate;
        this.emergencyDelivery = emergencyDelivery;
        this.items = items;
    }

    public int getSiteIDFrom() {
        return siteIDFrom;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }
    
    //Cals the total weight and item quantity based on item list
    public void calculateStats(){
        double totalWeight = 0;
        int totalItemQuantity = 0;
        for(TransactionItem item : this.items){
            int itemsOrdered = item.getCaseQuantityOrdered() * item.getCaseSize();
            totalItemQuantity += itemsOrdered;
            totalWeight += (item.getWeight() * itemsOrdered);
        }
        this.totalWeight = totalWeight;
        this.quantity = totalItemQuantity;
    }
    
    public double getTotalWeight(){
        return this.totalWeight;
    }
    
    public ArrayList<TransactionItem> getItems(){
        return this.items;
    }
    
    public String getStatus(){
        return this.status;
    }
    public int getSiteIDTo(){
        return this.siteIDTo;
    }
    public int getDeliveryID(){
        return this.deliveryID;
    }
    
    public int getTransactionID(){
        return this.transactionID;
    }
    
    public String getShipDate(){
        return this.shipDate;
    }
    
    public ArrayList<TransactionItem> getTransactionItems(){
        return this.items;
    }
    
    public void setTransactionID(int transactionID){
        this.transactionID = transactionID;
    }
    public void setSiteIDTo(int siteIDTo){
         this.siteIDTo = siteIDTo;
    }
    public void setSiteIDFrom(int siteIDFrom){
        this.siteIDFrom = siteIDFrom;
    }
    public void setStatus(String status){
        this.status = status;
    }
    public void setShipDate(String shipDate){
        this.shipDate = shipDate;
    }
    public void setTransactionType(String transactionType){
        this.transactionType = transactionType;
    }
    public void setBarCode(String barCode){
        this.barCode = barCode;
    }
    public void setCreatedDate(String createdDate){
        this.createdDate = createdDate;
    }
    public void setDeliveryID(int deliveryID){
        this.deliveryID = deliveryID;
    }
    public void setEmergencyDelivery(boolean emergencyDelivery){
        this.emergencyDelivery = emergencyDelivery;
    }
    public void setQuantity(int quantity){
        this.quantity = quantity;
    }
    public void setTotalWeight(double totalWeight){
        this.totalWeight = totalWeight;
    }
    public void setOrigin(String origin){
        this.origin = origin;
    }
    public void setDestination(String destination){
        this.destination = destination;
    }
    public void setItems(ArrayList<TransactionItem> items){
        this.items = items;
    }
}
