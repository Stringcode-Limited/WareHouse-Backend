import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    suppliedProducts: [
        {
            productName: {
                type: String,
            },
            expectedQuantity: {
                type: Number,
                required: true,
                default: 0,
            },
            expectedDate: {
              type: Date,
            },
            dateDelivered: {
              type: Date,
            },
            quantityDelivered: {
                type: Number,
            },
            fee: {
              type: Number,
            },
            status: {
                type: String,
                enum: ["Pending", "Delivered", "Canceled"],
                default: "Pending",
            },
            isSupplyOnLoan:{
                type: Boolean,
            },
            returnDate: {
                type: Date,
            }
        },
    ],
});

const SupplierModel = mongoose.model("Supplier", supplierSchema);

export default SupplierModel;
