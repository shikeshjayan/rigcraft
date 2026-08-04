import axiosInstance from "./axios";
import { getToken, setToken, clearToken } from "../auth/token";

// Request Interceptor — attach the JWT as a Bearer token so cross-site
// requests (Vercel frontend -> Render API) authenticate without relying on
// cookies, which modern browsers block for third-party sites.
const tokenIssuingRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/refresh-token",
];

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const url = response.config?.url || "";
    // Persist the token centrally so every login path (customer + admin)
    // is covered in one place.
    if (tokenIssuingRoutes.some((route) => url.includes(route))) {
      const token = response.data?.data?.accessToken;
      if (token) setToken(token);
    }
    return response;
  },

  async (error) => {
    const publicAuthRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/check",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/google",
      "/auth/refresh-token",
    ];
    const isPublicAuth = publicAuthRoutes.some((route) => error.config?.url?.includes(route));

    if (error.response?.status === 401 && !isPublicAuth) {
      console.error("🔥 401 UNAUTHORIZED CAUGHT BY INTERCEPTOR 🔥");
      console.error("Error Response Data:", error.response.data);
      console.error("Request URL:", error.config?.url);

      clearToken();
      // Remove any stale token that may linger in legacy localStorage.
      localStorage.removeItem("accessToken");

      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;