import apiClient from "../api";

/**
 * User Package Service
 * Quản lý API liên quan đến gói đăng tin của người dùng
 */

export const userPackageService = {
  /**
   * Lấy danh sách các gói đăng tin của user
   * @returns {Promise<Object>} Danh sách user packages
   */
  async getUserPackages() {
    try {
      const response = await apiClient.get('/UserPackages');
      return response.data;
    } catch (error) {
      console.error('❌ userPackageService - Error getting user packages:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra và lấy gói đăng tin active của user
   * @returns {Promise<Object|null>} Trả về feeId nếu có gói active, null nếu không
   */
  async getActivePackage() {
    try {
      const response = await this.getUserPackages();
      
      // Response structure mới: response.data.packages là array
      const packages = response?.data?.packages || response?.data;
      
      if (response?.success && packages && Array.isArray(packages)) {
        // Tìm gói có status = "Active"
        const activePackage = packages.find(pkg => pkg.status === 'Active');
        
        if (activePackage) {
          console.log('✅ Tìm thấy gói đăng tin Active:', {
            feeId: activePackage.feeId,
            feeName: activePackage.feeCommission?.feeName,
            feeType: activePackage.feeCommission?.feeType,
            remainingListings: activePackage.remainingListings,
            expiredAt: activePackage.expiredAt
          });
          
          return {
            feeId: activePackage.feeId,
            feeName: activePackage.feeCommission?.feeName,
            feeType: activePackage.feeCommission?.feeType,
            remainingListings: activePackage.remainingListings,
            expiredAt: activePackage.expiredAt,
            package: activePackage
          };
        }
        
        console.log('⚠️ Không tìm thấy gói đăng tin Active');
        return null;
      }
      
      console.log('⚠️ Response không hợp lệ hoặc không có data');
      return null;
    } catch (error) {
      console.error('❌ userPackageService - Error getting active package:', error);
      // Không throw error, trả về null để xử lý thanh toán phí lẻ
      return null;
    }
  },

  /**
   * Kiểm tra xem user có gói đăng tin active không
   * @returns {Promise<boolean>} True nếu có gói active, false nếu không
   */
  async hasActivePackage() {
    const activePackage = await this.getActivePackage();
    return activePackage !== null;
  }
};

