import { Router } from "express";
import * as prebuiltPCController from "../controllers/prebuiltPC.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createPrebuiltPCSchema,
  updatePrebuiltPCSchema,
} from "../validators/prebuiltPC.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";

import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

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
  hasPermission(PERMISSIONS.prebuilts.create),
  uploadMultipleImages("images", 10),
  validate(createPrebuiltPCSchema),
  prebuiltPCController.create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.prebuilts.update),
  uploadMultipleImages("images", 10),
  validate(updatePrebuiltPCSchema),
  prebuiltPCController.update
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.prebuilts.delete),
  prebuiltPCController.remove
);

export default router;