import { Router } from "express";
import * as brandController from "../controllers/brand.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../validators/brand.validator.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

import { USER_ROLES } from "../constants/constants.js";

const router = Router();

// Public
router.get("/", brandController.getAll);
router.get("/all", brandController.getAll);
router.get("/:id", brandController.getById);

// Admin
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadSingleImage("logo"),
  validate(createBrandSchema),
  brandController.create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PRODUCT_MANAGER),
  uploadSingleImage("logo"),
  validate(updateBrandSchema),
  brandController.update
);

router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  brandController.remove
);

export default router;
