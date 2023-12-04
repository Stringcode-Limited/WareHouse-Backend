import EmployeeMod from "../models/employee.model.js";
import { tokenGen, adminTokenGen } from "../utils/tokenGenerate.js";
import CustomerModel from "../models/customer.model.js";
import AdminModel from "../models/admin.model.js";
import ProductModel from "./../models/product.model.js";
import bcrypt from "bcrypt";
import InvoiceModel from "./../models/invoice.model.js";

export const setSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      throw new Error("Super admin already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminModel({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.status(201).json({ message: "Admin has been created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAdmin = await AdminModel.findOne({ email });
    if (!existingAdmin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }
    const token = adminTokenGen(existingAdmin);
    res.json({
      status: "success",
      message: "Admin logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to log in",
    });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await EmployeeMod.findOne({ email });
    if (!existingUser) {
      return res.json({
        status: "Error",
        message: "User not found",
      });
    }
    if (existingUser.availability === "Inactive") {
      return res.json({
        status: "Error",
        message: "User is inactive. Contact your administrator for assistance.",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.json({
        status: "Error",
        message: "Invalid Credentials",
      });
    }
    const token = tokenGen(existingUser);
    existingUser.lastLogin = Date.now();
    await existingUser.save();
    res.json({
      status: "success",
      token,
      role: existingUser.role,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: "Error",
      message: "Failed to login",
    });
  }
};

export const createEmployee = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { name, phone, email, address, role, password } = req.body;
    const existingUser = await EmployeeMod.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee already exists." });
    }
    let superAdmin;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      superAdmin = await AdminModel.findById(employee.superAdminId);
    } else {
      superAdmin = await AdminModel.findById(userId);
    }
    console.log(superAdmin._id);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new EmployeeMod({
      name,
      phone,
      email,
      address,
      role,
      password: hashedPassword,
      superAdminId: superAdmin._id,
    });
    await newUser.save();
    const admin = await AdminModel.findById(superAdmin._id);
    console.log(admin);
    admin.employees.push(newUser._id);
    await admin.save();
    res.status(201).json({ message: "Employee created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllEmployees = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let employees;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      employees = superAdmin.employees;
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      employees = superAdmin.employees;
    }
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const nonManagerEmployees = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let allEmployees;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      allEmployees = superAdmin.employees;
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      allEmployees = superAdmin.employees;
    }
    const employees = allEmployees.filter(emp => emp.role !== 'Manager');
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getSalesmenEmployees = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let employees;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      employees = superAdmin.employees.filter(employee => employee.role === "Salesman" && employee.availability === "Active");
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("employees");
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
      employees = superAdmin.employees.filter(employee => employee.role === "Salesman" && employee.availability === "Active");
    }
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getEmployeeById = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let employee = null;
    const employeeData = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employeeData) {
      const superAdmin = await AdminModel.findById(
        employeeData.superAdminId
      ).populate("employees");
      if (superAdmin) {
        const employeeId = req.params.employeeId;
        employee = superAdmin.employees.find(
          (emp) => emp._id.toString() === employeeId
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate(
        "employees"
      );
      if (superAdmin) {
        const employeeId = req.params.employeeId;
        employee = superAdmin.employees.find(
          (emp) => emp._id.toString() === employeeId
        );
      }
    }
    if (employee) {
      return res.status(200).json({ employee });
    } else {
      return res.status(404).json({ message: "Employee not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const registerCustomer = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { name, email, phone, address, discount, invoice } = req.body;
    const existingCustomer = await CustomerModel.findOne({ email: email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists." });
    }
    const newCustomer = new CustomerModel({
      name,
      email,
      phone,
      address,
      discount,
      invoice,
    });
    await newCustomer.save();
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        superAdmin.customers.push(newCustomer._id);
        await superAdmin.save();
        return res
          .status(201)
          .json({ message: "New customer has been added successfully." });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        superAdmin.customers.push(newCustomer._id);
        await superAdmin.save();
        return res
          .status(201)
          .json({ message: "New customer has been added successfully." });
      } else {
        return res.status(404).json({ message: "SuperAdmin not found." });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCustomers = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let customers = [];
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        customers = await CustomerModel.find({
          _id: { $in: superAdmin.customers },
        });
      }
    }
    if (customers.length === 0) {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        customers = await CustomerModel.find({
          _id: { $in: superAdmin.customers },
        });
      }
    }
    return res.status(200).json({ customers });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCustomerById = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let customer = null;
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("customers");
      if (superAdmin) {
        const customerId = req.params.customerId;
        customer = superAdmin.customers.find(
          (cust) => cust._id.toString() === customerId
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate(
        "customers"
      );
      if (superAdmin) {
        const customerId = req.params.customerId;
        customer = superAdmin.customers.find(
          (cust) => cust._id.toString() === customerId
        );
      }
    }
    if (customer) {
      return res.status(200).json({ customer });
    } else {
      return res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCustomerInvoice = async (req, res) => {
  const { customerId } = req.params;
  try {
    const customer = await CustomerModel.findById(customerId).populate(
      "invoice"
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }
    const customerInvoices = customer.invoice;
    if (!customerInvoices || customerInvoices.length === 0) {
      return res
        .status(404)
        .json({ message: "No invoices found for this customer." });
    }
    return res.status(200).json({ invoices: customerInvoices });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editCustomer = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const customerId = req.params.customerId;
    const updatedFields = req.body;
    const customer = await CustomerModel.findByIdAndUpdate(
      customerId,
      updatedFields,
      {
        new: true,
      }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }
    return res.status(200).json({
      status: "Success",
      data: customer,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCustomer = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const customerId = req.params.customerId;
  try {
    let superAdmin;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      superAdmin = await AdminModel.findById(employee.superAdminId);
    } else {
      superAdmin = await AdminModel.findById(userId);
    }
    if (!superAdmin) {
      return res.status(404).json({ message: "SuperAdmin not found." });
    }
    const customerIndex = superAdmin.customers.indexOf(customerId);
    if (customerIndex !== -1) {
      superAdmin.customers.splice(customerIndex, 1);
      superAdmin.deletedCustomers.push(customerId);
      await superAdmin.save();
      return res.status(200).json({ message: "Customer deleted successfully." });
    } else {
      return res.status(404).json({ message: "Customer not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const marketerSale = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { employeeName, productName, quantity } = req.body;
    const user = await EmployeeMod.findById(userId).populate("superAdminId");
    const superAdminId = user && user.superAdminId ? user.superAdminId : userId;
    const employee = await EmployeeMod.findOne({
      name: employeeName,
      superAdminId,
    });
    if (!employee) {
      return res
        .status(400)
        .json({ error: `Employee '${employeeName}' not found.` });
    }
    const existingProduct = await ProductModel.findOne({
      name: productName,
      belongsTo: employee.superAdminId,
    });
    if (!existingProduct || existingProduct.quantity < quantity) {
      return res.status(400).json({
        error: `${productName} not available in sufficient quantity.`,
      });
    }
    await existingProduct.save();
    employee.outMarket.push({
      productName,
      quantity,
      unitPrice: existingProduct.price,
      expectedProfit: Number(quantity) * Number(existingProduct.price),
    });
    await employee.save();
    return res
      .status(200)
      .json({ message: "Product added to outMarket successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEmployeeMarketSale = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const employeeId = req.params.employeeId;
  try {
    const employee = await EmployeeMod.findById(employeeId);
    if (!employee) {
      return res
        .status(400)
        .json({ error: `Employee with ID '${employeeId}' not found.` });
    }
    return res.status(200).json({ marketSale: employee.outMarket });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const myMarketSale = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employee = await EmployeeMod.findById(userId);
    if (!employee) {
      return res
        .status(400)
        .json({ error: `Employee with ID '${userId}' not found.` });
    }
    return res.status(200).json({ marketSale: employee.outMarket });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const employeeMarketSaleById = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const targetEmployeeId = req.params.employeeId;
  const marketSaleId = req.params.marketSaleId;
  try {
    const targetEmployee = await EmployeeMod.findById(targetEmployeeId);
    if (!targetEmployee) {
      return res
        .status(400)
        .json({ error: `Employee with ID '${targetEmployeeId}' not found.` });
    }
    const marketSale = targetEmployee.outMarket.id(marketSaleId);
    if (!marketSale) {
      return res
        .status(400)
        .json({
          error: `Market sale with ID '${marketSaleId}' not found for the employee.`,
        });
    }
    return res.status(200).json({ marketSale });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMarketSale = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const employeeId = req.params.employeeId;
  const marketSaleId = req.params.marketSaleId;
  try {
    const user = await EmployeeMod.findById(employeeId).populate("outMarket");
    if (!user) {
      return res.status(400).json({ error: `Employee with ID '${employeeId}' not found.` });
    }
    const marketSale = user.outMarket.id(marketSaleId);
    if (!marketSale) {
      return res.status(400).json({ error: `Market sale with ID '${marketSaleId}' not found for the employee.` });
    }
    const { quantitySold, quantityReturned } = req.body;
    const sumQuantity = Number(quantitySold) + Number(quantityReturned);
    if (sumQuantity > marketSale.quantity) {
      return res.status(400).json({ error: "Inaccurate quantity input." });
    }
    const totalQuantity = Number(marketSale.quantitySold) + Number(quantitySold) +
                          Number(marketSale.quantityReturned) + Number(quantityReturned);
    if (totalQuantity > marketSale.quantity) {
      return res.status(400).json({ error: "Inaccurate quantity input." });
    }

    const totalSoldQuantity = Number(marketSale.quantityReturned) + Number(quantitySold);
    const totalReturnedQuantity = Number(marketSale.quantitySold) + Number(quantityReturned);
    if (totalSoldQuantity > marketSale.quantity || totalReturnedQuantity > marketSale.quantity) {
      return res.status(400).json({ error: "Inaccurate quantity input" });
    }
    marketSale.quantitySold += Number(quantitySold);
    marketSale.amountMade = Number(marketSale.quantitySold) * Number(marketSale.unitPrice);
    marketSale.amountOwed = Number(marketSale.expectedProfit) - Number(marketSale.amountMade);
    if (marketSale.quantity > 0) {
      marketSale.sellPercentage = Math.round((Number(marketSale.quantitySold) / Number(marketSale.quantity)) * 100);
    } else {
      marketSale.sellPercentage = 0;
    }
    marketSale.quantityReturned += Number(quantityReturned);
    marketSale.amountOwed = marketSale.quantity === totalReturnedQuantity ? 0 : Number(marketSale.amountOwed) - Number(quantityReturned * marketSale.unitPrice);
    await user.save();
    return res.status(200).json({ message: "Market sale updated successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMarketSale = async(req,res)=>{
  const userId = req.userAuth;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const employeeId = req.params.employeeId;
  const marketSaleId = req.params.marketSaleId;
  try {
    const user = await EmployeeMod.findById(employeeId).populate("outMarket");
    if (!user) return res.status(400).json({ error: `Employee with ID '${employeeId}' not found.` });
    const marketSale = user.outMarket.id(marketSaleId);
    if (!marketSale) return res.status(400).json({ error: `Market sale with ID '${marketSaleId}' not found for the employee.` });
    user.outMarket.pull(marketSale);
    await user.save();
    return res.status(200).json({ message: "Market sale deleted successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const activateEmployee = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employeeId = req.params.employeeId;
    const employee = await EmployeeMod.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    if (employee.availability === 'Active') {
      return res.status(400).json({
        status: "Error",
        message: "Employee is already active.",
      });
    }
    await EmployeeMod.findByIdAndUpdate(
      employeeId,
      { availability: 'Active' },
      { new: true }
    );
    return res.status(200).json({
      status: "Success",
      message: "Employee has been activated successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deactivateEmployee = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employeeId = req.params.employeeId;
    const employee = await EmployeeMod.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    if (employee.availability === 'Inactive') {
      return res.status(400).json({
        status: "Error",
        message: "Employee is already inactive.",
      });
    }
    await EmployeeMod.findByIdAndUpdate(
      employeeId,
      { availability: 'Inactive' },
      { new: true }
    );
    return res.status(200).json({
      status: "Success",
      message: "Employee has been deactivated successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const editStaff = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employeeId = req.params.employeeId;
    const updatedFields = req.body;
    const employee = await EmployeeMod.findByIdAndUpdate(
      employeeId,
      updatedFields,
      {
        new: true,
      }
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.status(200).json({
      status: "Success",
      data: employee,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteStaff = async (req, res) => {
  const userId = req.userAuth;
  const { employeeId } = req.params;
  try {
    let superadmin;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      superadmin = await AdminModel.findById(employee.superAdminId).populate("employees");
    } else {
      superadmin = await AdminModel.findById(userId).populate("employees");
    }
    if (!superadmin) {
      return res.status(404).json({ message: "SuperAdmin not found." });
    }
    const staffIndex = superadmin.employees.findIndex(
      (emp) => emp._id.toString() === employeeId
    );
    if (staffIndex === -1) {
      return res.status(404).json({ message: "Employee not found." });
    }
    const deletedEmployee = superadmin.employees.splice(staffIndex, 1)[0];
    superadmin.deletedStaffs.push(deletedEmployee);
    await superadmin.save();
    return res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getUserById = async (req, res) => {
  try {
    const userId = req.userAuth;
    let user = await EmployeeMod.findById(userId);
    if (!user) {
      user = await AdminModel.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userAuth;
    const updatedFields = req.body;
    let user = await EmployeeMod.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });
    if (!user) {
      user = await AdminModel.findByIdAndUpdate(userId, updatedFields, {
        new: true,
      });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.userAuth;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    let user = await EmployeeMod.findById(userId);
    if (!user) {
      user = await AdminModel.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid old password." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ status: "Success", message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
