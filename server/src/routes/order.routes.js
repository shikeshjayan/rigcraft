import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  checkoutSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../validators/order.validation.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.post(
  "/checkout",
  protect,
  hasPermission(PERMISSIONS.orders.create),
  validate(checkoutSchema),
  orderController.checkout
);

router.get("/", protect, hasPermission(PERMISSIONS.orders.read), orderController.getOrders);

router.get("/:id", protect, hasPermission(PERMISSIONS.orders.read), orderController.getOrder);

router.patch("/:id/cancel", protect, hasPermission(PERMISSIONS.orders.cancel), validate(cancelOrderSchema), orderController.cancelOrder);

export default router;

export const adminOrderRoutes = Router();

adminOrderRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  hasPermission(PERMISSIONS.orders.list),
  orderController.adminGetOrders
);

adminOrderRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  hasPermission(PERMISSIONS.orders.read),
  orderController.adminGetOrder
);

adminOrderRoutes.patch(
  "/:id/status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  hasPermission(PERMISSIONS.orders.manageStatus),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

adminOrderRoutes.patch(
  "/:id/payment-status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  hasPermission(PERMISSIONS.orders.managePaymentStatus),
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);
