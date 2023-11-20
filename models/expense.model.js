import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
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
  transactionHistory:[
    {
        amountPaid: {
            type: Number,
        },
        datePaid: {
            type: Date
        },
        newBalance: {
            type: Number,
        },
    }
]
});

const ExpenseMod = mongoose.model('Expense', expenseSchema);

export default ExpenseMod;
