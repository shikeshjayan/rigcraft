import * as paymentService from "../services/payment.service.js";
import * as orderService from "../services/order.service.js";
import orderRepository from "../repositories/order.repository.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(
    req.body.orderId,
    req.user.id
  );
  ApiResponse.created(result, "Razorpay order created").send(res);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const valid = paymentService.verifySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  if (!valid) {
    throw ApiError.badRequest("Invalid payment signature");
  }

  const order = await orderRepository.findByRazorpayOrderId(razorpay_order_id);
  if (!order) throw ApiError.notFound("Order not found");

  if (order.user?.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden("You are not authorized to verify this order");
  }

  const confirmed = await orderService.confirmPayment(
    order._id,
    razorpay_payment_id,
    req.user
  );
  ApiResponse.ok(confirmed, "Payment verified successfully").send(res);
});

export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody;

  if (!rawBody) {
    throw ApiError.badRequest("Missing request body");
  }

  const result = await paymentService.processWebhook(rawBody, signature);
  ApiResponse.ok(result, "Webhook processed").send(res);
});
