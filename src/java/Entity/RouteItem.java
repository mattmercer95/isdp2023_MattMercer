/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class RouteItem {
    private int deliveryID, orderID, distanceFromWH;
    private String location, address;

    public RouteItem() {
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setDeliveryID(int deliveryID) {
        this.deliveryID = deliveryID;
    }

    public void setOrderID(int orderID) {
        this.orderID = orderID;
    }

    public void setDistanceFromWH(int distanceFromWH) {
        this.distanceFromWH = distanceFromWH;
    }

    public void setLocation(String location) {
        this.location = location;
    }
    
}
