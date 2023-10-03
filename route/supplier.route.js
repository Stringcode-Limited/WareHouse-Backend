import express from "express";
import { loggedIn } from './../middleware/loginAccess.js';
import { isAdmin } from './../middleware/admin.js';
import { addProductForSupplier, createSupplier, failedToSupply, getSupplierById, productSupplied } from './../controller/supplier.controller.js';

const supplyRoute = express.Router();

supplyRoute.post('/new-supplier', loggedIn, isAdmin, createSupplier);

supplyRoute.post('/new-product/:supplierId', loggedIn, isAdmin, addProductForSupplier);

supplyRoute.get('/getSupplier/:supplierId', loggedIn, isAdmin, getSupplierById);

supplyRoute.put('/supplied/:supplierId/:productId', loggedIn, isAdmin, productSupplied);

supplyRoute.put('/supplyFailed/:supplierId/:productId', loggedIn, isAdmin, failedToSupply);

export default supplyRoute;