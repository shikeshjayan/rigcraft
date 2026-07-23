import * as reviewService from "../services/review.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user._id,
    req.body,
    req.files
  );
  ApiResponse.created(review, "Review created successfully").send(res);
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user._id,
    req.body,
    req.files
  );
  ApiResponse.ok(review, "Review updated successfully").send(res);
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user._id);
  ApiResponse.ok(null, "Review deleted successfully").send(res);
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getUserReviews(req.user._id, req.query);
  ApiResponse.ok(result, "Reviews fetched successfully").send(res);
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(
    req.params.productId,
    "product",
    req.query
  );
  ApiResponse.ok(result, "Reviews fetched successfully").send(res);
});

export const getPrebuiltReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(
    req.params.id,
    "prebuilt",
    req.query
  );
  ApiResponse.ok(result, "Reviews fetched successfully").send(res);
});

export const adminGetAllReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.adminGetAllReviews(req.query);
  ApiResponse.ok(result, "All reviews fetched successfully").send(res);
});

export const adminToggleVisibility = asyncHandler(async (req, res) => {
  const review = await reviewService.toggleVisibility(req.params.id);
  const msg = review.isVisible
    ? "Review is now visible"
    : "Review has been hidden";
  ApiResponse.ok(review, msg).send(res);
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
  await reviewService.adminDeleteReview(req.params.id);
  ApiResponse.ok(null, "Review deleted by admin").send(res);
});
