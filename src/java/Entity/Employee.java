/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

import DB.PermissionAccessor;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class Employee {
    private int employeeID, siteID, positionID;
    private String username, firstName, lastName, email, position, site, password;
    private boolean active, locked;
    private ArrayList<String> permissions;
    
    public Employee(int employeeID, String username, String password, String firstName, String lastName, 
            String email, boolean active, boolean locked, String position, int positionID, String site, int siteID){
        this.employeeID = employeeID;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.active = active;
        this.locked = locked;
        this.position = position;
        this.positionID = positionID;
        this.site = site;
        this.siteID = siteID;
    }
    
    public Employee(int employeeID, String username, String password, String firstName, String lastName, 
            String email, boolean active, boolean locked, String position, int positionID, String site, int siteID, String permissions){
        this(employeeID, username, password, firstName, lastName, email, active, locked, position, positionID, site, siteID);
        //get the permissions
        this.permissions = PermissionAccessor.getPermissionList(employeeID);
    }
 
    public int getEmployeeID(){
        return this.employeeID;
    }
    public int getSiteID(){
        return this.siteID;
    }
    public int getPositionID(){
        return this.positionID;
    }
    public String getUsername(){
        return this.username;
    }
    public String getPassword(){
        return this.password;
    }
    public String getFirstName(){
        return this.firstName;
    }
    public String getLastName(){
        return this.lastName;
    }
    public String getEmail(){
        return this.email;
    }
    public String getPosition(){
        return this.position;
    }
    public String getSite(){
        return this.site;
    }
    public ArrayList<String> getPermissions(){
        return this.permissions;
    }
    public boolean getActive(){
        return this.active;
    }
    public boolean getLocked(){
        return this.locked;
    }
}
