import express from "express";
import { loggedIn } from "./../middleware/loginAccess.js";
import {
  addProductForSupplier,
  createSupplier,
  allSuppliers,
  getSupplierById,
  getSuppliersStat,
  settledSupplier,
  updateSupplierBasicInfo,
  deleteSupplier,
  transactionHistory,
} from "./../controller/supplier.controller.js";

const supplyRoute = express.Router();

supplyRoute.post("/new-supplier", loggedIn, createSupplier);

supplyRoute.get("/all-suppliers", loggedIn, allSuppliers);

supplyRoute.post("/new-product", loggedIn, addProductForSupplier);

supplyRoute.put("/update-supplier-info/:supplierId", loggedIn, updateSupplierBasicInfo);

supplyRoute.get("/getSupplier/:supplierId", loggedIn, getSupplierById);

supplyRoute.get("/suppliers-products/:supplierId", loggedIn, getSuppliersStat);

supplyRoute.put("/settle-supply/:supplierId/:productId", loggedIn, settledSupplier);

supplyRoute.get("/transaction-history/:supplierId/:productId", loggedIn, transactionHistory);

supplyRoute.delete("/delete-supplier/:supplierId", loggedIn, deleteSupplier);

export default supplyRoute;
