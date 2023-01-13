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
import java.util.ArrayList;
import java.util.List;
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
@WebServlet(name = "LogInService", urlPatterns = {"/LogInService/login"})
public class LogInService extends HttpServlet {

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
        try (PrintWriter out = response.getWriter()) {
            Scanner sc = new Scanner(request.getReader());
            String jsonData = sc.nextLine(); // payload is a single string
            Gson g = new Gson();
            System.out.println(jsonData);
            LogIn logInToVerify = g.fromJson(jsonData, LogIn.class);
            //get all logins and compare to submitted log in
            List<LogIn> logIns = new ArrayList();
            logIns = EmployeeAccessor.getAllLogIns();
            LogInResponse validationResponse = validateLogIn(logIns, logInToVerify);
            out.println(g.toJson(validationResponse));
        }
    }

    /**
     * Validates a log in attempt and returns a Log in Response.
     * If valid log in, Employee will contain data and errorMessage will be null.
     * If not valid log in, Employee will be null and errorMessage will contain data
     * @param allLogIns
     * @param logInToVerify
     * @return LogInResponse
     */
    private LogInResponse validateLogIn(List<LogIn> allLogIns, LogIn logInToVerify){
        LogInResponse response = null;
        //find if there exists a user with the entered username
        LogIn usernameMatch = null;
        for(LogIn l : allLogIns){
            if(l.getUsername().equals(logInToVerify.getUsername())){
                usernameMatch = l;
            }
        }
        //check if a match was found, return error Message if not
        if(usernameMatch == null){
            String errorMessage = "No user named " + logInToVerify.getUsername() + " exists";
            response = new LogInResponse(null, errorMessage);
            return response;
        }
        //check if passwords match
        String password = usernameMatch.getPassword();
        boolean validPassword = verifyPassword(password, logInToVerify.getPassword());
        if(validPassword){
            String username = logInToVerify.getUsername();
            //get Employee info from accessor
            Employee emp = EmployeeAccessor.getEmployeeInfo(username);
            response = new LogInResponse(emp, null);
        }
        else {
            //return incorrect password message
            String errorMessage = "Password is incorrect";
            response = new LogInResponse(null, errorMessage);
            return response;
        }
        //Check for active employee
        Employee emp = response.getEmployee();
        if(!emp.getActive()){
            String errorMessage = "Employee account is not currently active";
            response = new LogInResponse(null, errorMessage);
            return response;
        }
        //Check for locked account
        if(emp.getLocked()){
            String errorMessage = "Employee account currently locked, please contact admin";
            response = new LogInResponse(null, errorMessage);
            return response;
        }
        //Response has met all checks and log in is valid
        //Make transcation audit record for logging in
        String timestamp = getCurrentTimeStamp();
        TxnAudit transaction = new TxnAudit(timestamp, emp.getSiteID(), emp.getEmployeeID());
        if(!TxnAuditAccessor.insertLogInTransaction(transaction)){
            System.out.println("Error logging the login transaction");
        }
        //Return employee info
        return response;
    }
    
    //Helper function for getting the current time in the MySQL datetime format
    private String getCurrentTimeStamp(){
        java.util.Date dt = new java.util.Date();
        java.text.SimpleDateFormat sdf = 
             new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(dt);
    }
    
    private boolean verifyPassword(String password, String passwordToVerify){
        boolean result = false;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(
                    passwordToVerify.getBytes(StandardCharsets.UTF_8));
                String hashedPassToVerify = bytesToHex(encodedhash);
                result = password.equals(hashedPassToVerify);
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
