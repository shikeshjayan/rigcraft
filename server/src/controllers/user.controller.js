import * as userService from "../services/user.service.js";
import * as orderService from "../services/order.service.js";
import * as addressService from "../services/address.service.js";
import * as reviewService from "../services/review.service.js";
import * as wishlistService from "../services/wishlist.service.js";
import * as buildService from "../services/build.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  ApiResponse.created(user, "User created").send(res);
});

export const list = asyncHandler(async (req, res) => {
  const result = await userService.list(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  ApiResponse.ok(user).send(res);
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateById(req.params.id, req.body, req.file);
  ApiResponse.ok(user, "User updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteById(req.params.id);
  ApiResponse.ok(null, "User deleted").send(res);
});

export const block = asyncHandler(async (req, res) => {
  const user = await userService.blockUser(req.params.id);
  const msg = user.isBlocked ? "User blocked" : "User unblocked";
  ApiResponse.ok(user, msg).send(res);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.adminGetUserOrders(req.params.id, req.query);
  ApiResponse.ok(result).send(res);
});

export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.adminGetUserAddresses(req.params.id);
  ApiResponse.ok(addresses).send(res);
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.adminGetUserReviews(req.params.id, req.query);
  ApiResponse.ok(result).send(res);
});

export const getUserWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.adminGetUserWishlist(req.params.id);
  ApiResponse.ok(wishlist).send(res);
});

export const getUserBuilds = asyncHandler(async (req, res) => {
  const result = await buildService.getUserBuilds(req.params.id, req.query);
  ApiResponse.ok(result).send(res);
});
