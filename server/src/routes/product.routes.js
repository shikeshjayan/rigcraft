import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", productController.list);
router.get("/featured", productController.getFeatured);
router.get("/:id", productController.getById);
router.get("/:slug/related", productController.getRelated);
router.get("/:slug", productController.getBySlug);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadMultipleImages("images", 10),
  validate(createProductSchema),
  productController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadMultipleImages("images", 10),
  validate(updateProductSchema),
  productController.update
);

router.delete("/:id", protect, authorize("admin"), productController.remove);

export default router;
