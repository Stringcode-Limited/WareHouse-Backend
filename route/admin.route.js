import express  from "express";
import { adminLogin, setSuperAdmin } from "../controller/personnel.controller.js";

const adminRouter = express.Router();

adminRouter.post('/Initialize-SuperAdmin', setSuperAdmin);

adminRouter.post('/admin-log-in', adminLogin);

export default adminRouter;