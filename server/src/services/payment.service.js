import crypto from "crypto";
import getRazorpay from "../config/razorpay.js";
import orderRepository from "../repositories/order.repository.js";
import * as orderService from "./order.service.js";
import ApiError from "../utils/ApiError.js";

const validateOrderForPayment = (order) => {
  if (!order) throw ApiError.notFound("Order not found");

  if (order.paymentMethod !== "razorpay") {
    throw ApiError.badRequest("Payment method is not Razorpay");
  }

  if (order.paymentStatus === "paid") {
    throw ApiError.badRequest("Order is already paid");
  }

  if (order.paymentStatus === "failed") {
    throw ApiError.badRequest("Order payment has failed");
  }

  if (order.orderStatus === "cancelled") {
    throw ApiError.badRequest("Order has been cancelled");
  }

  if (
    order.checkoutExpiresAt &&
    new Date() > new Date(order.checkoutExpiresAt)
  ) {
    throw ApiError.badRequest("Checkout session has expired");
  }
};

export const createRazorpayOrder = async (orderId) => {
  const order = await orderRepository.findById(orderId);
  validateOrderForPayment(order);

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order.orderNumber,
  });

  order.razorpay.orderId = razorpayOrder.id;
  await order.save({ validateBeforeSave: false });

  return {
    order,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
};

export const verifySignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return generated === razorpay_signature;
};

export const processWebhook = async (rawBody, signature) => {
  if (!signature) {
    throw ApiError.badRequest("Missing webhook signature");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw ApiError.badRequest("Invalid webhook signature");
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "payment.captured") {
    return { received: true, ignored: true, event: event.event };
  }

  const payment = event.payload?.payment?.entity;
  if (!payment) {
    throw ApiError.badRequest("Invalid webhook payload");
  }

  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;

  const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    throw ApiError.notFound("Order not found for Razorpay order ID");
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  const confirmed = await orderService.confirmPayment(
    order._id,
    razorpayPaymentId
  );

  return confirmed;
};
