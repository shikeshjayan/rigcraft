import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

// Public
router.get("/", categoryController.getAll);
router.get("/all", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Admin
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.categories.create),
  uploadSingleImage("image"),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.categories.update),
  uploadSingleImage("image"),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.categories.delete),
  categoryController.remove
);

export default router;