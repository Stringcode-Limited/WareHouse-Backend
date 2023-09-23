import express from 'express';
import multer from 'multer';
import { createProduct, getAllCategories, getAvailableProductsByCategory, getProductByName, updateProduct } from '../controller/product.controller.js';

const productRouter = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

productRouter.post('/create', upload.single('image'), createProduct);

productRouter.get('/getAll', getAllCategories);

productRouter.get('/get/:productName', getProductByName);

productRouter.get('/available/:category', getAvailableProductsByCategory);

productRouter.put('/update/:productId', updateProduct);

export default productRouter;
