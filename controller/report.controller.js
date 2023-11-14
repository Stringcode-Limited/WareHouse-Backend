import InvoiceModel from './../models/invoice.model.js';
import Sales from './../models/report.model.js';
import ProductModel from './../models/product.model.js';
import EmployeeMod from '../models/employee.model.js';
import AdminModel from '../models/admin.model.js';

export const createSalesReport = async (invoiceId, userId, res) => {
  try {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }
    const { products, total, dueDate } = invoice;
    const salesReports = [];
    const employee = await EmployeeMod.findById(userId).populate("superAdminId");
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        for (const product of products) {
          const { productName, quantity } = product;
          const productDetails = await ProductModel.findOne({ name: productName });
          if (!productDetails) {
            throw new Error(`Product details not found for ${productName}.`);
          }
          const { price } = productDetails;

          const existingReport = await Sales.findOne({
            product: productName,
            date: new Date(Date.now()),
          });

          if (existingReport) {
            existingReport.quantity += quantity;
            existingReport.total += total;
            await existingReport.save();
            salesReports.push(existingReport);
          } else {
            const newReport = new Sales({
              date: new Date(Date.now()),
              product: productName,
              quantity,
              unitPrice: price,
              total,
              invoice: invoiceId,
            });
            await newReport.save();
            salesReports.push(newReport);
          }
        }
        superAdmin.sales.push(...salesReports.map(report => report._id));
        await superAdmin.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
};
  

  export const getAllSalesReports = async (req, res) => {
    try {
      const userId = req.userAuth;
      const employee = await EmployeeMod.findById(userId).populate("superAdminId");
      let salesReports;
  
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId);
        if (superAdmin) {
          salesReports = await Sales.find({ _id: { $in: superAdmin.sales } });
        }
      } else {
        const superAdmin = await AdminModel.findById(userId);
        if (superAdmin) {
          salesReports = await Sales.find({ _id: { $in: superAdmin.sales } });
        }
      }
  
      res.status(200).json({
        data: salesReports,
        message: "Sales reports retrieved successfully.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to retrieve sales reports." });
    }
  };
  