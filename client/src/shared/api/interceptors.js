import axios from "axios";
import axiosInstance from "./axios";

// A valid session is proven solely by the HttpOnly cookies the browser sends
// (first-party via the same-origin Vite/Vercel proxy). No Bearer token is ever
// attached and nothing auth-related is persisted to localStorage.

const publicAuthRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/check",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/google",
  "/auth/refresh-token",
];

const isPublicAuth = (url) => publicAuthRoutes.some((route) => url?.includes(route));

// Serialize refresh attempts so concurrent 401s trigger exactly one /refresh-token
// round-trip and every waiter reuses the same promise.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = axios
    .post("/api/v1/auth/refresh-token", null, { withCredentials: true })
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const forceLogout = () => {
  // Best-effort sweep of every legacy/stale storage key so nothing auth-shaped
  // survives in localStorage.
  ["rigcraft_token", "accessToken", "rigcraft_auth", "rigcraft_user", "admin-auth-storage"].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable
    }
  });
  window.dispatchEvent(new Event("rigcraft:auth-logout"));

  const isAdmin = window.location.pathname.startsWith("/admin");
  window.location.href = isAdmin ? "/admin/login" : "/login";
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const url = config.url || "";

    // Public auth endpoints return 401 for bad credentials, invalid tokens, etc.
    // Those must be surfaced to the caller untouched (no refresh, no redirect).
    if (isPublicAuth(url) || config._skipAuthRedirect) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Already retried this request after a refresh — the session is dead.
    if (config._retried) {
      forceLogout();
      return Promise.reject(error);
    }

    try {
      await refreshAccessToken();
      config._retried = true;
      return axiosInstance(config);
    } catch (refreshError) {
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;