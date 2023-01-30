/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.EmployeeAccessor;
import DB.PermissionAccessor;
import Entity.CustomHTTPResponse;
import Entity.EditPermission;
import Entity.Employee;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 * @author mattm
 */
@WebServlet(name = "UserService", urlPatterns = {"/UserService/*"})
public class UserService extends HttpServlet {

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
        //determine which action to take based on URI
        String uri = request.getPathInfo();
        try ( PrintWriter out = response.getWriter()) {
            Gson g = new Gson();
            if(uri.equals("/all")) {
                ArrayList<Employee> allEmployees = new ArrayList<Employee>();
                allEmployees = EmployeeAccessor.getAllEmployees();
                out.println(g.toJson(allEmployees));
            } 
            else if(uri.equals("/allUsernames")){
                ArrayList<String> allUsernames = new ArrayList<String>();
                allUsernames = EmployeeAccessor.getAllUsernames();
                out.println(g.toJson(allUsernames));
            }
            else if(uri.equals("/addNewUser")){
                Scanner sc = new Scanner(request.getReader());
                String jsonData = sc.nextLine();
                Employee newUser = g.fromJson(jsonData, Employee.class);
                Boolean success = EmployeeAccessor.addNewUser(newUser);
                CustomHTTPResponse responseMsg = new CustomHTTPResponse(success, "");
                if(success){
                    int newEmpID = EmployeeAccessor.getEmployeeIDByUsername(newUser.getUsername());
                    responseMsg.setMessage("Successfully created new user " + newUser.getUsername() + " with employeeID: " + newEmpID);
                }
                else {
                    responseMsg.setMessage("Error creating new user");
                }
                out.println(g.toJson(responseMsg));
            }
            else if(uri.equals("/permissions")){
                Scanner sc = new Scanner(request.getReader());
                String jsonData = sc.nextLine();
                int empID = Integer.parseInt(jsonData);
                ArrayList<String> permissions = PermissionAccessor.getPermissionList(empID);
                out.println(g.toJson(permissions));
            }
            else if(uri.equals("/permissionsToAdd")){
                Scanner sc = new Scanner(request.getReader());
                String jsonData = sc.nextLine();
                int empID = Integer.parseInt(jsonData);
                ArrayList<String> permissions = PermissionAccessor.getPermissionsToAdd(empID);
                out.println(g.toJson(permissions));
            }
            else if(uri.equals("/removePermission")){
                Scanner sc = new Scanner(request.getReader());
                String jsonData = sc.nextLine();
                EditPermission permission = g.fromJson(jsonData, EditPermission.class);
                boolean success = PermissionAccessor.removePermission(permission);
                out.println(g.toJson(success));
            }
            else if(uri.equals("/addPermission")){
                Scanner sc = new Scanner(request.getReader());
                String jsonData = sc.nextLine();
                EditPermission permission = g.fromJson(jsonData, EditPermission.class);
                boolean success = PermissionAccessor.addPermission(permission);
                out.println(g.toJson(success));
            }
            else{
                out.println("UserService Error: Invalid identifier");
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

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try ( PrintWriter out = response.getWriter()) {
            String uri = request.getPathInfo();
            StringBuilder sb = new StringBuilder(uri);
            sb.deleteCharAt(0);
            int empID = Integer.parseInt(sb.toString());
            boolean success = EmployeeAccessor.deactivateUser(empID);
            Gson g = new Gson();
            if(success == true){
                CustomHTTPResponse result = new CustomHTTPResponse(success, null);
                out.println(g.toJson(result));
            }
            else {
                CustomHTTPResponse result = new CustomHTTPResponse(success, "Error deleting employee #" + sb.toString());
                out.println(g.toJson(result));
            }
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try ( PrintWriter out = response.getWriter()) {
            Scanner sc = new Scanner(request.getReader());
            String jsonData = sc.nextLine();
            Gson g = new Gson();
            Employee empToEdit = g.fromJson(jsonData, Employee.class);
            boolean success;
            if(empToEdit.getPassword() == null){
                success = EmployeeAccessor.updateEmployeeWithoutPassword(empToEdit);
            }
            else {
                success = EmployeeAccessor.updateEmployeeWithPassword(empToEdit);
            }
            if(success == true){
                CustomHTTPResponse result = new CustomHTTPResponse(success, null);
                out.println(g.toJson(result));
            }
            else {
                CustomHTTPResponse result = new CustomHTTPResponse(success, "Error updating info for employee #" + empToEdit.getEmployeeID());
                out.println(g.toJson(result));
            }
        }  
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
