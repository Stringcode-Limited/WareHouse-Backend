import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactInformation: {
    address: {
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
  },
  productSold: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      totalFee: {
        type: Number,
        required: true,
      },
      dateSold: {
        type: Date,
        required: true,
      },
    },
  ],
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
