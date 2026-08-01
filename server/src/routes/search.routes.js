import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.get("/", searchController.publicSearch);

const adminSearchRoutes = Router();

adminSearchRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  searchController.adminSearch
);

export { adminSearchRoutes };
export default router;
