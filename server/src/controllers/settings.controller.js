import asyncHandler from '../utils/asyncHandler.js';
import * as settingsService from '../services/settings.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const get = asyncHandler(async (req, res) => {
  const settings = await settingsService.get();
  ApiResponse.ok(settings).send(res);
});

export const update = asyncHandler(async (req, res) => {
  const settings = await settingsService.update(req.body);
  ApiResponse.ok(settings, 'Settings updated').send(res);
});

export const getPublic = asyncHandler(async (req, res) => {
  const data = await settingsService.getPublic();
  ApiResponse.ok(data).send(res);
});
