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
    private int transactionID, siteIDTo, siteIDFrom, deliveryID, quantity;
    private double totalWeight;
    private String origin, destination, status, shipDate, transactionType, barCode, 
            createdDate;
    private boolean emergencyDelivery;
    private ArrayList<Item> items;
    
    public Transaction(){
        //empty constructor
    }
    
    public Transaction(int transactionID, int siteIDTo, int siteIDFrom,
            String status, String shipDate, String transactionType, String barCode,
            String createdDate, int deliveryID, boolean emergencyDelivery, int quantity,
            double totalWeight, ArrayList<Item> items){
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
    public void setItems(ArrayList<Item> items){
        this.items = items;
    }
}
