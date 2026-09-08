import { Router } from "express";
import * as dealController from "../controllers/deal.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createDealSchema,
  updateDealSchema,
} from "../validators/deal.validator.js";
import { uploadFields } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();
const adminRouter = Router();

// ── Public routes ──────────────────────────────────────────────
router.get("/", dealController.getAll);
router.get("/active", dealController.getActive);
router.get("/promotions", dealController.getPromotions);
router.get("/:slug", dealController.getBySlug);

// ── Admin routes ───────────────────────────────────────────────

// List & search
adminRouter.get("/", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.deals.list), dealController.getAll);
adminRouter.get("/active-list", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.deals.list), dealController.getActiveForHomepage);

// Single deal
adminRouter.get("/:id", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), hasPermission(PERMISSIONS.deals.read), dealController.getById);

// Create
adminRouter.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.deals.create),
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
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.deals.update),
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
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.deals.toggleStatus),
  dealController.toggleStatus,
);

// Delete (admin only)
adminRouter.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.deals.delete),
  dealController.remove,
);

export default router;
export { adminRouter as adminDealRoutes };