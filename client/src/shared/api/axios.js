import axios from "axios";

const axiosInstance = axios.create({
  // Same-origin: the Vite dev proxy and the Vercel rewrite forward /api to the
  // backend, so HttpOnly cookies remain first-party.
  baseURL: "/api/v1",
  timeout: 30000,
  withCredentials: true,
});

export default axiosInstance;
