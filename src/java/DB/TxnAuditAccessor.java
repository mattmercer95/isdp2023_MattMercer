/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Transaction;
import Entity.TxnAudit;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class TxnAuditAccessor {
    private static Connection conn = null;
    private static String insertStatementRoot = "insert into txnaudit(txnID, txnType, status, txnDate, SiteID, deliveryID, employeeID, notes) ";
    private static PreparedStatement insertLogInTransactionStatement = null;
    private static PreparedStatement insertLogOutTransactionStatement = null;
    private static PreparedStatement insertPasswordResetTransactionStatement = null;
    private static PreparedStatement insertStoreOrderTransaction = null;
    private static PreparedStatement auditReportByDateRange = null;
    
    private TxnAuditAccessor(){
        //no instantiation
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                insertLogInTransactionStatement = conn.prepareStatement(insertStatementRoot + "values(null, 'Login', 'Successful log in', ?, ?, null, ?, null)");
                insertLogOutTransactionStatement = conn.prepareStatement(insertStatementRoot + "values(null, 'Logout', 'Successful log out', ?, ?, null, ?, null)");
                insertPasswordResetTransactionStatement = conn.prepareStatement(insertStatementRoot + 
                        "values(null, 'Password Reset', 'Reset by User', "
                        + "?, ?, null, ?, null)");
                insertStoreOrderTransaction = conn.prepareStatement(insertStatementRoot +
                        "values(?, ?, ?, ?, ?, ?, ?, null)");
                auditReportByDateRange = conn.prepareStatement("select * from auditReport where txnDate between ? and ?");
                return true;
            } catch (SQLException ex) {
                System.err.println("************************");
                System.err.println("** Error preparing SQL");
                System.err.println("** " + ex.getMessage());
                System.err.println("************************");
                conn = null;
            }
        System.out.println("Connection was null");
        return false;
    }
    
    public static ArrayList<TxnAudit> auditReportInRange(String startDate, String endDate) {
        ArrayList<TxnAudit> audit = new ArrayList<TxnAudit>();
        
        ResultSet rs;
        try{
            if (!init())
                return audit;
            auditReportByDateRange.setString(1, startDate);
            auditReportByDateRange.setString(2, endDate);
            rs = auditReportByDateRange.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Audit Report");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return audit;
        }
        
        try {
            while (rs.next()) {
                TxnAudit temp = new TxnAudit();
                temp.setTxnAuditID(rs.getInt(1));
                temp.setTxnID(rs.getInt(2));
                temp.setTxnType(rs.getString(3));
                temp.setStatus(rs.getString(4));
                temp.setTxnDate(rs.getDate(5).toString());
                temp.setSiteID(rs.getInt(6));
                temp.setDeliveryID(rs.getInt(7));
                temp.setEmployeeID(rs.getInt(8));
                temp.setEmployeeName(rs.getString(10) + " " + rs.getString(11));
                temp.setPosition(rs.getString(12));
                temp.setSiteName(rs.getString(13));
                
                audit.add(temp);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Audit Report");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return audit;
    }
    
    public static boolean passwordResetTransaction(TxnAudit txnToBeLogged){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            insertPasswordResetTransactionStatement.setString(1, txnToBeLogged.getTxnDate());
            insertPasswordResetTransactionStatement.setInt(2, txnToBeLogged.getSiteID());
            insertPasswordResetTransactionStatement.setInt(3, txnToBeLogged.getEmployeeID());
            int rowCount = insertPasswordResetTransactionStatement.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Inserting Log In Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
    
    public static boolean insertOrderTransaction(TxnAudit txnToBeLogged){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            insertStoreOrderTransaction.setInt(1, txnToBeLogged.getTxnID());
            insertStoreOrderTransaction.setString(2, txnToBeLogged.getTxnType());
            insertStoreOrderTransaction.setString(3, txnToBeLogged.getStatus());
            insertStoreOrderTransaction.setString(4, txnToBeLogged.getTxnDate());
            System.out.println(txnToBeLogged.getSiteID());
            insertStoreOrderTransaction.setInt(5, txnToBeLogged.getSiteID());
            insertStoreOrderTransaction.setInt(6, txnToBeLogged.getDeliveryID());
            insertStoreOrderTransaction.setInt(7, txnToBeLogged.getEmployeeID());
            int rowCount = insertStoreOrderTransaction.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Inserting Order Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
    
    public static boolean insertLogInTransaction(TxnAudit txnToBeLogged){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            insertLogInTransactionStatement.setString(1, txnToBeLogged.getTxnDate());
            insertLogInTransactionStatement.setInt(2, txnToBeLogged.getSiteID());
            insertLogInTransactionStatement.setInt(3, txnToBeLogged.getEmployeeID());
            int rowCount = insertLogInTransactionStatement.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Inserting Log In Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
    public static boolean insertLogOutTransaction(TxnAudit txnToBeLogged){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            insertLogOutTransactionStatement.setString(1, txnToBeLogged.getTxnDate());
            insertLogOutTransactionStatement.setInt(2, txnToBeLogged.getSiteID());
            insertLogOutTransactionStatement.setInt(3, txnToBeLogged.getEmployeeID());
            int rowCount = insertLogOutTransactionStatement.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Inserting Log Out Transaction");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
}
