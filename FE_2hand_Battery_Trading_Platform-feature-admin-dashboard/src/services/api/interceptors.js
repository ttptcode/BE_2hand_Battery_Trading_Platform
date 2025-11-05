import { tokenService } from "../auth/tokenService";
import { normalizeImageUrl, normalizeImageUrls } from "../../utils/imageUrlHelper";

/**
 * Request/Response Interceptors
 * Quản lý việc thêm token vào request và xử lý response errors
 */
export const setupInterceptors = (apiClient) => {
  /**
   * Request Interceptor
   * Tự động thêm Authorization header với Bearer token vào mọi request
   */
  apiClient.interceptors.request.use(
    async (config) => {
      const accessToken = tokenService.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      // QUAN TRỌNG: Với FormData (multipart/form-data), không set Content-Type
      // Axios sẽ tự động set Content-Type với boundary
      // Nếu data là FormData, xóa Content-Type header để Axios tự động set
      if (config.data instanceof FormData) {
        // Xóa Content-Type header để Axios tự động set với boundary
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        console.log('📦 FormData detected - letting Axios set Content-Type automatically');
      }
      
      // Trong development mode, thêm header để bypass authentication
      const isDevelopment = import.meta.env.DEV;
      if (isDevelopment) {
        config.headers['X-Development-Mode'] = 'true';
        
        // Lấy user ID từ localStorage thay vì hardcode
        try {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user.userId) {
              config.headers['X-User-ID'] = user.userId;
            }
          }
        } catch (error) {
          console.error('❌ Interceptor - Error getting user ID from localStorage:', error);
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  /**
   * Response Interceptor
   * Xử lý các lỗi response, đặc biệt là 401 Unauthorized
   * Tự động refresh token khi token hết hạn
   * Tự động normalize image URLs trong responses
   */
  apiClient.interceptors.response.use(
    (response) => {
      // Tự động normalize image URLs trong response data
      if (response.data) {
        response.data = normalizeResponseData(response.data);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Xử lý lỗi 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        const currentToken = tokenService.getAccessToken();
        
        // Không có token -> lỗi login thất bại, không cần refresh
        if (!currentToken) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Thử refresh token
          const newToken = await tokenService.refreshAccessToken();
          
          if (newToken) {
            // Retry request với token mới
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh thất bại -> clear tokens và yêu cầu đăng nhập lại
          tokenService.clearTokens();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Recursively normalize image URLs in response data
 * Tự động normalize tất cả image URLs từ API responses
 * @param {any} data - Response data
 * @returns {any} - Normalized data
 */
const normalizeResponseData = (data) => {
  if (!data) return data;
  
  // Nếu là array
  if (Array.isArray(data)) {
    return data.map(item => normalizeResponseData(item));
  }
  
  // Nếu là object
  if (typeof data === 'object' && data !== null) {
    const normalized = { ...data };
    
    // Normalize các field có thể chứa image URLs
    const imageFields = ['imageUrl', 'imageUrls', 'videoUrl', 'videoUrls', 'url', 'preview', 'thumbnail', 'avatar', 'photo'];
    
    for (const field of imageFields) {
      if (normalized[field]) {
        if (Array.isArray(normalized[field])) {
          normalized[field] = normalizeImageUrls(normalized[field]);
        } else if (typeof normalized[field] === 'string') {
          normalized[field] = normalizeImageUrl(normalized[field]);
        }
      }
    }
    
    // Nếu có item object với imageUrls
    if (normalized.item) {
      normalized.item = normalizeResponseData(normalized.item);
    }
    
    // Nếu có data array (listings, items, etc.)
    if (normalized.data && Array.isArray(normalized.data)) {
      normalized.data = normalized.data.map(item => normalizeResponseData(item));
    }
    
    // Recursively normalize nested objects (tránh infinite loop)
    for (const key in normalized) {
      if (normalized[key] && typeof normalized[key] === 'object' && !Array.isArray(normalized[key]) && !imageFields.includes(key)) {
        normalized[key] = normalizeResponseData(normalized[key]);
      }
    }
    
    return normalized;
  }
  
  return data;
};
