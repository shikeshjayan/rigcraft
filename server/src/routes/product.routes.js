import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

import { USER_ROLES } from "../constants/constants.js";

const router = Router();

// Public
router.get("/", productController.list);
router.get("/featured", productController.getFeatured);
router.get("/:slugOrId/related", productController.getRelated);
router.get("/:slugOrId", productController.getBySlugOrId);

// Admin
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadMultipleImages("images", 10),
  validate(createProductSchema),
  productController.create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadMultipleImages("images", 10),
  validate(updateProductSchema),
  productController.update
);

router.delete("/:id", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), productController.remove);

export default router;
