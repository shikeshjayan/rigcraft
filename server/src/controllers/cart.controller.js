import asyncHandler from "../utils/asyncHandler.js";
import * as cartService from "../services/cart.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  ApiResponse.ok(cart).send(res);
});

export const addItem = asyncHandler(async (req, res) => {
  const result = await cartService.addItem(req.user._id, req.body);
  const response = { cart: result.cart };
  if (result.couponRemoved) {
    response.couponRemoved = true;
    response.message = result.message;
  }
  ApiResponse.ok(response, "Item added to cart").send(res);
});

export const updateItem = asyncHandler(async (req, res) => {
  const result = await cartService.updateQuantity(
    req.user._id,
    req.params.itemId,
    req.body.quantity
  );
  const response = { cart: result.cart };
  if (result.couponRemoved) {
    response.couponRemoved = true;
    response.message = result.message;
  }
  ApiResponse.ok(response, "Quantity updated").send(res);
});

export const removeItem = asyncHandler(async (req, res) => {
  const result = await cartService.removeItem(req.user._id, req.params.itemId);
  const response = { cart: result.cart };
  if (result.couponRemoved) {
    response.couponRemoved = true;
    response.message = result.message;
  }
  ApiResponse.ok(response, "Item removed").send(res);
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  ApiResponse.ok(null, "Cart cleared").send(res);
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const result = await cartService.applyCoupon(req.user._id, req.body.code);
  ApiResponse.ok(result.cart, "Coupon applied").send(res);
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const result = await cartService.removeCoupon(req.user._id);
  ApiResponse.ok(result.cart, "Coupon removed").send(res);
});
