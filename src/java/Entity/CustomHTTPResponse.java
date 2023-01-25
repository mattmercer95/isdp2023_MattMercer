/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 * A simple data class for responding to HTTP requests on the backend. 
 * Contains a true/false if successful and a message
 * @author mattm
 */
public class CustomHTTPResponse {
    private boolean success;
    private String message;
    
    public CustomHTTPResponse(boolean success, String message){
        this.success = success;
        this.message = message;
    }
    
    public boolean isSuccess(){
        return this.success;
    }
    public String getMessage(){
        return this.message;
    }
    public void setMessage(String msg){
        this.message = msg;
    }
}
