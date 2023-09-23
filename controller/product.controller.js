import ProductModel from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      category,
      availability,
      expirationDate,
      barcode,
      weight,
      dimensions,
      manufacturer,
    } = req.body;
    const image = req.file.path;

    const product = new ProductModel({
      name,
      description,
      image,
      price,
      quantity,
      category,
      availability: "Available",
      expirationDate,
      barcode,
      weight,
      dimensions,
      manufacturer,
    });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Unable to create product" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await ProductModel.aggregate([
      {
        $group: {
          _id: "$category",
          products: {
            $push: {
              name: "$name",
              description: "$description",
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          categories: {
            $push: {
              category: "$_id",
              products: "$products",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          categories: 1,
        },
      },
    ]);

    res.json({
      status: "Success",
      data: categories[0].categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProductByName = async (req, res) => {
  try {
    const productName = req.params.productName;
    const product = await ProductModel.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({
      status: "Success",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAvailableProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await ProductModel.find({
      category: category,
      availability: "Available",
    });
    if (products.length === 0) {
      return res.json({ message: "No available products" });
    }
    res.json({
      status: "Success",
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedFields = req.body;
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({
      status: "Success",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getByManufacturer = async (req, res) => {
  try {
    const manufacturer = req.params.manufacturer;
    const products = await ProductModel.find({
      manufacturer: manufacturer,
    });
    if (products.length === 0) {
      return res.json({
        message: "No products found with the specified manufacturer",
      });
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getByExpiration = async (req, res) => {
  try {
    const expirationDate = req.params.expirationDate;
    const products = await ProductModel.find({
      expirationDate: new Date(expirationDate),
    });
    if (products.length === 0) {
      return res.json({
        message: "No products found with the specified expiration date",
      });
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const products = await ProductModel.find({
      barcode: barcode,
    });
    if (products.length === 0) {
      return res.json({
        message: "No products found with the specified manufacturer",
      });
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};