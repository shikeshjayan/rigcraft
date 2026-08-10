import buildRepository from "../repositories/build.repository.js";
import productRepository from "../repositories/product.repository.js";
import ApiError from "../utils/ApiError.js";
import { COMPONENT_TYPES } from "../constants/constants.js";
import { validate as compatibilityValidate } from "./compatibility.service.js";
import * as cartService from "./cart.service.js";
import BuildSetting from "../models/build-setting.model.js";

const validateComponentsExist = async (components) => {
  if (!components || components.length === 0) return;

  const productIds = [...new Set(components.map((c) => c.product.toString()))];
  const existing = await productRepository.findAll({ _id: { $in: productIds } });
  const existingIds = new Set(existing.map((p) => p._id.toString()));

  for (const c of components) {
    if (!existingIds.has(c.product.toString())) {
      throw ApiError.badRequest(
        `Product ${c.product} not found for component type ${c.type}`
      );
    }
  }
};

const resolveProducts = async (components) => {
  if (!components || components.length === 0) return [];

  const productIds = components.map((c) => c.product.toString());
  const products = await productRepository.findAll({
    _id: { $in: [...new Set(productIds)] },
  });

  const productMap = {};
  for (const p of products) {
    productMap[p._id.toString()] = p;
  }

  return components.map((c) => ({
    ...c,
    product: productMap[c.product.toString()] || c.product,
  }));
};

const DEFAULT_BUILD_SETTINGS = {
  enabled: true,
  assemblyFeeEnabled: false,
  assemblyFeeType: "percent",
  assemblyFeeValue: 0.5,
  requireCompleteBuild: true,
};

export const getBuildSettings = async () => {
  const setting = await BuildSetting.findOne();
  return { ...DEFAULT_BUILD_SETTINGS, ...(setting ? setting.toObject() : {}) };
};

export const createBuild = async (userId, data) => {

  const build = await buildRepository.create({
    user: userId,
    name: data.name,
    components: data.components || [],
    assemblyMode: data.assemblyMode || "parts",
  });

  return recalculateBuild(build, true);
};

export const getBuild = async (buildId, userId) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");
  return build;
};

export const getUserBuilds = async (userId, query) => {
  const { page = 1, limit = 20 } = query;
  return buildRepository.getUserBuilds(userId, {
    page: Number(page),
    limit: Number(limit),
  });
};

export const updateBuild = async (buildId, userId, data) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  const updateData = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.components) {
    updateData.components = data.components;
  }

  if (data.assemblyMode !== undefined) {
    updateData.assemblyMode = data.assemblyMode;
  }

  if (data.isPublic !== undefined) {
    updateData.isPublic = data.isPublic;
  }

  const updated = await buildRepository.updateById(buildId, updateData);
  return recalculateBuild(updated, true);
};

export const renameBuild = async (buildId, userId, name) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  return buildRepository.updateById(buildId, { name });
};

export const deleteBuild = async (buildId, userId) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  return buildRepository.deleteById(buildId);
};

export const duplicateBuild = async (buildId, userId, name) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  const duplicated = await buildRepository.duplicateBuild(
    buildId,
    userId,
    name
  );
  if (!duplicated) throw ApiError.notFound("Build not found");

  return duplicated;
};

const recalculateBuild = async (build, enforceComplete = false) => {
  await build.populate({
    path: "components.product",
    model: "Product"
  });

  const result = await compatibilityValidate(build);
  const settings = await getBuildSettings();

  if (enforceComplete && settings.requireCompleteBuild && result.status === "incomplete") {
    throw ApiError.badRequest(
      `Build is incomplete. Missing required components: ${result.issues.join(", ")}`
    );
  }

  let totalPrice = result.totalPrice;
  let totalSalePrice = result.totalSalePrice;

  const assemblyFee =
    build.assemblyMode === "assembled" && settings.assemblyFeeEnabled
      ? settings.assemblyFeeType === "fixed"
        ? Number(settings.assemblyFeeValue) || 0
        : totalPrice * ((Number(settings.assemblyFeeValue) || 0) / 100)
      : 0;

  totalPrice += assemblyFee;
  totalSalePrice += assemblyFee;

  build.totalPrice = totalPrice;
  build.totalSalePrice = totalSalePrice;
  build.assemblyFee = assemblyFee;
  build.estimatedPower = result.estimatedPower;
  build.compatibility = {
    status: result.status,
    issues: result.issues,
  };

  await build.save({ validateBeforeSave: false });
  return build;
};

export const validateBuild = async (buildId, userId) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  return recalculateBuild(build);
};

export const addToCart = async (buildId, userId) => {
  const build = await buildRepository.findBuildById(buildId, userId);
  if (!build) throw ApiError.notFound("Build not found");

  return cartService.addItem(userId, {
    itemType: "savedBuild",
    itemId: buildId,
    quantity: 1,
  });
};

export const adminGetAllBuilds = async (query) => {
  return buildRepository.getAllBuilds(query);
};

export const getBuildAnalytics = async () => {
  return buildRepository.getBuildAnalytics();
};

export const getCompatibilityIssues = async (query) => {
  return buildRepository.getCompatibilityIssues(query);
};

export const updateBuildSettings = async (data) => {
  let setting = await BuildSetting.findOne();
  if (!setting) {
    setting = new BuildSetting();
  }
  const settableFields = [
    "enabled",
    "assemblyFeeEnabled",
    "assemblyFeeType",
    "assemblyFeeValue",
    "requireCompleteBuild",
  ];
  for (const field of settableFields) {
    if (data[field] !== undefined) setting[field] = data[field];
  }
  return setting.save();
};