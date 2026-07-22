import { Router } from "express";
import * as brandController from "../controllers/brand.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../validators/brand.validator.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", brandController.getAll);
router.get("/:id", brandController.getById);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadSingleImage("logo"),
  validate(createBrandSchema),
  brandController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadSingleImage("logo"),
  validate(updateBrandSchema),
  brandController.update
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  brandController.remove
);

export default router;
