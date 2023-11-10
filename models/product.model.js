import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        // required: true,
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
        enum: ["Available","Out-of-Stock", "Expired", "Dead Stock"]
    },
    expirationDate: {
        type: Date,
    },
    lastSupplied: {
         type: Date,
    },
    barcode:{ 
        type: String,
    },
    weight: {
        type: Number,
    },
    supplier: {
        type: String,
    },
})

const ProductModel = mongoose.model("Product", productSchema)

export default ProductModel;  