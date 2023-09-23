import ProductModel from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, availability, expirationDate, barcode, weight, dimensions, manufacturer } = req.body;
    const image = req.file.path;

    const product = new ProductModel({
      name,
      description, 
      image,
      price,
      quantity,
      category,
      availability,
      expirationDate,
      barcode,
      weight,
      dimensions,
      manufacturer,
    });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create product' });
  }
};
