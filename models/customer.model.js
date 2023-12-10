import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  invoice:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  }],
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
