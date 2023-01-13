/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class TxnAudit {
    private int txnAuditID, txnID, siteID, deliveryID, employeeID;
    private String txnType, status, txnDate, notes;
    
    public TxnAudit(int txnAuditID, int txnID, String txnType, String status,
            String txnDate, int siteID, int deliveryID, int employeeID, String notes){
        this.txnAuditID = txnAuditID;
        this.txnID = txnID;
        this.txnType = txnType;
        this.status = status;
        this.txnDate = txnDate;
        this.siteID = siteID;
        this.deliveryID = deliveryID;
        this.employeeID = employeeID;
        this.notes = notes;
    }
    //constructor for Log-In Transactions
    public TxnAudit(String txnDate, int siteID, int employeeID){
        this.txnType = "Login";
        this.status = "Successful log in";
        this.txnDate = txnDate;
        this.siteID = siteID;
        this.employeeID = employeeID;
    }
    
    public int getTxnAuditID(){
        return this.txnAuditID;
    }
    public int getTxnID(){
        return this.txnID;
    }
    public int getSiteID(){
        return this.siteID;
    }
    public int getDeliveryID(){
        return this.deliveryID;
    }
    public int getEmployeeID(){
        return this.employeeID;
    }
    public String getTxnType(){
        return this.txnType;
    }
    public String getStatus(){
        return this.status;
    }
    public String getTxnDate(){
        return this.txnDate;
    }
    public String getNotes(){
        return this.notes;
    }
}
