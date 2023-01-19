/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package DB;

import Entity.Position;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 *
 * @author mattm
 */
public class PositionAccessor {
    private static Connection conn = null;
    private static PreparedStatement getAllPositionsStatement = null;
    
    private PositionAccessor(){
        //no instantiation
    }
    
    private static boolean init() throws SQLException {
        if (conn != null)
            return true;
        conn = ConnectionManager.getConnection(ConnectionParameters.URL, ConnectionParameters.USERNAME, ConnectionParameters.PASSWORD);
        if (conn != null)            
            try {
                System.out.println("Connection was not null");
                getAllPositionsStatement = conn.prepareStatement("select * from posn");
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
    
    public static ArrayList<Position> getAllPositions() {
        ArrayList<Position> positions = new ArrayList<Position>();
        
        ResultSet rs;
        try{
            if (!init())
                return positions;
            rs = getAllPositionsStatement.executeQuery();
        } catch(SQLException ex){
            System.err.println("************************");
            System.err.println("** Error retreiving Positions List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
            return positions;
        }
        
        try {
            while (rs.next()) {
                int positionID = rs.getInt("positionID");
                String positionTitle = rs.getString("permissionLevel");
                positions.add(new Position(positionID, positionTitle));
            }
        } catch(SQLException ex) {
            System.err.println("************************");
            System.err.println("** Error populating Positions List");
            System.err.println("** " + ex.getMessage());
            System.err.println("************************");
        }
        
        return positions;
    }
}
