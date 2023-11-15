import AdminModel from "../models/admin.model.js";
import EmployeeMod from "../models/employee.model.js";
import SupplierModel from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { name, contactInformation } = req.body;
    if (!contactInformation || !contactInformation.email) {
      return res.status(400).json({ error: "Invalid contact information" });
    }
    const newSupplier = new SupplierModel({
      name,
      contactInformation,
    });
    await newSupplier.save();
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        superAdmin.suppliers.push(newSupplier._id);
        await superAdmin.save();
        return res.status(201).json({ message: "New supplier has been added successfully." });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        superAdmin.suppliers.push(newSupplier._id);
        await superAdmin.save();
        return res.status(201).json({ message: "New supplier has been added successfully." });
      } else {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const allSuppliers = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let suppliers;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        suppliers = await SupplierModel.find({ _id: { $in: superAdmin.suppliers } });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        suppliers = await SupplierModel.find({ _id: { $in: superAdmin.suppliers } });
      } else {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
    }
    res.status(200).json({ suppliers });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getSupplierById = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
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
    const { supplierName, productName, dateDelivered, quantityDelivered, unitPrice, amountPaid } = req.body;
    const totalFee = unitPrice * quantityDelivered;
    let supplier = await SupplierModel.findOne({ name: supplierName });
    if (!supplier) {
      supplier = new SupplierModel({
        name: supplierName,
        suppliedProducts: [],
      });
    }
    const balance = totalFee - amountPaid;
    supplier.suppliedProducts.push({
      productName,
      dateDelivered,
      quantityDelivered,
      unitPrice,
      totalFee,
      status: "Supplied",
      balance,
      amountPaid,
      suppliedPay: balance === 0 ? "Fully Paid" : "On-Loan",
    });
    await supplier.save();
    res.status(201).json({ message: "Supplied product Recorded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to add supplied product" });
  }
};


export const getSuppliersStat = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { supplierId } = req.params;
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    const suppliedProducts = supplier.suppliedProducts;
    res.status(200).json({ suppliedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch supplied products" });
  }
};


export const updateSupplierBasicInfo = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(404).json({ message: "User not found." });
  }
  try {
    const supplierId = req.params.supplierId;
    const updatedFields = req.body;
    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      supplierId,
      updatedFields,
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.json({
      status: "Success",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const settledSupplier = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { supplierId, productId } = req.params;
    const { amountPaid } = req.body;
    const supplier = await SupplierModel.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    const suppliedProduct = supplier.suppliedProducts.find(
      (product) => product._id == productId
    );
    if (!suppliedProduct) {
      return res.status(404).json({ message: "Supplied product not found" });
    }
    if (suppliedProduct.balance === 0){
      return res.status(404).json({ message: "Supplier has already been paid off" });
    }
    let newBalance = suppliedProduct.balance - amountPaid;
    if (newBalance < 0) {
      return res.status(400).json({ message: "Amount is bigger than balance." });
    }
    suppliedProduct.balance = newBalance;
    suppliedProduct.amountPaid = Number(suppliedProduct.amountPaid) + Number(amountPaid);;
    suppliedProduct.paymentStatus = newBalance === 0 ? "Fully Paid" : "Partially Paid";
    await supplier.save();
    return res.status(200).json({ message: "Supplier settlement updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to settle supplier" });
  }
};
