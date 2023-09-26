import express from 'express';
import {
  createShipment,
  cancelShipment,
  shipShipment,
  deliverShipment,
  totalAmountForToday,
  shipmentsForPeriod,
  totalShipmentsByMonth,
  AverageShipmentsPerMonth,
  TotalShipmentsForCurrentDay,
  shipmentInLastWeek,
  getAllShipments,
  getByStatus,
} from '../controller/shipment.controller.js';
import { loggedIn } from '../middleware/loginAccess.js';
import { isAdmin } from '../middleware/admin.js';

const shipmentRouter = express.Router();

shipmentRouter.post('/create', loggedIn, isAdmin, createShipment);

shipmentRouter.get('/all-shipments', getAllShipments);

shipmentRouter.get('/byStatus', getByStatus);

shipmentRouter.put('/cancel/:shipmentId', loggedIn, isAdmin, cancelShipment); 

shipmentRouter.put('/ship/:shipmentId', loggedIn, isAdmin,shipShipment);

shipmentRouter.put('/delivered/:shipmentId', loggedIn, isAdmin, deliverShipment);

shipmentRouter.get('/latest-shipments', loggedIn, isAdmin, shipmentInLastWeek);

shipmentRouter.get('/total-amount/:day', loggedIn, isAdmin, totalAmountForToday);

shipmentRouter.get('/total-for-period/:startDate/:endDate', loggedIn, isAdmin, shipmentsForPeriod);

shipmentRouter.get('/total-by-month', loggedIn, isAdmin, totalShipmentsByMonth);

shipmentRouter.get('/average-per-month', loggedIn, isAdmin, AverageShipmentsPerMonth);

shipmentRouter.get('/total-for-current-day', loggedIn, isAdmin, TotalShipmentsForCurrentDay);

export default shipmentRouter;
