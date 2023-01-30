/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.EditPermission;
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
    private static PreparedStatement getPermissionsToAdd = null;
    private static PreparedStatement removePermission = null;
    private static PreparedStatement addPermission = null;
    
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
                getPermissionsToAdd = conn.prepareStatement("call GetPermissionsToAdd(?)");
                removePermission = conn.prepareStatement("delete from user_permission where employeeID = ? and permissionID = ?");
                addPermission = conn.prepareStatement("insert into user_permission(employeeID, permissionID) values (?, ?)");
                
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
    
    public static boolean addPermission(EditPermission permission){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            addPermission.setInt(1, permission.getEmployeeID());
            addPermission.setString(2, permission.getPermission());
            int rowCount = addPermission.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Adding Permission");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
    
    public static boolean removePermission(EditPermission permission){
        boolean result = false;
        ResultSet rs;
        try{
            if (!init())
                return result;
            removePermission.setInt(1, permission.getEmployeeID());
            removePermission.setString(2, permission.getPermission());
            int rowCount = removePermission.executeUpdate();
            result = (rowCount == 1);
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error Remove Permission");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        return result;
    }
    
    public static ArrayList<String> getPermissionsToAdd(int employeeID){
        ArrayList<String> permissions = new ArrayList<String>();
        
        ResultSet rs;
        try{
            if (!init())
                return permissions;
            getPermissionsToAdd.setString(1, Integer.toString(employeeID));
            rs = getPermissionsToAdd.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Permissions To Add List");
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
            System.err.println("** Error populating Permissions To Add List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return permissions;
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
