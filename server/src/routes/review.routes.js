import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { hasPermission } from "../middlewares/permission.js";
import validate from "../middlewares/validate.js";
import {
  createProductReviewSchema,
  createTestimonialSchema,
  updateReviewSchema,
  updateReviewStatusSchema,
  featureReviewSchema,
  reportReviewSchema,
  adminReplySchema,
} from "../validators/review.validator.js";
import { uploadMultipleImages } from "../middlewares/upload.middleware.js";
import { USER_ROLES } from "../constants/constants.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = Router();

router.post(
  "/product",
  protect,
  hasPermission(PERMISSIONS.reviews.create),
  uploadMultipleImages("images", 5),
  validate(createProductReviewSchema),
  reviewController.createReview
);

router.post(
  "/testimonial",
  protect,
  hasPermission(PERMISSIONS.reviews.create),
  uploadMultipleImages("images", 5),
  validate(createTestimonialSchema),
  reviewController.createReview
);

router.get("/testimonials", reviewController.getTestimonials);

router.put(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.reviews.update),
  uploadMultipleImages("images", 5),
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete("/:id", protect, hasPermission(PERMISSIONS.reviews.delete), reviewController.deleteReview);

router.patch("/:id/helpful", protect, reviewController.toggleHelpful);

router.post(
  "/:id/report",
  protect,
  validate(reportReviewSchema),
  reviewController.reportReview
);

router.get("/me", protect, reviewController.getMyReviews);

router.get("/product/:productId", reviewController.getProductReviews);

router.get("/prebuilt/:id", reviewController.getPrebuiltReviews);

export default router;

export const adminReviewRoutes = Router();

adminReviewRoutes.get(
  "/stats",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.reviews.read),
  reviewController.getReviewStats
);

adminReviewRoutes.get(
  "/",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.reviews.list),
  reviewController.adminGetAllReviews
);

adminReviewRoutes.get(
  "/:id",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPPORT_EXECUTIVE),
  hasPermission(PERMISSIONS.reviews.read),
  reviewController.adminGetReview
);

adminReviewRoutes.patch(
  "/:id/status",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.reviews.moderate),
  validate(updateReviewStatusSchema),
  reviewController.adminUpdateStatus
);

adminReviewRoutes.patch(
  "/:id/feature",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.reviews.toggleFeatured),
  validate(featureReviewSchema),
  reviewController.adminToggleFeatured
);

adminReviewRoutes.patch(
  "/:id/reply",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.reviews.reply),
  validate(adminReplySchema),
  reviewController.adminReply
);

adminReviewRoutes.patch(
  "/:id/dismiss-reports",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.reviews.dismissReports),
  reviewController.dismissReports
);

adminReviewRoutes.patch(
  "/:id/clear-spam",
  protect,
  authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  hasPermission(PERMISSIONS.reviews.clearSpam),
  reviewController.adminClearSpam
);

adminReviewRoutes.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  hasPermission(PERMISSIONS.reviews.delete),
  reviewController.adminDeleteReview
);