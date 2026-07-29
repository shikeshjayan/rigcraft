import api from "../shared/api/axios";

export const paymentService = {
  createRazorpayOrder: async (orderData) => {
    const { data } = await api.post("/payments/create-razorpay-order", orderData);
    return data;
  },

  verifyPayment: async (paymentData) => {
    const { data } = await api.post("/payments/verify", paymentData);
    return data;
  },
};
