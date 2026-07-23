import buildRepository from "../repositories/build.repository.js";
import productRepository from "../repositories/product.repository.js";
import ApiError from "../utils/ApiError.js";
import { COMPONENT_TYPES } from "../constants/constants.js";
import { validate as compatibilityValidate } from "./compatibility.service.js";
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

export const createBuild = async (userId, data) => {
  if (data.components) {
    await validateComponentsExist(data.components);
  }

  const build = await buildRepository.create({
    user: userId,
    name: data.name,
    components: data.components || [],
  });

  return recalculateBuild(build);
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
    await validateComponentsExist(data.components);
    updateData.components = data.components;
  }

  if (data.isPublic !== undefined) {
    updateData.isPublic = data.isPublic;
  }

  const updated = await buildRepository.updateById(buildId, updateData);
  return recalculateBuild(updated);
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

  await duplicated.populate("components.product");
  return duplicated;
};

const recalculateBuild = async (build) => {
  await build.populate("components.product");

  const result = compatibilityValidate(build);

  build.totalPrice = result.totalPrice;
  build.totalSalePrice = result.totalSalePrice;
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

  return build;
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
  if (data.enabled !== undefined) setting.enabled = data.enabled;
  return setting.save();
};