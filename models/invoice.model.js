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
    enum: ["Pending","Paid","Unpaid","Partially Paid"],
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
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  amountPaid: {
    type: Number,
  },
  balance: {
    type: Number,
  }
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
