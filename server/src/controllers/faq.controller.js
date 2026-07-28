import asyncHandler from "../utils/asyncHandler.js";
import * as faqService from "../services/faq.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const listPublic = asyncHandler(async (req, res) => {
  const faqs = await faqService.listPublic();
  ApiResponse.ok(faqs).send(res);
});

export const adminList = asyncHandler(async (req, res) => {
  const result = await faqService.adminList(req.query);
  ApiResponse.ok(result).send(res);
});

export const getById = asyncHandler(async (req, res) => {
  const faq = await faqService.getById(req.params.id);
  ApiResponse.ok(faq).send(res);
});

export const create = asyncHandler(async (req, res) => {
  const faq = await faqService.create(req.body);
  ApiResponse.created(faq, "FAQ created").send(res);
});

export const update = asyncHandler(async (req, res) => {
  const faq = await faqService.update(req.params.id, req.body);
  ApiResponse.ok(faq, "FAQ updated").send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await faqService.remove(req.params.id);
  ApiResponse.ok(null, "FAQ deleted").send(res);
});