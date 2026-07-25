import { Router } from "express";
import * as prebuiltPCController from "../controllers/prebuiltPC.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createPrebuiltPCSchema,
  updatePrebuiltPCSchema,
} from "../validators/prebuiltPC.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", prebuiltPCController.list);
router.get("/featured", prebuiltPCController.getFeatured);
router.get("/category/:category", prebuiltPCController.getByCategory);
router.get("/:id", prebuiltPCController.getById);
router.get("/:slug/similar", prebuiltPCController.getSimilar);
router.get("/:slug/components", prebuiltPCController.getComponentProducts);
router.get("/:slug", prebuiltPCController.getBySlug);

// Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadMultipleImages("images", 10),
  validate(createPrebuiltPCSchema),
  prebuiltPCController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadMultipleImages("images", 10),
  validate(updatePrebuiltPCSchema),
  prebuiltPCController.update
);

router.delete("/:id", protect, authorize("admin"), prebuiltPCController.remove);

export default router;
