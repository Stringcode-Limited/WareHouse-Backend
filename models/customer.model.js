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
  deletedStatus: {
    type: String,
    enum: ['Deleted','Not Deleted'],
    default: 'Not Deleted'
},
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
