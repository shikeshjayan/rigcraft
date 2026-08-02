import axiosInstance from "./axios";

// Request Interceptor — no-op; auth handled via httpOnly cookies.
// (Previously read accessToken from localStorage — removed for XSS safety.)

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const publicAuthRoutes = ['/auth/login', '/auth/register', '/auth/check', '/auth/forgot-password', '/auth/reset-password', '/auth/google'];
    const isPublicAuth = publicAuthRoutes.some(route => error.config?.url?.includes(route));

    if (error.response?.status === 401 && !isPublicAuth) {
      console.error("🔥 401 UNAUTHORIZED CAUGHT BY INTERCEPTOR 🔥");
      console.error("Error Response Data:", error.response.data);
      console.error("Request URL:", error.config?.url);

      // Cookie is cleared server-side via the logout endpoint.
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
