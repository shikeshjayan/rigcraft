import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.get(
  "/stats",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getStats
);

router.get(
  "/sales",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getSalesData
);

router.get(
  "/recent-orders",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getRecentOrders
);

export default router;
