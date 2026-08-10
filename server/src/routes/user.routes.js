import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.js";
import { createUserSchema } from "../validators/user.validator.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  validate(createUserSchema),
  userController.create
);

router.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.list
);

router.get(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getById
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  uploadSingleImage("avatar"),
  userController.update
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  userController.remove
);

router.patch(
  "/:id/block",
  protect,
  authorize(USER_ROLES.ADMIN),
  userController.block
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize(USER_ROLES.ADMIN),
  userController.deactivate
);

router.get(
  "/:id/orders",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getUserOrders
);

router.get(
  "/:id/addresses",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getUserAddresses
);

router.get(
  "/:id/reviews",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getUserReviews
);

router.get(
  "/:id/wishlist",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getUserWishlist
);

router.get(
  "/:id/builds",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getUserBuilds
);

export default router;
