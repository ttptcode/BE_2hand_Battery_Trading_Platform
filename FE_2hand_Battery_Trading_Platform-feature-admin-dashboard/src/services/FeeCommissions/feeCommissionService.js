import apiClient from '../api/index.js';
import { API_ENDPOINTS } from '../api/config.js';

/**
 * FeeCommission Service
 * Quản lý tất cả các API liên quan đến phí và hoa hồng
 */

/**
 * Lấy danh sách các gói phí (cho khách hàng)
 * @returns {Promise<Object>} Danh sách các gói phí
 */
export const getFeePackages = async () => {
  try {
    // Sửa lỗi: Endpoint đúng là GET_PACKAGES
    const response = await apiClient.get(API_ENDPOINTS.FEE_COMMISSIONS.GET_PACKAGES);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching fee packages:', error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Lấy tất cả phí & hoa hồng (cho admin)
 * @param {Object} params - (Tùy chọn) Query params (ví dụ: page, limit)
 * @returns {Promise<Object>} Danh sách phí
 */
export const getAllFees = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.FEE_COMMISSIONS.LIST, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching all fees:', error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Lấy chi tiết một khoản phí bằng ID
 * @param {string} feeId - ID của khoản phí
 * @returns {Promise<Object>} Chi tiết khoản phí
 */
export const getFeeById = async (feeId) => {
  if (!feeId) throw new Error('feeId is required');
  try {
    const path = API_ENDPOINTS.FEE_COMMISSIONS.GET_BY_ID.replace(':feeId', feeId);
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching fee with ID ${feeId}:`, error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Tạo một khoản phí mới
 * @param {Object} feeData - Dữ liệu của khoản phí mới (ví dụ: { name, price, type, ... })
 * @returns {Promise<Object>} Khoản phí vừa được tạo
 */
export const createFee = async (feeData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FEE_COMMISSIONS.POST, feeData);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating fee:', error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Cập nhật một khoản phí
 * @param {string} feeId - ID của khoản phí cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Khoản phí vừa được cập nhật
 */
export const updateFee = async (feeId, updateData) => {
  if (!feeId) throw new Error('feeId is required');
  try {
    const path = API_ENDPOINTS.FEE_COMMISSIONS.UPDATE.replace(':feeId', feeId);
    const response = await apiClient.put(path, updateData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating fee with ID ${feeId}:`, error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Xóa một khoản phí
 * @param {string} feeId - ID của khoản phí cần xóa
 * @returns {Promise<Object>} Kết quả từ server (thường là status 204)
 */
export const deleteFee = async (feeId) => {
  if (!feeId) throw new Error('feeId is required');
  try {
    const path = API_ENDPOINTS.FEE_COMMISSIONS.DELETE.replace(':feeId', feeId);
    const response = await apiClient.delete(path);
    return response.data; // Hoặc trả về response.status
  } catch (error) {
    console.error(`❌ Error deleting fee with ID ${feeId}:`, error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};