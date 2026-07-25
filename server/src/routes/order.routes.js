import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  checkoutSchema,
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

router.patch("/:id/cancel", protect, orderController.cancelOrder);

export default router;

export const adminOrderRoutes = Router();

adminOrderRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  orderController.adminGetOrders
);

adminOrderRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  orderController.adminGetOrder
);

adminOrderRoutes.patch(
  "/:id/status",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

adminOrderRoutes.patch(
  "/:id/payment-status",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);


