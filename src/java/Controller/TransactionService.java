/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.InventoryAccessor;
import DB.SiteAccessor;
import DB.TransactionAccessor;
import Entity.Transaction;
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
@WebServlet(name = "TransactionService", urlPatterns = {"/TransactionService/*"})
public class TransactionService extends HttpServlet {

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try ( PrintWriter out = response.getWriter()) {
            Gson g = new Gson();
            Scanner sc = new Scanner(request.getReader());
            Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
            boolean success = TransactionAccessor.updateTransaction(t);
            out.println(g.toJson(success));
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
            if(uri.equals("/isOrderOpen")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                boolean isOrderOpen = TransactionAccessor.isOrderOpen(siteID);
                out.println(g.toJson(isOrderOpen));
            }
            else if(uri.equals("/isEmergencyOrderOpen")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                boolean isOrderOpen = TransactionAccessor.isEmergencyOrderOpen(siteID);
                out.println(g.toJson(isOrderOpen));
            }
            else if(uri.equals("/newStoreOrder")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                int orderID = TransactionAccessor.createNewStoreOrder(siteID, false);
                out.println(g.toJson(orderID));
            }
            else if(uri.equals("/newEmergencyStoreOrder")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                int orderID = TransactionAccessor.createNewStoreOrder(siteID, true);
                out.println(g.toJson(orderID));
            }
            else if(uri.equals("/getDetails")){
                Scanner sc = new Scanner(request.getReader());
                int transactionID = Integer.parseInt(sc.nextLine());
                Transaction t = TransactionAccessor.getTransactionByID(transactionID);
                t.setItems(TransactionAccessor.getTransactionItems(transactionID));
                t.calculateStats();
                out.println(g.toJson(t));
            }
            else if(uri.equals("/submit")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("SUBMITTED");
                boolean submitted = TransactionAccessor.updateTransaction(t);
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/orderStatusList")){
                ArrayList<String> orderStatusList = TransactionAccessor.getOrderStatusList();
                out.println(g.toJson(orderStatusList));
            }
            else {
                ArrayList<Transaction> transactions = TransactionAccessor.getAllTransactions();
                //get zero item orders and add to list
                transactions.addAll(TransactionAccessor.getZeroItemTransactions());
                out.println(g.toJson(transactions));
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
