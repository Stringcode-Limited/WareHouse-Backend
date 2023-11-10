import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { mongoDB } from './config/database.js';
import productRouter from './route/product.route.js';
import personnelRouter from './route/personnel.route.js';
import invoiceRouter from './route/invoice.route.js';
import supplyRoute from './route/supplier.route.js';
import adminRouter from './route/admin.route.js';
import taxRouter from './route/tax.route.js';
import expenseRouter from './route/expense.route.js';


dotenv.config();
mongoDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*', 
  credentials: true,
  allowedHeaders: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/v1/product', productRouter);
app.use('/api/v1/personnel', personnelRouter);
app.use('/api/v1/invoice', invoiceRouter);
app.use('/api/v1/supply', supplyRoute);
app.use('/api/v1/setup', adminRouter);
app.use('/api/v1/rates', taxRouter); 
app.use('/api/v1/expense', expenseRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
