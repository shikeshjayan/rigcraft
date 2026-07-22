import brandRepository from "../repositories/brand.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "brands";

export const getAll = async (query = {}) => {
  if (query.isActive !== undefined) {
    return brandRepository.findAllActive();
  }
  return brandRepository.findAll({}, { sort: { name: 1 } });
};

export const getById = async (id) => {
  return brandRepository.findById(id);
};

export const create = async (data, file) => {
  if (file) {
    const logo = await uploadService.uploadImage(file, FOLDER);
    data.logo = { ...logo, alt: data.name };
  }

  return brandRepository.create(data);
};

export const update = async (id, data, file) => {
  if (file) {
    const existing = await brandRepository.findById(id);
    const logo = await uploadService.replaceImage(
      existing.logo?.publicId,
      file,
      FOLDER
    );
    data.logo = { ...logo, alt: data.name || existing.name };
  }

  return brandRepository.updateById(id, data);
};

export const remove = async (id) => {
  const brand = await brandRepository.findById(id);

  if (brand.logo?.publicId) {
    await uploadService.deleteImage(brand.logo.publicId);
  }

  return brandRepository.deleteById(id);
};
