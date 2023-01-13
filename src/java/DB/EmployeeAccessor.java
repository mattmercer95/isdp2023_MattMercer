/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Employee;
import Entity.LogIn;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Matt
 */
public class EmployeeAccessor {
    private static Connection conn = null;
    private static PreparedStatement selectAllStatement = null;
    private static PreparedStatement getEmployeeInfoStatement = null;

    private EmployeeAccessor(){
        //no instantiation
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                selectAllStatement = conn.prepareStatement("select * from employee");
                getEmployeeInfoStatement = conn.prepareStatement("call GetEmployeeInfo(?)");
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
    
    public static List<LogIn> getAllLogIns() {
        List<LogIn> logIns = new ArrayList();
        
        ResultSet rs;
        try{
            if (!init())
                return logIns;
            rs = selectAllStatement.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Log In records");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return logIns;
        }
        
        try {
            while (rs.next()) {
                String username = rs.getString("username");
                String password = rs.getString("password");
                LogIn user = new LogIn(username, password);
                logIns.add(user);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Records");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return logIns;
    }
    
    public static Employee getEmployeeInfo(String username) {
        Employee result = null;
        
        ResultSet rs;
        try{
            if (!init())
                return result;
            getEmployeeInfoStatement.setString(1, username);
            rs = getEmployeeInfoStatement.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Employee Info");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }
        
        try {
            while (rs.next()) {
                int employeeID = rs.getInt("employeeID");
                username = rs.getString("username");
                String firstName = rs.getString("firstName");
                String lastName = rs.getString("lastName");
                String email = rs.getString("email");
                boolean active = rs.getBoolean("active");
                boolean locked = rs.getBoolean("locked");
                String position = rs.getString("position");
                String site = rs.getString("site");
                int siteID = rs.getInt("siteID");
                result = new Employee(employeeID, username, firstName, lastName,
                    email, active, locked, position, site, siteID);
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Records");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return result;
    }
}
