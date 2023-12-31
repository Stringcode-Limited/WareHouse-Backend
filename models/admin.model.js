import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "SuperAdmin",
  },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
  customers:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    }
  ],
  suppliers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    }
  ],
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }
  ],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  taxes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tax"
    }
  ],
  discounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount"
    }
  ],
  invoices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice"
    }
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense"
    }
  ],
  sales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales"
    }
  ], 
  deletedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  deletedStaffs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
  deletedCustomers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
  ],
  deletedSuppliers:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
  ],
  deletedInvoices: [
   { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice" 
    }
  ],
  deletedCategory: [
    { 
       type: mongoose.Schema.Types.ObjectId,
       ref: "Category" 
     }
   ],
});

const AdminModel = mongoose.model("SuperAdmin", adminSchema);

export default AdminModel;
