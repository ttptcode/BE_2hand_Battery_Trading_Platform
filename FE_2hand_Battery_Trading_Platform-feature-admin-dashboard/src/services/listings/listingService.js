import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

/**
 * Listing Service
 * Quản lý tất cả các API liên quan đến listings
 */

export const listingService = {
  /**
   * Lấy tất cả listings (chỉ status = Active)
   * @returns {Promise<Object>} Danh sách listings
   */
  async getAllListings() {
    try {
      const response = await apiClient.get('/Listings');
      
      if (response.data?.success && response.data?.data) {
        // Filter chỉ lấy listings có status = "Active" và có item
        const activeListings = response.data.data.filter(
          listing => listing.status === 'Active' && listing.item
        );
        
        return {
          success: true,
          data: activeListings
        };
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error('❌ listingService - Error getting listings:', error);
      throw error;
    }
  },

  /**
   * Get listing by listingId
   * @param {string} listingId - ID của listing
   */
  async getListingById(listingId) {
    try {
      const response = await apiClient.get(`/Listings/${listingId}`);
      return response.data;
    } catch (error) {
      console.error('❌ listingService - Error getting listing:', error);
      throw error;
    }
  },

  /**
   * Get listing by itemId (tìm listing chứa item này)
   * @param {string} itemId - ID của item
   */
  async getListingByItemId(itemId) {
    try {
      const response = await this.getAllListings();
      
      if (response.success && response.data) {
        const listing = response.data.find(
          listing => listing.item?.itemId === itemId
        );
        
        if (listing) {
          return {
            success: true,
            data: listing
          };
        }
        
        return {
          success: false,
          message: 'Listing not found for this item'
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ listingService - Error finding listing by itemId:', error);
      throw error;
    }
  },

  /**
   * Tạo một proxy bid mới
   * @param {Object} bidData - Dữ liệu của proxy bid cần tạo
   * @returns {Promise} Response với thông tin proxy bid vừa tạo
   */
  async createProxyBid(bidData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LISTINGS.PROXY_BID, bidData);
      return response;
    } catch (error) {
      console.error('Create Proxy Bid Error:', error);
      throw error;
    }
  },

  /**
   * Tạo một listing mới
   * @param {Object} listingData - Dữ liệu của listing cần tạo
   * @returns {Promise} Response với thông tin listing vừa tạo
   */
  async createListing(listingData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LISTINGS.CREATE, listingData);
      return response;
    } catch (error) {
      console.error('Create Listing Error:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin của một listing
   * @param {string} listingId - ID của listing cần cập nhật
   * @param {Object} updateData - Dữ liệu cập nhật cho listing
   * @returns {Promise} Response với thông tin cập nhật của listing
   */
  async updateListing(listingId, updateData) {
    try {
      if (!listingId) throw new Error('Listing ID is required');
      const endpoint = API_ENDPOINTS.LISTINGS.UPDATE.replace(':listingId', listingId);
      const response = await apiClient.put(endpoint, updateData);
      return response;
    } catch (error) {
      console.error('Update Listing Error:', error);
      throw error;
    }
  },

  /**
   * Xóa một listing
   * @param {string} listingId - ID của listing cần xóa
   * @returns {Promise} Response xác nhận việc xóa listing
   */
  async deleteListing(listingId) {
    try {
      if (!listingId) throw new Error('Listing ID is required');
      const endpoint = API_ENDPOINTS.LISTINGS.DELETE.replace(':listingId', listingId);
      const response = await apiClient.delete(endpoint);
      return response;
    } catch (error) {
      console.error('Delete Listing Error:', error);
      throw error;
    }
  },

  /**
   * Get listings by user ID
   * @param {string} userId - ID của user
   * @returns {Promise} Response với danh sách listings của user
   */
  async getListingsByUserId(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const endpoint = API_ENDPOINTS.LISTINGS.BY_USER.replace(':userId', userId);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get User Listings Error:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách các listings theo loại
   * @param {string} listingType - Loại của listing
   * @returns {Promise} Response với danh sách các listings theo loại
   */
  async getListingsByType(listingType) {
    try {
      if (!listingType) throw new Error('Listing type is required');
      const endpoint = API_ENDPOINTS.LISTINGS.BY_TYPE.replace(':listingType', listingType);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get Listings By Type Error:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách các listings theo ID của item
   * @param {string} itemId - ID của item
   * @returns {Promise} Response với danh sách các listings theo ID của item
   */
  async getListingsByItemId(itemId) {
    try {
      if (!itemId) throw new Error('Item ID is required');
      const endpoint = API_ENDPOINTS.LISTINGS.BY_ITEM.replace(':itemId', itemId);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get Listings By Item Error:', error);
      throw error;
    }
  },

  /**
   * Toggle listing status (Draft ↔ Active)
   * Chuyển đổi trạng thái của listing giữa Draft và Active
   * @param {string} listingId - ID của listing cần toggle status
   * @returns {Promise} Response với thông tin listing sau khi toggle
   */
  async toggleListingStatus(listingId) {
    try {
      console.log('🔄 Toggling listing status:', listingId);
      
      if (!listingId) {
        throw new Error('Listing ID is required');
      }

      const endpoint = `/Listings/${listingId}/toggle-status`;
      const response = await apiClient.patch(endpoint);
      
      console.log('✓ Toggle status successful:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Toggle Listing Status Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Full Error Object:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  }
};