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
                default: 0
            },
            suppliedPay: {
                type: String,
                enum: ["On-Loan","Fully Paid"]
            },
            transactionHistory:[
                {
                    amountPaid: {
                        type: Number,
                    },
                    datePayed: {
                        type: Date
                    },
                    newBalance: {
                        type: Number,
                    },
                }
            ]
        },
    ],
});

const SupplierModel = mongoose.model("Supplier", supplierSchema);

export default SupplierModel;
