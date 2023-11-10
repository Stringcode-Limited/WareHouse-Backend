import express from 'express';
import multer from 'multer';
import { isAdmin } from '../middleware/admin.js';
import { loggedIn } from '../middleware/loginAccess.js';
import { createEmployee, updatePassword, updateUser, registerCustomer, getAllEmployees, logIn, getAllCustomers, editCustomer, createCreditCase, getCustomerCredit, settleCreditCase, getCustomerById, getCustomerInvoice, getEmployeeById, editStaff, deleteStaff } from '../controller/personnel.controller.js';
import { profilePictureStorage }  from '../config/cloudinary.js';

const personnelRouter = express.Router();
const profilePictureUpload = multer({ storage: profilePictureStorage });

personnelRouter.post('/new-employee', loggedIn, createEmployee);

personnelRouter.post('/login', logIn);

personnelRouter.get('/staff', loggedIn, getAllEmployees);

personnelRouter.get('/get-staff/:employeeId', loggedIn, getEmployeeById);

personnelRouter.post('/new-customer', loggedIn, registerCustomer);

personnelRouter.get('/customers', loggedIn, getAllCustomers);

personnelRouter.put('/edit-customer/:customerId', loggedIn, editCustomer);

personnelRouter.put('/edit-staff/:employeeId', loggedIn, editStaff);

personnelRouter.delete('/delete-staff/:employeeId', loggedIn, deleteStaff);

personnelRouter.get('/get-customer/:customerId', loggedIn, getCustomerById);

personnelRouter.get('/customer-invoice/:customerId', loggedIn, getCustomerInvoice);

personnelRouter.post('/create-credit-case/:customerId', loggedIn, createCreditCase);

personnelRouter.get('/customers-credit/:customerId', loggedIn, getCustomerCredit);

personnelRouter.put('/settle-credit/:creditCaseId', loggedIn, settleCreditCase);

personnelRouter.put('/update-password', isAdmin, loggedIn, updatePassword);

personnelRouter.put('/update-profile', isAdmin, loggedIn, updateUser);


export default personnelRouter;
