import express from 'express';
import multer from 'multer';
import { createProduct } from '../controller/product.controller.js';

const productRouter = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

productRouter.post('/create', upload.single('image'), createProduct);

export default productRouter;
