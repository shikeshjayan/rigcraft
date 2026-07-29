import asyncHandler from "../utils/asyncHandler.js";
import * as dealService from "../services/deal.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await dealService.getAll(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const deal = await dealService.getById(req.params.id);
  ApiResponse.ok(deal).send(res);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const deal = await dealService.getBySlug(req.params.slug);
  ApiResponse.ok(deal).send(res);
});

export const getActive = asyncHandler(async (req, res) => {
  const deals = await dealService.getActive();
  ApiResponse.ok(deals).send(res);
});

export const getActiveForHomepage = asyncHandler(async (req, res) => {
  const deals = await dealService.getActiveForHomepage();
  ApiResponse.ok(deals).send(res);
});

export const getProductsForDeal = asyncHandler(async (req, res) => {
  const products = await dealService.getProductsForDeal();
  ApiResponse.ok(products).send(res);
});

export const getPrebuiltPCsForDeal = asyncHandler(async (req, res) => {
  const prebuiltPCs = await dealService.getPrebuiltPCsForDeal();
  ApiResponse.ok(prebuiltPCs).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const deal = await dealService.create(req.body, req.file);
  ApiResponse.created(deal, "Deal created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const deal = await dealService.update(req.params.id, req.body, req.file);
  ApiResponse.ok(deal, "Deal updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await dealService.remove(req.params.id);
  ApiResponse.ok(null, "Deal deleted").send(res);
});

export const removeEnded = asyncHandler(async (req, res) => {
  const result = await dealService.removeEnded();
  ApiResponse.ok(result, `${result.deletedCount} ended deal(s) deleted`).send(res);
});
