import express from 'express';
import {
  createShipment,
  cancelShipment,
  shipShipment,
  deliverShipment,
  totalAmountForToday,
  totalShipmentsByMonth,
  AverageShipmentsPerMonth,
  TotalShipmentsForCurrentDay,
  shipmentInLastWeek,
  getAllShipments,
  getByStatus,
  shipmentsForLast30Days,
} from '../controller/shipment.controller.js';
import { loggedIn } from '../middleware/loginAccess.js';
import { isAdmin } from '../middleware/admin.js';
import { getShipmentItems } from './../controller/shipment.controller.js';

const shipmentRouter = express.Router();

shipmentRouter.post('/create', loggedIn, isAdmin, createShipment);

shipmentRouter.get('/all-shipments', loggedIn, isAdmin, getAllShipments);

shipmentRouter.get('/ship-items/:shipmentId', loggedIn, isAdmin, getShipmentItems);

shipmentRouter.get('/byStatus',  loggedIn, isAdmin, getByStatus);

shipmentRouter.put('/cancel/:shipmentId', loggedIn, isAdmin, cancelShipment); 

shipmentRouter.put('/ship/:shipmentId', loggedIn, isAdmin,shipShipment);

shipmentRouter.put('/delivered/:shipmentId', loggedIn, isAdmin, deliverShipment);

shipmentRouter.get('/latest-shipments', loggedIn, isAdmin, shipmentInLastWeek);

shipmentRouter.get('/total-amount', loggedIn, isAdmin, totalAmountForToday);

shipmentRouter.get('/total-for-period', loggedIn, isAdmin, shipmentsForLast30Days);

shipmentRouter.get('/total-by-month', loggedIn, isAdmin, totalShipmentsByMonth);

shipmentRouter.get('/average-per-month', loggedIn, isAdmin, AverageShipmentsPerMonth);

shipmentRouter.get('/total-for-current-day', loggedIn, isAdmin, TotalShipmentsForCurrentDay);

export default shipmentRouter;
