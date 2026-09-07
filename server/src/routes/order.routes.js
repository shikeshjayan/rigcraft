import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  checkoutSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../validators/order.validation.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.post(
  "/checkout",
  protect,
  validate(checkoutSchema),
  orderController.checkout
);

router.get("/", protect, orderController.getOrders);

router.get("/:id", protect, orderController.getOrder);

router.patch("/:id/cancel", protect, validate(cancelOrderSchema), orderController.cancelOrder);

export default router;

export const adminOrderRoutes = Router();

adminOrderRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  orderController.adminGetOrders
);

adminOrderRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  orderController.adminGetOrder
);

adminOrderRoutes.patch(
  "/:id/status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

adminOrderRoutes.patch(
  "/:id/payment-status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.ORDER_MANAGER),
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);


