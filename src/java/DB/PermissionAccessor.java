/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Employee;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class PermissionAccessor {
    private static Connection conn = null;
    private static PreparedStatement getPermissionsByIDStatement = null;
    
    private PermissionAccessor(){
        //no instantiation
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                getPermissionsByIDStatement = conn.prepareStatement("call GetPermissionsByID(?)");
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
    
    public static ArrayList<String> getPermissionList(int employeeID) {
        ArrayList<String> permissions = new ArrayList<String>();
        
        ResultSet rs;
        try{
            if (!init())
                return permissions;
            getPermissionsByIDStatement.setString(1, Integer.toString(employeeID));
            rs = getPermissionsByIDStatement.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Permission List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return permissions;
        }
        
        try {
            while (rs.next()) {
                String permission = rs.getString("permissionID");
                permissions.add(permission);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Permission List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return permissions;
    }
}
