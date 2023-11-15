import EmployeeMod from './../models/employee.model.js';
import AdminModel from './../models/admin.model.js';
import ExpenseMod from './../models/expense.model.js';


export const createExpense = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { title, totalAmount, amountPaid, description, category, datePaid } = req.body;
    const totalAmountInt = parseInt(totalAmount);
    const amountPaidInt = parseInt(amountPaid);

    if (totalAmountInt < 0 || amountPaidInt < 0) {
      return res.status(400).json({ message: 'Please enter accurate numbers.' });
    }

    let paymentStatus;
    if (amountPaidInt < totalAmountInt) {
      paymentStatus = 'Partially Paid';
    } else if (amountPaidInt === totalAmountInt) {
      paymentStatus = 'Fully Paid';
    } else {
      return res.status(400).json({ message: 'The amount paid is greater than the total amount.' });
    }

    const existingExpense = await ExpenseMod.findOne({ title, paymentStatus: 'Fully Paid', datePaid });
    if (existingExpense) {
      return res.status(400).json({ message: 'Expense already marked as fully paid on the same date.' });
    }

    const balance = totalAmountInt - amountPaidInt;

    const newExpense = new ExpenseMod({
      title,
      totalAmount: totalAmountInt,
      amountPaid: amountPaidInt,
      description,
      category,
      paymentStatus,
      balance,
      datePaid,
    });

    await newExpense.save();

    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        superAdmin.expenses.push(newExpense._id);
        await superAdmin.save();
        return res.status(201).json({ message: 'Expense created successfully.' });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        superAdmin.expenses.push(newExpense._id);
        await superAdmin.save();
        return res.status(201).json({ message: 'Expense created successfully.' });
      } else {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};




export const getAllExpenses = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    let expenses;
    let totalAmountPaidForCurrentMonth = 0;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        expenses = await ExpenseMod.find({
          _id: { $in: superAdmin.expenses },
          datePaid: { $gte: startOfMonth, $lte: endOfMonth },
        });
        totalAmountPaidForCurrentMonth = expenses.reduce(
          (total, expense) => total + (expense.amountPaid || 0),
          0
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        expenses = await ExpenseMod.find({
          _id: { $in: superAdmin.expenses },
          datePaid: { $gte: startOfMonth, $lte: endOfMonth },
        });
        totalAmountPaidForCurrentMonth = expenses.reduce(
          (total, expense) => total + (expense.amountPaid || 0),
          0
        );
      } else {
        return res.status(404).json({ message: 'User not found.' });
      }
    }

    return res.status(200).json({ expenses, totalAmountPaidForCurrentMonth });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const updateExpense = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const expenseId = req.params.expenseId;
    const { amountPaid } = req.body;
    if (amountPaid <= 0) {
      return res.status(400).json({ message: "Amount paid must be a positive value." });
    }
    const expense = await ExpenseMod.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }
    if (expense.paymentStatus === "Fully Paid") {
      return res.status(400).json({ message: "Expense is already fully paid." });
    }
    let newBalance = expense.balance - amountPaid;
    if (newBalance < 0) {
      return res.status(400).json({ message: "Amount is bigger than balance." });
    }
    const paymentStatus = newBalance === 0 ? "Fully Paid" : "Partially Paid";
    const updatedExpense = await ExpenseMod.findByIdAndUpdate(
      expenseId,
      {
        amountPaid: Number(expense.amountPaid) + Number(amountPaid),
        balance: newBalance,
        paymentStatus,
      },
      { new: true }
    );
    if (amountPaid === 0) {
      return res.status(400).json({ message: "Please enter an accurate figure for amount paid." });
    }
    return res.status(200).json({
      status: "Success",
      data: updatedExpense,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
