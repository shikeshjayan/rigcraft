import * as orderService from "../services/order.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const checkout = asyncHandler(async (req, res) => {
  const result = await orderService.checkout(req.user._id, req.body);
  ApiResponse.created(result, "Checkout successful").send(res);
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.user._id, req.query);
  ApiResponse.ok(result, "Orders fetched successfully").send(res);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id, req.user._id);
  ApiResponse.ok(order, "Order fetched successfully").send(res);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  ApiResponse.ok(order, "Order cancelled successfully").send(res);
});

export const adminGetOrders = asyncHandler(async (req, res) => {
  const result = await orderService.adminGetAllOrders(req.query);
  ApiResponse.ok(result, "Orders fetched successfully").send(res);
});

export const adminGetOrder = asyncHandler(async (req, res) => {
  const order = await orderService.adminGetOrder(req.params.id);
  ApiResponse.ok(order, "Order fetched successfully").send(res);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.orderStatus
  );
  ApiResponse.ok(order, "Order status updated successfully").send(res);
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updatePaymentStatus(
    req.params.id,
    req.body.paymentStatus
  );
  ApiResponse.ok(order, "Payment status updated successfully").send(res);
});
