import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

export const reviewService = {
  /**
   * Tạo review hoặc bình luận
   * Nếu có rating -> review
   * Nếu không có rating -> bình luận
   */
  async createReviewOrComment({ reviewerId, revieweeId, listingId, comment = null }) {
    try {
      const payload = { reviewerId, revieweeId, listingId,  comment };
      const response = await apiClient.post(API_ENDPOINTS.REVIEW.CREATE, payload);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo review/bình luận:", error.response?.data || error.message);
      throw error;
    }
  },

  async getReviewsByReviewee(revieweeId) {
    const endpoint = API_ENDPOINTS.REVIEW.BY_REVIEWEE.replace(":revieweeId", revieweeId);
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  async getReviewsByReviewer(reviewerId) {
    const endpoint = API_ENDPOINTS.REVIEW.BY_REVIEWER.replace(":reviewerId", reviewerId);
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  async getReviewsByListing(listingId) {
    const endpoint = API_ENDPOINTS.REVIEW.BY_LISTING.replace(":listingId", listingId);
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  async getReviewById(id) {
    const endpoint = API_ENDPOINTS.REVIEW.DETAIL.replace(":id", id);
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  async updateReviewOrComment(id, data) {
    const endpoint = API_ENDPOINTS.REVIEW.UPDATE.replace(":id", id);
    const res = await apiClient.put(endpoint, data);
    return res.data;
  },

  async deleteReview(id) {
    const endpoint = API_ENDPOINTS.REVIEW.DELETE.replace(":id", id);
    const res = await apiClient.delete(endpoint);
    return res.data;
  },
};
