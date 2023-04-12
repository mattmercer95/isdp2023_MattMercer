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
public class ReturnsDamageLossReport {

    private ArrayList<Transaction> returns, damage, loss;

    public void setReturns(ArrayList<Transaction> returns) {
        this.returns = returns;
    }

    public void setDamage(ArrayList<Transaction> damage) {
        this.damage = damage;
    }

    public void setLoss(ArrayList<Transaction> loss) {
        this.loss = loss;
    }
    
    public ReturnsDamageLossReport(ArrayList<Transaction> returns, ArrayList<Transaction> damage, ArrayList<Transaction> loss) {
        this.returns = returns;
        this.damage = damage;
        this.loss = loss;
    }
    
}
