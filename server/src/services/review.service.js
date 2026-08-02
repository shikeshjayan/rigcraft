import reviewRepository from "../repositories/review.repository.js";
import productRepository from "../repositories/product.repository.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import Order from "../models/order.model.js";
import { getSettings } from "../models/settings.model.js";
import * as uploadService from "./upload.service.js";
import { moderateReview } from "./moderation.service.js";
import ApiError from "../utils/ApiError.js";

const FOLDER = "reviews";

const ITEM_MODEL_MAP = {
  product: "Product",
  prebuilt: "PrebuiltPC",
};

const verifyPurchase = async (userId, itemId, itemType) => {
  const order = await Order.findOne({
    user: userId,
    paymentStatus: "paid",
    orderStatus: { $ne: "cancelled" },
    items: { $elemMatch: { item: itemId, itemType } },
  });
  return !!order;
};

export const createReview = async (userId, data, files) => {
  const { reviewType = "product", rating, title, comment } = data;
  const isWebsite = reviewType === "website";

  const settings = await getSettings();

  if (settings.review && !settings.review.allowReviews) {
    throw ApiError.forbidden("Reviews are currently disabled");
  }

  const isPurchased = await verifyPurchase(userId, item, itemType);

    const isPurchased = await verifyPurchase(userId, item, itemType);
    if (!isPurchased) {
      throw ApiError.forbidden("You must purchase this item before reviewing");
    }

    const existing = await reviewRepository.findOneByUserAndItem(
      userId,
      item,
      itemType
    );
    if (existing) {
      throw ApiError.conflict("You have already reviewed this item");
    }

    itemModel = ITEM_MODEL_MAP[itemType];
    isVerifiedPurchase = true;
  }

  let images = [];
  const allowImages = settings.review?.allowImages !== false;
  if (files && files.length > 0 && allowImages) {
    const maxImages = settings.review?.maxImages || 5;
    if (files.length > maxImages) {
      throw ApiError.badRequest(`Maximum ${maxImages} images allowed per review`);
    }
    const uploaded = await uploadService.uploadMultipleImages(files, FOLDER);
    images = uploaded.map((img) => ({ ...img, alt: title || "Review image" }));
  }

  const moderation = await moderateReview({
    title: title || "",
    comment: comment || "",
  });

  const createData = {
    reviewType,
    user: userId,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: isPurchased,
    status: settings.review?.autoApprove ? "approved" : "pending",
  };

  if (isWebsite) {
    createData.displayOrder = data.displayOrder || 0;
  } else {
    createData.itemType = itemType;
    createData.item = item;
    createData.itemModel = itemModel;
  }

  if (moderation.status === "rejected") {
    createData.status = "rejected";
  }
  if (moderation.spamFlagged) {
    createData.spamFlagged = true;
    createData.spamScore = moderation.spamScore;
    createData.spamReason = moderation.spamReason;
  }

  const review = await reviewRepository.create(createData);

  if (!isWebsite) {
    await recalculateRating(item, itemType);
  }

  return review;
};

export const updateReview = async (reviewId, userId, data, files) => {
  const review = await reviewRepository.findWithUser(reviewId);
  if (!review) throw ApiError.notFound("Review not found");

  if (review.user._id.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only edit your own reviews");
  }

  const updateData = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.comment !== undefined) updateData.comment = data.comment;

  if (files && files.length > 0) {
    for (const img of review.images) {
      if (img.publicId) {
        try {
          await uploadService.deleteImage(img.publicId);
        } catch {
          // best-effort
        }
      }
    }
    const uploaded = await uploadService.uploadMultipleImages(files, FOLDER);
    updateData.images = uploaded.map((img) => ({
      ...img,
      alt: data.title || review.title || "Review image",
    }));
  }

  if (updateData.comment !== undefined) {
    const moderation = await moderateReview({
      title: updateData.title ?? review.title ?? "",
      comment: updateData.comment,
    });
    if (moderation.status === "rejected") {
      updateData.status = "rejected";
    }
    if (moderation.spamFlagged) {
      updateData.spamFlagged = true;
      updateData.spamScore = moderation.spamScore;
      updateData.spamReason = moderation.spamReason;
    }
  }

  const updated = await reviewRepository.updateById(reviewId, updateData);
  if (review.reviewType === "product") {
    await recalculateRating(review.item, review.itemType);
  }

  return updated;
};

export const deleteReview = async (reviewId, userId) => {
  const review = await reviewRepository.findWithUser(reviewId);
  if (!review) throw ApiError.notFound("Review not found");

  if (review.user._id.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only delete your own reviews");
  }

  for (const img of review.images) {
    if (img.publicId) {
      try {
        await uploadService.deleteImage(img.publicId);
      } catch {
        // best-effort
      }
    }
  }

  await reviewRepository.deleteById(reviewId);
  if (review.reviewType === "product") {
    await recalculateRating(review.item, review.itemType);
  }
};

export const toggleHelpful = async (reviewId, userId) => {
  const review = await reviewRepository.findById(reviewId);

  const hasVoted = (review.helpfulVotes || []).some(
    (id) => id.toString() === userId.toString()
  );

  if (hasVoted) {
    return reviewRepository.removeHelpfulVote(reviewId, userId);
  }
  return reviewRepository.addHelpfulVote(reviewId, userId);
};

