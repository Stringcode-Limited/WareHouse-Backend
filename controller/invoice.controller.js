import InvoiceModel from "../models/invoice.model.js";
import ProductModel from "../models/product.model.js";
import CustomerModel from "../models/customer.model.js";
import AdminModel from "../models/admin.model.js";
import DiscountMod from './../models/discount.model.js';
import TaxModel from './../models/tax.model.js';
import EmployeeMod from "../models/employee.model.js";

export const createInvoice = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const {
      products,
      customer,
      discountName,
      taxName,
      issuedDate,
      dueDate
    } = req.body;
    const existingCustomer = await CustomerModel.findOne({ name: customer });
    if (!existingCustomer) {
      return res.status(400).json({ error: 'Customer not found.' });
    }
    let total = 0;
    for (const product of products) {
      const { productName, quantity } = product;
      const existingProduct = await ProductModel.findOne({ name: productName });
      if (!existingProduct || existingProduct.quantity < quantity) {
        return res.status(400).json({ error: 'Product not available in sufficient quantity.' });
      }
      total += existingProduct.price * quantity;
    }
    const tax = await TaxModel.findOne({ name: taxName });
    const discount = await DiscountMod.findOne({ name: discountName });
    let calculatedTotal = total;
    if (tax) {
      calculatedTotal += total * (tax.rate / 100);
    }
    if (discount) {
      calculatedTotal -= total * (discount.value / 100);
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
      discount: discount ? discount.value : 0,
      tax: tax ? tax.rate : 0,
      issuedBy,
      total: calculatedTotal,
      isProductOnLoan: false
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
      return res.status(200).json({ message: "Invoice is already unpaid." });
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
      return res.status(200).json({ message: "Invoice is already settled." });
    }
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

// export const averageAmountPerMonth = async (req, res) => {
//   try {
//     const pipeline = [
//       {
//         $group: {
//           _id: {
//             year: { $year: "$shipmentDate" },
//             month: { $month: "$shipmentDate" },
//           },
//           totalAmount: { $sum: "$totalFees" },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           averageAmount: { $avg: "$totalAmount" },
//         },
//       },
//     ];
//     const result = await ShipmentModel.aggregate(pipeline);
//     if (result.length === 0) {
//       return res.json({ averageAmount: 0 });
//     }
//     const averageAmount = result[0].averageAmount;
//     res.json({ averageAmount });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Unable to calculate average amount per month" });
//   }
// };

// export const totalAmountForToday = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const endDate = new Date();
//     endDate.setHours(23, 59, 59, 999);
//     const totalAmount = await ShipmentModel.aggregate([
//       {
//         $match: {
//           shipmentDate: { $gte: today, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$totalFees" },
//         },
//       },
//     ]);
//     // console.log("Total Amount:", totalAmount);
//     if (totalAmount.length > 0) {
//       res.json({ totalAmount: totalAmount[0].totalAmount });
//     } else {
//       res.json({ totalAmount: 0 });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Unable to calculate total amount" });
//   }
// };

// export const shipmentInLastWeek = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const sevenDaysAgo = new Date(currentDate);
//     sevenDaysAgo.setDate(currentDate.getDate() - 7);
//     const [latestShipments, totalLatestShipments] = await Promise.all([
//       ShipmentModel.find({
//         shipmentDate: { $gte: sevenDaysAgo, $lte: currentDate },
//       })
//         .sort({ shipmentDate: -1 })
//         .lean(),
//       ShipmentModel.countDocuments({
//         shipmentDate: { $gte: sevenDaysAgo, $lte: currentDate },
//       }),
//     ]);
//     const formattedShipments = latestShipments.map((shipment) => ({
//       shipmentId: shipment._id,
//       shipmentDate: shipment.shipmentDate,
//       recipient: shipment.recipient,
//       totalFee: shipment.totalFees,
//     }));
//     res.json({ latestShipments: formattedShipments, totalLatestShipments });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Unable to fetch the latest shipments" });
//   }
// };

// export const shipmentsForLast30Days = async (req, res) => {
//   try {
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30);
//     const totalShipments = await ShipmentModel.countDocuments({
//       shipmentDate: { $gte: startDate, $lte: endDate },
//     });
//     res.json({ totalShipments });
//   } catch (error) {
//     res.status(500).json({ error: "Unable to calculate total shipments" });
//   }
// };

// export const totalShipmentsByMonth = async (req, res) => {
//   try {
//     const monthNames = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];
//     const totalShipmentsByMonth = [];
//     for (let month = 0; month < 12; month++) {
//       const startDate = new Date(new Date().getFullYear(), month, 1);
//       const endDate = new Date(new Date().getFullYear(), month + 1, 0);
//       const totalShipments = await ShipmentModel.countDocuments({
//         shipmentDate: { $gte: startDate, $lte: endDate },
//       });
//       totalShipmentsByMonth.push({
//         month: monthNames[month],
//         totalShipments: totalShipments,
//       });
//     }
//     res.json(totalShipmentsByMonth);
//   } catch (error) {
//     res.status(500).json({ error: "Unable to calculate total shipments" });
//   }
// };

// export const AverageShipmentsPerMonth = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth();
//     const currentDay = currentDate.getDate();
//     const startDate = new Date(currentYear, currentMonth, 1);
//     const endDate = new Date(currentYear, currentMonth + 1, 0);
//     const totalShipments = await ShipmentModel.countDocuments({
//       shipmentDate: { $gte: startDate, $lte: endDate },
//     });
//     const averageShipmentsPerDay = totalShipments / currentDay;
//     res.json({ averageShipmentsPerDay });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         error: "Unable to calculate average shipments for the current month",
//       });
//   }
// };

// export const TotalShipmentsForCurrentDay = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const totalShipments = await ShipmentModel.countDocuments({
//       shipmentDate: { $gte: today, $lte: today },
//     });
//     res.json({ totalShipments });
//   } catch (error) {
//     res.status(500).json({ error: "Unable to calculate total shipments" });
//   }
// };

// export const totalAmountForPeriod = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.params;
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const totalAmount = await InvoiceModel.aggregate([
//       {
//         $match: {
//           shipmentDate: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$totalFees" },
//         },
//       },
//     ]);
//     if (totalAmount.length === 0) {
//       return res.json({ totalAmount: 0 });
//     }
//     res.json({ totalAmount: totalAmount[0].totalAmount });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Unable to calculate total amount" });
//   }
// };
