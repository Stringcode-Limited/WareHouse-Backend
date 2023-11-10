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
    get: (date) => date.toISOString().split("T")[0],
  },
  dueDate:{
    type: Date,
    get: (date) => date.toISOString().split("T")[0],
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
  isProductOnLoan: {
    type: Boolean,
    default: false
  },
  returnDate: {
    type: Date,
    get: (date) => (date ? date.toISOString().split("T")[0] : null),
  },
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
