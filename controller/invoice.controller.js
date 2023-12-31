import InvoiceModel from "../models/invoice.model.js";
import ProductModel from "../models/product.model.js";
import CustomerModel from "../models/customer.model.js";
import AdminModel from "../models/admin.model.js";
import DiscountMod from './../models/discount.model.js';
import TaxModel from './../models/tax.model.js';
import EmployeeMod from "../models/employee.model.js";
import { createSalesReport } from './report.controller.js';
import {sendSoldEmail} from './../config/email.js';

export const createInvoice = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let superAdminId;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId;
    } else {
      superAdminId = userId; 
    }
    const superAdmin = await AdminModel.findById(superAdminId);
    const superAdminEmail = superAdmin.email;
    const {
      products,
      customer,
      issuedDate,
      dueDate,
      paymentMethod, 
      amountPaid,
      datePaid,
    } = req.body;
    let total = 0;
    for (const product of products) {
      const { productName, quantity } = product;
      const existingProduct = await ProductModel.findOne({
        name: productName,
        belongsTo: superAdminId,
      });
      if (!existingProduct || existingProduct.quantity < quantity) {
        return res.status(400).json({ error: `${productName} not available in sufficient quantity.` });
      }
      existingProduct.quantity -= quantity;
      await existingProduct.save();
      total += Number(existingProduct.price) * Number(quantity);
    }
    if (amountPaid < 0) {
      return res.status(400).json({ error: 'Amount paid must be a positive number.' });
    }
    if (amountPaid > total) {
      return res.status(400).json({ error: 'Initial payment greater than total.' });
    }
    const balance = total - amountPaid;
    let status = 'Pending';
    if (balance < total) {
      status = 'Partially Paid';
    }
    const newInvoice = new InvoiceModel({
      products,
      status,
      issuedDate,
      dueDate,
      customer,
      total,
      amountPaid,
      balance,
    });
    const transactionEntry = {
      amountPaid: Number(amountPaid),
      datePaid,
      newBalance: Number(balance),
      paymentMethod
    };
    if (amountPaid > 0) {
      newInvoice.transactionHistory.push(transactionEntry);
    }
    const invoiceId = newInvoice._id;
    await newInvoice.save();
    await createSalesReport(invoiceId, amountPaid, superAdminId, userId, res);
    await sendSoldEmail(products, total, superAdminEmail);
    superAdmin.invoices.push(invoiceId);
    await superAdmin.save();
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
    if (employee && employee.superAdminId) {
      const superAdminId = employee.superAdminId;
      const superAdmin = await AdminModel.findById(superAdminId).populate('invoices');
      if (superAdmin) {
        invoices = superAdmin.invoices || [];
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('invoices');
      if (superAdmin) {
        invoices = superAdmin.invoices || [];
      } else {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
    }
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const getInvoiceItems = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  let superAdminId;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId;
    } else {
      superAdminId = userId;
    }
  const { invoiceId } = req.params;
  try {
    const invoice = await InvoiceModel.findById(invoiceId).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const productsInInvoice = [];
    for (const product of invoice.products) {
      const foundProduct = await ProductModel.findOne({ 
        name: product.productName, 
      }).lean();
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

export const invoiceTransactionHistory = async(req,res)=>{
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      console.error('Error: Invoice not found.');
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    return res.status(200).json({
      data: invoice.transactionHistory,
    });
  } catch (error) {
    console.error('Error in getInvoiceHistory:', error);
    res.status(500).json({ error: 'Unable to retrieve invoice transaction history.' });
  }
}


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
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      console.error('Error: Invoice not found.');
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    if (invoice.status === 'Paid' || invoice.balance === 0) {
      return res.status(400).json({ message: 'Invoice is already paid off.' });
    }
    const { amountPaid, paymentMethod, datePaid } = req.body;
    if (amountPaid <= 0) {
      return res.status(400).json({ error: 'Amount paid must be a positive number.' });
    }
    if (amountPaid > invoice.balance) {
      return res.status(400).json({ error: 'Amount paid is greater than the balance.' });
    }
    const newBalance = invoice.balance - amountPaid;
    const newAmountPaid = Number(invoice.amountPaid) + Number(amountPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';
    const settledInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        status: newStatus,
        amountPaid: newAmountPaid,
        balance: newBalance,
      },
      { new: true }
    );
    const transactionEntry = {
      amountPaid: Number(amountPaid),
      datePaid,
      newBalance: Number(newBalance),
      paymentMethod: paymentMethod,
    };
    let superAdminId;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId._id;
    } else {
      superAdminId = userId;
    }
    settledInvoice.transactionHistory.push(transactionEntry);
    await createSalesReport(invoiceId, amountPaid, superAdminId, userId, res);
    await settledInvoice.save();
    res.status(200).json({
      data: settledInvoice,
      message: 'Invoice settled successfully.',
    });
   }catch (error) {
    console.error('Error in settleInvoice:', error);
    res.status(500).json({ error: 'Unable to settle the invoice.' });
  }
};


export const deleteInvoice = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    let superAdminId;
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId;
    } else {
      superAdminId = userId;
    }
    const superAdmin = await AdminModel.findById(superAdminId);
    if (!superAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const { invoiceId } = req.params;
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoiceIndex = superAdmin.invoices.indexOf(invoiceId);
    if (invoiceIndex !== -1) {
      superAdmin.invoices.splice(invoiceIndex, 1);
      superAdmin.deletedInvoices.push(invoiceId);
      await superAdmin.save();
      return res.status(200).json({ message: 'Invoice deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Invoice not found in SuperAdmin\'s invoices' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
