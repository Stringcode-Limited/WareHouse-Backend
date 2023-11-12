import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  products: [
    {
      productName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true, 
      },
    },
  ],
  status: {
    type: String,
    enum: ["Pending","Paid","Unpaid"],
    default: "Pending",
  },
  issuedDate: {
    type: Date,
  },
  dueDate:{
    type: Date,
  },
  customer: {
    type: String,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0
  },
  issuedBy: {
    type: String,
  },
  total: {
    type: Number,
    required: true,
  },
  invoiceType: {
    type: String,
    enum: ["Credit", "Normal"],
  },
  returnDate: {
    type: Date,
    get: function () {
      const date = this.getDataValue('returnDate');
      return date ? date.toLocaleDateString('en-US') : null;
    },
  },
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
