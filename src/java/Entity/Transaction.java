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
    private String location, status, shipDate, transactionType, barCode, 
            createdDate;
    private boolean emergencyDelivery;
    private ArrayList<Item> items;
    
    public Transaction(int transactionID, String location, int siteIDTo, int siteIDFrom,
            String status, String shipDate, String transactionType, String barCode,
            String createdDate, int deliveryID, boolean emergencyDelivery, int quantity,
            double totalWeight, ArrayList<Item> items){
        this.transactionID = transactionID;
        this.siteIDTo = siteIDTo;
        this.siteIDFrom = siteIDFrom;
        this.deliveryID = deliveryID;
        this.quantity = quantity;
        this.totalWeight = totalWeight;
        this.location = location;
        this.status = status;
        this.shipDate = shipDate;
        this.transactionType = transactionType;
        this.barCode = barCode;
        this.createdDate = createdDate;
        this.emergencyDelivery = emergencyDelivery;
        this.items = items;
    }
}
