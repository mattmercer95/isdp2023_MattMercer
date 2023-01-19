/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Entity;

/**
 *
 * @author mattm
 */
public class Position {
    private int positionID;
    private String positionTitle;
    
    public Position(int positionID, String positionTitle){
        this.positionID = positionID;
        this.positionTitle = positionTitle;
    }
    
    public int getPositionID(){
        return this.positionID;
    }
    public String getPositionTitle(){
        return this.positionTitle;
    }
}
