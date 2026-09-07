import { Router } from "express";
import * as prebuiltPCController from "../controllers/prebuiltPC.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createPrebuiltPCSchema,
  updatePrebuiltPCSchema,
} from "../validators/prebuiltPC.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

import { USER_ROLES } from "../constants/constants.js";

const router = Router();

// Public
router.get("/", prebuiltPCController.list);
router.get("/featured", prebuiltPCController.getFeatured);
router.get("/category/:category", prebuiltPCController.getByCategory);
router.get("/:slugOrId/similar", prebuiltPCController.getSimilar);
router.get("/:slugOrId/components", prebuiltPCController.getComponentProducts);
router.get("/:slugOrId", prebuiltPCController.getBySlugOrId);

// Admin
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadMultipleImages("images", 10),
  validate(createPrebuiltPCSchema),
  prebuiltPCController.create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadMultipleImages("images", 10),
  validate(updatePrebuiltPCSchema),
  prebuiltPCController.update
);

router.delete("/:id", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER), prebuiltPCController.remove);

export default router;
