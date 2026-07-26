import mongoose from "mongoose";
import orderRepository from "../repositories/order.repository.js";
import addressRepository from "../repositories/address.repository.js";
import couponRepository from "../repositories/coupon.repository.js";
import productRepository from "../repositories/product.repository.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import buildRepository from "../repositories/build.repository.js";
import * as couponService from "./coupon.service.js";
import * as pricingService from "./pricing.service.js";
import * as cartService from "./cart.service.js";
import ApiError from "../utils/ApiError.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

const ORDER_NUMBER_PREFIX = "RIG";
const CHECKOUT_EXPIRY_MINUTES = 30;
const ORDER_NUMBER_RETRIES = 5;

export const generateOrderNumber = async () => {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yy}${mm}${dd}`;

  for (let attempt = 0; attempt < ORDER_NUMBER_RETRIES; attempt++) {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderNumber = `${ORDER_NUMBER_PREFIX}-${dateStr}-${random}`;

    const existing = await orderRepository.findByOrderNumber(orderNumber);
    if (!existing) return orderNumber;
  }

  throw ApiError.internal("Failed to generate unique order number");
};

const buildOrderItems = (cartItems) => {
  return cartItems.map((item) => {
    let name = "";
    let sku = "";

    if (item.item) {
      name = item.item.name || "";
      sku = item.item.sku || "";
    }

    return {
      itemType: item.itemType,
      item: item.item?._id || item.item,
      itemModel: item.itemTypeModel,
      name,
      sku,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.totalPrice,
    };
  });
};

const reduceStock = async (orderItems) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of orderItems) {
      if (item.itemType === "product") {
        await productRepository.model.findByIdAndUpdate(
          item.item,
          {
            $inc: { stock: -item.quantity, soldCount: item.quantity },
          },
          { session }
        );
      } else if (item.itemType === "prebuilt") {
        await prebuiltPCRepository.model.findByIdAndUpdate(
          item.item,
          {
            $inc: { stock: -item.quantity, soldCount: item.quantity },
          },
          { session }
        );
      } else if (item.itemType === "savedBuild") {
        const build = await buildRepository.model
          .findById(item.item)
          .populate("components.product")
          .session(session);

        if (build && build.components) {
          for (const component of build.components) {
            if (component.product) {
              await productRepository.model.findByIdAndUpdate(
                component.product._id,
                {
                  $inc: {
                    stock: -component.quantity * item.quantity,
                    soldCount: component.quantity * item.quantity,
                  },
                },
                { session }
              );
            }
          }
        }
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const clearCartAfterOrder = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;

  cart.items = [];
  cart.coupon = null;
  cart.discount = 0;

  const totals = await pricingService.recalculateCart(cart);
  cart.subtotal = totals.subtotal;
  cart.shippingCharge = totals.shippingCharge;
  cart.tax = totals.tax;
  cart.total = totals.total;

  await cart.save({ validateBeforeSave: false });
};

export const checkout = async (userId, { addressId, paymentMethod }) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.item")
    .populate("coupon");

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("Cart is empty");
  }

  const stockCheck = await cartService.validateStock(userId);
  if (!stockCheck.valid) {
    throw ApiError.badRequest(
      `Stock issues: ${stockCheck.issues.join("; ")}`
    );
  }

  let coupon = null;
  if (cart.coupon) {
    const code = cart.coupon.code || cart.coupon;
    coupon = await couponService.validateCoupon(
      code,
      userId,
      cart.subtotal,
      cart.items
    );
  }

  const address = await addressRepository.findById(addressId);
  if (address.user.toString() !== userId.toString()) {
    throw ApiError.notFound("Address not found");
  }

  const totals = {
    subtotal: cart.subtotal,
    discount: cart.discount,
    shippingCharge: cart.shippingCharge,
    tax: cart.tax,
    total: cart.total,
  };

  const orderNumber = await generateOrderNumber();

  const orderData = {
    orderNumber,
    user: userId,
    items: buildOrderItems(cart.items),
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      alternatePhone: address.alternatePhone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    },
    coupon: coupon
      ? { code: coupon.code, discount: totals.discount }
      : undefined,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingCharge: totals.shippingCharge,
    tax: totals.tax,
    total: totals.total,
    paymentMethod,
  };

  if (paymentMethod === "razorpay") {
    orderData.orderStatus = "pending";
    orderData.paymentStatus = "pending";
    orderData.checkoutExpiresAt = new Date(
      Date.now() + CHECKOUT_EXPIRY_MINUTES * 60 * 1000
    );

    const order = await orderRepository.create(orderData);

    return { order };
  }

  if (paymentMethod === "cod") {
    orderData.orderStatus = "confirmed";
    orderData.paymentStatus = "pending";

    const order = await orderRepository.create(orderData);

    await reduceStock(order.items);

    if (coupon) {
      await couponService.incrementUsage(coupon._id);
    }

    await clearCartAfterOrder(userId);

    return { order };
  }

  throw ApiError.badRequest("Invalid payment method");
};

export const confirmPayment = async (orderId, razorpayPaymentId) => {
  const order = await orderRepository.findById(orderId);

  if (order.paymentStatus === "paid") {
    return order;
  }

  if (order.paymentStatus === "failed" || order.orderStatus === "cancelled") {
    throw ApiError.badRequest("Cannot confirm payment for this order");
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.razorpay.paymentId = razorpayPaymentId;
  order.checkoutExpiresAt = undefined;
  await order.save({ validateBeforeSave: false });

  await reduceStock(order.items);

  if (order.coupon?.code) {
    const couponDoc = await couponRepository.findByCode(order.coupon.code);
    if (couponDoc) {
      await couponService.incrementUsage(couponDoc._id);
    }
  }

  await clearCartAfterOrder(order.user);

  return order;
};

export const getOrders = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const orders = await orderRepository.findByUser(userId, {
    sort: { createdAt: -1 },
    page,
    limit,
  });
  const total = await orderRepository.countByUser(userId);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getOrder = async (orderId, userId) => {
  const order = await orderRepository.findById(orderId);

  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only view your own orders");
  }

  return order;
};

export const cancelOrder = async (orderId, userId) => {
  const order = await orderRepository.findById(orderId);

  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only cancel your own orders");
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    throw ApiError.badRequest(
      `Order cannot be cancelled in "${order.orderStatus}" status`
    );
  }

  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }

  order.orderStatus = "cancelled";
  await order.save({ validateBeforeSave: false });

  return order;
};

export const adminGetAllOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    orderStatus,
    paymentStatus,
    paymentMethod,
    search,
  } = query;

  const filter = {};

  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) {
    filter.$or = [{ orderNumber: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email"),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const adminGetOrder = async (orderId) => {
  const order = await Order.findById(orderId).populate(
    "user",
    "name email phone"
  );

  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  return order;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await orderRepository.findById(orderId);

  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const allowed = validTransitions[order.orderStatus] || [];
  if (!allowed.includes(orderStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from "${order.orderStatus}" to "${orderStatus}"`
    );
  }

  order.orderStatus = orderStatus;

  if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }

  await order.save({ validateBeforeSave: false });

  return order;
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  const order = await orderRepository.findById(orderId);

  order.paymentStatus = paymentStatus;
  await order.save({ validateBeforeSave: false });

  return order;
};
