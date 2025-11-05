import axios from "axios";
import { API_CONFIG } from "./config";
import { setupInterceptors } from "./interceptors";

/**
 * Axios Instance Configuration
 * Tạo và cấu hình axios instance chung cho toàn bộ ứng dụng
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Setup Request/Response interceptors
setupInterceptors(apiClient);

export default apiClient;
