
import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "../api/config";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request: Thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: Xử lý 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Lấy userId từ token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return (
      payload["sub"] ||
      payload["userId"] ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      null
    );
  } catch (error) {
    console.warn("Token không hợp lệ:", error);
    return null;
  }
};

// Cache userId
let cachedUserId = null;

export const userService = {
  getUserItems: (userId) => {
    const url = API_ENDPOINTS.ITEMS.BY_USER.replace(":userId", userId);
    return api.get(url);
  },

  getUserById: (userId) => {
    const url = API_ENDPOINTS.USERS.DETAIL.replace(":userId", userId);
    return api.get(url);
  },

  /**
   * Lấy danh sách yêu thích của user
   * @param {string} userId
   * @returns {Promise<AxiosResponse>}
   */
  getFavoritesByUser: (userId) => {
    const url = API_ENDPOINTS.FAVORITE.USER_FAVORITES.replace(":userId", userId);
    return api.get(url);
  },

  getUserPackages: (userId) => {
    const url = API_ENDPOINTS.USERS.PACKAGES.replace(":userId", userId);
    return api.get(url);
  },

  /**
   * Toggle yêu thích
   * @param {string} userId
   * @param {string} listingId
   * @returns {Promise<AxiosResponse>}
   */
  toggleFavorite: (userId, listingId) => {
    return api.post(API_ENDPOINTS.FAVORITE.TOGGLE, {
      userId,
      listingId,
    });
  },

  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy thông tin user hiện tại:", error);
      return null;
    }
  },

  async getCurrentUserId() {
    if (cachedUserId) return cachedUserId;

    const fromToken = getUserIdFromToken();
    if (fromToken) {
      cachedUserId = fromToken;
      return fromToken;
    }

    const user = await this.getCurrentUser();
    cachedUserId = user?.userId || null;
    return cachedUserId;
  },
};