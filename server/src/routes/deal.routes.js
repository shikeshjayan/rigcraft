import { Router } from "express";
import * as dealController from "../controllers/deal.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createDealSchema,
  updateDealSchema,
} from "../validators/deal.validator.js";
import { uploadFields } from "../middlewares/upload.middleware.js";

const router = Router();
const adminRouter = Router();

// ── Public routes ──────────────────────────────────────────────
router.get("/", dealController.getAll);
router.get("/active", dealController.getActive);
router.get("/:slug", dealController.getBySlug);

// ── Admin routes ───────────────────────────────────────────────

// List & search
adminRouter.get("/", protect, authorize("admin", "manager"), dealController.getAll);
adminRouter.get("/active-list", protect, authorize("admin", "manager"), dealController.getActiveForHomepage);

// Single deal
adminRouter.get("/:id", protect, authorize("admin", "manager"), dealController.getById);

// Create
adminRouter.post(
  "/",
  protect,
  authorize("admin", "manager"),
  uploadFields([
    { name: "desktopBanner", maxCount: 1 },
    { name: "mobileBanner", maxCount: 1 },
  ]),
  validate(createDealSchema),
  dealController.create,
);

// Update
adminRouter.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  uploadFields([
    { name: "desktopBanner", maxCount: 1 },
    { name: "mobileBanner", maxCount: 1 },
  ]),
  validate(updateDealSchema),
  dealController.update,
);

// Toggle active status
adminRouter.patch(
  "/:id/status",
  protect,
  authorize("admin", "manager"),
  dealController.toggleStatus,
);

// Delete (admin only)
adminRouter.delete(
  "/:id",
  protect,
  authorize("admin"),
  dealController.remove,
);

export default router;
export { adminRouter as adminDealRoutes };
