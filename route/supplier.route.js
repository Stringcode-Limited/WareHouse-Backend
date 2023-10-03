import express from "express";
import { loggedIn } from './../middleware/loginAccess.js';
import { isAdmin } from './../middleware/admin.js';
import { createSupplier, getSupplierById } from './../controller/supplier.controller.js';

const supplyRoute = express.Router();

supplyRoute.post('/new-supplier', loggedIn, isAdmin, createSupplier);

supplyRoute.get('/getSupplier/:supplierId', loggedIn, isAdmin, getSupplierById);

export default supplyRoute;