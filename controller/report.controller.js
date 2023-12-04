import InvoiceModel from './../models/invoice.model.js';
import Sales from './../models/report.model.js';
import ProductModel from './../models/product.model.js';
import EmployeeMod from '../models/employee.model.js';
import AdminModel from '../models/admin.model.js';
import CategoryModel from '../models/category.model.js';
import SupplierModel from './../models/supplier.model.js';
import CustomerModel from '../models/customer.model.js';

export const createSalesReport = async (invoiceId, amountPaid, superAdminId, userId, res) => {
  try {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found.");
    }
    const { products, total } = invoice;
    const employee = await EmployeeMod.findById(userId).populate("superAdminId");
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        const salesReport = await Sales.findOne({
          invoice: invoiceId,
          date: new Date(Date.now()),
        });
        if (salesReport) {
          await Promise.all(products.map(async (product) => {
            const { productName, quantity } = product;
            const productDetails = await ProductModel.findOne({ name: productName });
            if (!productDetails) {
              console.error(`Error: Product details not found for ${productName}.`);
              throw new Error(`Product details not found for ${productName}.`);
            }
            const { _id: productId } = productDetails;
            const existingProductIndex = salesReport.products.findIndex(p => p.productId.equals(productId));
            if (existingProductIndex !== -1) {
              salesReport.products[existingProductIndex].quantity += quantity;
            } else {
              salesReport.products.push({
                productId,
                name: productName,
                quantity,
              });
            }
          }));
          salesReport.total += total;
          await salesReport.save();
        } else {
          const newReport = new Sales({
            date: new Date(Date.now()),
            products: await Promise.all(products.map(async (product) => {
              const { productName, quantity } = product;
              const productDetails = await ProductModel.findOne({ name: productName, belongsTo: superAdminId });
              if (!productDetails) {
                throw new Error(`Product details not found for ${productName}.`);
              }
              const { _id: productId } = productDetails;
              return {
                productId,
                name: productName,
                quantity
              };
            })),
            total: amountPaid,
            invoice: invoiceId,
          });
          await newReport.save();
          superAdmin.sales.push(newReport._id);
          await superAdmin.save();
        }
      }
    }
  } catch (error) {
    console.error("Error in createSalesReport:", error);
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
        salesReports = await Sales.find({ _id: { $in: superAdmin.sales } }).populate({
          path: 'products.productId',
          select: 'name price',
        });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        salesReports = await Sales.find({ _id: { $in: superAdmin.sales } }).populate({
          path: 'products.productId',
          select: 'name price',
        });
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




  export const getTotalCategories = async (req, res) => {
    try {
      const userId = req.userAuth;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      let categories = [];
      const employee = await EmployeeMod.findById(userId).populate("superAdminId");
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId);
        if (superAdmin) {
          categories = await CategoryModel.find({ _id: { $in: superAdmin.category } });
        }
      }
      if (categories.length === 0) {
        const superAdmin = await AdminModel.findById(userId);
        if (superAdmin) {
          categories = await CategoryModel.find({ _id: { $in: superAdmin.category } });
        }
      }
      const totalCategories = categories.length;
      return res.status(200).json({ totalCategories });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const getTotalProducts = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      let productCount = 0;
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId).populate('products');
        if (superAdmin) {
          productCount = superAdmin.products
            .filter(
              (product) =>
                product.availability === 'Available' ||
                product.availability === 'Out-of-Stock'
            )
            .length;
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate('products');
        if (superAdmin) {
          productCount = superAdmin.products
            .filter(
              (product) =>
                product.availability === 'Available' ||
                product.availability === 'Out-of-Stock'
            )
            .length;
        }
      }
      return res.status(200).json({  productCount });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  export const getTotalInvoices = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      let totalInvoices = 0;
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdminId = employee.superAdminId;
        const superAdmin = await AdminModel.findById(superAdminId).populate({
          path: 'customers',
          populate: { path: 'invoice' },
        });
        if (superAdmin) {
          for (const customer of superAdmin.customers) {
            totalInvoices += customer.invoice.length;
          }
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate({
          path: 'customers',
          populate: { path: 'invoice' },
        });
        if (superAdmin) {
          for (const customer of superAdmin.customers) {
            totalInvoices += customer.invoice.length;
          }
        }
      }
      res.status(200).json({ totalInvoices });
    } catch (error) {
      console.error('Error fetching total invoices:', error);
      res.status(500).json({ error: 'Unable to fetch total invoices' });
    }
  };

  export const getTotalSuppliers = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      let totalSuppliers = 0;
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee && employee.superAdminId) {
        const superAdmin = await AdminModel.findById(employee.superAdminId);
        if (superAdmin) {
          totalSuppliers = await SupplierModel.countDocuments({ _id: { $in: superAdmin.suppliers } });
        }
      } else {
        const superAdmin = await AdminModel.findById(userId);
        if (superAdmin) {
          totalSuppliers = await SupplierModel.countDocuments({ _id: { $in: superAdmin.suppliers } });
        } else {
          return res.status(404).json({ message: 'SuperAdmin not found.' });
        }
      }
      res.status(200).json({ totalSuppliers });
    } catch (error) {
      console.error('Error fetching total suppliers:', error);
      res.status(500).json({ error: 'Unable to fetch total suppliers' });
    }
  };

  
