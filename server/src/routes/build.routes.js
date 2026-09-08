import { Router } from "express";
import * as buildController from "../controllers/build.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";
import validate from "../middlewares/validate.js";
import {
  createBuildSchema,
  updateBuildSchema,
  duplicateBuildSchema,
  updateBuildSettingsSchema,
} from "../validators/build.validation.js";

const router = Router();

router.post("/", protect, hasPermission(PERMISSIONS.builds.create), validate(createBuildSchema), buildController.createBuild);

router.get("/admin", protect, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), hasPermission(PERMISSIONS.builds.adminList), buildController.adminGetAllBuilds);

router.get("/admin/analytics", protect, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), hasPermission(PERMISSIONS.builds.analytics), buildController.getBuildAnalytics);

router.get("/admin/issues", protect, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), hasPermission(PERMISSIONS.builds.compatibilityIssues), buildController.getCompatibilityIssues);

router.post("/admin/settings", protect, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), hasPermission(PERMISSIONS.builds.settingsUpdate), validate(updateBuildSettingsSchema), buildController.updateBuildSettings);

router.get("/settings", buildController.getBuildSettings);

router.get("/admin/settings", protect, authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), hasPermission(PERMISSIONS.builds.settingsRead), buildController.getBuildSettings);

router.get("/", protect, hasPermission(PERMISSIONS.builds.list), buildController.getUserBuilds);

router.get("/:id", protect, hasPermission(PERMISSIONS.builds.read), buildController.getBuild);

router.put("/:id", protect, hasPermission(PERMISSIONS.builds.update), validate(updateBuildSchema), buildController.updateBuild);

router.delete("/:id", protect, hasPermission(PERMISSIONS.builds.delete), buildController.deleteBuild);

router.post("/:id/duplicate", protect, hasPermission(PERMISSIONS.builds.duplicate), validate(duplicateBuildSchema), buildController.duplicateBuild);

router.post("/:id/validate", protect, hasPermission(PERMISSIONS.builds.validate), buildController.validateBuild);

router.post("/:id/add-to-cart", protect, hasPermission(PERMISSIONS.builds.addToCart), buildController.addToCart);

export default router;