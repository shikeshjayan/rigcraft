import asyncHandler from "../utils/asyncHandler.js";
import * as brandService from "../services/brand.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAll = asyncHandler(async (req, res) => {
  const brands = await brandService.getAll(req.query);
  ApiResponse.ok(brands).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const brand = await brandService.getById(req.params.id);
  ApiResponse.ok(brand).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const brand = await brandService.create(req.body, req.file);
  ApiResponse.created(brand, "Brand created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const brand = await brandService.update(req.params.id, req.body, req.file);
  ApiResponse.ok(brand, "Brand updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await brandService.remove(req.params.id);
  ApiResponse.ok(null, "Brand deleted").send(res);
});
