import * as dashboardService from "../services/dashboard.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  ApiResponse.ok(stats).send(res);
});

export const getSalesData = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSalesData(req.query.period);
  ApiResponse.ok(data).send(res);
});

export const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await dashboardService.getRecentOrders(req.query.limit);
  ApiResponse.ok(orders).send(res);
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await dashboardService.getLowStockProducts(req.query.limit);
  ApiResponse.ok(products).send(res);
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await dashboardService.getTopProducts(req.query.limit);
  ApiResponse.ok(products).send(res);
});

export const getOrderBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await dashboardService.getOrderBreakdown();
  ApiResponse.ok(breakdown).send(res);
});
