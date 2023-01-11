/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class LogIn {
    private String username, password;
    
    public LogIn(String username, String password){
        this.username = username;
        this.password = password;
    }
    
    public String getUsername(){
        return this.username;
    }
    public String getPassword(){
        return this.password;
    }
}
