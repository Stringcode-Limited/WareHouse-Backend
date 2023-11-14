import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    contactInformation: {
        address: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
        },
        phone: {
            type: String,
        },
    },
    suppliedProducts: [
        {
            productName: {
                type: String,
            },
            dateDelivered: {
              type: Date,
            },
            quantityDelivered: {
                type: Number,
            },
            unitPrice: {
                type: Number,
            },
            totalFee: {
              type: Number,
            },
            status: {
                type: String,
                default: "Supplied",
            },
            balance: {
                type: Number,
            },
            amountPaid: {
                type: Number,
            },
            suppliedPay: {
                type: String,
                enum: ["On-Loan","Fully Paid"]
            },
            datePayed: {
                type: Date
            }
        },
    ],
});

const SupplierModel = mongoose.model("Supplier", supplierSchema);

export default SupplierModel;
