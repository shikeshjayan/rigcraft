import asyncHandler from "../utils/asyncHandler.js";
import * as newsletterService from "../services/newsletter.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const subscribe = asyncHandler(async (req, res) => {
  await newsletterService.subscribe(req.body.email);
  ApiResponse.ok(null, "Subscribed successfully").send(res);
});

export const unsubscribe = asyncHandler(async (req, res) => {
  await newsletterService.unsubscribe(req.body.email);
  ApiResponse.ok(null, "You have been unsubscribed").send(res);
});

export const getSubscribers = asyncHandler(async (req, res) => {
  const result = await newsletterService.getSubscribers(req.query);
  ApiResponse.ok(result).send(res);
});

export const getSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await newsletterService.getSubscriber(req.params.id);
  ApiResponse.ok(subscriber).send(res);
});

export const updateSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await newsletterService.updateSubscriber(
    req.params.id,
    req.body
  );
  ApiResponse.ok(subscriber, "Subscriber updated").send(res);
});

export const deleteSubscriber = asyncHandler(async (req, res) => {
  await newsletterService.deleteSubscriber(req.params.id);
  ApiResponse.ok(null, "Subscriber deleted").send(res);
});

export const exportSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await newsletterService.exportSubscribers(req.query);
  ApiResponse.ok(subscribers).send(res);
});
