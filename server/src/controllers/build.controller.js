import asyncHandler from "../utils/asyncHandler.js";
import * as buildService from "../services/build.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createBuild = asyncHandler(async (req, res) => {
  const build = await buildService.createBuild(req.user._id, req.body);
  ApiResponse.created(build, "Build created").send(res);
});

export const getBuild = asyncHandler(async (req, res) => {
  const build = await buildService.getBuild(req.params.id, req.user._id);
  ApiResponse.ok(build).send(res);
});

export const getUserBuilds = asyncHandler(async (req, res) => {
  const result = await buildService.getUserBuilds(req.user._id, req.query);
  ApiResponse.ok(result).send(res);
});

export const updateBuild = asyncHandler(async (req, res) => {
  const build = await buildService.updateBuild(
    req.params.id,
    req.user._id,
    req.body
  );
  ApiResponse.ok(build, "Build updated").send(res);
});

export const deleteBuild = asyncHandler(async (req, res) => {
  await buildService.deleteBuild(req.params.id, req.user._id);
  ApiResponse.ok(null, "Build deleted").send(res);
});

export const duplicateBuild = asyncHandler(async (req, res) => {
  const build = await buildService.duplicateBuild(
    req.params.id,
    req.user._id,
    req.body.name
  );
  ApiResponse.created(build, "Build duplicated").send(res);
});

export const validateBuild = asyncHandler(async (req, res) => {
  const build = await buildService.validateBuild(req.params.id, req.user._id);
  ApiResponse.ok(build, "Compatibility check complete").send(res);
});

export const addToCart = asyncHandler(async (req, res) => {
  const build = await buildService.addToCart(req.params.id, req.user._id);
  ApiResponse.ok(build, "Build added to cart").send(res);
});

export const adminGetAllBuilds = asyncHandler(async (req, res) => {
  const result = await buildService.adminGetAllBuilds(req.query);
  ApiResponse.ok(result).send(res);
});

export const getBuildAnalytics = asyncHandler(async (req, res) => {
  const analytics = await buildService.getBuildAnalytics();
  ApiResponse.ok(analytics).send(res);
});

export const getCompatibilityIssues = asyncHandler(async (req, res) => {
  const result = await buildService.getCompatibilityIssues(req.query);
  ApiResponse.ok(result).send(res);
});

export const updateBuildSettings = asyncHandler(async (req, res) => {
  const settings = await buildService.updateBuildSettings(req.body);
  ApiResponse.ok(settings, "Build settings updated").send(res);
});

export const getBuildSettings = asyncHandler(async (req, res) => {
  const settings = await buildService.getBuildSettings();
  ApiResponse.ok(settings).send(res);
});