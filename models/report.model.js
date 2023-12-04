import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  invoice:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  }],
});

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;
