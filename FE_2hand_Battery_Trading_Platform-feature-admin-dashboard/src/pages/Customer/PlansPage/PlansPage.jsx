import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { getAllFees } from '../../../services/FeeCommissions/feeCommissionService';
import PricingCard from './PricingCard';
import LoginModal from '../../../pages/Customer/LoginPage/LoginPage'; // 2. Import LoginModal (Giả sử đúng đường dẫn)
import backgroundPost from '../../../assets/img/backgroundpost.png';

// --- COMPONENT CHÍNH CỦA TRANG ---

function PlansPage() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 3. Thêm state cho modal và navigate
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Listen for dark mode changes from Header
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  // 5. Bọc logic fetch trong useCallback
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Xóa lỗi cũ
    try {
      const result = await getAllFees();
      if (result.success && Array.isArray(result.data)) {
        setPackages(result.data);
      } else {
        throw new Error(result.message || 'Không thể lấy dữ liệu gói');
      }
    } catch (e) {
      console.error("Lỗi khi fetch data:", e);

      // 6. XỬ LÝ LỖI 401
      if (e.message && (e.message.includes('401') || e.message.includes('Unauthorized'))) {
        // Nếu là lỗi 401, không set lỗi mà mở Modal Login
        setError(null);
        setShowLoginModal(true);
      } else {
        // Nếu là lỗi khác, mới hiển thị lỗi
        setError(e.message);
      }

    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback không có dependency

  // 4. Định nghĩa các handler cho modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
    // Nếu user đóng modal mà không đăng nhập, quay về trang chủ
    // vì trang này không thể xem khi chưa đăng nhập.
    navigate('/');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Khi đăng nhập thành công, gọi lại hàm fetch data
    fetchPackages();
  };

  // useEffect để gọi fetch lần đầu
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]); // Dependency là hàm fetchPackages

  // --- Xử lý các trạng thái UI ---

  // Trạng thái Đang tải
  if (isLoading) {
    return (
      <div className="min-h-screen py-6 px-4 relative">
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundPost})`,
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
        </div>
        
        <div className="flex justify-center items-center min-h-screen">
          <div className={`text-2xl font-semibold transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Đang tải các gói...</div>
        </div>
      </div>
    );
  }

  // Trạng thái Lỗi (Chỉ hiển thị khi có lỗi VÀ modal login không mở)
  if (error && !showLoginModal) {
    return (
      <div className="min-h-screen py-6 px-4 relative">
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundPost})`,
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
        </div>
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-2xl font-semibold text-red-500">Lỗi: {error}</div>
        </div>
      </div>
    );
  }

  // --- Trạng thái Thành công (Hiển thị các gói) ---
  return (
    <div className="min-h-screen py-6 px-4 relative">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${backgroundPost})`,
        }}
      >
        <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 py-8">
        {/* Tiêu đề trang */}
        <h1 className={`text-4xl font-extrabold text-center mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Chọn Gói Dịch Vụ
        </h1>
        <p className={`text-lg text-center mb-12 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Tìm gói phù hợp nhất với nhu cầu của bạn.
        </p>

        {/* Container chứa các thẻ gói (responsive) */}
        <div className="flex flex-wrap justify-center items-stretch gap-8">
          {packages.length > 0 ? (
            packages.map((pkg, index) => (
              <PricingCard
                key={pkg.feeId}
                packageInfo={pkg}
                isRecommended={index === 1}
                isDarkMode={isDarkMode}
              />
            ))
          ) : (
            // Chỉ hiển thị "Không tìm thấy" nếu không loading, không lỗi, VÀ không bắt đăng nhập
            !isLoading && !error && !showLoginModal && (
              <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Không tìm thấy gói dịch vụ nào.</p>
            )
          )}
        </div>
      </div>

      {/* 7. Render Modal Login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
        navigate={navigate}
      />
    </div>
  );
}

// CheckIcon component (Giữ nguyên như trong file cũ của bạn nếu nó ở chung file)
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export default PlansPage;