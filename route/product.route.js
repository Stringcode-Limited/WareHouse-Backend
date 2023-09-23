import express from 'express';
import multer from 'multer';
import { createProduct, getAllCategories, getAvailableProductsByCategory, getByBarcode, getByExpiration, getByManufacturer, getProductByName, updateProduct } from '../controller/product.controller.js';
import { isAdmin } from './../middleware/admin.js';
import { loggedIn } from './../middleware/loginAccess.js';

const productRouter = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

productRouter.post('/create', upload.single('image'), loggedIn, isAdmin , createProduct);

productRouter.get('/getAll', getAllCategories);

productRouter.get('/get/:productName', getProductByName);

productRouter.get('/available/:category', loggedIn, isAdmin , getAvailableProductsByCategory);

productRouter.put('/update/:productId', loggedIn, isAdmin, updateProduct);

productRouter.get('/manufacturer/:manufacturer', loggedIn, isAdmin , getByManufacturer);

productRouter.get("/expiration/:expirationDate", loggedIn, isAdmin , getByExpiration);

productRouter.get("/barcode/:barcode", loggedIn, isAdmin , getByBarcode);

export default productRouter;
