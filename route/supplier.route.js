import express from "express";
import { loggedIn } from "./../middleware/loginAccess.js";
import { isAdmin } from "./../middleware/admin.js";
import {
  addProductForSupplier,
  createSupplier,
  allSuppliers,
  failedToSupply,
  getSupplierById,
  getSuppliersStat,
  productSupplied,
  updateSupplierBasicInfo,
} from "./../controller/supplier.controller.js";

const supplyRoute = express.Router();

supplyRoute.post("/new-supplier", loggedIn, createSupplier);

supplyRoute.get("/all-suppliers", loggedIn, allSuppliers);

supplyRoute.post("/new-product/:supplierName", loggedIn, addProductForSupplier);

supplyRoute.put("/update-supplier-info/:supplierId", loggedIn, updateSupplierBasicInfo);

supplyRoute.get("/getSupplier/:supplierId", loggedIn, getSupplierById);

supplyRoute.put("/supplied/:supplierId/:productId", loggedIn, productSupplied);

supplyRoute.put("/supplyFailed/:supplierId/:productId", loggedIn, failedToSupply);

supplyRoute.get("/suppliers-products/:supplierId", loggedIn, getSuppliersStat);

export default supplyRoute;
