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
        required: true,
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
    barcode:{ 
        type: String,
    },
    weight: {
        type: Number,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
      },
})

const ProductModel = mongoose.model("Product", productSchema)

export default ProductModel; 