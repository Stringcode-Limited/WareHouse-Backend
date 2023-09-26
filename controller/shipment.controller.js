import ShipmentModel from "./../models/shipment.model.js";
import ProductModel from "../models/product.model.js";

export const createShipment = async (req, res) => {
  try {
    const { products, shipmentStatus, shipmentDate, recipient, deliveryFee } =
      req.body;
    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No products specified for shipment' });
    }
    const totalProductPrice = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    const totalFees = totalProductPrice + deliveryFee;
    for (const product of products) {
      const existingProduct = await ProductModel.findById(product.productId);
      if (!existingProduct || product.quantity > existingProduct.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product: ${product.productId}`,
        });
      }
      existingProduct.quantity -= product.quantity;
      await existingProduct.save();
    }
    const shipment = new ShipmentModel({
      products,
      shipmentStatus,
      shipmentDate,
      recipient,
      deliveryFee,
      totalFees,
    });
    const newShipment = await shipment.save();
    res.status(201).json(newShipment);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create shipment' });
  }
};


export const cancelShipment = async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const canceledShipment = await ShipmentModel.findByIdAndUpdate(
      shipmentId,
      { shipmentStatus: "Canceled" },
      { new: true }
    );
    if (!canceledShipment) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    res.status({
      data: "Success",
      message: "Shipment canceled successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to cancel shipment" });
  }
};

export const shipShipment = async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const shippedShipment = await ShipmentModel.findByIdAndUpdate(
      shipmentId,
      { shipmentStatus: "Shipped" },
      { new: true }
    );
    if (!shippedShipment) {
      return res.status(404).json({ message: "Shipment not found." });
    }
    res.status({
      data: "Success",
      message: "Shipped successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to Ship" });
  }
};

export const deliverShipment = async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const deliveredShipment = await ShipmentModel.findByIdAndUpdate(
      shipmentId,
      { shipmentStatus: "Delivered" },
      { new: true }
    );
    if (!deliveredShipment) {
      return res.status(404).json({ message: "Shipment not found." });
    }
    res.json({ message: "Shipment delivered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Unable to deliver shipment" });
  }
};


export const averageAmountPerMonth = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$shipmentDate' },
            month: { $month: '$shipmentDate' },
          },
          totalAmount: { $sum: '$totalFees' },
        },
      },
      {
        $group: {
          _id: null,
          averageAmount: { $avg: '$totalAmount' },
        },
      },
    ];
    const result = await ShipmentModel.aggregate(pipeline);
    if (result.length === 0) {
      return res.json({ averageAmount: 0 });
    }
    const averageAmount = result[0].averageAmount;
    res.json({ averageAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to calculate average amount per month' });
  }
};


export const totalAmountForToday = async (req, res) => {
  try {
    const { day } = req.params;
    const startDate = new Date(day);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(day);
    endDate.setHours(23, 59, 59, 999);
    const totalAmount = await ShipmentModel.aggregate([
      {
        $match: {
          shipmentDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalFees" },
        },
      },
    ]);
    if (totalAmount.length > 0) {
      res.json({ totalAmount: totalAmount[0].totalAmount });
    } else {
      res.json({ totalAmount: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total amount" });
  }
};

export const shipmentInLastWeek = async (req, res) => {
  try {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    const latestShipment = await ShipmentModel.findOne({
      shipmentDate: { $gte: sevenDaysAgo, $lte: currentDate },
    })
      .sort({ shipmentDate: -1 })
      .limit(1);

    res.json({ latestShipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch the latest shipment' });
  }
};

export const shipmentsForPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalShipments = await ShipmentModel.countDocuments({
      shipmentDate: { $gte: start, $lte: end },
    });
    res.json({ totalShipments });
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total shipments" });
  }
};

export const totalShipmentsByMonth = async (req, res) => {
  try {
    const totalShipmentsByMonth = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(new Date().getFullYear(), month, 1);
      const endDate = new Date(new Date().getFullYear(), month + 1, 0);
      const totalShipments = await ShipmentModel.countDocuments({
        shipmentDate: { $gte: startDate, $lte: endDate },
      });
      totalShipmentsByMonth.push({ month: month + 1, totalShipments });
    }
    res.json(totalShipmentsByMonth);
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total shipments" });
  }
};

export const AverageShipmentsPerMonth = async (req, res) => {
  try {
    const totalShipmentsByMonth = await totalShipmentsByMonth();
    const totalMonths = 12;
    const totalShipments = totalShipmentsByMonth.reduce(
      (total, { totalShipments }) => total + totalShipments,
      0
    );
    const averageShipmentsPerMonth = totalShipments / totalMonths;
    res.json({ averageShipmentsPerMonth });
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate average shipments" });
  }
};


export const TotalShipmentsForCurrentDay = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalShipments = await ShipmentModel.countDocuments({
      shipmentDate: { $gte: today, $lte: today },
    });
    res.json({ totalShipments });
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total shipments" });
  }
};


export const totalAmountForPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalAmount = await ShipmentModel.aggregate([
      {
        $match: {
          shipmentDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalFees' },
        },
      },
    ]);
    if (totalAmount.length === 0) {
      return res.json({ totalAmount: 0 });
    }
    res.json({ totalAmount: totalAmount[0].totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to calculate total amount' });
  }
};