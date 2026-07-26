import wishlistRepository from "../repositories/wishlist.repository.js";
import productRepository from "../repositories/product.repository.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import * as cartService from "../services/cart.service.js";
import ApiError from "../utils/ApiError.js";
import { CART_ITEM_TYPES } from "../constants/constants.js";

const ITEM_MODEL_MAP = {
  [CART_ITEM_TYPES.PRODUCT]: "Product",
  [CART_ITEM_TYPES.PREBUILT]: "PrebuiltPC",
};

const resolveItem = async (itemType, itemId) => {
  if (itemType === CART_ITEM_TYPES.PRODUCT) {
    const product = await productRepository.findById(itemId);
    return {
      itemType,
      item: product._id,
      itemModel: ITEM_MODEL_MAP[itemType],
    };
  }

  if (itemType === CART_ITEM_TYPES.PREBUILT) {
    const prebuilt = await prebuiltPCRepository.findById(itemId);
    return {
      itemType,
      item: prebuilt._id,
      itemModel: ITEM_MODEL_MAP[itemType],
    };
  }

  throw ApiError.badRequest("Invalid item type");
};

const getOrCreateWishlist = async (userId) => {
  let wishlist = await wishlistRepository.findByUser(userId);
  if (!wishlist) {
    wishlist = await wishlistRepository.create({ user: userId, items: [] });
  }
  return wishlist;
};

export const getWishlist = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  await wishlist.populate("items.item");
  return wishlist;
};

export const addToWishlist = async (userId, { itemType, itemId }) => {
  const resolved = await resolveItem(itemType, itemId);

  const wishlist = await getOrCreateWishlist(userId);

  const exists = wishlist.items.some(
    (i) => i.itemType === itemType && i.item.toString() === itemId.toString()
  );
  if (exists) {
    throw ApiError.conflict("Item already in wishlist");
  }

  wishlist.items.push(resolved);
  await wishlist.save();
  await wishlist.populate("items.item");
  return wishlist;
};

export const removeFromWishlist = async (userId, itemId) => {
  const wishlist = await getOrCreateWishlist(userId);

  const item = wishlist.items.find((i) => i.item.toString() === itemId);
  if (!item) throw ApiError.notFound("Item not found in wishlist");

  item.deleteOne();
  await wishlist.save();
  return wishlist;
};

export const moveToCart = async (userId, itemId) => {
  const wishlist = await getOrCreateWishlist(userId);

  const wishlistItem = wishlist.items.find((i) => i.item.toString() === itemId);
  if (!wishlistItem) throw ApiError.notFound("Item not found in wishlist");

  await cartService.addItem(userId, {
    itemType: wishlistItem.itemType,
    itemId: wishlistItem.item,
    quantity: 1,
  });

  wishlistItem.deleteOne();
  await wishlist.save();

  return { wishlist, itemType: wishlistItem.itemType };
};

export const clearWishlist = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.items = [];
  await wishlist.save();
  return wishlist;
};
