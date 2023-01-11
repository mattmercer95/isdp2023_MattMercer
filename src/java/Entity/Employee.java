/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class Employee {
    private int employeeID;
    private String username, firstName, lastName, email, position, site;
    private ArrayList<String> permissions;
    
    public Employee(int employeeID, String username, String firstName, String lastName, 
            String email, String position, String site){
        this.employeeID = employeeID;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.position = position;
        this.site = site;
        //get permission list from the permission accessor
    }
    
    public int getEmployeeID(){
        return this.employeeID;
    }
    public String getUsername(){
        return this.username;
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
}
