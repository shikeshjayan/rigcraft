import slugify from "slugify";
import Product from "../models/product.model.js";
import productRepository from "../repositories/product.repository.js";
import categoryRepository from "../repositories/category.repository.js";
import brandRepository from "../repositories/brand.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "products";

const generateSlug = (name) => slugify(name, { lower: true, strict: true });

export const list = async (query) => {
  const filter = {};
  const {
    category,
    brand,
    productType,
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
  if (status) filter.status = status;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

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
    for (const img of product.images) {
      if (img.publicId) {
        await uploadService.deleteImage(img.publicId);
      }
    }

    const images = await uploadService.uploadMultipleImages(files, FOLDER);
    data.images = images.map((img, i) => ({
      ...img,
      alt: data.name || product.name,
      isPrimary: i === 0,
    }));
  }

  return productRepository.updateById(id, data);
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
