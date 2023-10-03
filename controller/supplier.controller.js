import SupplierModel from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (!req.userAuth) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, contactInformation, suppliedProducts } = req.body;
    if (!contactInformation || !contactInformation.email) {
      return res.status(400).json({ error: "Invalid contact information" });
    }
    if (!Array.isArray(suppliedProducts)) {
      return res.status(400).json({ error: "Invalid supplied products data" });
    }
    const supplier = new SupplierModel({
      name,
      contactInformation,
      suppliedProducts,
    });
    await supplier.save();
    res.status(201).json({ message: "Supplier created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create supplier" });
  }
};

export const getSupplierById = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (!req.userAuth) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { supplierId } = req.params;
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch supplier" });
  }
};

export const addProductForSupplier = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const supplierId = req.params.supplierId;
    const { productName, expectedQuantity, expectedDate, fee } = req.body;
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    supplier.suppliedProducts.push({
      productName,
      expectedQuantity,
      expectedDate,
      dateDelivered: null,
      quantityDelivered: 0,
      fee,
      status: "Pending",
    });
    await supplier.save();
    res.status(201).json({ message: "Supplied product added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to add supplied product" });
  }
};
