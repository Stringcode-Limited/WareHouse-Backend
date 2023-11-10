import EmployeeMod from '../models/employee.model.js';
import TaxModel from './../models/tax.model.js';
import AdminModel from './../models/admin.model.js';
import DiscountMod from './../models/discount.model.js';


export const createTax = async (req, res) => {
  const userId = req.userAuth;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { name, type, rate, description } = req.body;
    const taxExists = await TaxModel.findOne({ name });
    if (taxExists) {
      return res.status(400).json({ error: 'Tax already exists.' });
    }
    const newTax = new TaxModel({ name, type, rate, description });
    await newTax.save();
    const employee = await EmployeeMod.findById(userId).populate('superAdminId');
    if (employee && employee.superAdminId) {
      const superAdmin = await AdminModel.findById(employee.superAdminId);
      if (superAdmin) {
        superAdmin.taxes.push(newTax._id);
        await superAdmin.save();
        return res.status(201).json({ message: 'Tax created successfully.' });
      }
    } else {
      const superAdmin = await AdminModel.findById(userId);
      if (superAdmin) {
        superAdmin.taxes.push(newTax._id);
        await superAdmin.save();
        return res.status(201).json({ message: 'Tax created successfully.' });
      } else {
        return res.status(404).json({ message: 'SuperAdmin not found.' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

  
  export const createDiscount = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { name, type, value, description } = req.body;
      const discountExists = await DiscountMod.findOne({ name });
      if (discountExists) {
        return res.status(400).json({ error: 'Discount already exists.' });
      }
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId);
        if (superAdmin) {
          const newDiscount = new DiscountMod({
             name,
             type,
             value,
             description
             });
          await newDiscount.save();
          superAdmin.discounts.push(newDiscount._id);
          await superAdmin.save();
          return res.status(201).json({ message: 'Discount created successfully.' });
        }
      } else {
        const superAdmin = await AdminModel.findById(userId);
        if (superAdmin) {
          const newDiscount = new DiscountMod({ name, type, value, description });
          await newDiscount.save();
          superAdmin.discounts.push(newDiscount._id);
          await superAdmin.save();
          return res.status(201).json({ message: 'Discount created successfully.' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  export const getAllTaxes = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      let taxes = [];
  
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId).populate('taxes');
        if (superAdmin) {
          taxes = superAdmin.taxes;
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate('taxes');
        if (superAdmin) {
          taxes = superAdmin.taxes;
        }
      }
      return res.status(200).json({ taxes });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  export const getAllDiscounts = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      let discounts = [];
  
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId).populate('discounts');
        if (superAdmin) {
          discounts = superAdmin.discounts;
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate('discounts');
        if (superAdmin) {
          discounts = superAdmin.discounts;
        }
      }
      return res.status(200).json({ discounts });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  export const getTaxById = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { taxId } = req.params;
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId).populate('taxes');
        if (superAdmin) {
          const tax = superAdmin.taxes.find(t => t._id.toString() === taxId);
          if (tax) {
            return res.status(200).json({ tax });
          }
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate('taxes');
        if (superAdmin) {
          const tax = superAdmin.taxes.find(t => t._id.toString() === taxId);
          if (tax) {
            return res.status(200).json({ tax });
          }
        }
      }
      return res.status(404).json({ error: 'Tax not found' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  export const getDiscountById = async (req, res) => {
    const userId = req.userAuth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { discountId } = req.params;
      const employee = await EmployeeMod.findById(userId).populate('superAdminId');
      if (employee) {
        const superAdmin = await AdminModel.findById(employee.superAdminId).populate('discounts');
        if (superAdmin) {
          const discount = superAdmin.discounts.find(d => d._id.toString() === discountId);
          if (discount) {
            return res.status(200).json({ discount });
          }
        }
      } else {
        const superAdmin = await AdminModel.findById(userId).populate('discounts');
        if (superAdmin) {
          const discount = superAdmin.discounts.find(d => d._id.toString() === discountId);
          if (discount) {
            return res.status(200).json({ discount });
          }
        }
      }
      return res.status(404).json({ error: 'Discount not found' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };  

  
  export const editTax = async (req, res) => {
    try {
      const taxId = req.params.taxId;
      const updatedFields = req.body;
      const updatedTax = await TaxModel.findByIdAndUpdate(taxId, updatedFields, { new: true });
      if (!updatedTax) {
        return res.status(404).json({ message: 'Tax not found.' });
      }
      res.json({
        status: 'Success',
        data: updatedTax,
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  export const editDiscount = async (req, res) => {
    try {
      const discountId = req.params.discountId;
      const updatedFields = req.body;
      const updatedDiscount = await DiscountMod.findByIdAndUpdate(discountId, updatedFields, { new: true });
      if (!updatedDiscount) {
        return res.status(404).json({ message: 'Discount not found.' });
      }
      res.json({
        status: 'Success',
        data: updatedDiscount,
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  