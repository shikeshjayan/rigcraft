import asyncHandler from "../utils/asyncHandler.js";
import * as wishlistService from "../services/wishlist.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  ApiResponse.ok(wishlist).send(res);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addToWishlist(req.user._id, req.body);
  ApiResponse.created(wishlist, "Item added to wishlist").send(res);
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(
    req.user._id,
    req.params.itemId
  );
  ApiResponse.ok(wishlist, "Item removed from wishlist").send(res);
});

export const moveToCart = asyncHandler(async (req, res) => {
  const { wishlist } = await wishlistService.moveToCart(
    req.user._id,
    req.params.itemId
  );
  ApiResponse.ok(wishlist, "Item moved to cart").send(res);
});

export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.clearWishlist(req.user._id);
  ApiResponse.ok(wishlist, "Wishlist cleared").send(res);
});
