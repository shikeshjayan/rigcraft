import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "../services/upload.service.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("No image file provided");
  }

  const result = await uploadService.uploadImage(req.file, "uploads");
  ApiResponse.created(result, "Image uploaded").send(res);
});
