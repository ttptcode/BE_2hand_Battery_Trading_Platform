import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllFees } from '../../../services/FeeCommissions/feeCommissionService';
import PricingCard from './PricingCard';
import { FiX } from 'react-icons/fi';

const PlansModal = ({ isOpen, onClose, isDarkMode = false }) => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Disable scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllFees();
      if (result.success && Array.isArray(result.data)) {
        setPackages(result.data);
      } else {
        throw new Error(result.message || 'Không thể lấy dữ liệu gói');
      }
    } catch (e) {
      console.error("Lỗi khi fetch data:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen, fetchPackages]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-16 overflow-y-auto"
          >
            <div 
              className={`rounded-2xl shadow-2xl w-full max-w-5xl my-auto transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`relative border-b p-4 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-700 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-green-50 border-gray-200'}`}>
                <button
                  onClick={onClose}
                  className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-white/80'}`}
                >
                  <FiX className={`text-xl transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                <div className="text-center">
                  <h2 className={`text-2xl font-extrabold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Chọn Gói Đăng Tin
                  </h2>
                  <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bạn cần mua gói để có thể đăng tin. Chọn gói phù hợp với nhu cầu của bạn.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className={`inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 mb-3 ${isDarkMode ? 'border-emerald-500' : 'border-blue-500'}`}></div>
                      <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải các gói...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">Lỗi: {error}</p>
                    <button
                      onClick={fetchPackages}
                      className={`mt-3 px-5 py-2 text-sm text-white rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center items-stretch gap-4">
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
                      <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Không tìm thấy gói dịch vụ nào.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlansModal;

