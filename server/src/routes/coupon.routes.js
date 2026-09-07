import { Router } from "express";
import * as couponController from "../controllers/coupon.controller.js";
import { protect, authorize, optionalProtect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../validators/coupon.validation.js";

import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get("/active", optionalProtect, couponController.getActiveCoupons);

router.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORDER_MANAGER),
  couponController.getCoupons
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  couponController.getCoupon
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  couponController.deleteCoupon
);

export default router;
