/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.InventoryAccessor;
import Entity.Inventory;
import Entity.Item;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Scanner;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author mattm
 */
@WebServlet(name = "InventoryService", urlPatterns = {"/InventoryService/*"})
public class InventoryService extends HttpServlet {

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String uri = request.getPathInfo();
        try ( PrintWriter out = response.getWriter()) {
            Gson g = new Gson();
            if(uri.equals("/updateThreshold")){
                Scanner sc = new Scanner(request.getReader());
                Inventory item = g.fromJson(sc.nextLine(), Inventory.class);
                boolean success = InventoryAccessor.updateThreshold(item);
                out.println(g.toJson(success));
            }
            else if(uri.equals("/updateItemDetails")){
                Scanner sc = new Scanner(request.getReader());
                Item item = g.fromJson(sc.nextLine(), Item.class);
                boolean success = InventoryAccessor.updateItemDetails(item);
                out.println(g.toJson(success));
            }
        }
    }
    
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        String uri = request.getPathInfo();
        try ( PrintWriter out = response.getWriter()) {
            Gson g = new Gson();
            if(uri.equals("/newOrder")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                ArrayList<Inventory> inventory = InventoryAccessor.getAvailableInventory(siteID);
                out.println(g.toJson(inventory));
            }
            else if(uri.equals("/warehouse")){
                Scanner sc = new Scanner(request.getReader());
                int txnID = Integer.parseInt(sc.nextLine());
                ArrayList<Inventory> inventory = InventoryAccessor.getWarehouseInventory(txnID);
                out.println(g.toJson(inventory));
            }
            else if(uri.equals("/addNewProduct")){
                Scanner sc = new Scanner(request.getReader());
                Item item = g.fromJson(sc.nextLine(), Item.class);
                boolean result = InventoryAccessor.addNewProduct(item);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/allDetailed")){
                ArrayList<Inventory> inventory = InventoryAccessor.getAllDetailed();
                out.println(g.toJson(inventory));
            }
            else if(uri.equals("/detailedBySite")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                ArrayList<Inventory> inventory = InventoryAccessor.getDetailedInventoryBySite(siteID);
                out.println(g.toJson(inventory));
            }
            else if(uri.equals("/onlineInventory")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                ArrayList<Inventory> inventory = InventoryAccessor.getOnlineInventory(siteID);
                out.println(g.toJson(inventory));
            }
            else {
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                ArrayList<Inventory> inventory = InventoryAccessor.getInventoryByID(siteID);
                out.println(g.toJson(inventory));
            }
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
