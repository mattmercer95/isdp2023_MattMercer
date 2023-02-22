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
    private static PreparedStatement getAllOpenStoreOrders = null;
    private static PreparedStatement getAllRetailLocations = null;

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
            getAllOpenStoreOrders = conn.prepareStatement("call GetOpenStoreOrderCount(?)");
            getAllRetailLocations = conn.prepareStatement("call GetAllRetailLocations()");
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
    
    public static boolean isOrderOpen(int siteID){
        boolean result = true;

        ResultSet rs;
        try {
            if (!init()) {
                return result;
            }
            getAllOpenStoreOrders.setInt(1, siteID);
            rs = getAllOpenStoreOrders.executeQuery();
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return result;
        }

        try {
            while (rs.next()) {
                int ordersOpen = rs.getInt("ordersOpen");
                result = (ordersOpen == 0) ? false : true;
            }
        } catch (SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error checking Open Orders");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }

        return result;
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
