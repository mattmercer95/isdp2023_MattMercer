/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Position;
import Entity.Province;
import Entity.Site;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author Matt
 */
public class SiteAccessor {

    private static Connection conn = null;
    private static PreparedStatement getAllSitesStatement = null;
    private static PreparedStatement getAllRetailLocations = null;
    private static PreparedStatement getAllDetailed = null;
    private static PreparedStatement updateSite = null;
    private static PreparedStatement getProvinceList = null;
    private static PreparedStatement getTypeList = null;
    private static PreparedStatement insertSite = null;

    private SiteAccessor() {
        //no instantiation
    }

    private static boolean init() throws SQLException {
        if (conn != null) {
            return true;
        }
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
            System.out.println("Connection was not null");
            getAllSitesStatement = conn.prepareStatement("call GetAllSiteNamesIDs()");
            getAllRetailLocations = conn.prepareStatement("call GetAllRetailLocations()");
            getAllDetailed = conn.prepareStatement("SELECT * FROM site inner join province using(provinceID) where name not in ('Truck', 'Warehouse Bay')");
            updateSite = conn.prepareStatement("update site set name = ?, provinceID = ?, "
                    + "address = ?, address2 = ?, city = ?, country = ?, postalCode = ?, "
                    + "phone = ?, dayOfWeek = ?, distanceFromWH = ?, siteType = ?, "
                    + "notes = ?, active = ?, dayOfWeekID = ? where siteID = ?");
            getProvinceList = conn.prepareStatement("select provinceID, provinceName from province");
            getTypeList = conn.prepareStatement("select siteType from sitetype");
            insertSite = conn.prepareStatement("insert into site (name, provinceID, "
                    + "address, address2, city, country, postalCode, phone, dayOfWeek,"
                    + "distanceFromWH, siteType, notes, active, dayOfWeekID) "
                    + "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            return true;
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error preparing SQL");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            conn = null;
        }
        System.out.println("Connection was null");
        return false;
    }

    public static ArrayList<String> getTypeList(){
        ArrayList<String> typeList = new ArrayList<String>();
        
        ResultSet rs;
        try {
            if (!init()) {
                return typeList;
            }
            rs = getTypeList.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Type List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return typeList;
        }

        try {
            while (rs.next()) {
                String temp = rs.getString("siteType");
                typeList.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Type List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return typeList;
    }
    
    public static ArrayList<Province> getProvinceList(){
        ArrayList<Province> provinces = new ArrayList<Province>();
        
        ResultSet rs;
        try {
            if (!init()) {
                return provinces;
            }
            rs = getProvinceList.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Province List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return provinces;
        }

        try {
            while (rs.next()) {
                Province temp = new Province();
                temp.setCode(rs.getString("provinceID"));
                temp.setName(rs.getString("provinceName"));
                provinces.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Province List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return provinces;
    }
    
    public static boolean insertSite(Site s){
        boolean result = false;
        int rc = 0;
        try {
            if (!init()) {
                return result;
            }
            insertSite.setString(1,s.getName());
            insertSite.setString(2, s.getProvinceID());
            insertSite.setString(3, s.getAddress());
            insertSite.setString(4,s.getAddress2());
            insertSite.setString(5, s.getCity());
            insertSite.setString(6, s.getCountry());
            insertSite.setString(7, s.getPostalCode());
            insertSite.setString(8, s.getPhone());
            insertSite.setString(9, s.getDayOfWeek());
            insertSite.setInt(10, s.getDistanceFromWH());
            insertSite.setString(11, s.getSiteType());
            insertSite.setString(12, s.getNotes());
            insertSite.setBoolean(13, s.isActive());
            insertSite.setInt(14, s.getDayOfWeekID());
            rc = insertSite.executeUpdate();
            result = rc > 0 ? true : false;
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error inserting Site List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        
        return result;
    }
    
    public static boolean updateSite(Site s){
        boolean result = false;
        int rc = 0;
        try {
            if (!init()) {
                return result;
            }
            updateSite.setString(1,s.getName());
            updateSite.setString(2, s.getProvinceID());
            updateSite.setString(3, s.getAddress());
            updateSite.setString(4,s.getAddress2());
            updateSite.setString(5, s.getCity());
            updateSite.setString(6, s.getCountry());
            updateSite.setString(7, s.getPostalCode());
            updateSite.setString(8, s.getPhone());
            updateSite.setString(9, s.getDayOfWeek());
            updateSite.setInt(10, s.getDistanceFromWH());
            updateSite.setString(11, s.getSiteType());
            updateSite.setString(12, s.getNotes());
            updateSite.setBoolean(13, s.isActive());
            updateSite.setInt(14, s.getDayOfWeekID());
            updateSite.setInt(15, s.getSiteID());
            rc = updateSite.executeUpdate();
            result = rc > 0 ? true : false;
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Retail Sites List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        
        return result;
    }
    
    public static ArrayList<Site> getAllDetailed(){
        ArrayList<Site> allDetailed = new ArrayList<Site>();

        ResultSet rs;
        try {
            if (!init()) {
                return allDetailed;
            }
            rs = getAllDetailed.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Retail Sites List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return allDetailed;
        }

        try {
            while (rs.next()) {
                Site temp = new Site();
                temp.setSiteID(rs.getInt("siteID"));
                temp.setProvinceID(rs.getString("provinceID"));
                temp.setName(rs.getString("name"));
                temp.setAddress(rs.getString("address"));
                temp.setAddress2(rs.getString("address2"));
                temp.setCity(rs.getString("city"));
                temp.setCountry(rs.getString("country"));
                temp.setPostalCode(rs.getString("postalCode"));
                temp.setPhone(rs.getString("phone"));
                temp.setDayOfWeek(rs.getString("dayOfWeek"));
                temp.setDistanceFromWH(rs.getInt("distanceFromWH"));
                temp.setSiteType(rs.getString("siteType"));
                temp.setNotes(rs.getString("notes"));
                temp.setActive(rs.getBoolean("active"));
                temp.setDayOfWeekID(rs.getInt("dayOfWeekID"));
                temp.setProvince(rs.getString("provinceName"));
                allDetailed.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Retail Site List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return allDetailed;
    }
    
    public static ArrayList<Site> getAllRetailLocations() {
        ArrayList<Site> retailSites = new ArrayList<Site>();

        ResultSet rs;
        try {
            if (!init()) {
                return retailSites;
            }
            rs = getAllRetailLocations.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Retail Sites List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return retailSites;
        }

        try {
            while (rs.next()) {
                Site temp = new Site();
                temp.setSiteID(rs.getInt("siteID"));
                temp.setName(rs.getString("name"));
                String address1 = rs.getString("address");
                String address2 = (rs.getString("address2") == null) ? "" : rs.getString("address2");
                String city = rs.getString("city");
                String provinceID = rs.getString("provinceID");
                temp.setAddress(address1 + " " + address2 + " " + city + ", " + provinceID);
                retailSites.add(temp);
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Retail Site List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return retailSites;
    }
    
    public static ArrayList<Site> getAllSiteNamesIDs() {
        ArrayList<Site> sites = new ArrayList<Site>();

        ResultSet rs;
        try {
            if (!init()) {
                return sites;
            }
            rs = getAllSitesStatement.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error retreiving Sites List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return sites;
        }

        try {
            while (rs.next()) {
                int siteID = rs.getInt("siteID");
                String name = rs.getString("name");
                sites.add(new Site(siteID, name));
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Site List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return sites;
    }
}
