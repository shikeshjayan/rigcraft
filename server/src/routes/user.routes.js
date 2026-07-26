import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

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

export default router;
