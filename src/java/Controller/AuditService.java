/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.TxnAuditAccessor;
import Entity.TxnAudit;
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
@WebServlet(name = "AuditService", urlPatterns = {"/AuditService/*"})
public class AuditService extends HttpServlet {

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
            if(uri.equals("/new")){
                Scanner sc = new Scanner(request.getReader());
                TxnAudit auditItem = g.fromJson(sc.nextLine(), TxnAudit.class);
                boolean result = TxnAuditAccessor.insertOrderTransaction(auditItem);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/fulfil")){
                Scanner sc = new Scanner(request.getReader());
                TxnAudit auditItem = g.fromJson(sc.nextLine(), TxnAudit.class);
                boolean result = TxnAuditAccessor.insertOrderTransaction(auditItem);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/report")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                ArrayList<TxnAudit> auditReport = TxnAuditAccessor.auditReportInRange(startDate, endDate);
                out.println(g.toJson(auditReport));
            }
            else if(uri.equals("/received")){
                Scanner sc = new Scanner(request.getReader());
                TxnAudit auditItem = g.fromJson(sc.nextLine(), TxnAudit.class);
                if(auditItem.getTxnDate().equals("-1")){
                    auditItem.setTxnDate(getCurrentTimeStamp());
                }
                boolean result = TxnAuditAccessor.insertOrderTransaction(auditItem);
                out.println(g.toJson(result));
            }
            else if(uri.equals("/rejected")){
                Scanner sc = new Scanner(request.getReader());
                TxnAudit auditItem = g.fromJson(sc.nextLine(), TxnAudit.class);
                boolean result = TxnAuditAccessor.insertOrderTransaction(auditItem);
                out.println(g.toJson(result));
            }
            else {
                System.out.println(":(");
            }
        }
    }
    //Helper function for getting the current time in the MySQL datetime format
    private String getCurrentTimeStamp(){
        java.util.Date dt = new java.util.Date();
        java.text.SimpleDateFormat sdf = 
             new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(dt);
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
