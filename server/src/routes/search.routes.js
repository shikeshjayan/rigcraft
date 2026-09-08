import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.get("/", searchController.publicSearch);

const adminSearchRoutes = Router();

adminSearchRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.PRODUCT_MANAGER, USER_ROLES.ORDER_MANAGER, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.search.admin),
  searchController.adminSearch
);

export { adminSearchRoutes };
export default router;