import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  totalAmount: {
    type: Number,
  },
  amountPaid: {
    type: Number,
  },
  description: {
    type: String,
  },
  category: {
    type: String, 
  },
  paymentStatus: {
    type: String,
    enum: ['Partially Paid', 'Fully Paid'],
  },
  balance: {
    type: Number,
  },
  datePaid: {
    type: Date,
  },
});

const ExpenseMod = mongoose.model('Expense', expenseSchema);

export default ExpenseMod;
