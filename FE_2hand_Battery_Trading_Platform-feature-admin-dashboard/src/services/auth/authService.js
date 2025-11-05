import apiClient from "../api";
import { API_ENDPOINTS, API_CONFIG } from "../api/config";
import { tokenService } from "./tokenService";

// Login, logout, register service
export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        phoneNumber: credentials.phoneNumber,
        password: credentials.password
      });
      
      // Chỉ lưu tokens khi login thành công (success: true)
      if (response.data?.success === true && response.data?.data) {
        const { token, userId, fullName, phone, role } = response.data.data;
        
        // Lưu token (API chỉ trả về 1 token, không có refreshToken)
        if (token) {
          tokenService.setTokens(token, token);
        }
        
        // Lưu thông tin user
        const userInfo = {
          userId,
          fullName,
          phone,
          role,
          username: fullName // Thêm username cho tương thích với code cũ
        };
        
        tokenService.setUserInfo(userInfo);
        
        // Dispatch event để notify các component khác về auth state change
        window.dispatchEvent(new Event('authStateChanged'));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        password: userData.password
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const token = tokenService.getAccessToken();
      
      if (token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
          token
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Xóa tokens bất kể API call có thành công hay không
      tokenService.clearTokens();
      
      // Dispatch event để notify các component khác về auth state change
      window.dispatchEvent(new Event('authStateChanged'));
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check authentication status
  isAuthenticated() {
    return tokenService.isAuthenticated() && !tokenService.isTokenExpired();
  },

  // Get user info from token
  getUserInfo() {
    return tokenService.getUserInfo();
  },

  // Google Login - Redirect to Google OAuth
  googleLogin() {
    const googleLoginUrl = `${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    // Lưu URL hiện tại để redirect về sau khi login
    sessionStorage.setItem('preLoginUrl', window.location.pathname);
    
    // Lưu frontend domain vào cả localStorage và sessionStorage
    // Để redirect page trên backend có thể đọc được
    try {
      localStorage.setItem('frontendDomain', window.location.origin);
      sessionStorage.setItem('frontendDomain', window.location.origin);
    } catch (e) {
      console.warn('Could not save frontend domain:', e);
    }
    
    // Tạo callback URL để backend redirect về sau khi login thành công
    const callbackUrl = `${window.location.origin}/auth/google/callback`;
    
    // QUAN TRỌNG: Dùng absolute URL đến backend để redirect trực tiếp
    // Không dùng proxy qua Netlify function vì redirect OAuth cần direct
    const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
    const backendBaseUrl = isProduction 
      ? 'http://vehiclemarket.runasp.net/api'  // Dùng HTTP trực tiếp cho OAuth redirect
      : 'http://vehiclemarket.runasp.net/api'; // Local cũng dùng HTTP
    
    console.log('🔐 Google Login - Redirecting to:', `${backendBaseUrl}${googleLoginUrl}?returnUrl=${encodeURIComponent(callbackUrl)}`);
    
    // Redirect đến Google OAuth với callback URL
    // Backend sẽ redirect về http://vehiclemarket.runasp.net/signin-google
    // và redirect page sẽ forward về frontend domain
    window.location.href = `${backendBaseUrl}${googleLoginUrl}?returnUrl=${encodeURIComponent(callbackUrl)}`;
  },

  // Handle Google OAuth callback
  async handleGoogleCallback(queryParams) {
    try {
      // Parse query parameters từ callback URL
      const urlParams = new URLSearchParams(queryParams);
      const token = urlParams.get('token');
      const userId = urlParams.get('userId');
      const fullName = urlParams.get('fullName');
      const email = urlParams.get('email');
      const phone = urlParams.get('phone');
      const role = urlParams.get('role');
      const success = urlParams.get('success');

      // Log để debug
      console.log('🔍 Google callback params:', {
        hasToken: !!token,
        hasUserId: !!userId,
        hasFullName: !!fullName,
        hasEmail: !!email,
        success,
        queryString: queryParams
      });

      // Kiểm tra success parameter (backend có thể gửi success=true)
      if (success === 'false' || (success !== 'true' && !token)) {
        const error = urlParams.get('error') || 'Authentication failed';
        const message = urlParams.get('message') || 'Đăng nhập Google thất bại';
        throw new Error(message);
      }

      if (!token) {
        throw new Error('Token không tồn tại trong callback');
      }

      // Lưu token trước để có thể gọi API
      tokenService.setTokens(token, token);

      let userInfo;

      // Nếu có đầy đủ thông tin user trong query params
      if (userId && (fullName || email)) {
        userInfo = {
          userId: userId,
          fullName: fullName || email || 'User',
          email: email || '',
          phone: phone || '',
          role: role || 'User',
          username: fullName || email || 'User'
        };
      } else {
        // Nếu không có user info, gọi API để lấy thông tin user
        try {
          const response = await this.getCurrentUser();
          if (response.data?.success && response.data?.data) {
            const userData = response.data.data;
            userInfo = {
              userId: userData.userId || userData.id || '',
              fullName: userData.fullName || userData.name || '',
              phone: userData.phone || userData.phoneNumber || '',
              role: userData.role || 'User',
              username: userData.fullName || userData.name || userData.username || ''
            };
          } else {
            throw new Error('Không thể lấy thông tin user');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          // Nếu không lấy được user info, tạo một object mặc định
          userInfo = {
            userId: '',
            fullName: 'User',
            phone: '',
            role: 'User',
            username: 'User'
          };
        }
      }
      
      // Lưu thông tin user
      tokenService.setUserInfo(userInfo);

      // Dispatch event để notify các component khác về auth state change
      window.dispatchEvent(new Event('authStateChanged'));

      return {
        success: true,
        data: userInfo
      };
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }
};
