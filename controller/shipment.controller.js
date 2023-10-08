import ShipmentModel from "./../models/shipment.model.js";
import ProductModel from "../models/product.model.js";

export const createShipment = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { products, shipmentStatus, shipmentDate, recipient, deliveryFee } =
      req.body;
    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No products specified for shipment' });
    }
    let totalProductPrice = 0;
    for (const product of products) {
      const existingProduct = await ProductModel.findById(product.productId);
      if (!existingProduct) {
        return res.status(400).json({
          error: `Product not found for ID: ${product.productId}`,
        });
      }
      if (product.quantity > existingProduct.quantity  || product.quantity === 0) {
        return res.status(400).json({
          error: `Insufficient stock for product: ${existingProduct.name}`,
        });
      }
      existingProduct.quantity -= product.quantity;
      await existingProduct.save();

      totalProductPrice += existingProduct.price * product.quantity;
    }

    if (isNaN(deliveryFee)) {
      return res.status(400).json({ error: 'Invalid deliveryFee value' });
    }

    const totalFees = totalProductPrice + deliveryFee;

    if (isNaN(totalFees)) {
      return res.status(400).json({ error: 'Invalid totalFees value' });
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
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Unable to create shipment' });
  }
};




export const cancelShipment = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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

export const getAllShipments = async(req,res)=>{
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const shipments = await ShipmentModel.find();
    res.json({
      status: "success",
      message: "Shipments retrieved successfully",
      data: shipments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

export const getByStatus = async(req,res)=>{
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { status } = req.params;
    if (!["Pending", "Shipped", "Delivered", "Canceled"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid shipment status",
      });
    }
    const shipments = await ShipmentModel.find({ shipmentStatus: status });
    res.json({
      status: "success",
      message: `Shipments with status '${status}' retrieved successfully`,
      data: shipments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const shipShipment = async (req, res) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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
  const user = req.userAuth;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    // console.log("Today:", today);
    // console.log("End Date:", endDate);
    const totalAmount = await ShipmentModel.aggregate([
      {
        $match: {
          shipmentDate: { $gte: today, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalFees" },
        },
      },
    ]);
    // console.log("Total Amount:", totalAmount);
    if (totalAmount.length > 0) {
      res.json({ totalAmount: totalAmount[0].totalAmount });
    } else {
      res.json({ totalAmount: 0 });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Unable to calculate total amount" });
  }
};



export const shipmentInLastWeek = async (req, res) => {
  try {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    const [latestShipments, totalLatestShipments] = await Promise.all([
      ShipmentModel.find({
        shipmentDate: { $gte: sevenDaysAgo, $lte: currentDate },
      })
        .sort({ shipmentDate: -1 })
        .lean(),
      ShipmentModel.countDocuments({
        shipmentDate: { $gte: sevenDaysAgo, $lte: currentDate },
      }),
    ]);
    const formattedShipments = latestShipments.map((shipment) => ({
      shipmentId: shipment._id,
      shipmentDate: shipment.shipmentDate,
      recipient: shipment.recipient,
      totalFee: shipment.totalFees,
    }));
    res.json({ latestShipments: formattedShipments, totalLatestShipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch the latest shipments' });
  }
};



export const shipmentsForLast30Days = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const totalShipments = await ShipmentModel.countDocuments({
      shipmentDate: { $gte: startDate, $lte: endDate },
    });
    res.json({ totalShipments });
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total shipments" });
  }
};


export const totalShipmentsByMonth = async (req, res) => {
  try {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const totalShipmentsByMonth = [];
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(new Date().getFullYear(), month, 1);
      const endDate = new Date(new Date().getFullYear(), month + 1, 0);
      const totalShipments = await ShipmentModel.countDocuments({
        shipmentDate: { $gte: startDate, $lte: endDate },
      });
      totalShipmentsByMonth.push({
        month: monthNames[month],
        totalShipments: totalShipments
      });
    }
    res.json(totalShipmentsByMonth);
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate total shipments" });
  }
};



export const AverageShipmentsPerMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const totalShipments = await ShipmentModel.countDocuments({
      shipmentDate: { $gte: startDate, $lte: endDate },
    });
    const averageShipmentsPerDay = totalShipments / currentDay;
    res.json({ averageShipmentsPerDay });
  } catch (error) {
    res.status(500).json({ error: "Unable to calculate average shipments for the current month" });
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