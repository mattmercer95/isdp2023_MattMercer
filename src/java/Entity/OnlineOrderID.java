/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class OnlineOrderID {
    private int transactionID;
    private String email;
    
    public OnlineOrderID(){
        
    }

    public int getTransactionID() {
        return transactionID;
    }

    public String getEmail() {
        return email;
    }

    public void setTransactionID(int transactionID) {
        this.transactionID = transactionID;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
}
