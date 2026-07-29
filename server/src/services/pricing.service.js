import { getSettings } from "../models/settings.model.js";
import { DISCOUNT_TYPES } from "../constants/constants.js";
import Coupon from "../models/coupon.model.js";

export const calculateSubtotal = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
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

export const calculateShipping = (
  subtotal,
  settings,
  isFreeShipping = false,
) => {
  if (isFreeShipping) return 0;

  if (
    settings.shipping.freeShippingThreshold > 0 &&
    subtotal >= settings.shipping.freeShippingThreshold
  ) {
    return 0;
  }

  return settings.shipping.standardRate || 0;
};

export const calculateTax = (amount, settings) => {
  if (!settings.tax || !settings.tax.rate) return 0;
  if (settings.tax.pricesIncludeTax) return 0;
  return Math.round(amount * settings.tax.rate * 100) / 100;
};

export const calculateGrandTotal = (subtotal, discount, shipping, tax) => {
  return Math.round((subtotal - discount + shipping + tax) * 100) / 100;
};

export const roundPrice = (value) => {
  return Math.round(value * 100) / 100;
};

const resolveCoupon = async (couponRef) => {
  if (!couponRef) return null;
  if (typeof couponRef === "object" && couponRef.discountType) return couponRef;
  const id = couponRef._id || couponRef;
  return Coupon.findById(id);
};

export const recalculateCart = async (cart, removedCouponInfo = null) => {
  const settings = await getSettings();

  const subtotal = roundPrice(calculateSubtotal(cart.items));

  const coupon = await resolveCoupon(cart.coupon);

  let discount = 0;
  let couponRemoved = false;
  let couponMessage = null;

  if (coupon) {
    discount = roundPrice(calculateDiscount(coupon, subtotal));
  }

  if (removedCouponInfo) {
    couponRemoved = true;
    couponMessage = removedCouponInfo.message;
    discount = 0;
  }

  const isFreeShipping =
    coupon && coupon.discountType === DISCOUNT_TYPES.FREE_SHIPPING;

  const shippingCharge = roundPrice(
    calculateShipping(subtotal, settings, isFreeShipping),
  );

  const taxableAmount = roundPrice(subtotal - discount);
  const tax = calculateTax(taxableAmount, settings);

  const total = calculateGrandTotal(subtotal, discount, shippingCharge, tax);

  return {
    subtotal,
    discount,
    shippingCharge,
    tax,
    total,
    couponRemoved,
    message: couponMessage,
  };
};
