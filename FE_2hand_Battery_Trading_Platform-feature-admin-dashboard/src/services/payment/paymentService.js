import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

/**
 * Payment Service
 * Quản lý các API calls liên quan đến thanh toán
 */

export const paymentService = {
    /**
     * Lấy tất cả giao dịch thanh toán
     * @returns {Promise<Object>} Danh sách tất cả giao dịch
     */
    getAllPayments: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PAYMENT.PAYMENT_ALL);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching all payments:', error);
            console.error('❌ Error details:', error.response?.data);
            throw error;
        }
    },

    /**
     * Lấy báo cáo doanh thu hàng tháng dưới dạng PDF
     * @param {number} year - Năm cần lấy báo cáo (ví dụ: 2025)
     * @returns {Promise<Blob>} File PDF báo cáo doanh thu
     */
    getMonthlyRevenueReport: async (year = new Date().getFullYear()) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PAYMENT.PAYMENT_REPORT, {
                params: { year }, // Thêm parameter năm
                responseType: 'blob', // Quan trọng: nhận dạng Blob cho file PDF
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching monthly revenue report:', error);
            console.error('❌ Error details:', error.response?.data);
            throw error;
        }
    },

    /**
     * Tải và mở báo cáo doanh thu PDF
     * @param {number} year - Năm cần lấy báo cáo
     */
    downloadMonthlyRevenueReport: async (year = new Date().getFullYear()) => {
        try {
            const url = `http://vehiclemarket.runasp.net/api/PaymentReport/monthly-revenue-pdf?year=${year}`;
            
            // ✅ Mở trực tiếp trong tab mới - KHÔNG cần xử lý phức tạp
            window.open(url, '_blank');
            
            console.log('✅ PDF opened successfully');
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Lỗi mở báo cáo: ' + error.message);
        }
    }
};