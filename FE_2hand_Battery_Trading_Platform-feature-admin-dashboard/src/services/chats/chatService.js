import apiClient from '../api/index.js';

/**
 * Chat Service
 * Quản lý tất cả các API liên quan đến chat và messaging
 */

// NOTE: Các function liên quan đến Listings đã được chuyển sang listingService.js
// để tránh duplicate code và dễ maintain hơn

/**
 * Tạo conversation mới
 * @param {string} listingId - ID của listing
 * @param {string} buyerId - ID của người mua
 * @returns {Promise<Object>} Thông tin conversation được tạo
 */
export const createConversation = async (listingId, buyerId) => {
  try {
    
    // Sử dụng API thật
    
    const response = await apiClient.post('/Conversations/create', null, {
      params: {
        listingId,
        buyerId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    console.error('❌ Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Gửi tin nhắn
 * @param {string} conversationId - ID của conversation
 * @param {string} senderId - ID của người gửi
 * @param {string} content - Nội dung tin nhắn
 * @returns {Promise<Object>} Thông tin tin nhắn được gửi
 */
export const sendMessage = async (conversationId, senderId, content) => {
  try {
    // Sử dụng API thật
    
    const response = await apiClient.post('/Messages', {
      conversationId,
      senderId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tin nhắn của conversation
 * @param {string} conversationId - ID của conversation
 * @returns {Promise<Object>} Danh sách tin nhắn
 */
export const getMessages = async (conversationId) => {
  try {
    const response = await apiClient.get(`/Messages/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Lấy danh sách conversations của user
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} Danh sách conversations
 */
export const getUserConversations = async (userId) => {
  try {
    const response = await apiClient.get(`/Conversations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user conversations:', error);
    throw error;
  }
};

/**
 * Lấy thông tin conversation
 * @param {string} conversationId - ID của conversation
 * @returns {Promise<Object>} Thông tin conversation
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await apiClient.get(`/Conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Đánh dấu tin nhắn đã đọc
 * @param {string} messageId - ID của tin nhắn
 * @returns {Promise<Object>} Kết quả đánh dấu
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await apiClient.put(`/Messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    // Check if it's a 404 or 501 error (endpoint not implemented)
    if (error.response?.status === 404 || error.response?.status === 501) {
      // Return success to prevent error propagation since this is not critical functionality
      return { success: true, message: 'Endpoint not implemented - message marked as read locally' };
    }
    
    // For other errors, log but don't throw to prevent breaking the chat flow
    console.error('❌ Error marking message as read:', error);
    return { success: false, message: 'Failed to mark message as read' };
  }
};

/**
 * Lấy danh sách tin nhắn chưa đọc đến (incoming unread messages)
 * @returns {Promise<Object>} Danh sách tin nhắn chưa đọc
 */
export const getIncomingUnreadMessages = async () => {
  try {
    const response = await apiClient.get('/Messages/incoming');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching incoming unread messages:', error);
    // Return empty array instead of throwing to prevent breaking the app
    return { success: false, data: [], message: 'Failed to fetch unread messages' };
  }
};
