import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";
import { authService } from "./authService";

/**
 * Phone Update Service
 * Handles phone number and password updates
 */
export const phoneUpdateService = {
  /**
   * Update user's phone number and password
   * @param {Object} data - { phone: string, password: string }
   * @returns {Promise<Object>} Response data
   */
  async updatePhonePassword(data) {
    try {
      console.log('📞 Updating phone and password:', { phone: data.phone });
      console.log('📞 API Endpoint:', API_ENDPOINTS.AUTH.UPDATE_PHONE_PASSWORD);
      
      // Get userId from multiple possible sources
      const userInfo = authService.getUserInfo();
      console.log('📞 Current userInfo from localStorage:', userInfo);
      
      // Try to get userId from different sources
      let userId = userInfo?.userId;
      
      // Fallback: check other possible keys in localStorage
      if (!userId) {
        console.warn('⚠️ userId not found in userInfo, checking alternatives...');
        
        // Check if stored directly in localStorage
        userId = localStorage.getItem('id') || localStorage.getItem('userId');
        
        // Check user object
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          userId = userId || user.userId || user.id;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      console.log('📞 Resolved userId:', userId);
      
      if (!userId) {
        console.error('❌ Cannot find userId from any source');
        console.error('Available localStorage keys:', Object.keys(localStorage));
        throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
      
      // Prepare request data - API expects "userId", "phone" and "password"
      const requestData = {
        userId: userId,    // ✅ Required by backend
        phone: data.phone  // ✅ Use "phone" not "phoneNumber"
      };
      
      // If password is provided, add it to request
      if (data.password && data.password.trim()) {
        requestData.password = data.password;
      }
      
      console.log('📞 Request data:', requestData);
      
      // Step 1: Update phone and password (using PUT method with userId)
      const response = await apiClient.put(
        API_ENDPOINTS.AUTH.UPDATE_PHONE_PASSWORD,
        requestData
      );

      console.log('✅ Phone and password updated successfully');
      console.log('✅ Update response:', response.data);
      
      // Step 2: Fetch latest user info from backend to sync localStorage
      console.log('🔄 Fetching latest user info from backend...');
      const userDetailEndpoint = API_ENDPOINTS.USERS.DETAIL.replace(':userId', userId);
      const userDetailResponse = await apiClient.get(userDetailEndpoint);
      
      if (userDetailResponse.data?.success && userDetailResponse.data?.data) {
        const latestUserData = userDetailResponse.data.data;
        console.log('✅ Latest user data:', latestUserData);
        
        // Update userInfo in localStorage with latest data from backend
        const updatedUserInfo = {
          userId: latestUserData.userId,
          fullName: latestUserData.fullName || userInfo.fullName,
          email: latestUserData.email || userInfo.email,
          phone: latestUserData.phone,  // Updated phone from backend
          role: userInfo.role,  // Keep existing role
          username: latestUserData.fullName || userInfo.username,
          status: latestUserData.status,
          createdAt: latestUserData.createdAt
        };
        
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        console.log('💾 Updated userInfo in localStorage with latest data from backend');
        console.log('💾 New userInfo:', updatedUserInfo);
        
        // Dispatch event to notify components about userInfo change
        window.dispatchEvent(new Event('authStateChanged'));
      } else {
        // Fallback: just update phone if can't fetch latest data
        console.warn('⚠️ Could not fetch latest user data, updating phone only');
        userInfo.phone = data.phone;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error updating phone and password:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      console.error('❌ Error message:', error.message);
      console.error('❌ Request was:', error.config);
      throw error;
    }
  },

  /**
   * Check if user has phone number
   * @returns {boolean}
   */
  hasPhoneNumber() {
    const userInfo = authService.getUserInfo();
    return !!(userInfo && userInfo.phone && userInfo.phone.trim());
  },

  /**
   * Get user's phone number
   * @returns {string|null}
   */
  getPhoneNumber() {
    const userInfo = authService.getUserInfo();
    return userInfo?.phone || null;
  }
};

