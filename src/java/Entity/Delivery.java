/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class Delivery {
    private int deliveryID, numLocations;
    private double distanceCost, hourlyCost, totalCost, weight;
    private String status, origin, destination, truckSize, deliveryDate, pickupTime, deliveredTime;
    private ArrayList<Transaction> transactions;
    
    public Delivery(){
        
    }
    
    public ArrayList<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(ArrayList<Transaction> transactions) {
        this.transactions = transactions;
    }


    public void setDeliveryID(int deliveryID) {
        this.deliveryID = deliveryID;
    }

    public void setNumLocations(int numLocations) {
        this.numLocations = numLocations;
    }

    public void setDistanceCost(double distanceCost) {
        this.distanceCost = distanceCost;
    }

    public void setHourlyCost(double hourlyCost) {
        this.hourlyCost = hourlyCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public void setTruckSize(String truckSize) {
        this.truckSize = truckSize;
    }

    public void setDeliveryDate(String deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public void setPickupTime(String pickupTime) {
        this.pickupTime = pickupTime;
    }

    public void setDeliveredTime(String deliveredTime) {
        this.deliveredTime = deliveredTime;
    }

    public int getDeliveryID() {
        return deliveryID;
    }

    public int getNumLocations() {
        return numLocations;
    }

    public double getDistanceCost() {
        return distanceCost;
    }

    public double getHourlyCost() {
        return hourlyCost;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public double getWeight() {
        return weight;
    }

    public String getStatus() {
        return status;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public String getTruckSize() {
        return truckSize;
    }

    public String getDeliveryDate() {
        return deliveryDate;
    }

    public String getPickupTime() {
        return pickupTime;
    }

    public String getDeliveredTime() {
        return deliveredTime;
    }
    
}
