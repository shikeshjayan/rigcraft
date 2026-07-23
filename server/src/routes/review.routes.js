import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../constants/constants.js";

const router = Router();

router.post(
  "/",
  protect,
  uploadMultipleImages("images", 5),
  validate(createReviewSchema),
  reviewController.createReview
);

router.put(
  "/:id",
  protect,
  uploadMultipleImages("images", 5),
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete("/:id", protect, reviewController.deleteReview);

router.get("/me", protect, reviewController.getMyReviews);

router.get("/product/:productId", reviewController.getProductReviews);

router.get("/prebuilt/:id", reviewController.getPrebuiltReviews);

export default router;

export const adminReviewRoutes = Router();

adminReviewRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  reviewController.adminGetAllReviews
);

adminReviewRoutes.patch(
  "/:id/visibility",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  reviewController.adminToggleVisibility
);

adminReviewRoutes.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  reviewController.adminDeleteReview
);
