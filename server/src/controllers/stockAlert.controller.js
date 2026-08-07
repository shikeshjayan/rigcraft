import asyncHandler from "../utils/asyncHandler.js";
import * as stockAlertService from "../services/stockAlert.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const subscribe = asyncHandler(async (req, res) => {
  const alert = await stockAlertService.subscribe(req.user._id, req.body);
  ApiResponse.created(alert, "We'll notify you when it's back in stock").send(
    res
  );
});

export const getMyAlerts = asyncHandler(async (req, res) => {
  const result = await stockAlertService.getMyAlerts(req.user._id, req.query);
  ApiResponse.ok(result).send(res);
});

export const cancel = asyncHandler(async (req, res) => {
  const alert = await stockAlertService.cancel(req.user._id, req.params.id);
  ApiResponse.ok(alert, "Stock alert removed").send(res);
});
