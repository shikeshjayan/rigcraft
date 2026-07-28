import faqRepository from "../repositories/faq.repository.js";
import ApiError from "../utils/ApiError.js";

export const listPublic = async () => {
  return faqRepository.findActive();
};

export const adminList = async (query = {}) => {
  return faqRepository.findAllPaginated(query);
};

export const getById = async (id) => {
  return faqRepository.findById(id);
};

export const create = async (data) => {
  return faqRepository.create(data);
};

export const update = async (id, data) => {
  return faqRepository.updateById(id, data);
};

export const remove = async (id) => {
  return faqRepository.deleteById(id);
};