import slugify from "slugify";
import dealRepository from "../repositories/deal.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "deals";

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true });

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      { title: { $regex: regex, $options: "i" } },
      { description: { $regex: regex, $options: "i" } },
    ];
  }

  const deals = await dealRepository.findAll(filter, {
    populate: "products prebuiltPCs",
    sort: { displayOrder: 1, createdAt: -1 },
    skip,
    limit: limitNum,
  });
  const total = await dealRepository.count(filter);

  return {
    deals,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
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

export const getPromotions = async () => {
  return dealRepository.findPromotions();
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
  for (const offer of deal.promotion?.homeOffer || []) {
    if (offer.banner?.publicId) {
      await uploadService.deleteImage(offer.banner.publicId);
    }
  }

  return dealRepository.deleteById(id);
};

export const toggleStatus = async (id) => {
  const deal = await dealRepository.findById(id);
  if (!deal) throw ApiError.notFound("Deal not found");

  deal.isActive = !deal.isActive;
  return deal.save();
};
