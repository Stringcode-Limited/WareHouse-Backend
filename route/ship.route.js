import express from 'express';
import {
  createShipment,
  cancelShipment,
  shipShipment,
  deliverShipment,
  totalShipmentForDay,
  shipmentsForPeriod,
  totalShipmentsByMonth,
  calculateAverageShipmentsPerMonth,
  calculateTotalShipmentsForCurrentDay,
} from '../controller/shipment.controller.js';
import { loggedIn } from '../middleware/loginAccess.js';
import { isAdmin } from '../middleware/admin.js';

const shipmentRouter = express.Router();

shipmentRouter.post('/create', loggedIn, isAdmin, createShipment);

shipmentRouter.put('/cancel/:shipmentId', loggedIn, isAdmin, cancelShipment); 

shipmentRouter.put('/ship/:shipmentId', loggedIn, isAdmin,shipShipment);

shipmentRouter.put('/delivered/:shipmentId', loggedIn, isAdmin, deliverShipment);

shipmentRouter.get('/total-for-day/:day', loggedIn, isAdmin, totalShipmentForDay);

shipmentRouter.get('/total-for-period/:startDate/:endDate', loggedIn, isAdmin, shipmentsForPeriod);

shipmentRouter.get('/total-by-month', loggedIn, isAdmin, totalShipmentsByMonth);

shipmentRouter.get('/average-per-month', loggedIn, isAdmin, calculateAverageShipmentsPerMonth);

shipmentRouter.get('/total-for-current-day', loggedIn, isAdmin, calculateTotalShipmentsForCurrentDay);

export default shipmentRouter;
