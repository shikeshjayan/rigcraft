import { Router } from "express";
import * as dealController from "../controllers/deal.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createDealSchema,
  updateDealSchema,
} from "../validators/deal.validator.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();
const adminRouter = Router();

// ── Public routes ──────────────────────────────────────────────
router.get("/", dealController.getAll);
router.get("/active", dealController.getActive);
router.get("/:slug", dealController.getBySlug);

// ── Admin routes ───────────────────────────────────────────────
adminRouter.get("/", protect, authorize("admin"), dealController.getAll);

adminRouter.get("/:id", protect, authorize("admin"), dealController.getById);

adminRouter.post(
  "/",
  protect,
  authorize("admin"),
  uploadSingleImage("banner"),
  validate(createDealSchema),
  dealController.create,
);

adminRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadSingleImage("banner"),
  validate(updateDealSchema),
  dealController.update,
);

adminRouter.delete(
  "/",
  protect,
  authorize("admin"),
  dealController.removeEnded,
);

adminRouter.delete(
  "/:id",
  protect,
  authorize("admin"),
  dealController.remove,
);

export default router;
export { adminRouter as adminDealRoutes };
