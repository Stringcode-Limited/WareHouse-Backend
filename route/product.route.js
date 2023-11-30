import express from 'express';
import multer from 'multer';
import { checkExpiringProducts, createCategory, createProduct, deleteCategory, deleteProduct, editCategory, getAllCategories, getAllProducts, getCategoryId, getDeadStockProducts, getExpiredProducts, getProductById, getProductByName, moveToDeadStock, moveToExpired, updateProduct } from '../controller/product.controller.js';
import { loggedIn } from './../middleware/loginAccess.js';
import { productStorage } from '../config/cloudinary.js';

const productRouter = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
const productImageUpload = multer({ storage: productStorage });

productRouter.post('/create',  loggedIn, productImageUpload.single('image'), createProduct);

productRouter.post('/new-category', loggedIn, createCategory);

productRouter.get('/categories', loggedIn, getAllCategories);

productRouter.get('/get-category/:categoryId', loggedIn, getCategoryId);

productRouter.put('/edit-category/:categoryId', loggedIn, editCategory);

productRouter.delete('/delete-category/:categoryId', loggedIn, deleteCategory);
 
productRouter.get('/products', loggedIn, getAllProducts);

productRouter.get('/getId/:productId', getProductById);

productRouter.get('/get/:productName', getProductByName);

productRouter.put('/dead-stock/:productId', loggedIn, moveToDeadStock);

productRouter.put('/expired/:productId', loggedIn, moveToExpired);

productRouter.get('/dead-stocks', loggedIn, getDeadStockProducts);

productRouter.get('/expired', loggedIn, getExpiredProducts);

productRouter.delete('/delete-product/:productId', loggedIn, deleteProduct);

productRouter.put('/update/:productId', loggedIn, updateProduct); 

productRouter.get('/notification', loggedIn, checkExpiringProducts);


export default productRouter;
