/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.EmployeeAccessor;
import Entity.Employee;
import Entity.LogIn;
import Entity.LogInResponse;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;
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
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            List<LogIn> logIns = new ArrayList();
            logIns = EmployeeAccessor.getAllLogIns();
            LogInResponse validationResponse = validateLogIn(logIns, logInToVerify);
            out.println(g.toJson(validationResponse));
        } catch (NoSuchAlgorithmException ex) {
            System.out.println("Hashing algorithm not found");
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
        if(password.equals(logInToVerify.getPassword())){
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
        //Response has met all checks and log in is valid, return employee info
        return response;
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
