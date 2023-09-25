import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  shipmentStatus: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Canceled"],
    default: "Pending",
  },
  shipmentDate: {
    type: Date,
  },
  recipient: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  deliveryFee: {
    type: Number
  },
  totalFees: {
    type: Number,
    required: true,
  }
});

const ShipmentModel = mongoose.model("Shipment", shipmentSchema);

export default ShipmentModel;
