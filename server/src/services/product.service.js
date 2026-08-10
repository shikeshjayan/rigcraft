import slugify from "slugify";
import Product from "../models/product.model.js";
import productRepository from "../repositories/product.repository.js";
import categoryRepository from "../repositories/category.repository.js";
import brandRepository from "../repositories/brand.repository.js";
import { getSettings } from "../models/settings.model.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";
import { CART_ITEM_TYPES } from "../constants/constants.js";
import { notifyRestockIfNeeded } from "./stockAlert.service.js";

const FOLDER = "products";

const generateSlug = (name) => slugify(name, { lower: true, strict: true });

export const list = async (query) => {
  const filter = {};
  const {
    category,
    brand,
    productType,
    categoryType,
    status,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    page = 1,
    limit = 20,
    sort,
  } = query;

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (productType) filter.productType = productType;
  if (categoryType) filter.categoryType = categoryType;
  if (status === "inactive") filter.status = { $ne: "active" };
  else if (status) filter.status = status;
  if (isFeatured === "true" || isFeatured === "false") filter.isFeatured = isFeatured === "true";

  const settings = await getSettings();
  if (settings?.inventory?.hideOutOfStock && !query.status) {
    filter.stock = { $gt: 0 };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { name: regex },
      { tags: regex },
      { shortDescription: regex },
    ];
  }

  const sortOptions = {};
  if (sort === "price_asc") sortOptions.price = 1;
  else if (sort === "price_desc") sortOptions.price = -1;
  else if (sort === "rating") sortOptions["rating.average"] = -1;
  else if (sort === "sold") sortOptions.soldCount = -1;
  else if (sort === "name") sortOptions.name = 1;
  else sortOptions.createdAt = -1;

  return productRepository.findAllPaginated(filter, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
  });
};

export const getById = async (id) => {
  const product = await productRepository.findById(id);
  return product;
};

export const getBySlug = async (slug) => {
  const product = await productRepository.findPublishedBySlug(slug);
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

export const getFeatured = async (limit) => {
  return productRepository.findFeatured(Number(limit) || 8);
};

export const getRelated = async (slug, limit) => {
  const product = await productRepository.findBySlug(slug);
  if (!product) throw ApiError.notFound("Product not found");
  return productRepository.findRelated(product, Number(limit) || 6);
};

export const create = async (data, files) => {
  await categoryRepository.findById(data.category);
  await brandRepository.findById(data.brand);

  const slug = generateSlug(data.name);
  const existing = await productRepository.findOne({ slug });
  if (existing) {
    data.slug = `${slug}-${Date.now()}`;
  } else {
    data.slug = slug;
  }

  if (files && files.length > 0) {
    const images = await uploadService.uploadMultipleImages(files, FOLDER);
    data.images = images.map((img, i) => ({
      ...img,
      alt: data.name,
      isPrimary: i === 0,
    }));
  }

  return productRepository.create(data);
};

export const update = async (id, data, files) => {
  const product = await productRepository.findById(id);
  const previousStock = product.stock;

  if (data.category) await categoryRepository.findById(data.category);
  if (data.brand) await brandRepository.findById(data.brand);

  if (data.name && data.name !== product.name) {
    const slug = generateSlug(data.name);
    const existing = await productRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (files && files.length > 0) {
    // Images the frontend sent back to keep (existing images user chose to retain)
    const keptImages = data.images || [];
    const keepPublicIds = new Set(keptImages.map((img) => img.publicId).filter(Boolean));

    // Delete only removed images from Cloudinary
    for (const img of product.images) {
      if (img.publicId && !keepPublicIds.has(img.publicId)) {
        await uploadService.deleteImage(img.publicId);
      }
    }

    // Upload new images
    const uploaded = await uploadService.uploadMultipleImages(files, FOLDER);
    const newImages = uploaded.map((img) => ({
      ...img,
      alt: data.name || product.name,
    }));

    // Merge kept existing + new uploads
    data.images = [...keptImages, ...newImages];
    if (data.images.length > 0) data.images[0].isPrimary = true;
  } else if (data.images === undefined) {
    delete data.images;
  }

  const updated = await productRepository.updateById(id, data);

  try {
    await notifyRestockIfNeeded(
      CART_ITEM_TYPES.PRODUCT,
      id,
      previousStock,
      updated.stock
    );
  } catch (err) {
    console.warn("[product] restock check failed:", err.message);
  }

  return updated;
};

export const remove = async (id) => {
  const product = await productRepository.findById(id);

  if (product.images?.length) {
    for (const img of product.images) {
      if (img.publicId) {
        try {
          await uploadService.deleteImage(img.publicId);
        } catch {
          // Cloudinary cleanup is best-effort
        }
      }
    }
  }

  return productRepository.deleteById(id);
};
