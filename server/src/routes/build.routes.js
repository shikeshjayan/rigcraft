import { Router } from "express";
import * as buildController from "../controllers/build.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../constants/constants.js";
import validate from "../middlewares/validate.js";
import {
  createBuildSchema,
  updateBuildSchema,
  duplicateBuildSchema,
  updateBuildSettingsSchema,
} from "../validators/build.validation.js";

const router = Router();

router.post("/", protect, validate(createBuildSchema), buildController.createBuild);

router.get("/admin", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), buildController.adminGetAllBuilds);

router.get("/admin/analytics", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), buildController.getBuildAnalytics);

router.get("/admin/issues", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), buildController.getCompatibilityIssues);

router.post("/admin/settings", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), validate(updateBuildSettingsSchema), buildController.updateBuildSettings);

router.get("/settings", buildController.getBuildSettings);

router.get("/admin/settings", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), buildController.getBuildSettings);

router.get("/", protect, buildController.getUserBuilds);

router.get("/:id", protect, buildController.getBuild);

router.put("/:id", protect, validate(updateBuildSchema), buildController.updateBuild);

router.delete("/:id", protect, buildController.deleteBuild);

router.post("/:id/duplicate", protect, validate(duplicateBuildSchema), buildController.duplicateBuild);

router.post("/:id/validate", protect, buildController.validateBuild);

router.post("/:id/add-to-cart", protect, buildController.addToCart);

export default router;