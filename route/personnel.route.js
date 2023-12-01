import express from "express";
import multer from "multer";
import { isAdmin } from "../middleware/admin.js";
import { loggedIn } from "../middleware/loginAccess.js";
import {
  createEmployee,
  updatePassword,
  updateUser,
  registerCustomer,
  getAllEmployees,
  logIn,
  getAllCustomers,
  editCustomer,
  getCustomerById,
  getCustomerInvoice,
  getEmployeeById,
  getSalesmenEmployees,
  editStaff,
  deleteStaff,
  getUserById,
  marketerSale,
  getEmployeeMarketSale,
  employeeMarketSaleById,
  updateMarketSale,   
  deleteCustomer,
  deleteMarketSale,
  activateEmployee,
  deactivateEmployee
} from "../controller/personnel.controller.js";

const personnelRouter = express.Router();

personnelRouter.post("/new-employee", loggedIn, createEmployee);

personnelRouter.post("/login", logIn);

personnelRouter.get("/staff", loggedIn, getAllEmployees);

personnelRouter.get("/get-staff/:employeeId", loggedIn, getEmployeeById);

personnelRouter.get("/salesmen", loggedIn, getSalesmenEmployees);

personnelRouter.post("/new-customer", loggedIn, registerCustomer);

personnelRouter.get("/customers", loggedIn, getAllCustomers);

personnelRouter.put("/edit-customer/:customerId", loggedIn, editCustomer);

personnelRouter.put("/activate/:employeeId", loggedIn, activateEmployee);

personnelRouter.put("/de-activate/:employeeId", loggedIn, deactivateEmployee);

personnelRouter.put("/edit-staff/:employeeId", loggedIn, editStaff);

personnelRouter.delete("/delete-staff/:employeeId", loggedIn, deleteStaff);

personnelRouter.get("/get-customer/:customerId", loggedIn, getCustomerById);

personnelRouter.get("/customer-invoice/:customerId", loggedIn, getCustomerInvoice);

personnelRouter.delete('/delete-customer/:customerId', loggedIn, deleteCustomer);

personnelRouter.post("/issue-marketer-sale", loggedIn, marketerSale);

personnelRouter.get("/marketer-sales/:employeeId", loggedIn, getEmployeeMarketSale);

personnelRouter.get("/employees-market-sale/:employeeId/:marketSaleId", loggedIn, employeeMarketSaleById);

personnelRouter.put("/update-market-sale/:employeeId/:marketSaleId", loggedIn, updateMarketSale);

personnelRouter.delete("/delete-market-sale/:employeeId/:marketSaleId", loggedIn, deleteMarketSale);

personnelRouter.put("/update-password", loggedIn, updatePassword);

personnelRouter.put("/update-profile", loggedIn, updateUser);

personnelRouter.get("/get-user", loggedIn, getUserById);

export default personnelRouter;
