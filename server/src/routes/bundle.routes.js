import { Router } from "express";
import * as bundleController from "../controllers/bundle.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createBundleSchema,
  updateBundleSchema,
} from "../validators/bundle.validator.js";
import { uploadFields } from "../middlewares/upload.middleware.js";

const router = Router();
const adminRouter = Router();

// ── Public routes ──────────────────────────────────────────────
router.get("/", bundleController.getActive);
router.get("/active", bundleController.getActive);
router.get("/:slug", bundleController.getBySlug);

// ── Admin routes ───────────────────────────────────────────────
adminRouter.get("/", protect, authorize("admin", "manager"), bundleController.getAll);
adminRouter.get("/:id", protect, authorize("admin", "manager"), bundleController.getById);

adminRouter.post(
  "/",
  protect,
  authorize("admin", "manager"),
  uploadFields([{ name: "image", maxCount: 1 }]),
  validate(createBundleSchema),
  bundleController.create,
);

adminRouter.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  uploadFields([{ name: "image", maxCount: 1 }]),
  validate(updateBundleSchema),
  bundleController.update,
);

adminRouter.patch(
  "/:id/status",
  protect,
  authorize("admin", "manager"),
  bundleController.toggleStatus,
);

adminRouter.delete(
  "/:id",
  protect,
  authorize("admin"),
  bundleController.remove,
);

export default router;
export { adminRouter as adminBundleRoutes };
