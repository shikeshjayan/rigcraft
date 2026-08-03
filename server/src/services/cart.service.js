import cartRepository from "../repositories/cart.repository.js";
import productRepository from "../repositories/product.repository.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import buildRepository from "../repositories/build.repository.js";
import * as couponService from "./coupon.service.js";
import * as pricingService from "./pricing.service.js";
import ApiError from "../utils/ApiError.js";
import { CART_ITEM_TYPES } from "../constants/constants.js";
import Cart from "../models/cart.model.js";
import { getSettings } from "../models/settings.model.js";

const ITEM_TYPE_MODEL_MAP = {
  [CART_ITEM_TYPES.PRODUCT]: "Product",
  [CART_ITEM_TYPES.PREBUILT]: "PrebuiltPC",
  [CART_ITEM_TYPES.SAVED_BUILD]: "SavedBuild",
};

const resolveItemPrice = async (itemType, itemId, quantity) => {
  let effectivePrice;

  if (itemType === CART_ITEM_TYPES.PRODUCT) {
    const product = await productRepository.findById(itemId);
    if (product.status !== "active") {
      throw ApiError.badRequest("Product is not available");
    }
    const settings = await getSettings();
    const allowBackorders = settings?.inventory?.allowBackorders === true;
    if (!allowBackorders && product.stock < quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
    }
    effectivePrice =
      product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    return {
      itemType,
      item: product._id,
      itemTypeModel: ITEM_TYPE_MODEL_MAP[itemType],
      price: effectivePrice,
      quantity,
      totalPrice: effectivePrice * quantity,
    };
  }

  if (itemType === CART_ITEM_TYPES.PREBUILT) {
    const prebuilt = await prebuiltPCRepository.findById(itemId);
    if (prebuilt.status !== "active") {
      throw ApiError.badRequest("Prebuilt PC is not available");
    }
    const settings = await getSettings();
    const allowBackorders = settings?.inventory?.allowBackorders === true;
    if (!allowBackorders && prebuilt.stock < quantity) {
      throw ApiError.badRequest(`Insufficient stock for ${prebuilt.name}`);
    }
    effectivePrice =
      prebuilt.pricing.salePrice && prebuilt.pricing.salePrice > 0
        ? prebuilt.pricing.salePrice
        : prebuilt.pricing.price;
    return {
      itemType,
      item: prebuilt._id,
      itemTypeModel: ITEM_TYPE_MODEL_MAP[itemType],
      price: effectivePrice,
      quantity,
      totalPrice: effectivePrice * quantity,
    };
  }

  if (itemType === CART_ITEM_TYPES.SAVED_BUILD) {
    const build = await buildRepository.findById(itemId);
    effectivePrice = build.totalSalePrice || build.totalPrice;
    return {
      itemType,
      item: build._id,
      itemTypeModel: ITEM_TYPE_MODEL_MAP[itemType],
      price: effectivePrice,
      quantity,
      totalPrice: effectivePrice * quantity,
    };
  }

  throw ApiError.badRequest("Invalid item type");
};

