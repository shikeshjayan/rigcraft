import api from "../shared/api/axios";
import { ENDPOINTS } from "../shared/api/endpoints";

export const reviewService = {
  getProductReviews: async (productId, params = {}) => {
    const { data } = await api.get(`${ENDPOINTS.REVIEW.LIST}/product/${productId}`, { params });
    return data;
  },

  getPrebuiltReviews: async (prebuiltId, params = {}) => {
    const { data } = await api.get(`${ENDPOINTS.REVIEW.LIST}/prebuilt/${prebuiltId}`, { params });
    return data;
  },

  getMyReviews: async (params = {}) => {
    const { data } = await api.get(`${ENDPOINTS.REVIEW.LIST}/me`, { params });
    return data;
  },

  getTestimonials: async () => {
    const { data } = await api.get(ENDPOINTS.REVIEW.TESTIMONIALS);
    return data;
  },

  create: async (reviewData) => {
    const { data } = await api.post(ENDPOINTS.REVIEW.CREATE_PRODUCT, reviewData);
    return data;
  },

  createTestimonial: async (reviewData) => {
    const { data } = await api.post(ENDPOINTS.REVIEW.CREATE_TESTIMONIAL, reviewData);
    return data;
  },

  toggleHelpful: async (id) => {
    const { data } = await api.patch(ENDPOINTS.REVIEW.HELPFUL(id));
    return data;
  },

  report: async (id, payload) => {
    const { data } = await api.post(ENDPOINTS.REVIEW.REPORT(id), payload);
    return data;
  },

  update: async (id, reviewData) => {
    const { data } = await api.put(ENDPOINTS.REVIEW.UPDATE(id), reviewData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(ENDPOINTS.REVIEW.DELETE(id));
    return data;
  },
};
