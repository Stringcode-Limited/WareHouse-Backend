import AdminModel from "../models/admin.model.js";
import EmployeeMod from "../models/employee.model.js";
import SupplierModel from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { name, contactInformation, suppliedProducts } = req.body;
    if (!contactInformation || !contactInformation.email) {
      return res.status(400).json({ error: "Invalid contact information" });
    }
    if (!Array.isArray(suppliedProducts)) {
      return res.status(400).json({ error: "Invalid supplied products data" });
    }
    const newSupplier = new SupplierModel({
      name,
      contactInformation,
      suppliedProducts,
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
    const supplierName = req.params.supplierName;
    const { productName, expectedQuantity, expectedDate, fee } = req.body;
    const supplier = await SupplierModel.findOne({ name: supplierName });
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

export const productSupplied = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { supplierId, productId } = req.params;
    const { quantityDelivered, newExpectedQuantity, newExpectedDate, newFee } =
      req.body;
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
    suppliedProduct.quantityDelivered = quantityDelivered;
    suppliedProduct.status = "Delivered";
    suppliedProduct.dateDelivered = new Date();
    await supplier.save();
    supplier.suppliedProducts.push({
      productName: suppliedProduct.productName,
      expectedQuantity: newExpectedQuantity,
      expectedDate: newExpectedDate,
      dateDelivered: null,
      quantityDelivered: 0,
      fee: newFee,
      status: "Pending",
    });
    await supplier.save();
    res.status(200).json({ message: "Delivered Supply Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update supplied product" });
  }
};

export const failedToSupply = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { supplierId, productId } = req.params;
    const { newExpectedQuantity, newExpectedDate, newFee } = req.body;
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
    suppliedProduct.quantityDelivered = 0;
    suppliedProduct.status = "Canceled";
    suppliedProduct.dateDelivered = null;
    await supplier.save();
    supplier.suppliedProducts.push({
      productName: suppliedProduct.productName,
      expectedQuantity: newExpectedQuantity,
      expectedDate: newExpectedDate,
      dateDelivered: null,
      quantityDelivered: 0,
      fee: newFee,
      status: "Pending",
    });
    await supplier.save();
    res.status(200).json({ message: "Failed Supply Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update supplied product" });
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

export const updateSupplierSuppliedProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(404).json({ message: "User not found." });
  }
  try {
    const supplierId = req.params.supplierId;
    const productId = req.params.productId;
    const updatedFields = req.body;
    const updatedSupplier = await SupplierModel.findOneAndUpdate(
      { _id: supplierId, "suppliedProducts._id": productId },
      {
        $set: {
          "suppliedProducts.$": updatedFields,
        },
      },
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier or Product not found." });
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
