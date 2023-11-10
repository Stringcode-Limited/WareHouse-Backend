import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  invoice:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  }],
  receipt: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Receipt"
  }],
  creditCase: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    total: {
      type: Number,
    }, 
    dueDate: {
      type: Date,
    },
    issuedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Outstanding','Overdue', 'Settled']
    },
    settleDate: {
      type: Date,
    },
  }],
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
