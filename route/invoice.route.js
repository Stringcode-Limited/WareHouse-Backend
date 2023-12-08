import express from 'express';
import { loggedIn } from '../middleware/loginAccess.js';
import { isAdmin } from '../middleware/admin.js';
import { createInvoice, deleteInvoice, getAllInvoices, getInvoiceItems, invoiceTransactionHistory, paidInvoice, unpaidInvoice } from './../controller/invoice.controller.js';
import { getAllSalesReports, getTotalExpensesForYear, getTotalOutstandingInvoicesForYear, getTotalRevenue, getMonthlySummary } from '../controller/report.controller.js';

const invoiceRouter = express.Router();

invoiceRouter.post('/create', loggedIn, createInvoice);

invoiceRouter.get('/all-invoice', loggedIn,  getAllInvoices);

invoiceRouter.get('/invoice-items/:invoiceId', loggedIn, getInvoiceItems);

invoiceRouter.put('/unpaid/:invoiceId', loggedIn, unpaidInvoice); 

invoiceRouter.put('/paid/:invoiceId', loggedIn, paidInvoice);

invoiceRouter.get('/invoice-trans-history/:invoiceId', loggedIn, invoiceTransactionHistory);

invoiceRouter.delete('/delete-invoice/:invoiceId', loggedIn, deleteInvoice);

invoiceRouter.get('/sales-report', loggedIn, getAllSalesReports);

invoiceRouter.get('/tot-rev', loggedIn, getTotalRevenue);

invoiceRouter.get('/tot-exp', loggedIn, getTotalExpensesForYear);

invoiceRouter.get('/out-inv', loggedIn, getTotalOutstandingInvoicesForYear);

invoiceRouter.get('/monthly-summary', loggedIn, getMonthlySummary);

export default invoiceRouter;
