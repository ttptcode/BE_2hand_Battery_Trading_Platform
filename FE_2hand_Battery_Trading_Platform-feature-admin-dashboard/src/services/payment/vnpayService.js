import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

/**
 * VNPay Payment Service
 * Quản lý các API calls liên quan đến thanh toán VNPay
 */
export const vnpayService = {
  /**
   * Create VNPay payment
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - Amount to pay
   * @param {string} paymentData.feeId - Fee package ID
   * @returns {Promise} Response with payment URL
   */
  async createPayment(paymentData) {
    try {
      // Lưu current path để redirect về sau khi thanh toán thành công
      const postingPath = sessionStorage.getItem('postingPath');
      if (postingPath) {
        sessionStorage.setItem('returnAfterPayment', postingPath);
        console.log('💾 Saved return path:', postingPath);
      }

      // Tạo returnUrl với frontend domain
      const frontendUrl = window.location.origin; // http://localhost:5173 hoặc production domain
      const returnUrl = `${frontendUrl}/payment-callback`;
      
      const paymentRequest = {
        ...paymentData,
        returnUrl: returnUrl
      };

      const response = await apiClient.post(
        API_ENDPOINTS.PAYMENT.VNPAY_CREATE,
        paymentRequest
      );

      console.log('✅ VNPay API Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating VNPay payment:', error);
      throw error;
    }
  },
};

