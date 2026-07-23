import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
} from "../validators/cart.validation.js";

const router = Router();

router.get("/", protect, cartController.getCart);

router.post("/items", protect, validate(addItemSchema), cartController.addItem);

router.put(
  "/items/:itemId",
  protect,
  validate(updateQuantitySchema),
  cartController.updateItem
);

router.delete("/items/:itemId", protect, cartController.removeItem);

router.delete("/", protect, cartController.clearCart);

router.post(
  "/apply-coupon",
  protect,
  validate(applyCouponSchema),
  cartController.applyCoupon
);

router.delete("/remove-coupon", protect, cartController.removeCoupon);

export default router;
