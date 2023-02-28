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
    private int siteID, distanceFromWH, dayOfWeekID;
    private String name, provinceID, province, address, address2, city, country, postalCode, phone, dayOfWeek, siteType, notes;
    private boolean active;
    
    public Site(){
        
    }
    public Site(int siteID, String name){
        this.siteID = siteID;
        this.name = name;
    }
    
    public void setSiteID(int siteID){
        this.siteID = siteID;
    }
    public void setDistanceFromWH(int distanceFromWH){
        this.distanceFromWH = distanceFromWH;
    }
    public void setDayOfWeekID(int dayOfWeekID){
        this.dayOfWeekID = dayOfWeekID;
    }
    public void setName(String name){
        this.name = name;
    }
    public void setProvinceID(String provinceID){
        this.provinceID = provinceID;
    }
    public void setProvince(String province){
        this.province = province;
    }
    public void setAddress(String address){
        this.address = address;
    }
    public void setAddress2(String address2){
        this.address2 = address2;
    }
    public void setCity(String city){
        this.city = city;
    }
    public void setCountry(String country){
        this.country = country;
    }
    public void setPostalCode(String postalCode){
        this.postalCode = postalCode;
    }
    public void setPhone(String phone){
        this.phone = phone;
    }
    public void setDayOfWeek(String dayOfWeek){
        this.dayOfWeek = dayOfWeek;
    }
    public void setSiteType(String siteType){
        this.siteType = siteType;
    }
    public void setNotes(String notes){
        this.notes = notes;
    }
    public void setActive(boolean active){
        this.active = active;
    }
    
    public int getSiteID(){
        return this.siteID;
    }
    public String getName(){
        return this.name;
    }
    public String getProvinceID(){
        return this.provinceID;
    }
    public String getProvince(){
        return this.province;
    }
    public String getAddress(){
        return this.address;
    }
    public String getAddress2(){
        return this.address2;
    }
    public String getCity(){
        return this.city;
    }
    public String getCountry(){
        return this.country;
    }
    public String getPostalCode(){
        return this.postalCode;
    }
    public String getPhone(){
        return this.phone;
    }
    public String getDayOfWeek(){
        return this.dayOfWeek;
    }
    public String getSiteType(){
        return this.siteType;
    }
    public String getNotes(){
        return this.notes;
    }
    public boolean isActive(){
        return this.active;
    }
    public int getDistanceFromWH(){
        return this.distanceFromWH;
    }
    public int getDayOfWeekID(){
        return this.dayOfWeekID;
    }
}
