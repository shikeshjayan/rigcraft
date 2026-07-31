import slugify from "slugify";
import { COMPONENT_TYPES } from "../constants/constants.js";
import PrebuiltPC from "../models/prebuiltPC.model.js";
import prebuiltPCRepository from "../repositories/prebuiltPC.repository.js";
import productRepository from "../repositories/product.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "prebuilt-pcs";

const REQUIRED_COMPONENT_TYPES = [
  COMPONENT_TYPES.CPU,
  COMPONENT_TYPES.MOTHERBOARD,
  COMPONENT_TYPES.RAM,
  COMPONENT_TYPES.PSU,
  COMPONENT_TYPES.CABINET,
];

const generateSlug = (name) => slugify(name, { lower: true, strict: true });

const validateComponents = async (components) => {
  if (!components || components.length === 0) {
    throw ApiError.badRequest("At least one component is required");
  }

  const providedTypes = components.map((c) => c.type);
  for (const required of REQUIRED_COMPONENT_TYPES) {
    if (!providedTypes.includes(required)) {
      throw ApiError.badRequest(`Missing required component type: ${required}`);
    }
  }

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

export const list = async (query) => {
  const filter = {};
  const {
    category,
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
  if (status) filter.status = status;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  if (minPrice || maxPrice) {
    filter["pricing.price"] = {};
    if (minPrice) filter["pricing.price"].$gte = Number(minPrice);
    if (maxPrice) filter["pricing.price"].$lte = Number(maxPrice);
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
  if (sort === "price_asc") sortOptions["pricing.price"] = 1;
  else if (sort === "price_desc") sortOptions["pricing.price"] = -1;
  else if (sort === "rating") sortOptions["rating.average"] = -1;
  else if (sort === "sold") sortOptions.soldCount = -1;
  else if (sort === "name") sortOptions.name = 1;
  else sortOptions.createdAt = -1;

  return prebuiltPCRepository.findAllPaginated(filter, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
  });
};

export const getBySlug = async (slug) => {
  const prebuilt = await prebuiltPCRepository.findPublishedBySlug(slug);
  if (!prebuilt) throw ApiError.notFound("Prebuilt PC not found");
  await PrebuiltPC.findByIdAndUpdate(prebuilt._id, { $inc: { viewCount: 1 } });
  return prebuilt;
};

export const getById = async (id) => {
  const prebuilt = await prebuiltPCRepository.findById(id);
  if (prebuilt.isDeleted) throw ApiError.notFound("Prebuilt PC not found");
  return prebuilt;
};

export const getFeatured = async (limit) => {
  return prebuiltPCRepository.findFeatured(Number(limit) || 8);
};

export const getByCategory = async (category, query) => {
  const { page = 1, limit = 20, sort } = query;
  const sortOptions = {};
  if (sort === "price_asc") sortOptions["pricing.price"] = 1;
  else if (sort === "price_desc") sortOptions["pricing.price"] = -1;
  else if (sort === "rating") sortOptions["rating.average"] = -1;
  else if (sort === "sold") sortOptions.soldCount = -1;
  else sortOptions.createdAt = -1;

  return prebuiltPCRepository.findByCategory(category, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOptions,
  });
};

export const create = async (data, files) => {
  await validateComponents(data.components);

  const slug = generateSlug(data.name);
  const existing = await prebuiltPCRepository.findOne({ slug });
  data.slug = existing ? `${slug}-${Date.now()}` : slug;

  if (files && files.length > 0) {
    const images = await uploadService.uploadMultipleImages(files, FOLDER);
    data.images = images.map((img, i) => ({
      ...img,
      alt: data.name,
      isPrimary: i === 0,
    }));
  }

  const prebuilt = await prebuiltPCRepository.create(data);
  await prebuilt.populate("components.product");
  return prebuilt;
};

export const update = async (id, data, files) => {
  const prebuilt = await prebuiltPCRepository.findById(id);

  if (data.components) {
    await validateComponents(data.components);
  }

  if (data.name && data.name !== prebuilt.name) {
    const slug = generateSlug(data.name);
    const existing = await prebuiltPCRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (files && files.length > 0) {
    for (const img of prebuilt.images) {
      if (img.publicId) {
        await uploadService.deleteImage(img.publicId);
      }
    }

    const images = await uploadService.uploadMultipleImages(files, FOLDER);
    data.images = images.map((img, i) => ({
      ...img,
      alt: data.name || prebuilt.name,
      isPrimary: i === 0,
    }));
  } else if (data.images === undefined) {
    delete data.images;
  } else {
    for (const img of prebuilt.images || []) {
      if (img.publicId) {
        try {
          await uploadService.deleteImage(img.publicId);
        } catch {
          // Cloudinary cleanup is best-effort
        }
      }
    }
    data.images = Array.isArray(data.images) ? data.images : [];
  }

  const updated = await prebuiltPCRepository.updateById(id, data);
  await updated.populate("components.product");
  return updated;
};

export const remove = async (id) => {
  const prebuilt = await prebuiltPCRepository.findById(id);

  if (prebuilt.images?.length) {
    for (const img of prebuilt.images) {
      if (img.publicId) {
        try {
          await uploadService.deleteImage(img.publicId);
        } catch {
          // Cloudinary cleanup is best-effort
        }
      }
    }
  }

  return prebuiltPCRepository.deleteById(id);
};

export const getSimilar = async (slug, limit) => {
  const prebuilt = await prebuiltPCRepository.findBySlug(slug);
  if (!prebuilt) throw ApiError.notFound("Prebuilt PC not found");
  return prebuiltPCRepository.findSimilar(prebuilt, Number(limit) || 4);
};

export const getComponentProducts = async (slug) => {
  const prebuilt = await prebuiltPCRepository.findPublishedBySlug(slug);
  if (!prebuilt) throw ApiError.notFound("Prebuilt PC not found");
  return prebuilt.components;
};


