import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        default: "X0X0"
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    lastLogin: {
        type: Date,
      },
})

const UserModel = mongoose.model("User", userSchema)

export default UserModel