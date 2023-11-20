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
  amountPaid: {
    type: Number,
  },
  balance: {
    type: Number,
  },  
  transactionHistory:[
    {
        amountPaid: {
            type: Number,
        },
        datePaid: {
            type: Date
        },
        newBalance: {
            type: Number,
        },
        paymentMethod: {
          type: String,
        },
    }
]
});

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
