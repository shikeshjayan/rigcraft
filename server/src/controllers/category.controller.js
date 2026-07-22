import asyncHandler from "../utils/asyncHandler.js";
import * as categoryService from "../services/category.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAll(req.query);
  ApiResponse.ok(categories).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  ApiResponse.ok(category).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body, req.file);
  ApiResponse.created(category, "Category created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body, req.file);
  ApiResponse.ok(category, "Category updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  ApiResponse.ok(null, "Category deleted").send(res);
});
