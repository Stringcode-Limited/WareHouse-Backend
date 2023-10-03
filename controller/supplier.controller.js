import SupplierModel from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, contactInformation, suppliedProducts } = req.body;
    if (!contactInformation || !contactInformation.email) {
      return res.status(400).json({ error: 'Invalid contact information' });
    }
    if (!Array.isArray(suppliedProducts)) {
      return res.status(400).json({ error: 'Invalid supplied products data' });
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

export const getSupplierById = async(req,res)=>{
    try {
        const { supplierId } = req.params;
        const supplier = await SupplierModel.findById(supplierId);
        if (!supplier) {
          return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(supplier);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to fetch supplier' });
      }
}
