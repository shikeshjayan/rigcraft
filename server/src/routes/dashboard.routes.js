import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.get(
  "/stats",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getStats
);

router.get(
  "/sales",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getSalesData
);

router.get(
  "/recent-orders",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getRecentOrders
);

router.get(
  "/low-stock-products",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getLowStockProducts
);

router.get(
  "/top-products",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getTopProducts
);

router.get(
  "/order-breakdown",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  dashboardController.getOrderBreakdown
);

export default router;
