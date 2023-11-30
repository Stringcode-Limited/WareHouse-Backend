import  express  from "express";
import { loggedIn } from "../middleware/loginAccess.js";
import { createExpense, getAllExpenses, getExpenseTransactionsHistory, updateExpense } from "../controller/expense.controller.js";

const expenseRouter = express.Router();

expenseRouter.post('/new-expense', loggedIn, createExpense);

expenseRouter.get('/expenses', loggedIn, getAllExpenses);

expenseRouter.get('/expense-transaction/:expenseId', loggedIn ,getExpenseTransactionsHistory);

expenseRouter.put('/update-expense/:expenseId', loggedIn, updateExpense);

export default expenseRouter