import * as searchService from "../services/search.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const publicSearch = asyncHandler(async (req, res) => {
  const data = await searchService.publicSearch(req.query.q, req.query.limit);
  ApiResponse.ok(data).send(res);
});

export const adminSearch = asyncHandler(async (req, res) => {
  const data = await searchService.adminSearch(
    req.query.q,
    req.user.role,
    req.query.limit
  );
  ApiResponse.ok(data).send(res);
});
