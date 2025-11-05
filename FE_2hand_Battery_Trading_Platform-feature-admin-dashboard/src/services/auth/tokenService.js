import { API_CONFIG, API_ENDPOINTS } from "../api/config";

/**
 * Token Service
 * Quản lý authentication tokens và user info trong localStorage
 * Sử dụng fetch API để tránh circular dependency với axios
 */
export const tokenService = {
  // Set access and refresh tokens
  setTokens(accessToken, refreshToken = null) {
    localStorage.setItem("accessToken", accessToken);
    // Chỉ lưu refreshToken nếu khác với accessToken
    if (refreshToken && refreshToken !== accessToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  // Get access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  },

  // Get refresh token
  getRefreshToken() {
    // Nếu không có refreshToken riêng, trả về accessToken
    return localStorage.getItem("refreshToken") || localStorage.getItem("accessToken");
  },

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  },

  // Set user info
  setUserInfo(userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },

  // Get user info
  getUserInfo() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  // Check if token is expired
  isTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Refresh Access Token
   * Sử dụng fetch API thay vì axios để tránh circular dependency
   * khi interceptor gọi refreshAccessToken
   */
  async refreshAccessToken() {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error("No token available");
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const result = await response.json();
        // API trả về: { success: true, data: { token: "..." } }
        if (result.success && result.data?.token) {
          this.setTokens(result.data.token, result.data.token);
          return result.data.token;
        }
      }
      
      throw new Error("Failed to refresh token");
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
};
