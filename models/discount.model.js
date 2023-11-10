import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  description: String
});

const DiscountMod = mongoose.model('Discount', discountSchema);

export default DiscountMod;
