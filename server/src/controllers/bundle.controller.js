import asyncHandler from "../utils/asyncHandler.js";
import * as bundleService from "../services/bundle.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await bundleService.getAll(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const bundle = await bundleService.getById(req.params.id);
  ApiResponse.ok(bundle).send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const bundle = await bundleService.getBySlug(req.params.slug);
  ApiResponse.ok(bundle).send(res);
});

export const getActive = asyncHandler(async (req, res) => {
  const bundles = await bundleService.getActive();
  ApiResponse.ok(bundles).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const bundle = await bundleService.create(req.body, req.files);
  ApiResponse.created(bundle, "Bundle created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const bundle = await bundleService.update(req.params.id, req.body, req.files);
  ApiResponse.ok(bundle, "Bundle updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await bundleService.remove(req.params.id);
  ApiResponse.ok(null, "Bundle deleted").send(res);
});

export const toggleStatus = asyncHandler(async (req, res) => {
  const bundle = await bundleService.toggleStatus(req.params.id);
  ApiResponse.ok(bundle, "Bundle status updated").send(res);
});
