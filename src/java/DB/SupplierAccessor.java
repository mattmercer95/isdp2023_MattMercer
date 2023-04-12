/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Supplier;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class SupplierAccessor {

    private static Connection conn = null;
    private static PreparedStatement getAllSuppliers = null;
    private static PreparedStatement getSuppliersByTxnID = null;

    public static ArrayList<Supplier> getSuppliersByTxnID(int txnID) {
        ArrayList<Supplier> suppliers = new ArrayList<Supplier>();
        
        ResultSet rs;
        try {
            if (!init()) {
                return suppliers;
            }
            getSuppliersByTxnID.setInt(1, txnID);
            rs = getSuppliersByTxnID.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Supplier List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return suppliers;
        }

        try {
            while (rs.next()) {
                Supplier temp = new Supplier();
                temp.setSupplierID(rs.getInt("supplierID"));
                temp.setName(rs.getString("name"));
                temp.setAddress(rs.getString("address"));
                temp.setPhone(rs.getString("phone"));
                temp.setContact(rs.getString("contact"));
                suppliers.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Supplier List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return suppliers;
    }
    
    private SupplierAccessor() {
    }
    
    private static boolean init() throws SQLException {
        if (conn != null) {
            return true;
        }
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
            System.out.println("Connection was not null");
            getAllSuppliers = conn.prepareStatement("select supplierID, name from supplier");
            getSuppliersByTxnID = conn.prepareStatement("select distinct supplierID, supplier.name, contact,concat_ws(\", \", address1, address2, city, province, postalCode) as address, phone "
                    + "from txnitems inner join (item) using (itemID) inner join supplier using(supplierID) where txnID = ?");
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
    
    public static ArrayList<Supplier> getAllSuppliers(){
        ArrayList<Supplier> suppliers = new ArrayList<Supplier>();
        
        ResultSet rs;
        try {
            if (!init()) {
                return suppliers;
            }
            rs = getAllSuppliers.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Supplier List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return suppliers;
        }

        try {
            while (rs.next()) {
                Supplier temp = new Supplier();
                temp.setSupplierID(rs.getInt("supplierID"));
                temp.setName(rs.getString("name"));
                suppliers.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Supplier List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return suppliers;
    }
}
