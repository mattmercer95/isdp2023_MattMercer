/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.EmployeeAccessor;
import DB.TxnAuditAccessor;
import Entity.Employee;
import Entity.LogIn;
import Entity.LogInResponse;
import Entity.TxnAudit;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
@WebServlet(name = "PasswordResetService", urlPatterns = {"/PasswordResetService/reset"})
public class PasswordResetService extends HttpServlet {

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
        try ( PrintWriter out = response.getWriter()) {
            Scanner sc = new Scanner(request.getReader());
            String jsonData = sc.nextLine(); // payload is a single string
            Gson g = new Gson();
            //format for request matches the format for the LogIn object
            LogIn passResetLogIn = g.fromJson(jsonData, LogIn.class);
            //hash the password
            String hashedPassword = hashPassword(passResetLogIn.getPassword());
            LogInResponse resetResponse = null;
            if(hashedPassword != null){
                passResetLogIn.setPassword(hashedPassword);
                Employee emp = EmployeeAccessor.resetPassword(passResetLogIn);
                //Make transcation audit record for reseting password
                String timestamp = getCurrentTimeStamp();
                TxnAudit transaction = new TxnAudit(timestamp, emp.getSiteID(), emp.getEmployeeID());
                if(!TxnAuditAccessor.passwordResetTransaction(transaction)){
                    System.out.println("Error logging the password reset transaction");
                }
                //Make transaction for logging in
                timestamp = getCurrentTimeStamp();
                transaction = new TxnAudit(timestamp, emp.getSiteID(), emp.getEmployeeID());
                if(!TxnAuditAccessor.insertLogInTransaction(transaction)){
                    System.out.println("Error logging the login transaction");
                }
                resetResponse = new LogInResponse(emp, null);
            }
            else{
                //error message, no employee info given in response
                resetResponse = new LogInResponse(null, "Error reseting password");
            }
            out.println(g.toJson(resetResponse));
        }
    }
    
    //Helper function for getting the current time in the MySQL datetime format
    private String getCurrentTimeStamp(){
        java.util.Date dt = new java.util.Date();
        java.text.SimpleDateFormat sdf = 
             new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(dt);
    }
    
    private String hashPassword(String password){
        String result = null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(
                    password.getBytes(StandardCharsets.UTF_8));
            result = bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException ex) {
            System.out.println("Error with hashing algorithm");
        }
        return result;
    }
    
    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
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
