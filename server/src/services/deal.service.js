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
    populate: "products prebuiltPCs",
    sort: { displayOrder: 1, createdAt: -1 },
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
  if (!deal) throw ApiError.notFound("Deal not found");
  return deal.populate("products prebuiltPCs");
};

export const getBySlug = async (slug) => {
  const deal = await dealRepository.findBySlug(slug);
  if (!deal) throw ApiError.notFound("Deal not found");
  return deal;
};

export const getActive = async () => {
  return dealRepository.findActive();
};

export const getActiveForHomepage = async () => {
  return dealRepository.findActiveForHomepage();
};

export const create = async (data, files) => {
  const slug = generateSlug(data.title);
  const existing = await dealRepository.findOne({ slug });
  data.slug = existing ? `${slug}-${Date.now()}` : slug;

  if (files?.desktopBanner?.[0]) {
    const image = await uploadService.uploadImage(files.desktopBanner[0], FOLDER);
    data.desktopBanner = { ...image, alt: data.title };
  }

  if (files?.mobileBanner?.[0]) {
    const image = await uploadService.uploadImage(files.mobileBanner[0], FOLDER);
    data.mobileBanner = { ...image, alt: data.title };
  }

  const deal = await dealRepository.create(data);
  return deal.populate("products prebuiltPCs");
};

export const update = async (id, data, files) => {
  const deal = await dealRepository.findById(id);
  if (!deal) throw ApiError.notFound("Deal not found");

  if (data.title && data.title !== deal.title) {
    const slug = generateSlug(data.title);
    const existing = await dealRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (files?.desktopBanner?.[0]) {
    const image = await uploadService.replaceImage(
      deal.desktopBanner?.publicId,
      files.desktopBanner[0],
      FOLDER,
    );
    data.desktopBanner = { ...image, alt: data.title || deal.title };
  }

  if (files?.mobileBanner?.[0]) {
    const image = await uploadService.replaceImage(
      deal.mobileBanner?.publicId,
      files.mobileBanner[0],
      FOLDER,
    );
    data.mobileBanner = { ...image, alt: data.title || deal.title };
  }

  const updatedDeal = await dealRepository.updateById(id, data);
  return updatedDeal.populate("products prebuiltPCs");
};

export const remove = async (id) => {
  const deal = await dealRepository.findById(id);
  if (!deal) throw ApiError.notFound("Deal not found");

  if (deal.desktopBanner?.publicId) {
    await uploadService.deleteImage(deal.desktopBanner.publicId);
  }
  if (deal.mobileBanner?.publicId) {
    await uploadService.deleteImage(deal.mobileBanner.publicId);
  }

  return dealRepository.deleteById(id);
};

export const toggleStatus = async (id) => {
  const deal = await dealRepository.findById(id);
  if (!deal) throw ApiError.notFound("Deal not found");

  deal.isActive = !deal.isActive;
  return deal.save();
};
