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
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
