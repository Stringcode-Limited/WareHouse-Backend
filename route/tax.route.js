import express from 'express'
import { loggedIn } from '../middleware/loginAccess.js';
import { createDiscount, createTax, editDiscount, editTax, getAllDiscounts, getAllTaxes, getDiscountById, getTaxById } from '../controller/tax.controller.js';

const taxRouter = express.Router();

taxRouter.post('/new-tax', loggedIn, createTax);

taxRouter.post('/new-discount', loggedIn, createDiscount);

taxRouter.get('/taxes', loggedIn, getAllTaxes);

taxRouter.get('/discounts', loggedIn, getAllDiscounts);

taxRouter.get('/get-tax/:taxId', loggedIn, getTaxById);

taxRouter.get('/get-discount/:discountId', loggedIn, getDiscountById);

taxRouter.put('/edit-tax/:taxId', loggedIn, editTax);

taxRouter.put('/edit-discount/:discountId', loggedIn, editDiscount);

export default taxRouter;