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
        enum: ['Accountant', 'Salesman']
    },
    lastLogin: {
        type: Date,
    },
    superAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true,
    }
})

const EmployeeMod = mongoose.model("Employee", employeeSchema)

export default EmployeeMod;