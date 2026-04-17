// src/services/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server indicates that the token is no longer valid
    const isVerify2FA = error.config?.url?.includes("/auth/verify-2fa");

    // If the error is 503, we don't delete cookies! 
    // Just return the error so the interface shows "Maintenance"
    if (error.response?.status === 503) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const isAdminPath = url.pathname.includes("/admin");
        const isSyncTab = url.searchParams.get("tab") === "sync";
        const isMaintenancePage = url.pathname.includes("/maintenance");

        // Route to maintenance ONLY if:
        // 1. We are not already on the maintenance page
        // 2. We are NOT admin on the sync tab
        if (!isMaintenancePage && !(isAdminPath && isSyncTab)) {
          window.location.href = "/maintenance";
          // Block the error propagation to stop the calling code from executing
          return new Promise(() => {}); 
        }
      }
      return Promise.reject(error);
    }

    if ((error.response?.status === 401 || error.response?.status === 403) && !isVerify2FA) {
      // Clear all auth data
      Cookies.remove("access_token");
      Cookies.remove("user_role");
      localStorage.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;