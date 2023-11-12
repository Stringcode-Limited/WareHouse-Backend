import express from "express";
import { loggedIn } from "./../middleware/loginAccess.js";
import {
  addProductForSupplier,
  createSupplier,
  allSuppliers,
  getSupplierById,
  getSuppliersStat,
  updateSupplierBasicInfo,
} from "./../controller/supplier.controller.js";

const supplyRoute = express.Router();

supplyRoute.post("/new-supplier", loggedIn, createSupplier);

supplyRoute.get("/all-suppliers", loggedIn, allSuppliers);

supplyRoute.post("/new-product", loggedIn, addProductForSupplier);

supplyRoute.put("/update-supplier-info/:supplierId", loggedIn, updateSupplierBasicInfo);

supplyRoute.get("/getSupplier/:supplierId", loggedIn, getSupplierById);

supplyRoute.get("/suppliers-products/:supplierId", loggedIn, getSuppliersStat);

export default supplyRoute;
