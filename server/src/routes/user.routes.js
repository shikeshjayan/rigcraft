import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.js";
import { createUserSchema } from "../validators/user.validator.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.users.create),
  validate(createUserSchema),
  userController.create
);

router.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.list),
  userController.list
);

router.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getById
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.users.update),
  uploadSingleImage("avatar"),
  userController.update
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.users.delete),
  userController.remove
);

router.patch(
  "/:id/block",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.users.block),
  userController.block
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.users.deactivate),
  userController.deactivate
);

router.get(
  "/:id/orders",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getUserOrders
);

router.get(
  "/:id/addresses",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getUserAddresses
);

router.get(
  "/:id/reviews",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getUserReviews
);

router.get(
  "/:id/wishlist",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getUserWishlist
);

router.get(
  "/:id/builds",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.users.read),
  userController.getUserBuilds
);

export default router;