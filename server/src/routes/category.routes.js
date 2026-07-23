import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadSingleImage("image"),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadSingleImage("image"),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  categoryController.remove
);

export default router;