const findDuplicateItemIndex = (cartItems, itemType, itemId) => {
  if (itemType === CART_ITEM_TYPES.SAVED_BUILD) return -1;

  return cartItems.findIndex(
    (cartItem) =>
      cartItem.itemType === itemType &&
      cartItem.item.toString() === itemId.toString()
  );
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const saveAndPopulate = async (cart) => {
  await cart.save({ validateBeforeSave: false });
  await cart.populate([
    {
      path: "items.item",
      populate: {
        path: "components.product",
        model: "Product",
        strictPopulate: false
      }
    },
    { path: "coupon" }
  ]);
  return cart;
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate([
    {
      path: "items.item",
      populate: {
        path: "components.product",
        model: "Product",
        strictPopulate: false
      }
    },
    { path: "coupon" }
  ]);
  return cart;
};

export const addItem = async (userId, { itemType, itemId, quantity }) => {
  const resolved = await resolveItemPrice(itemType, itemId, quantity);

  const cart = await getOrCreateCart(userId);

  const duplicateIndex = findDuplicateItemIndex(cart.items, itemType, itemId);

  if (duplicateIndex > -1) {
    const existing = cart.items[duplicateIndex];
    const newQty = existing.quantity + quantity;

    const stockItem =
      itemType === CART_ITEM_TYPES.PRODUCT
        ? await productRepository.findById(itemId)
        : await prebuiltPCRepository.findById(itemId);

    if (stockItem.stock < newQty) {
      throw ApiError.badRequest("Insufficient stock.");
    }

    existing.quantity = newQty;
    existing.price = resolved.price;
    existing.totalPrice = resolved.price * newQty;
  } else {
    cart.items.push(resolved);
  }

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  if (totals.couponRemoved) {
    cart.coupon = null;
    cart.discount = 0;
  } else {
    cart.discount = totals.discount;
  }
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  const saved = await saveAndPopulate(cart);

  if (totals.couponRemoved) {
    return {
      cart: saved,
      couponRemoved: true,
      message: totals.message,
    };
  }

  return { cart: saved };
};

export const updateQuantity = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Item not found in cart");

  const settings = await getSettings();
  const allowBackorders = settings?.inventory?.allowBackorders === true;

  if (item.itemType === CART_ITEM_TYPES.PRODUCT) {
    const product = await productRepository.findById(item.item);
    if (!allowBackorders && product.stock < quantity) {
      throw ApiError.badRequest("Insufficient stock.");
    }
  }

  if (item.itemType === CART_ITEM_TYPES.PREBUILT) {
    const prebuilt = await prebuiltPCRepository.findById(item.item);
    if (!allowBackorders && prebuilt.stock < quantity) {
      throw ApiError.badRequest("Insufficient stock.");
    }
  }

  item.quantity = quantity;
  item.totalPrice = item.price * quantity;

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  if (totals.couponRemoved) {
    cart.coupon = null;
    cart.discount = 0;
  } else {
    cart.discount = totals.discount;
  }
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  const saved = await saveAndPopulate(cart);

  if (totals.couponRemoved) {
    return {
      cart: saved,
      couponRemoved: true,
      message: totals.message,
    };
  }

  return { cart: saved };
};

export const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Item not found in cart");

  const removedItemType = item.itemType;
  item.deleteOne();

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  if (totals.couponRemoved) {
    cart.coupon = null;
    cart.discount = 0;
  } else {
    cart.discount = totals.discount;
  }
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  const saved = await saveAndPopulate(cart);

  if (totals.couponRemoved) {
    return {
      cart: saved,
      couponRemoved: true,
      message: totals.message,
    };
  }

  return { cart: saved };
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  cart.items = [];
  cart.coupon = null;
  cart.discount = 0;

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  await saveAndPopulate(cart);
  return null;
};

export const applyCoupon = async (userId, code) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate("items.item");

  const subtotal = pricingService.calculateSubtotal(cart.items);

  const coupon = await couponService.validateCoupon(
    code,
    userId,
    subtotal,
    cart.items
  );

  cart.coupon = coupon._id;

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  cart.discount = totals.discount;
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  const saved = await saveAndPopulate(cart);
  return { cart: saved };
};

export const removeCoupon = async (userId) => {
  const cart = await getOrCreateCart(userId);

  cart.coupon = null;
  cart.discount = 0;

  const totals = await pricingService.recalculateCart(cart);

  cart.subtotal = totals.subtotal;
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  const saved = await saveAndPopulate(cart);
  return { cart: saved };
};

export const validateStock = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate([
    {
      path: "items.item",
      populate: {
        path: "components.product",
        model: "Product",
        strictPopulate: false
      }
    }
  ]);

  const settings = await getSettings();
  if (settings?.inventory?.allowBackorders === true) {
    return { valid: true, issues: [] };
  }

  const issues = [];

  for (const item of cart.items) {
    if (item.itemType === CART_ITEM_TYPES.PRODUCT) {
      const product = item.item;
      if (!product || product.stock < item.quantity) {
        issues.push(
          `"${product?.name || "Product"}" has insufficient stock`
        );
      }
    }

    if (item.itemType === CART_ITEM_TYPES.PREBUILT) {
      const prebuilt = item.item;
      if (!prebuilt || prebuilt.stock < item.quantity) {
        issues.push(
          `"${prebuilt?.name || "Prebuilt PC"}" has insufficient stock`
        );
      }
    }

    if (item.itemType === CART_ITEM_TYPES.SAVED_BUILD) {
      const build = item.item;
      if (build && build.components && build.components.length > 0) {
        for (const component of build.components) {
          if (component.product && component.product.stock < 1) {
            issues.push(
              `"${component.product.name || "Component"}" in saved build "${build.name}" is out of stock`
            );
          }
        }
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};
