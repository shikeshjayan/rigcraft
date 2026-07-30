import asyncHandler from "../utils/asyncHandler.js";
import * as couponService from "../services/coupon.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import orderRepository from "../repositories/order.repository.js";

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  ApiResponse.created(coupon, "Coupon created").send(res);
});

export const getCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getCoupons(req.query);
  ApiResponse.ok(result).send(res);
});

export const getActiveCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getCoupons({ isActive: "true" });
  
  if (req.user) {
    const orderCount = await orderRepository.countByUser(req.user._id);
    if (orderCount > 0) {
      result.coupons = result.coupons.filter(c => !c.isFirstOrderOnly);
    }
  }

  ApiResponse.ok(result).send(res);
});

export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCoupon(req.params.id);
  ApiResponse.ok(coupon).send(res);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  ApiResponse.ok(coupon, "Coupon updated").send(res);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  ApiResponse.ok(null, "Coupon deleted").send(res);
});
