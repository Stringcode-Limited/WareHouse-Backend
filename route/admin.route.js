import express  from "express";
import { adminLogin, setSuperAdmin } from "../controller/personnel.controller.js";
import { loggedIn } from './../middleware/loginAccess.js';
import { getAllDeletedCategories, getAllDeletedCustomers, getAllDeletedEmployees, getAllDeletedInvoices, getAllDeletedSuppliers } from './../controller/report.controller.js';

const adminRouter = express.Router();

adminRouter.post('/Initialize-SuperAdmin', setSuperAdmin);

adminRouter.post('/admin-log-in', adminLogin);

adminRouter.get('/del-staff', loggedIn, getAllDeletedEmployees);

adminRouter.get('/del-customers', loggedIn, getAllDeletedCustomers);

adminRouter.get('/del-invoice', loggedIn, getAllDeletedInvoices);

adminRouter.get('/del-categories', loggedIn, getAllDeletedCategories);

adminRouter.get('/del-supplier', loggedIn, getAllDeletedSuppliers);

export default adminRouter;