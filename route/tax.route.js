import express from "express";
import { loggedIn } from "../middleware/loginAccess.js";
import {
    getInvoiceStatistics,
  getTotalCategories,
  getTotalCustomers,
  getTotalDeadStockProducts,
  getTotalEmployees,
  getTotalExpired,
  getTotalInactiveEmployees,
  getTotalInvoices,
  getTotalProducts,
  getTotalSuppliers,
  getQuantitiesByMonth
} from "../controller/report.controller.js";
// import { createDiscount, createTax, editDiscount, editTax, getAllDiscounts, getAllTaxes, getDiscountById, getTaxById } from '../controller/tax.controller.js';

const taxRouter = express.Router();
// taxRouter.post('/new-tax', loggedIn, createTax);
// taxRouter.post('/new-discount', loggedIn, createDiscount);
// taxRouter.get('/taxes', loggedIn, getAllTaxes);
// taxRouter.get('/discounts', loggedIn, getAllDiscounts);
// taxRouter.get('/get-tax/:taxId', loggedIn, getTaxById);
// taxRouter.get('/get-discount/:discountId', loggedIn, getDiscountById);
// taxRouter.put('/edit-tax/:taxId', loggedIn, editTax); 
// taxRouter.put('/edit-discount/:discountId', loggedIn, editDiscount);
taxRouter.get("/total-cat", loggedIn, getTotalCategories);
taxRouter.get("/total-items", loggedIn, getTotalProducts);
taxRouter.get("/total-invoice", loggedIn, getTotalInvoices);
taxRouter.get("/total-suppliers", loggedIn, getTotalSuppliers);
taxRouter.get("/total-customer", loggedIn, getTotalCustomers);
taxRouter.get("/total-staff", loggedIn, getTotalEmployees);
taxRouter.get("/total-dead", loggedIn, getTotalDeadStockProducts);
taxRouter.get("/total-exp", loggedIn, getTotalExpired);
taxRouter.get("/total-inactive", loggedIn, getTotalInactiveEmployees);
taxRouter.get("/total-stats", loggedIn, getInvoiceStatistics);
taxRouter.get("/total-month", loggedIn, getQuantitiesByMonth);


export default taxRouter;
