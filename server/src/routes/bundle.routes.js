import { Router } from "express";
import * as bundleController from "../controllers/bundle.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createBundleSchema,
  updateBundleSchema,
} from "../validators/bundle.validator.js";
import { uploadFields } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();
const adminRouter = Router();

// ── Public routes ──────────────────────────────────────────────
router.get("/", bundleController.getActive);
router.get("/active", bundleController.getActive);
router.get("/:slug", bundleController.getBySlug);

// ── Admin routes ───────────────────────────────────────────────
adminRouter.get("/", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.bundles.list), bundleController.getAll);
adminRouter.get("/:id", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.bundles.read), bundleController.getById);

adminRouter.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.bundles.create),
  uploadFields([{ name: "image", maxCount: 1 }]),
  validate(createBundleSchema),
  bundleController.create,
);

adminRouter.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.bundles.update),
  uploadFields([{ name: "image", maxCount: 1 }]),
  validate(updateBundleSchema),
  bundleController.update,
);

adminRouter.patch(
  "/:id/status",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  hasPermission(PERMISSIONS.bundles.toggleStatus),
  bundleController.toggleStatus,
);

adminRouter.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.bundles.delete),
  bundleController.remove,
);

export default router;
export { adminRouter as adminBundleRoutes };