/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Position;
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
                int siteID = rs.getInt("siteID");
                String name = rs.getString("name");
                retailSites.add(new Site(siteID, name));
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
