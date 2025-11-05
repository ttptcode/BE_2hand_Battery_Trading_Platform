import { useState, useEffect, useCallback } from 'react';
import { getIncomingUnreadMessages } from '../services/chats/chatService';
import { tokenService } from '../services/auth/tokenService';

/**
 * Custom hook để quản lý tin nhắn chưa đọc
 * Tự động polling API để lấy tin nhắn mới
 */
export const useUnreadMessages = (pollingInterval = 10000) => {
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  const isAuthenticated = useCallback(() => {
    const token = tokenService.getAccessToken();
    return token && !tokenService.isTokenExpired();
  }, []);

  /**
   * Fetch tin nhắn chưa đọc từ API
   */
  const fetchUnreadMessages = useCallback(async () => {
    // Chỉ fetch khi user đã đăng nhập
    if (!isAuthenticated()) {
      setUnreadMessages([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getIncomingUnreadMessages();
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const count = response.data.length;
        
        setUnreadMessages(response.data);
        setUnreadCount(count);
        
      } else {
        setUnreadMessages([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('❌ useUnreadMessages - Error fetching unread messages:', err);
      setError(err.message || 'Failed to fetch unread messages');
      // Don't clear existing data on error to avoid flickering
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Polling effect - tự động fetch tin nhắn theo interval
   */
  useEffect(() => {
    // Fetch ngay khi mount
    fetchUnreadMessages();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchUnreadMessages();
    }, pollingInterval);

    // Listen for auth state changes
    const handleAuthChange = () => {
      fetchUnreadMessages();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [fetchUnreadMessages, pollingInterval]);

  /**
   * Refresh tin nhắn thủ công
   */
  const refresh = useCallback(() => {
    fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  return {
    unreadMessages,
    unreadCount,
    isLoading,
    error,
    refresh
  };
};

