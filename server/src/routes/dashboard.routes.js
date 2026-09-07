import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.get(
  "/stats",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.read),
  dashboardController.getStats
);

router.get(
  "/sales",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.sales),
  dashboardController.getSalesData
);

router.get(
  "/recent-orders",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.recentOrders),
  dashboardController.getRecentOrders
);

router.get(
  "/low-stock-products",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.lowStock),
  dashboardController.getLowStockProducts
);

router.get(
  "/top-products",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.topProducts),
  dashboardController.getTopProducts
);

router.get(
  "/order-breakdown",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.dashboard.orderBreakdown),
  dashboardController.getOrderBreakdown
);

export default router;