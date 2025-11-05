import { useState, useCallback, useRef } from 'react';
import { tokenService } from '../services/auth/tokenService';

/**
 * Custom hook để kiểm tra authentication và hiển thị modal login
 */
export const useAuthCheck = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pendingActionRef = useRef(null);

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  const isAuthenticated = useCallback(() => {
    const token = tokenService.getAccessToken();
    return token && !tokenService.isTokenExpired();
  }, []);

  /**
   * Kiểm tra authentication trước khi thực hiện action
   * @param {Function} action - Function cần thực hiện sau khi đăng nhập
   */
  const requireAuth = useCallback((action) => {
    
    if (isAuthenticated()) {
      // User đã đăng nhập, thực hiện action ngay
      action();
    } else {
      // User chưa đăng nhập, lưu action và hiển thị modal login
      pendingActionRef.current = action;
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  /**
   * Xử lý khi đăng nhập thành công
   */
  const handleLoginSuccess = useCallback(() => {
    
    setShowLoginModal(false);
    
    // Lưu đường dẫn hiện tại để check xem có navigate hay không
    const currentPath = window.location.pathname;
    
    // Thực hiện action đã lưu trước đó
    if (pendingActionRef.current) {
      try {
        // Lưu action vào biến local trước khi clear
        const actionToExecute = pendingActionRef.current;
        pendingActionRef.current = null;
        
        // Thêm delay nhỏ để đảm bảo auth context được cập nhật
        setTimeout(() => {
          actionToExecute();
          
          // Kiểm tra xem có navigate sang trang khác không
          setTimeout(() => {
            const newPath = window.location.pathname;
            if (currentPath === newPath) {
              // Vẫn ở trang cũ → reload để refresh UI
              window.location.reload();
            } else {
              // Đã navigate sang trang khác → page mới sẽ tự load với auth mới
            }
          }, 200);
        }, 100);
      } catch (error) {
        console.error('❌ useAuthCheck - Error executing pending action:', error);
        // Reload anyway on error
        setTimeout(() => window.location.reload(), 300);
      }
    } else {
      
      // Nếu không có pending action, reload page ngay để hiển thị ChatBubble
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }, []);

  /**
   * Đóng modal login
   */
  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
    pendingActionRef.current = null;
  }, []);

  return {
    isAuthenticated,
    requireAuth,
    showLoginModal,
    handleLoginSuccess,
    closeLoginModal
  };
};
