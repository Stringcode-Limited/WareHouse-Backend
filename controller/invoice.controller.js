import InvoiceModel from "../models/invoice.model.js";
import ProductModel from "../models/product.model.js";
import CustomerModel from "../models/customer.model.js";
import AdminModel from "../models/admin.model.js";
import DiscountMod from './../models/discount.model.js';
import TaxModel from './../models/tax.model.js';
import EmployeeMod from "../models/employee.model.js";
import { createSalesReport } from './report.controller.js';

export const createInvoice = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const {
      products,
      customer,
      issuedDate,
      invoiceType,
      dueDate
    } = req.body;
    const existingCustomer = await CustomerModel.findOne({ name: customer });
    let total = 0;
    for (const product of products) {
      const { productName, quantity } = product;
      const existingProduct = await ProductModel.findOne({ name: productName });
      if (!existingProduct || existingProduct.quantity < quantity) {
        return res.status(400).json({ error: 'Product not available in sufficient quantity.' });
      }
      total += existingProduct.price * quantity;
    }
    let issuedBy = "SuperAdmin";
    if (userId) {
      const issuingEmployee = await EmployeeMod.findById(userId);
      if (issuingEmployee) {
        issuedBy = issuingEmployee.name;
      }
    }
    const newInvoice = new InvoiceModel({
      products,
      status: "Pending",
      issuedDate,
      dueDate,
      customer,
      invoiceType,
      issuedBy,
      total: calculatedTotal,
    });
    await newInvoice.save();
    existingCustomer.invoice.push(newInvoice._id);
    await existingCustomer.save();
    return res.status(201).json({ message: 'Invoice created successfully.' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



export const getAllInvoices = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let invoices = [];
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdminId = employee.superAdminId;
      const superAdmin = await AdminModel.findById(superAdminId).populate({
        path: 'customers',
        populate: { path: 'invoice' }
      });
      if (superAdmin) {
        for (const customer of superAdmin.customers) {
          const customerInvoices = customer.invoice;
          invoices.push(...customerInvoices);
        }
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate({
        path: 'customers',
        populate: { path: 'invoice' }
      });
      if (superAdmin) {
        for (const customer of superAdmin.customers) {
          const customerInvoices = customer.invoice;
          invoices.push(...customerInvoices);
        }
      }
    }
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching all customer invoices:', error);
    res.status(500).json({ error: 'Unable to fetch customer invoices' });
  }
};


export const getInvoiceItems = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { invoiceId } = req.params;
  try {
    const invoice = await InvoiceModel.findById(invoiceId).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const productsInInvoice = [];
    for (const product of invoice.products) {
      const foundProduct = await ProductModel.findOne({ name: product.productName }).lean();
      if (!foundProduct) {
        return res.status(404).json({ error: `Product with name ${product.productName} not found` });
      }
      const totalPrice = foundProduct.price * product.quantity;
      productsInInvoice.push({
        productName: product.productName,
        quantity: product.quantity,
        price: foundProduct.price,
        totalPrice: totalPrice,
      });
    }
    res.json(productsInInvoice);
  } catch (error) {
    console.error('Error retrieving products for invoice:', error);
    res.status(500).json({
      error: 'Unable to retrieve products for the invoice',
    });
  }
};



export const unpaidInvoice = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }
    if (invoice.status === "Unpaid") {
      return res.status(201).json({ message: "Invoice is already unpaid." });
    }
    const unpaidInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { status: "Unpaid" },
      { new: true }
    );
    res.status(200).json({
      data: unpaidInvoice,
      message: "Invoice canceled.",
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to cancel Invoice" });
  }
};


export const paidInvoice = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }
    if (invoice.status === "Paid") {
      return res.status(201).json({ message: "Invoice is already settled." });
    }
    await createSalesReport(invoiceId,user,res);
    const unpaidInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      { status: "Paid" },
      { new: true }
      );
    res.status(200).json({
      data: unpaidInvoice,
      message: "Invoice Settled.",
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to cancel Invoice" });
  }
};

export const generateSalesReport = async (req, res) => {
  try {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const today = new Date().toISOString().split("T")[0];
    const invoices = await InvoiceModel.find({
      status: 'Paid',
      dueDate: today,
    }).populate('products.productName');

    const salesReport = [];
    const productMap = new Map();
    for (const invoice of invoices) {
      for (const product of invoice.products) {
        const productId = product.productName._id;
        const productName = product.productName.name;
        const quantity = product.quantity;
        const price = product.productName.price;
        const totalAmount = quantity * price;
        if (productMap.has(productId)) {
          const existingProduct = productMap.get(productId);
          existingProduct.quantity += quantity;
          existingProduct.totalAmount += totalAmount;
        } else {
          productMap.set(productId, {
            productName,
            quantity,
            price,
            totalAmount,
          });
        }
      }
    }
    salesReport.push(...productMap.values());
    res.status(200).json(salesReport);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Unable to generate sales report' });
  }
};

