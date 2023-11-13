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
  const loggedInAdminId = req.userAuth;
  if (!loggedInAdminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { name, phone, email, address, role, password } = req.body;
    const existingUser = await EmployeeMod.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee already exists." });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new EmployeeMod({
      name,
      phone,
      email,
      address,
      role,
      password: hashedPassword,
      superAdminId: loggedInAdminId,
    });
    await newUser.save();
    const admin = await AdminModel.findById(loggedInAdminId);
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
    const employees = await EmployeeMod.find({ superAdminId: userId });
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
  const adminId = req.userAuth;
  const { employeeId } = req.params;
  try {
    const admin = await AdminModel.findById(adminId).populate("employees");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    const staffIndex = admin.employees.findIndex(
      (emp) => emp._id.toString() === employeeId
    );
    if (staffIndex === -1) {
      return res.status(404).json({ message: "Staff not found." });
    }
    admin.employees.splice(staffIndex, 1);
    await admin.save();
    const employee = await EmployeeMod.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    await EmployeeMod.findByIdAndDelete(employeeId);
    return res.status(200).json({ message: "Staff deleted successfully." });
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
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      status: 'Success',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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