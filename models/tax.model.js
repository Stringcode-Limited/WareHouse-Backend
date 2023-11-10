import mongoose from 'mongoose';

const taxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  description: String
});

const TaxModel = mongoose.model('Tax', taxSchema);

export default TaxModel;
