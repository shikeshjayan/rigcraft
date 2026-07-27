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

router.get(
  "/low-stock-products",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getLowStockProducts
);

router.get(
  "/top-products",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getTopProducts
);

router.get(
  "/order-breakdown",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  dashboardController.getOrderBreakdown
);

export default router;
