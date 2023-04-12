/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.DeliveryAccessor;
import DB.TransactionAccessor;
import Entity.Delivery;
import Entity.RouteItem;
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
 * @author Matt
 */
@WebServlet(name = "DeliveryService", urlPatterns = {"/DeliveryService/*"})
public class DeliveryService extends HttpServlet {

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
            if(uri.equals("/getTransactionsByDelivery")){
                Scanner sc = new Scanner(request.getReader());
                int deliveryID = Integer.parseInt(sc.nextLine());
                ArrayList<Transaction> transactions = TransactionAccessor.getOrdersByDeliveryID(deliveryID);
                for(Transaction t : transactions){
                    t.setItems(TransactionAccessor.getTransactionItems(t.getTransactionID()));
                }
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/deliveryReport")){
                Scanner sc = new Scanner(request.getReader());
                String shipDate = sc.nextLine();
                Delivery d = DeliveryAccessor.getDeliveryByShipDate(shipDate);
                d.setTransactions(TransactionAccessor.getOrdersByDeliveryID(d.getDeliveryID()));
                out.println(g.toJson(d));
            }
            else if(uri.equals("/pickupDelivery")){
                Scanner sc = new Scanner(request.getReader());
                Delivery d = g.fromJson(sc.nextLine(), Delivery.class);
                boolean result = DeliveryAccessor.pickupDelivery(d);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/deliveredStatusChange")){
                Scanner sc = new Scanner(request.getReader());
                int transactionID = Integer.parseInt(sc.nextLine());
                boolean result = TransactionAccessor.changeStatusToDelivered(transactionID);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/getRoute")){
                Scanner sc = new Scanner(request.getReader());
                int deliveryID = Integer.parseInt(sc.nextLine());
                ArrayList<RouteItem> route = DeliveryAccessor.getRoute(deliveryID);
                out.println(g.toJson(route));
            }
            else if(uri.equals("/checkIfComplete")){
                Scanner sc = new Scanner(request.getReader());
                Delivery d = g.fromJson(sc.nextLine(), Delivery.class);
                boolean isComplete = true;
                ArrayList<Transaction> txns = d.getTransactions();
                for(Transaction t : txns){
                    String currStatus = t.getStatus();
                    if(!currStatus.equals("DELIVERED")){
                        isComplete = false;
                    }
                }
                boolean result = false;
                if(isComplete){
                    result = DeliveryAccessor.completeDelivery(d);
                }
                out.println(g.toJson(result));
            }
            else {
                ArrayList<Delivery> deliveries = DeliveryAccessor.getAllDeliveries();
                out.println(g.toJson(deliveries));
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
