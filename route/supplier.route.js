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

supplyRoute.post("/new-supplier", loggedIn, isAdmin, createSupplier);

supplyRoute.get("/all-suppliers", loggedIn, isAdmin, allSuppliers);

supplyRoute.post(
  "/new-product/:supplierName",
  loggedIn,
  isAdmin,
  addProductForSupplier
);

supplyRoute.put(
  "/update-supplier-info/:supplierId",
  loggedIn,
  isAdmin,
  updateSupplierBasicInfo
);

supplyRoute.get("/getSupplier/:supplierId", loggedIn, isAdmin, getSupplierById);

supplyRoute.put(
  "/supplied/:supplierId/:productId",
  loggedIn,
  isAdmin,
  productSupplied
);

supplyRoute.put(
  "/supplyFailed/:supplierId/:productId",
  loggedIn,
  isAdmin,
  failedToSupply
);

supplyRoute.get(
  "/suppliers-products/:supplierId",
  loggedIn,
  isAdmin,
  getSuppliersStat
);

export default supplyRoute;
