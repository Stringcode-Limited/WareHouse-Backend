import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    category: {
        type: String,
    },
    availability: {
        type: String,
        enum: ["Available","Out-of-Stock"]
    },
    expirationDate: {
        type: Date,
    },
    salesHistory: [{
        date: Date,
        unitsSold: Number,
      }],
})

module.exports = mongoose.model('Product', productSchema);