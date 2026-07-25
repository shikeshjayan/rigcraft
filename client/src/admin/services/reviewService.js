import api from "../../shared/api/axios";

const useMock = true;

const MOCK_REVIEWS = [
  { id: 1, product: { id: 1, name: "Intel Core i9-14900K" }, customer: { id: 1, name: "John Doe" }, rating: 5, title: "Amazing processor!", comment: "Fastest CPU I've ever used. Handles everything I throw at it.", status: "approved", createdAt: "2025-06-10T10:00:00Z" },
  { id: 2, product: { id: 3, name: "NVIDIA GeForce RTX 4090" }, customer: { id: 2, name: "Jane Smith" }, rating: 5, title: "Worth every penny", comment: "4K gaming at max settings is incredible. The card runs cool too.", status: "approved", createdAt: "2025-06-12T14:00:00Z" },
  { id: 3, product: { id: 4, name: "Corsair Vengeance DDR5 32GB" }, customer: { id: 3, name: "Bob Wilson" }, rating: 4, title: "Great RAM, easy install", comment: "Works perfectly with my AM5 build. XMP enabled without issues.", status: "approved", createdAt: "2025-06-14T09:00:00Z" },
  { id: 4, product: { id: 5, name: "Samsung 990 Pro 2TB" }, customer: { id: 4, name: "Alice Brown" }, rating: 2, title: "Disappointed", comment: "Drive failed after 2 weeks. Had to RMA.", status: "pending", createdAt: "2025-06-18T11:00:00Z" },
  { id: 5, product: { id: 2, name: "AMD Ryzen 9 7950X" }, customer: { id: 5, name: "Charlie Davis" }, rating: 4, title: "Great for productivity", comment: "Runs hot but performance is outstanding for video editing.", status: "approved", createdAt: "2025-06-16T16:00:00Z" },
  { id: 6, product: { id: 1, name: "Intel Core i9-14900K" }, customer: { id: 6, name: "Diana Lee" }, rating: 1, title: "Overheating issues", comment: "Thermal throttles out of the box even with a 360mm AIO.", status: "pending", createdAt: "2025-06-19T08:00:00Z" },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const paginate = (data, page, pageSize) => {
  const start = page * pageSize;
  return { data: data.slice(start, start + pageSize), total: data.length };
};

export const reviewService = {
  list: async ({ page = 0, pageSize = 10, search = "", status = "", rating = "" } = {}) => {
    if (useMock) {
      await delay(300);
      let filtered = [...MOCK_REVIEWS];
      if (search) filtered = filtered.filter((r) => r.product.name.toLowerCase().includes(search.toLowerCase()) || r.customer.name.toLowerCase().includes(search.toLowerCase()));
      if (status) filtered = filtered.filter((r) => r.status === status);
      if (rating) filtered = filtered.filter((r) => r.rating === Number(rating));
      return paginate(filtered, page, pageSize);
    }
    const { data } = await api.get("/admin/reviews", { params: { page, pageSize, search, status, rating } });
    return data;
  },

  getById: async (id) => {
    if (useMock) {
      await delay(200);
      const review = MOCK_REVIEWS.find((r) => r.id === id);
      if (!review) throw new Error("Review not found");
      return review;
    }
    const { data } = await api.get(`/admin/reviews/${id}`);
    return data;
  },

  updateStatus: async (id, status) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_REVIEWS.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Review not found");
      MOCK_REVIEWS[idx].status = status;
      return MOCK_REVIEWS[idx];
    }
    const { data } = await api.patch(`/admin/reviews/${id}/status`, { status });
    return data;
  },

  delete: async (id) => {
    if (useMock) {
      await delay(200);
      const idx = MOCK_REVIEWS.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Review not found");
      MOCK_REVIEWS.splice(idx, 1);
      return { success: true };
    }
    const { data } = await api.delete(`/admin/reviews/${id}`);
    return data;
  },
};