export const getTotalCustomers = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let totalCustomers = 0;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        totalCustomers = await CustomerModel.countDocuments({ _id: { $in: superAdmin.customers } });
      }
    }
    if (totalCustomers === 0) {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        totalCustomers = await CustomerModel.countDocuments({ _id: { $in: superAdmin.customers } });
      }
    }
    res.status(200).json({ totalCustomers });
  } catch (error) {
    console.error('Error fetching total customers:', error);
    res.status(500).json({ error: 'Unable to fetch total customers' });
  }
};

export const getTotalEmployees = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let totalEmployees = 0;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('employees');
      if (!superAdmin) {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
      totalEmployees = superAdmin.employees.length;
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('employees');
      if (!superAdmin) {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
      totalEmployees = superAdmin.employees.length;
    }
    res.status(200).json({ totalEmployees });
  } catch (error) {
    console.error('Error fetching total employees:', error);
    res.status(500).json({ error: 'Unable to fetch total employees' });
  }
};


export const getTotalDeadStockProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let totalDeadStockProducts = 0;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('products');
      if (superAdmin) {
        totalDeadStockProducts = superAdmin.products.filter(
          (product) => product.availability === 'Dead Stock'
        ).length;
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('products');
      if (superAdmin) {
        totalDeadStockProducts = superAdmin.products.filter(
          (product) => product.availability === 'Dead Stock'
        ).length;
      }
    }
    res.status(200).json({ totalDeadStockProducts });
  } catch (error) {
    console.error('Error fetching total deadstock products:', error);
    res.status(500).json({ error: 'Unable to fetch total deadstock products' });
  }
};

export const getTotalExpired = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let totalExpiredProducts = 0;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('products');
      if (superAdmin) {
        totalExpiredProducts = superAdmin.products.filter(
          (product) => product.availability === 'Expired'
        ).length;
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('products');
      if (superAdmin) {
        totalExpiredProducts = superAdmin.products.filter(
          (product) => product.availability === 'Expired'
        ).length;
      }
    }
    res.status(200).json({ totalExpiredProducts });
  } catch (error) {
    console.error('Error fetching total deadstock products:', error);
    res.status(500).json({ error: 'Unable to fetch total deadstock products' });
  }
};


export const getTotalInactiveEmployees = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let totalInactiveEmployees = 0;
    const employee = await EmployeeMod.findById(userId);
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('employees');
      if (!superAdmin) {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
      totalInactiveEmployees = superAdmin.employees.filter(employee => employee.availability === 'Inactive').length;
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('employees');
      if (!superAdmin) {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
      totalInactiveEmployees = superAdmin.employees.filter(employee => employee.availability === 'Inactive').length;
    }
    res.status(200).json({ totalInactiveEmployees });
  } catch (error) {
    console.error('Error fetching total inactive employees:', error);
    res.status(500).json({ error: 'Unable to fetch total inactive employees' });
  }
};

export const getInvoiceStatistics = async (req, res) => {
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
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const invoicesCurrentDay = invoices.filter(
      invoice => new Date(invoice.issuedDate).toDateString() === today.toDateString()
    );
    const invoicesLast30Days = invoices.filter(
      invoice => new Date(invoice.issuedDate) >= thirtyDaysAgo
    );
    const totalQuantitiesCurrentDay = invoicesCurrentDay.reduce(
      (total, invoice) => total + invoice.products.reduce(
        (productTotal, product) => productTotal + product.quantity, 0
      ), 0
    );
    const totalAmountPaidCurrentDay = invoicesCurrentDay.reduce(
      (total, invoice) => total + invoice.amountPaid, 0
    );
    const totalQuantitiesLast30Days = invoicesLast30Days.reduce(
      (total, invoice) => total + invoice.products.reduce(
        (productTotal, product) => productTotal + product.quantity, 0
      ), 0
    );
    res.status(200).json({
      totalQuantitiesLast30Days
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({ error: 'Unable to fetch invoice statistics' });
  }
};

export const getQuantitiesByMonth = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    let invoices = [];

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
    const monthlyQuantities = invoices.reduce((acc, invoice) => {
      const issuedDate = new Date(invoice.issuedDate);
      const yearMonth = `${issuedDate.getFullYear()}-${getMonthName(issuedDate.getMonth())}`;
      acc[yearMonth] = (acc[yearMonth] || 0) + invoice.products.reduce((total, product) => total + product.quantity, 0);
      return acc;
    }, {});
    res.status(200).json({ monthlyQuantities });
  } catch (error) {
    console.error('Error fetching quantities by month:', error);
    res.status(500).json({ error: 'Unable to fetch quantities by month' });
  }
};
function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}
