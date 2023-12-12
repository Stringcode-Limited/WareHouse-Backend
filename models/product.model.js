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
    deletedStatus: {
        type: String,
        enum: ['Deleted','Not Deleted'],
        default: 'Not Deleted'
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
    supplier: {
        type: String,
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true, 
    }
})

const ProductModel = mongoose.model("Product", productSchema)

export default ProductModel;  