    import mongoose from "mongoose";

    const employeeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Accountant', 'Salesman', 'Manager']
        },
        lastLogin: {
            type: Date,
        },
        superAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin',
            required: true, 
        },
        availability:{
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        },
        outMarket: [
            {
                productName: {
                    type: String,
                },
                quantity: {
                    type: Number
                },
                unitPrice:{
                    type: Number,
                },
                amountMade: {
                    type: Number,
                    default: 0,
                },
                quantityReturned: {
                    type: Number,
                    default: 0
                },
                quantitySold: {
                    type: Number,
                    default: 0
                },
                amountOwed: {
                    type: Number,
                    default: 0,
                },
                expectedProfit:{
                    type: Number,
                },
                sellPercentage: {
                    type: Number,
                    default: 0
                }
            }
        ]
    })

    const EmployeeMod = mongoose.model("Employee", employeeSchema)

    export default EmployeeMod;