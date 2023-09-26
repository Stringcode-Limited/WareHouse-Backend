import express from 'express';
import multer from 'multer';
import { createProduct, getAllAvailableProducts, getAllCategories, getAllProducts, getAvailableProductsByCategory, getByBarcode, getByExpiration, getProductById, getProductByName, updateProduct } from '../controller/product.controller.js';
import { isAdmin } from './../middleware/admin.js';
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

productRouter.post('/create', productImageUpload.single('image'), createProduct);

productRouter.get('/getAll', getAllCategories);
 
productRouter.get('/all', getAllProducts);

productRouter.get('/get/:productId', getProductById);

productRouter.get('/get/:productName', getProductByName);

productRouter.get('/available', getAllAvailableProducts);

productRouter.get('/available/:category', getAvailableProductsByCategory);

productRouter.put('/update/:productId', loggedIn, isAdmin, updateProduct); 

productRouter.get("/expiration/:expirationDate", loggedIn, isAdmin , getByExpiration);

productRouter.get("/barcode/:barcode", loggedIn, isAdmin , getByBarcode);

export default productRouter;
