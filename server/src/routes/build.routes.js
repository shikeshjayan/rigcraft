import { Router } from "express";
import * as buildController from "../controllers/build.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createBuildSchema,
  updateBuildSchema,
  duplicateBuildSchema,
  updateBuildSettingsSchema,
} from "../validators/build.validation.js";

const router = Router();

router.post("/", protect, validate(createBuildSchema), buildController.createBuild);

router.get("/admin", protect, authorize("admin"), buildController.adminGetAllBuilds);

router.get("/admin/analytics", protect, authorize("admin"), buildController.getBuildAnalytics);

router.get("/admin/issues", protect, authorize("admin"), buildController.getCompatibilityIssues);

router.post("/admin/settings", protect, authorize("admin"), validate(updateBuildSettingsSchema), buildController.updateBuildSettings);

router.get("/", protect, buildController.getUserBuilds);

router.get("/:id", protect, buildController.getBuild);

router.put("/:id", protect, validate(updateBuildSchema), buildController.updateBuild);

router.delete("/:id", protect, buildController.deleteBuild);

router.post("/:id/duplicate", protect, validate(duplicateBuildSchema), buildController.duplicateBuild);

router.post("/:id/validate", protect, buildController.validateBuild);

router.post("/:id/add-to-cart", protect, buildController.addToCart);

export default router;