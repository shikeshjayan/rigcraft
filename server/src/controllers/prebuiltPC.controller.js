import asyncHandler from "../utils/asyncHandler.js";
import * as prebuiltPCService from "../services/prebuiltPC.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const list = asyncHandler(async (req, res) => {
  const result = await prebuiltPCService.list(req.query);
  ApiResponse.ok(result).send(res);
});

export const getBySlugOrId = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(slugOrId);
  let prebuilt;
  if (isObjectId) {
    prebuilt = await prebuiltPCService.getById(slugOrId);
  }
  if (!prebuilt) {
    prebuilt = await prebuiltPCService.getBySlug(slugOrId);
  }
  ApiResponse.ok(prebuilt).send(res);
});

export const getFeatured = asyncHandler(async (req, res) => {
  const prebuilts = await prebuiltPCService.getFeatured(req.query.limit);
  ApiResponse.ok(prebuilts).send(res);
});

export const getByCategory = asyncHandler(async (req, res) => {
  const result = await prebuiltPCService.getByCategory(
    req.params.category,
    req.query
  );
  ApiResponse.ok(result).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const prebuilt = await prebuiltPCService.create(req.body, req.files);
  ApiResponse.created(prebuilt, "Prebuilt PC created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const prebuilt = await prebuiltPCService.update(
    req.params.id,
    req.body,
    req.files
  );
  ApiResponse.ok(prebuilt, "Prebuilt PC updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await prebuiltPCService.remove(req.params.id);
  ApiResponse.ok(null, "Prebuilt PC deleted").send(res);
});

export const getSimilar = asyncHandler(async (req, res) => {
  const prebuilts = await prebuiltPCService.getSimilar(req.params.slugOrId, req.query.limit);
  ApiResponse.ok(prebuilts).send(res);
});

export const getComponentProducts = asyncHandler(async (req, res) => {
  const components = await prebuiltPCService.getComponentProducts(req.params.slugOrId);
  ApiResponse.ok(components).send(res);
});


