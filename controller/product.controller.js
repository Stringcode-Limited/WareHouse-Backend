import ProductModel from "../models/product.model.js";
import SupplierModel from "../models/supplier.model.js";
import CategoryModel from "../models/category.model.js";
import EmployeeMod from "../models/employee.model.js";
import AdminModel from "../models/admin.model.js";

export const createCategory = async (req, res) => {
  try {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name } = req.body;
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('category');
      if (superAdmin) {
        const existingCategory = superAdmin.category.find(
          (existingCategory) =>
            existingCategory.name === name && existingCategory.deletedStatus !== 'Deleted'
        );
        if (existingCategory) {
          return res.status(400).json({ error: "Category already exists." });
        }
        const newCategory = new CategoryModel({ name });
        await newCategory.save();
        superAdmin.category.push(newCategory._id);
        await superAdmin.save();
        return res.status(201).json({ message: "Category created successfully." });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('category');
      if (superAdmin) {
        const existingCategory = superAdmin.category.find(
          (existingCategory) =>
            existingCategory.name === name && existingCategory.deletedStatus !== 'Deleted'
        );
        if (existingCategory) {
          return res.status(400).json({ error: "Category already exists." });
        }
        const newCategory = new CategoryModel({ name });
        await newCategory.save();
        superAdmin.category.push(newCategory._id);
        await superAdmin.save();
        return res.status(201).json({ message: "Category created successfully." });
      }
    }
    return res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllCategories = async (req, res) => {
  try {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let categories = [];
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        categories = await CategoryModel.find({
          _id: { $in: superAdmin.category },
        });
      }
    }
    if (categories.length === 0) {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        categories = await CategoryModel.find({
          _id: { $in: superAdmin.category },
        });
      }
    }
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCategoryId = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const categoryId = req.params.categoryId;
    let category = null;
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("category");
      if (superAdmin) {
        category = superAdmin.category.find(
          (cat) => cat._id.toString() === categoryId
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("category");
      if (superAdmin) {
        category = superAdmin.category.find(
          (cat) => cat._id.toString() === categoryId
        );
      }
    }
    if (category) {
      return res.status(200).json({ category });
    } else {
      return res.status(404).json({ message: "Category not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editCategory = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(404).json({ message: "User not found." });
  }
  try {
    const categoryId = req.params.categoryId;
    const updatedFields = req.body;
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      updatedFields,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json({
      status: "Success",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    let superAdminId;
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId;
    } else {
      superAdminId = userId;
    }
    const superAdmin = await AdminModel.findById(superAdminId);
    if (!superAdmin) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const { categoryId } = req.params;
    const categoryIndex = superAdmin.category.indexOf(categoryId);
    if (categoryIndex !== -1) {
      superAdmin.category.splice(categoryIndex, 1);
      superAdmin.deletedCategory.push(categoryId);
      const category = await CategoryModel.findOne({ _id: categoryId });
      if (category) {
        category.deletedStatus = 'Deleted';
        await category.save();
      }
      await superAdmin.save();
      return res.status(200).json({ message: "Category deleted successfully" });
    } else {
      return res.status(404).json({ error: "Category not found in SuperAdmin's categories" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





export const createProduct = async (req, res) => {
  try {
    const userId = req.userAuth;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const {
      name,
      description,
      price,
      quantity,
      category,
      availability,
      expirationDate,
      supplier,
      lastSupplied,
    } = req.body;
    const existingProduct = await ProductModel.findOne({
      name,
      belongsTo: userId,
    });
    if (existingProduct) {
      if (existingProduct.availability !== "Available") {
        const superAdminId = existingProduct.belongsTo;
        const newProduct = new ProductModel({
          name,
          description,
          price,
          quantity,
          category,
          availability: "Available",
          expirationDate,
          lastSupplied: new Date().toISOString(),
          supplier,
          belongsTo: superAdminId,
        });

        await newProduct.save();
        const superAdmin = await AdminModel.findById(superAdminId);
        if (superAdmin) {
          superAdmin.products.push(newProduct._id);
          await superAdmin.save();
          return res.status(201).json({ message: "Product created successfully." });
        } else {
          return res.status(404).json({ message: "SuperAdmin not found." });
        }
      } else {
        existingProduct.quantity = Number(existingProduct.quantity) + Number(quantity);
        existingProduct.lastSupplied = new Date().toISOString();
        await existingProduct.save();
        return res.status(200).json({ message: "Product updated successfully." });
      }
    }
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    let superAdminId;
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) superAdminId = superAdmin._id;
    } else {
      superAdminId = userId;
    }
    const newProduct = new ProductModel({
      name,
      description,
      price,
      quantity,
      category,
      availability: "Available",
      expirationDate,
      lastSupplied,
      supplier,
      belongsTo: superAdminId,
    });
    await newProduct.save();
    const superAdmin = await AdminModel.findById(superAdminId);
    if (superAdmin) {
      superAdmin.products.push(newProduct._id);
      await superAdmin.save();
      return res.status(201).json({ message: "Product created successfully." });
    } else {
      return res.status(404).json({ message: "SuperAdmin not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let products = [];
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("products");
      if (superAdmin) {
        products = superAdmin.products
          .map((product) => {
            if (product.deletedStatus !== 'Deleted') {
              if (product.quantity === 0) {
                product.availability = "Out-of-Stock";
              } else if (product.availability === "Out-of-Stock") {
                product.quantity = 0;
              }
              return product;
            }
            return null; 
          })
          .filter(
            (product) =>
              product && 
              (product.availability === "Available" ||
                product.availability === "Out-of-Stock")
          );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("products");
      if (superAdmin) {
        products = superAdmin.products
          .map((product) => {
            if (product.deletedStatus !== 'Deleted') {
              if (product.quantity === 0) {
                product.availability = "Out-of-Stock";
              } else if (product.availability === "Out-of-Stock") {
                product.quantity = 0;
              }
              return product;
            }
            return null;
          })
          .filter(
            (product) =>
              product &&
              (product.availability === "Available" ||
                product.availability === "Out-of-Stock")
          );
      }
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getProductByName = async (req, res) => {
  try {
    const productName = req.params.productName;
    const userId = req.userAuth;
    const product = await ProductModel.findOne({ name: productName });
    if (!product) return res.status(404).json({ error: "Product not found" });
    if ((userId && product.belongsTo.toString() === userId) || (userId && (await EmployeeMod.findOne({ _id: userId, "superAdminId": product.belongsTo })))) {
      return res.json({ status: "Success", data: product });
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
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

export const getDeadStockProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let products = [];
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("products");
      if (superAdmin) {
        products = superAdmin.products.filter(
          (product) => product.availability === "Dead Stock"
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("products");
      if (superAdmin) {
        products = superAdmin.products.filter(
          (product) => product.availability === "Dead Stock"
        );
      }
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getExpiredProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    let products = [];

    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("products");
      if (superAdmin) {
        products = superAdmin.products.filter(
          (product) => product.availability === "Expired"
        );
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("products");
      if (superAdmin) {
        products = superAdmin.products.filter(
          (product) => product.availability === "Expired"
        );
      }
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const moveToDeadStock = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    product.availability = "Dead Stock";
    await product.save();
    return res.status(200).json({ message: "Product moved to Dead Stock." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const moveToExpired = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    product.availability = "Expired";
    await product.save();
    return res.status(200).json({ message: "Product set as Expired." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(404).json({ message: "User not found." });
  }
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

export const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.userAuth;
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    let superAdminId;
    if (employee && employee.superAdminId) {
      superAdminId = employee.superAdminId;
    } else {
      superAdminId = userId;
    }
    const superAdmin = await AdminModel.findById(superAdminId);
    if (!superAdmin) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.deletedStatus = "Deleted";
    await product.save();
    superAdmin.deletedItems.push(productId);
    await superAdmin.save();
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const checkExpiringProducts = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const today = new Date();
    const oneMonthLater = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    const twentyDaysLater = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 20
    );
    const tenDaysLater = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 10
    );
    let expiringProducts = [];
    const employee = await EmployeeMod.findById(userId).populate(
      "superAdminId"
    );
    if (employee) {
      const superAdmin = await AdminModel.findById(
        employee.superAdminId
      ).populate("products");
      if (superAdmin) {
        expiringProducts = superAdmin.products
          .filter((product) => product.deletedStatus !== 'Deleted')
          .filter((product) => {
            return (
              product.availability === "Available" &&
              ((new Date(product.expirationDate) <= oneMonthLater &&
                new Date(product.expirationDate) > twentyDaysLater) ||
                (new Date(product.expirationDate) <= twentyDaysLater &&
                  new Date(product.expirationDate) > tenDaysLater) ||
                (product.quantity <= 10 && product.quantity > 0))
            );
          });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate("products");
      if (superAdmin) {
        expiringProducts = superAdmin.products
          .filter((product) => product.deletedStatus !== 'Deleted')
          .filter((product) => {
            return (
              product.availability === "Available" &&
              ((new Date(product.expirationDate) <= oneMonthLater &&
                new Date(product.expirationDate) > twentyDaysLater) ||
                (new Date(product.expirationDate) <= twentyDaysLater &&
                  new Date(product.expirationDate) > tenDaysLater) ||
                (product.quantity <= 10 && product.quantity > 0))
            );
          });
      }
    }
    const messages = expiringProducts.map((product) => {
      const expirationDate = new Date(product.expirationDate);
      const daysRemaining = Math.floor(
        (expirationDate - today) / (1000 * 60 * 60 * 24)
      );
      const quantityRemaining = product.quantity;
      let message = "";
      if (expirationDate <= oneMonthLater && expirationDate > twentyDaysLater) {
        message = `${product.name} has ${daysRemaining} days left before expiration `;
      } else if (
        expirationDate <= twentyDaysLater &&
        expirationDate > tenDaysLater
      ) {
        message = `${product.name} has ${daysRemaining} days left before expiration`;
      } else if (product.quantity <= 10 && product.quantity > 0) {
        message = `${product.name} has only ${quantityRemaining} units remaining.`;
      }
      return message;
    });
    return res.status(200).json({ message: messages });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getProductsLessThanQuantity = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }
    let products = [];
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee) {
      const superAdmin = await AdminModel.findById(employee.superAdminId).populate('products');
      if (superAdmin) {
        products = superAdmin.products
          .map((product) => {
            if (product.quantity === 0) {
              product.availability = 'Out-of-Stock';
            } else if (product.availability === 'Out-of-Stock') {
              product.quantity = 0;
            }
            return product;
          })
          .filter((product) => product.quantity < quantity && product.availability === 'Available');
      }
    } else {
      const superAdmin = await AdminModel.findById(userId).populate('products');
      if (superAdmin) {
        products = superAdmin.products
          .map((product) => {
            if (product.quantity === 0) {
              product.availability = 'Out-of-Stock';
            } else if (product.availability === 'Out-of-Stock') {
              product.quantity = 0;
            }
            return product;
          })
          .filter((product) => product.quantity < quantity && product.availability === 'Available');
      } else {
        return res.status(404).json({ message: 'User not found.' });
      }
    }
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
