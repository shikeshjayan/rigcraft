import axiosInstance from "./axios";

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      console.error("🔥 401 UNAUTHORIZED CAUGHT BY INTERCEPTOR 🔥");
      console.error("Error Response Data:", error.response.data);
      console.error("Request URL:", error.config.url);
      
      alert(`401 Error on ${error.config.url}: ${error.response.data?.message || 'Unknown error'}\n\nCheck console for details before it redirects.`);

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
