import slugify from "slugify";
import dealRepository from "../repositories/deal.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "deals";

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true });

export const getAll = async (query = {}) => {
  const { page = 1, limit = 20, isActive, search } = query;

  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const deals = await dealRepository.findAll(filter, {
    populate: "products prebuiltPcs",
    sort: { createdAt: -1 },
  });
  const total = await dealRepository.count(filter);

  return {
    deals,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getById = async (id) => {
  const deal = await dealRepository.findById(id);
  return deal.populate("products prebuiltPcs");
};

export const getBySlug = async (slug) => {
  const deal = await dealRepository.findBySlug(slug);
  if (!deal) throw ApiError.notFound("Deal not found");
  return deal;
};

export const getActive = async () => {
  return dealRepository.findActive();
};

export const create = async (data, file) => {
  const slug = generateSlug(data.title);
  const existing = await dealRepository.findOne({ slug });
  if (existing) {
    data.slug = `${slug}-${Date.now()}`;
  } else {
    data.slug = slug;
  }

  if (file) {
    const image = await uploadService.uploadImage(file, FOLDER);
    data.banner = { ...image, alt: data.title };
  }

  return dealRepository.create(data);
};

export const update = async (id, data, file) => {
  const deal = await dealRepository.findById(id);

  if (data.title && data.title !== deal.title) {
    const slug = generateSlug(data.title);
    const existing = await dealRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (file) {
    const image = await uploadService.replaceImage(
      deal.banner?.publicId,
      file,
      FOLDER,
    );
    data.banner = { ...image, alt: data.title || deal.title };
  }

  return dealRepository.updateById(id, data);
};

export const remove = async (id) => {
  const deal = await dealRepository.findById(id);

  if (deal.banner?.publicId) {
    await uploadService.deleteImage(deal.banner.publicId);
  }

  return dealRepository.deleteById(id);
};

export const removeEnded = async () => {
  const now = new Date();
  const ended = await dealRepository.findAll({
    endDate: { $lt: now },
  });

  for (const deal of ended) {
    if (deal.banner?.publicId) {
      await uploadService.deleteImage(deal.banner.publicId);
    }
  }

  const result = await dealRepository.model.deleteMany({
    endDate: { $lt: now },
  });

  return { deletedCount: result.deletedCount };
};