export const reportReview = async (reviewId, userId, { reason, note }) => {
  const review = await reviewRepository.findById(reviewId);

  if (review.user.toString() === userId.toString()) {
    throw ApiError.forbidden("You cannot report your own review");
  }

  const alreadyReported = (review.reports || []).some(
    (r) => r.user.toString() === userId.toString()
  );
  if (alreadyReported) {
    throw ApiError.conflict("You have already reported this review");
  }

  return reviewRepository.addReport(reviewId, { user: userId, reason, note });
};

export const getTestimonials = async () => {
  return reviewRepository.findTestimonials();
};

export const getProductReviews = async (itemId, itemType, query) => {
  const { page = 1, limit = 20, sort, rating } = query;

  const sortOptions = {};
  if (sort === "highest") sortOptions.rating = -1;
  else if (sort === "lowest") sortOptions.rating = 1;
  else sortOptions.createdAt = -1;

  return reviewRepository.findByItem(itemId, itemType, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
    rating: rating ? Number(rating) : undefined,
  });
};

export const getUserReviews = async (userId, query) => {
  const { page = 1, limit = 20, sort } = query;

  const sortOptions = {};
  if (sort === "highest") sortOptions.rating = -1;
  else if (sort === "lowest") sortOptions.rating = 1;
  else sortOptions.createdAt = -1;

  return reviewRepository.findByUser(userId, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
  });
};

export const adminGetUserReviews = async (userId, query) => {
  const { page = 1, limit = 20 } = query;
  return reviewRepository.adminFindAll({
    page: Number(page),
    limit: Number(limit),
    filter: { user: userId },
  });
};

export const adminGetAllReviews = async (query) => {
  const {
    page = 1,
    limit = 20,
    sort,
    search,
    status,
    rating,
    reviewType,
    featured,
    reported,
    spamFlagged,
  } = query;

  const sortOptions = {};
  if (sort === "newest") sortOptions.createdAt = -1;
  else if (sort === "oldest") sortOptions.createdAt = 1;
  else if (sort === "highest") sortOptions.rating = -1;
  else if (sort === "lowest") sortOptions.rating = 1;
  else sortOptions.createdAt = -1;

  const extraFilter = {};
  if (["pending", "approved", "rejected"].includes(status)) {
    extraFilter.status = status;
  }
  if (rating) extraFilter.rating = Number(rating);
  if (["product", "website"].includes(reviewType)) {
    extraFilter.reviewType = reviewType;
  }
  if (featured === "true") extraFilter.featured = true;
  if (reported === "true") extraFilter["reports.0"] = { $exists: true };
  if (spamFlagged === "true") extraFilter.spamFlagged = true;
  if (search) {
    extraFilter.$or = [
      { title: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
    ];
  }

  return reviewRepository.adminFindAll({
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
    filter: extraFilter,
  });
};

export const adminGetReview = async (reviewId) => {
  const review = await reviewRepository.findWithUser(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  return review;
};

export const adminUpdateStatus = async (reviewId, status) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  await reviewRepository.updateById(reviewId, { status });
  if (review.reviewType === "product") {
    await recalculateRating(review.item, review.itemType);
  }
  return reviewRepository.findWithUser(reviewId);
};

export const adminToggleFeatured = async (reviewId, { featured, displayOrder }) => {
  const review = await reviewRepository.findById(reviewId);
  if (review.reviewType !== "website") {
    throw ApiError.badRequest("Only website testimonials can be featured");
  }

  const updateData = {};
  if (featured !== undefined) updateData.featured = !!featured;
  if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);

  await reviewRepository.updateById(reviewId, updateData);
  return reviewRepository.findWithUser(reviewId);
};

export const adminReply = async (reviewId, adminId, text) => {
  await reviewRepository.findById(reviewId);

  if (!text) {
    await reviewRepository.updateById(reviewId, {
      adminReply: { text: "", admin: null, repliedAt: null },
    });
  } else {
    await reviewRepository.updateById(reviewId, {
      adminReply: { text, admin: adminId, repliedAt: new Date() },
    });
  }

  return reviewRepository.findWithUser(reviewId);
};

export const dismissReports = async (reviewId) => {
  await reviewRepository.findById(reviewId);
  await reviewRepository.clearReports(reviewId);
  return reviewRepository.findWithUser(reviewId);
};

export const clearSpamFlag = async (reviewId) => {
  await reviewRepository.findById(reviewId);
  await reviewRepository.clearSpamFlag(reviewId);
  return reviewRepository.findWithUser(reviewId);
};

export const getReviewStats = async () => {
  return reviewRepository.getReviewStats();
};

export const adminDeleteReview = async (reviewId) => {
  const review = await reviewRepository.findById(reviewId);

  for (const img of review.images) {
    if (img.publicId) {
      try {
        await uploadService.deleteImage(img.publicId);
      } catch {
        // best-effort
      }
    }
  }

  await reviewRepository.deleteById(reviewId);
  if (review.reviewType === "product") {
    await recalculateRating(review.item, review.itemType);
  }
};

const recalculateRating = async (itemId, itemType) => {
  const stats = await reviewRepository.getRatingStats(itemId, itemType);

  const rating = {
    average: Math.round(stats.average * 10) / 10 || 0,
    count: stats.count || 0,
  };

  const updateRepo =
    itemType === "product" ? productRepository : prebuiltPCRepository;

  try {
    await updateRepo.updateById(itemId, { rating });
  } catch {
    // item may have been deleted — skip
  }
};
