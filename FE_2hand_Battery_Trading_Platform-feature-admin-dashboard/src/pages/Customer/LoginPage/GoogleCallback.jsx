import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../../services";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/ScrollspyContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  // Memoize handleCallback để tránh tạo lại function
  const handleCallback = useCallback(async () => {
    // Chỉ xử lý 1 lần duy nhất
    if (hasProcessed.current) {
      return;
    }

    try {
      hasProcessed.current = true; // Đánh dấu đã xử lý ngay lập tức
      
      const queryParams = location.search;
      
      // Log để debug
      console.log('🔍 GoogleCallback - Query params:', queryParams);
      console.log('🔍 GoogleCallback - Location:', location);
      
      if (!queryParams || queryParams.length <= 1) {
        // Check nếu có error trong URL
        const urlParams = new URLSearchParams(queryParams || '');
        const error = urlParams.get('error');
        const message = urlParams.get('message');
        
        if (error || message) {
          throw new Error(message || error || 'Không có thông tin đăng nhập từ Google');
        }
        
        throw new Error('Không có thông tin đăng nhập từ Google');
      }

      const response = await authService.handleGoogleCallback(queryParams);

      if (response.success) {
        // Lưu user info vào context (authService đã lưu vào localStorage)
        if (authLogin) {
          authLogin(response.data);
        }

        // Hiển thị toast
        toast.success("Đăng nhập bằng Google thành công!", {
          position: "top-right",
          autoClose: 2000,
          toastId: "google-login-success",
        });

        // Lấy URL trước đó
        const preLoginUrl = sessionStorage.getItem('preLoginUrl') || '/';
        sessionStorage.removeItem('preLoginUrl');
        
        // Navigate ngay lập tức
        navigate(preLoginUrl, { replace: true });
      } else {
        throw new Error('Đăng nhập Google thất bại');
      }
    } catch (error) {
      console.error('Google callback error:', error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng nhập Google. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "google-login-error",
      });
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  }, [location.search, navigate, authLogin]);

  useEffect(() => {
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi component mount

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00c9a7]"></div>
            <p className="mt-4 text-lg text-gray-700 font-medium">
              Đang xử lý đăng nhập Google...
            </p>
          </>
        ) : (
          <p className="text-lg text-gray-700 font-medium">
            Đang chuyển hướng...
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;

