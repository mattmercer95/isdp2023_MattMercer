/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author Matt
 */
public class Site {
    private int siteID;
    private String name;
    
    public Site(int siteID, String name){
        this.siteID = siteID;
        this.name = name;
    }
    
    public int getSiteID(){
        return this.siteID;
    }
    public String getName(){
        return this.name;
    }
}
