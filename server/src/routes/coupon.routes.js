import { Router } from "express";
import * as couponController from "../controllers/coupon.controller.js";
import { protect, authorize, optionalProtect } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../validators/coupon.validation.js";

import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.coupons.create),
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get("/active", optionalProtect, couponController.getActiveCoupons);

router.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORDER_MANAGER),
  hasPermission(PERMISSIONS.coupons.list),
  couponController.getCoupons
);

router.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.coupons.read),
  couponController.getCoupon
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.coupons.update),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.coupons.delete),
  couponController.deleteCoupon
);

export default router;