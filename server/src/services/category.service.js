import slugify from "slugify";
import categoryRepository from "../repositories/category.repository.js";
import ApiError from "../utils/ApiError.js";
import * as uploadService from "./upload.service.js";

const FOLDER = "categories";

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true });

export const getAll = async (query = {}) => {
  if (query.isActive !== undefined) {
    return categoryRepository.findAllActive();
  }
  if (query.parent === "null") {
    return categoryRepository.findRootCategories();
  }
  if (query.parent) {
    return categoryRepository.findChildren(query.parent);
  }
  return categoryRepository.findAll({}, { sort: { order: 1, name: 1 } });
};

export const getById = async (id) => {
  return categoryRepository.findById(id);
};

export const create = async (data, file) => {
  if (data.parent) {
    await categoryRepository.findById(data.parent);
  }

  const slug = generateSlug(data.name);
  const existing = await categoryRepository.findOne({ slug });
  if (existing) {
    data.slug = `${slug}-${Date.now()}`;
  } else {
    data.slug = slug;
  }
  console.log("Data after slug generation:", data);

  if (file) {
    const image = await uploadService.uploadImage(file, FOLDER);
    data.image = { ...image, alt: data.name };
  }

  return categoryRepository.create(data);
};

export const update = async (id, data, file) => {
  if (data.parent) {
    await categoryRepository.findById(data.parent);
    if (data.parent === id) {
      throw ApiError.badRequest("Category cannot be its own parent");
    }
  }

  const category = await categoryRepository.findById(id);

  if (data.image === null && category.image?.publicId) {
    await uploadService.deleteImage(category.image.publicId);
  }

  if (data.name && data.name !== category.name) {
    const slug = generateSlug(data.name);
    const existing = await categoryRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    data.slug = existing ? `${slug}-${Date.now()}` : slug;
  }

  if (file) {
    const image = await uploadService.replaceImage(
      category.image?.publicId,
      file,
      FOLDER
    );
    data.image = { ...image, alt: data.name || category.name };
  }

  return categoryRepository.updateById(id, data);
};

export const remove = async (id) => {
  const category = await categoryRepository.findById(id);
  const children = await categoryRepository.countByParent(id);
  if (children > 0) {
    throw ApiError.badRequest(
      "Cannot delete category with subcategories. Reassign or delete them first."
    );
  }

  if (category.image?.publicId) {
    await uploadService.deleteImage(category.image.publicId);
  }

  return categoryRepository.deleteById(id);
};
