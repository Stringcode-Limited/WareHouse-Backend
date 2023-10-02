import SupplierModel from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, contactInformation, suppliedProducts } = req.body;
    const existingSupplier = await SupplierModel.findOne({
      "contactInformation.email": contactInformation.email,
      "suppliedProducts.productName": suppliedProducts[0].productName,
    });
    if (existingSupplier) {
      return res.status(409).json({ error: "Supplier already exists" });
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
