import axios from "axios";
import { getToken, clearAuth } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("API_BASE_URL configured as:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// On 401 — wipe auth and redirect
api.interceptors.response.use(
  (res) => {
    console.log(`[API] Response from ${res.config.url}:`, res.status);
    return res;
  },
  (err) => {
    console.error(`[API] Error from ${err.config?.url}:`, {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      fullError: err.response?.data
    });
    if (err.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authService = {
  signup:         (data) => api.post("/auth/signup", data),
  login:          (data) => api.post("/auth/login",  data),
  getMe:          ()     => api.get("/auth/me"),
  updateProfile:  (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const productService = {
  getAll:   (search = "") => api.get(`/products${search ? `?search=${search}` : ""}`),
  getById:  (id)          => api.get(`/products/${id}`),
  create:   (data)        => api.post("/products", data),
  update:   (id, data)    => api.put(`/products/${id}`, data),
  remove:   (id)          => api.delete(`/products/${id}`),
};

export const billService = {
  getAll:   ()   => api.get("/bills"),
  getById:  (id) => api.get(`/bills/${id}`),
  create:   (data) => api.post("/bills", data),
  remove:   (id) => api.delete(`/bills/${id}`),
};

export const draftService = {
  getAll:      ()         => api.get("/drafts"),
  getById:     (id)       => api.get(`/drafts/${id}`),
  create:      (data)     => api.post("/drafts", data),
  update:      (id, data) => api.put(`/drafts/${id}`, data),
  remove:      (id)       => api.delete(`/drafts/${id}`),
  clearAll:    ()         => api.delete("/drafts"),
};

export const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
};
