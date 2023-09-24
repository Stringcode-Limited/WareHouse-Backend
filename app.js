import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { mongoDB } from './config/database.js';
import productRouter from './route/product.route.js';
import adminRouter from './route/auth.route.js';
import shipmentRouter from './route/ship.route.js';

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
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin-ship', shipmentRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
