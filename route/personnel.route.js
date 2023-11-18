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
  editStaff,
  deleteStaff,
  getUserById,
  marketerSale,
  getEmployeeMarketSale
} from "../controller/personnel.controller.js";

const personnelRouter = express.Router();

personnelRouter.post("/new-employee", loggedIn, createEmployee);

personnelRouter.post("/login", logIn);

personnelRouter.get("/staff", loggedIn, getAllEmployees);

personnelRouter.get("/get-staff/:employeeId", loggedIn, getEmployeeById);

personnelRouter.post("/new-customer", loggedIn, registerCustomer);

personnelRouter.get("/customers", loggedIn, getAllCustomers);

personnelRouter.put("/edit-customer/:customerId", loggedIn, editCustomer);

personnelRouter.put("/edit-staff/:employeeId", loggedIn, editStaff);

personnelRouter.delete("/delete-staff/:employeeId", loggedIn, deleteStaff);

personnelRouter.get("/get-customer/:customerId", loggedIn, getCustomerById);

personnelRouter.get(
  "/customer-invoice/:customerId",
  loggedIn,
  getCustomerInvoice
);

personnelRouter.post("/marketer-sales", loggedIn, marketerSale);

personnelRouter.get("/marketer-sales/:employeeId", loggedIn, getEmployeeMarketSale);

personnelRouter.put("/update-password", loggedIn, updatePassword);

personnelRouter.put("/update-profile", loggedIn, updateUser);

personnelRouter.get("/get-user", loggedIn, getUserById);

export default personnelRouter;
