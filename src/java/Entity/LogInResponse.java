/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class LogInResponse {
    private Employee employee;
    private String errorMessage;
    
    public LogInResponse(Employee emp, String errorMessage){
        this.employee = emp;
        this.errorMessage = errorMessage;
    }
    
    public Employee getEmployee(){
        return this.employee;
    }
    public String getErrorMessage(){
        return this.errorMessage;
    }
}
