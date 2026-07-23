import couponRepository from "../repositories/coupon.repository.js";
import ApiError from "../utils/ApiError.js";
import { DISCOUNT_TYPES, COUPON_APPLICABLE_TO } from "../constants/constants.js";

export const createCoupon = async (data) => {
  const existing = await couponRepository.findByCode(data.code);
  if (existing) throw ApiError.conflict("Coupon code already exists");

  return couponRepository.create(data);
};

export const updateCoupon = async (id, data) => {
  const coupon = await couponRepository.findById(id);

  if (data.code && data.code !== coupon.code) {
    const existing = await couponRepository.findByCode(data.code);
    if (existing) throw ApiError.conflict("Coupon code already exists");
  }

  return couponRepository.updateById(id, data);
};

export const deleteCoupon = async (id) => {
  return couponRepository.deleteById(id);
};

export const getCoupon = async (id) => {
  return couponRepository.findById(id);
};

export const getCoupons = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    isActive,
    discountType,
    search,
  } = query;

  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (discountType) filter.discountType = discountType;
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }

  const coupons = await couponRepository.findAll(filter, { sort });
  const total = await couponRepository.count(filter);

  return {
    coupons,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const validateCoupon = async (code, userId, subtotal, cartItems) => {
  const coupon = await couponRepository.findByCode(code);
  if (!coupon) throw ApiError.notFound("Coupon not found");

  if (!coupon.isActive) throw ApiError.badRequest("Coupon is no longer active");

  const now = new Date();
  if (now < coupon.validFrom) throw ApiError.badRequest("Coupon is not yet valid");
  if (now > coupon.validUntil) throw ApiError.badRequest("Coupon has expired");

  if (coupon.minimumPurchase > 0 && subtotal < coupon.minimumPurchase) {
    throw ApiError.badRequest(
      `Minimum purchase of ₹${coupon.minimumPurchase} required`
    );
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest("Coupon usage limit has been reached");
  }

  // TODO: After Order module
  // if (coupon.usageLimitPerUser) {
  //   const userUsage = await Order.countDocuments({
  //     user: userId,
  //     coupon: coupon._id,
  //     paymentStatus: "paid",
  //   });
  //   if (userUsage >= coupon.usageLimitPerUser) {
  //     throw ApiError.badRequest("You have already used this coupon");
  //   }
  // }

  // TODO: After Order module
  // if (coupon.isFirstOrderOnly) {
  //   const orderCount = await Order.countDocuments({
  //     user: userId,
  //     paymentStatus: "paid",
  //   });
  //   if (orderCount > 0) {
  //     throw ApiError.badRequest("This coupon is valid for first order only");
  //   }
  // }

  if (coupon.applicableTo !== COUPON_APPLICABLE_TO.ALL) {
    validateEligibility(coupon, cartItems);
  }

  return coupon;
};

const validateEligibility = (coupon, cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    throw ApiError.badRequest("Cart is empty");
  }

  if (coupon.applicableTo === COUPON_APPLICABLE_TO.PRODUCT) {
    const qualifyingItems = cartItems.filter((item) => {
      if (item.itemType !== "product") return false;
      const productId = item.item?._id?.toString() || item.item?.toString();
      return coupon.products.some(
        (p) => p.toString() === productId
      );
    });

    if (qualifyingItems.length === 0) {
      throw ApiError.badRequest("Coupon not applicable to items in cart");
    }
  }

  if (coupon.applicableTo === COUPON_APPLICABLE_TO.CATEGORY) {
    const qualifyingItems = cartItems.filter((item) => {
      if (item.itemType !== "product") return false;
      const product = item.item;
      if (!product || !product.category) return false;
      const categoryId = product.category._id?.toString() || product.category.toString();
      return coupon.categories.some(
        (c) => c.toString() === categoryId
      );
    });

    if (qualifyingItems.length === 0) {
      throw ApiError.badRequest("Coupon not applicable to items in cart");
    }
  }

  if (coupon.applicableTo === COUPON_APPLICABLE_TO.PREBUILT) {
    const qualifyingItems = cartItems.filter((item) => {
      if (item.itemType !== "prebuilt") return false;
      const prebuiltId = item.item?._id?.toString() || item.item?.toString();
      return coupon.prebuiltPcs.some(
        (p) => p.toString() === prebuiltId
      );
    });

    if (qualifyingItems.length === 0) {
      throw ApiError.badRequest("Coupon not applicable to items in cart");
    }
  }
};

export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;

  if (coupon.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    const discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscount) {
      return Math.min(discount, coupon.maximumDiscount);
    }
    return discount;
  }

  if (coupon.discountType === DISCOUNT_TYPES.FIXED) {
    return Math.min(coupon.discountValue, subtotal);
  }

  return 0;
};

export const incrementUsage = async (couponId) => {
  return couponRepository.incrementUsage(couponId);
};
