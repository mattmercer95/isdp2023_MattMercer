/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Controller;

import DB.DeliveryAccessor;
import DB.InventoryAccessor;
import DB.SiteAccessor;
import DB.TransactionAccessor;
import Entity.Item;
import Entity.OnlineOrderID;
import Entity.ReturnsDamageLossReport;
import Entity.Transaction;
import Entity.TransactionItem;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Calendar;
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
            else if(uri.equals("/isSupplierOrderOpen")){
                boolean isSupplierOrderOpen = TransactionAccessor.isOrderOpen(1);
                out.println(g.toJson(isSupplierOrderOpen));
            }
            else if(uri.equals("/isEmergencyOrderOpen")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                boolean isOrderOpen = TransactionAccessor.isEmergencyOrderOpen(siteID);
                out.println(g.toJson(isOrderOpen));
            }
            else if(uri.equals("/newSupplierOrder")){
                int orderID = TransactionAccessor.createNewSupplierOrder(1, false);
                out.println(g.toJson(orderID));
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
            else if(uri.equals("/backOrder")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                Transaction result = TransactionAccessor.getCurrentBackOrder(siteID);
                result.setItems(TransactionAccessor.getTransactionItems(result.getTransactionID()));
                result.calculateStats();
                out.println(g.toJson(result));
            }
            else if(uri.equals("/newBackOrder")){
                Scanner sc = new Scanner(request.getReader());
                int siteID = Integer.parseInt(sc.nextLine());
                Transaction result = TransactionAccessor.createNewBackOrder(siteID);
                result.setItems(TransactionAccessor.getTransactionItems(result.getTransactionID()));
                result.calculateStats();
                out.println(g.toJson(result));
            }
            else if(uri.equals("/getItems")){
                Scanner sc = new Scanner(request.getReader());
                int transactionID = Integer.parseInt(sc.nextLine());
                ArrayList<TransactionItem> items = TransactionAccessor.getTransactionItems(transactionID);
                out.println(g.toJson(items));
            }
            else if(uri.equals("/getItemsBySupplier")){
                Scanner sc = new Scanner(request.getReader());
                String csv = sc.nextLine();
                String[] pieces = csv.split(",");
                int supplierID = Integer.parseInt(pieces[0]);
                int transactionID = Integer.parseInt(pieces[1]);
                ArrayList<TransactionItem> items = TransactionAccessor.getTransactionItemsBySupplier(supplierID, transactionID);
                out.println(g.toJson(items));
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
            else if(uri.equals("/returnLoss")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                int submitted = TransactionAccessor.returnLoss(t);
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/newOnlineOrder")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setCreatedDate(getCurrentTimeStamp());
                t.setShipDate(getNextDayTimeStamp());
                int transactionID = TransactionAccessor.newOnlineOrder(t);
                out.println(g.toJson(transactionID));
            }
            else if(uri.equals("/fulfill")){
                System.out.println("here");
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("READY");
                boolean submitted = TransactionAccessor.updateTransaction(t);
                //create a delivery record for this transaction
                if(t.isEmergencyDelivery()){
                    DeliveryAccessor.openEmergencyDelivery(t);
                }
                else {
                    DeliveryAccessor.openDelivery(t);
                }
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/fulfillOnline")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("READY");
                boolean submitted = TransactionAccessor.updateTransaction(t);
                //create a delivery record for this transaction
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/complete")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("CLOSED");
                boolean submitted = TransactionAccessor.completeTransaction(t);
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/cancelOrder")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("CANCELLED");
                boolean submitted = TransactionAccessor.cancelTransaction(t);
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/completeOnlineOrder")){
                Scanner sc = new Scanner(request.getReader());
                Transaction t = g.fromJson(sc.nextLine(), Transaction.class);
                t.setStatus("CLOSED");
                boolean submitted = TransactionAccessor.completeOnlineTransaction(t);
                out.println(g.toJson(submitted));
            }
            else if(uri.equals("/orderStatusList")){
                ArrayList<String> orderStatusList = TransactionAccessor.getOrderStatusList();
                out.println(g.toJson(orderStatusList));
            }
            else if(uri.equals("/onlineOrderIDs")){
                ArrayList<OnlineOrderID> onlineOrderIDs = TransactionAccessor.getOnlineOrderIDs();
                out.println(g.toJson(onlineOrderIDs));
            }
            else if(uri.equals("/storeOrderReport")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                int siteID = Integer.parseInt(pieces[2]);
                ArrayList<Transaction> transactions;
                if(siteID == 0){
                    transactions = TransactionAccessor.getAllTransactionsInRange(startDate, endDate);
                }
                else {
                    transactions = TransactionAccessor.getTransactionsInRangeBySiteID(startDate, endDate, siteID);
                }
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/regularOrders")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                int siteID = Integer.parseInt(pieces[2]);
                ArrayList<Transaction> transactions;
                if(siteID == 0){
                    transactions = TransactionAccessor.getAllRegularOrdersInRange(startDate, endDate);
                }
                else {
                    transactions = TransactionAccessor.getRegularOrdersInRangeBySiteID(startDate, endDate, siteID);
                }
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/emergencyOrders")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                int siteID = Integer.parseInt(pieces[2]);
                ArrayList<Transaction> transactions;
                if(siteID == 0){
                    transactions = TransactionAccessor.getAllEmergencyOrdersInRange(startDate, endDate);
                }
                else {
                    transactions = TransactionAccessor.getEmergencyOrdersInRangeBySiteID(startDate, endDate, siteID);
                }
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/backorders")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                int siteID = Integer.parseInt(pieces[2]);
                ArrayList<Transaction> transactions;
                if(siteID == 0){
                    transactions = TransactionAccessor.getAllBackordersInRange(startDate, endDate);
                }
                else {
                    transactions = TransactionAccessor.getBackordersInRangeBySiteID(startDate, endDate, siteID);
                }
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/supplierOrders")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                ArrayList<Transaction> transactions;
                transactions = TransactionAccessor.getAllSupplierOrdersInRange(startDate, endDate);
                out.println(g.toJson(transactions));
            }
            else if(uri.equals("/returnsDamageLoss")){
                Scanner sc = new Scanner(request.getReader());
                String dates = sc.nextLine();
                String[] pieces = dates.split(":");
                String startDate = pieces[0];
                String endDate = pieces[1];
                int siteID = Integer.parseInt(pieces[2]);
                ArrayList<Transaction> transactions;
                if(siteID == 0){
                    //get all
                    transactions = TransactionAccessor.getReturnsDamageLossInRange(startDate, endDate);
                }
                else {
                    transactions = TransactionAccessor.getReturnsDamageLossInRangeBySite(startDate, endDate, siteID);
                }
                ArrayList<Transaction> returns = new ArrayList<Transaction>();
                ArrayList<Transaction> damage = new ArrayList<Transaction>();
                ArrayList<Transaction> loss = new ArrayList<Transaction>();
                for(Transaction t : transactions){
                    String type = t.getTransactionType();
                    switch(type){
                        case "Return":
                            returns.add(t);
                            break;
                        case "Damage":
                            damage.add(t);
                            break;
                        case "Loss":
                            loss.add(t);
                            break;
                        default:
                            break;
                    }
                }
                ReturnsDamageLossReport report = new ReturnsDamageLossReport(returns, damage, loss);
                out.println(g.toJson(report));
            }
            else {
                ArrayList<Transaction> transactions = TransactionAccessor.getAllTransactions();
                //get zero item orders and add to list
                transactions.addAll(TransactionAccessor.getZeroItemTransactions());
                out.println(g.toJson(transactions));
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
    private String getNextDayTimeStamp(){
        java.util.Date dt = new java.util.Date();
        Calendar c = Calendar.getInstance();
        c.setTime(dt);
        c.add(Calendar.DATE, 1);
        java.util.Date result = c.getTime();
        java.text.SimpleDateFormat sdf = 
             new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(result);
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
