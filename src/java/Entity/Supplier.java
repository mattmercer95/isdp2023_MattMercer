/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class Supplier {

    private int supplierID;
    private String name, address, contact, phone;

    public void setAddress(String address) {
        this.address = address;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public Supplier() {
    }

    public int getSupplierID() {
        return supplierID;
    }

    public String getName() {
        return name;
    }

    public void setSupplierID(int supplierID) {
        this.supplierID = supplierID;
    }

    public void setName(String name) {
        this.name = name;
    }
    
}
