import asyncHandler from "../utils/asyncHandler.js";
import * as productService from "../services/product.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const list = asyncHandler(async (req, res) => {
  const result = await productService.list(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  ApiResponse.ok(product).send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  ApiResponse.ok(product).send(res);
});

export const getFeatured = asyncHandler(async (req, res) => {
  const products = await productService.getFeatured(req.query.limit);
  ApiResponse.ok(products).send(res);
});

export const getRelated = asyncHandler(async (req, res) => {
  const products = await productService.getRelated(
    req.params.slug,
    req.query.limit
  );
  ApiResponse.ok(products).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.files);
  ApiResponse.created(product, "Product created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.files);
  ApiResponse.ok(product, "Product updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  ApiResponse.ok(null, "Product deleted").send(res);
});
