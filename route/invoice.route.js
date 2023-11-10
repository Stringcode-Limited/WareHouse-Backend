import express from 'express';
import { loggedIn } from '../middleware/loginAccess.js';
import { isAdmin } from '../middleware/admin.js';
import { createInvoice, getAllInvoices, getInvoiceItems, paidInvoice, unpaidInvoice } from './../controller/invoice.controller.js';

const invoiceRouter = express.Router();

invoiceRouter.post('/create', loggedIn, createInvoice);

invoiceRouter.get('/all-invoice', loggedIn,  getAllInvoices);

invoiceRouter.get('/invoice-items/:invoiceId', loggedIn, getInvoiceItems);

invoiceRouter.put('/unpaid/:invoiceId', loggedIn, unpaidInvoice); 

invoiceRouter.put('/paid/:invoiceId', loggedIn, paidInvoice);

// shipmentRouter.get('/latest-shipments', loggedIn, isAdmin, shipmentInLastWeek);

// shipmentRouter.get('/total-amount', loggedIn, isAdmin, totalAmountForToday);

// shipmentRouter.get('/total-for-period', loggedIn, isAdmin, shipmentsForLast30Days);

// shipmentRouter.get('/total-by-month', loggedIn, isAdmin, totalShipmentsByMonth);

// shipmentRouter.get('/average-per-month', loggedIn, isAdmin, AverageShipmentsPerMonth);

// shipmentRouter.get('/total-for-current-day', loggedIn, isAdmin, TotalShipmentsForCurrentDay);

export default invoiceRouter;
