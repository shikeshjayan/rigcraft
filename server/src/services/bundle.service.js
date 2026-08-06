import slugify from "slugify";
import bundleRepository from "../repositories/bundle.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "bundles";

const generateSlug = (name) => slugify(name, { lower: true, strict: true });

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMemberPrice = (item) => {
  if (!item || typeof item !== "object") return 0;

  if (typeof item.price === "number") {
    const sale = Number(item.salePrice);
    return sale > 0 ? sale : Number(item.price) || 0;
  }

  if (item.pricing && typeof item.pricing === "object") {
    const sale = Number(item.pricing.salePrice);
    return sale > 0 ? sale : Number(item.pricing.price) || 0;
  }

  return 0;
};

export const computeBundlePricing = (bundle) => {
  const products = Array.isArray(bundle.products) ? bundle.products : [];
  const prebuilts = Array.isArray(bundle.prebuiltPCs) ? bundle.prebuiltPCs : [];

  const itemsTotal = [...products, ...prebuilts].reduce(
    (sum, item) => sum + getMemberPrice(item),
    0
  );

  const bundlePrice = Number(bundle.bundlePrice) || 0;
  const savings = Math.max(0, itemsTotal - bundlePrice);
  const discountPct =
    itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0;

  return { itemsTotal, bundlePrice, savings, discountPct };
};

const withPricing = (bundle) => {
  if (!bundle) return null;
  const doc = bundle.toObject ? bundle.toObject() : bundle;
  return { ...doc, ...computeBundlePricing(bundle) };
};

export const getAll = async (query = {}) => {
  const { page = 1, limit = 20, isActive, search } = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    const regex = escapeRegex(search);
    filter.$or = [
      { name: { $regex: regex, $options: "i" } },
      { description: { $regex: regex, $options: "i" } },
    ];
  }

  const bundles = await bundleRepository.findAll(filter, {
    populate: "products prebuiltPCs",
    sort: { displayOrder: 1, createdAt: -1 },
    skip,
    limit: limitNum,
  });
  const total = await bundleRepository.count(filter);

  return {
    bundles: bundles.map(withPricing),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getById = async (id) => {
  const bundle = await bundleRepository.findByIdPopulated(id);
  if (!bundle) throw ApiError.notFound("Bundle not found");
  return withPricing(bundle);
};

export const getBySlug = async (slug) => {
  const bundle = await bundleRepository.findBySlug(slug);
  if (!bundle) throw ApiError.notFound("Bundle not found");
  return withPricing(bundle);
};

export const getActive = async () => {
  const bundles = await bundleRepository.findActive();
  return bundles.map(withPricing);
};

export const create = async (data, files) => {
  const slug = generateSlug(data.name);
  const existing = await bundleRepository.findOne({ slug });
  data.slug = existing ? `${slug}-${Date.now()}` : slug;

  if (files?.image?.[0]) {
    const image = await uploadService.uploadImage(files.image[0], FOLDER);
    data.image = { ...image, alt: data.name };
  }

  const bundle = await bundleRepository.create(data);
  return withPricing(await bundleRepository.findByIdPopulated(bundle._id));
};

export const update = async (id, data, files) => {
  const bundle = await bundleRepository.findById(id);

  if (data.name && data.name !== bundle.name) {
    const slug = generateSlug(data.name);
    const existing = await bundleRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (data.image === null && bundle.image?.publicId) {
    await uploadService.deleteImage(bundle.image.publicId);
  }

  if (files?.image?.[0]) {
    const image = await uploadService.replaceImage(
      bundle.image?.publicId,
      files.image[0],
      FOLDER
    );
    data.image = { ...image, alt: data.name || bundle.name };
  }

  const updated = await bundleRepository.updateById(id, data);
  return withPricing(await bundleRepository.findByIdPopulated(updated._id));
};

export const remove = async (id) => {
  const bundle = await bundleRepository.findById(id);

  if (bundle.image?.publicId) {
    await uploadService.deleteImage(bundle.image.publicId);
  }

  return bundleRepository.deleteById(id);
};

export const toggleStatus = async (id) => {
  const bundle = await bundleRepository.findById(id);
  bundle.isActive = !bundle.isActive;
  await bundle.save();
  return bundle;
};
