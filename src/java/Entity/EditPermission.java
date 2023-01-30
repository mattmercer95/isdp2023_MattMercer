/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 * A Data class used for editing user permissions
 * @author Matt
 */
public class EditPermission {
    private int employeeID;
    private String permission;
    
    public EditPermission(int employeeID, String permission){
        this.employeeID = employeeID;
        this.permission = permission;
    }
    
    public int getEmployeeID(){
        return this.employeeID;
    }
    public String getPermission(){
        return this.permission;
    }
}
