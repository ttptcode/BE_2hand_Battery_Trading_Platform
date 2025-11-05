import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { vnpayService } from '../../../services/payment/vnpayService';

const PackageModal = ({ isOpen, onClose, packageInfo, isDarkMode = false }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Disable scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!packageInfo) return null;

  const { feeName, description, amount, packageDurationDays, feeType } = packageInfo;

  // Tạo các options thời gian với giá gốc (không giảm giá) - Chỉ cho gói bình thường (Free)
  // Gói lẻ (Pay1v1) không có tùy chọn thời gian
  const timeOptions = feeType === 'Pay1v1' ? [] : [
    {
      id: 1,
      months: 1,
      label: '1 tháng',
      pricePerMonth: amount,
      totalPrice: amount * 1
    },
    {
      id: 2,
      months: 3,
      label: '3 tháng',
      pricePerMonth: amount,
      totalPrice: amount * 3
    },
    {
      id: 3,
      months: 6,
      label: '6 tháng',
      pricePerMonth: amount,
      totalPrice: amount * 6
    }
  ];
  
  // Đối với gói lẻ (Pay1v1), tự động chọn option đầu tiên (không có options)
  const isPay1v1Package = feeType === 'Pay1v1';

  // Format tiền VNĐ
  const formatCurrency = (num) => {
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const formattedPrice = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedPrice + ' VNĐ';
  };

  // Format số với dấu chấm
  const formatNumber = (num) => {
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleBuyNow = async () => {
    // Đối với gói lẻ (Pay1v1), không cần chọn option
    if (!isPay1v1Package && !selectedOption) {
      toast.error('Vui lòng chọn thời gian gói!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    if (!packageInfo.feeId) {
      toast.error('Không tìm thấy thông tin gói. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Đối với gói lẻ (Pay1v1), sử dụng giá trực tiếp, không cần tìm option
    const totalAmount = isPay1v1Package ? amount : timeOptions.find(opt => opt.id === selectedOption)?.totalPrice;
    
    if (!totalAmount) {
      toast.error('Không tìm thấy thông tin giá. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Gọi API tạo payment VNPay
      const paymentData = {
        amount: totalAmount,
        feeId: packageInfo.feeId
      };
      
      console.log('Đang tạo thanh toán VNPay:', paymentData);
      
      const response = await vnpayService.createPayment(paymentData);
      
      console.log('VNPay response:', response);
      
      // Nếu API trả về paymentUrl, chuyển hướng đến trang thanh toán
      if (response.success && response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Không thể tạo link thanh toán. Vui lòng thử lại!', {
          position: "top-right",
          autoClose: 3000,
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán:', error);
      
      // Xử lý lỗi từ API response
      const errorResponse = error.response?.data;
      
      // Lấy message từ errors array nếu có
      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!';
      
      if (errorResponse) {
        // Kiểm tra errors array
        if (errorResponse.errors && Array.isArray(errorResponse.errors) && errorResponse.errors.length > 0) {
          // Nếu có nhiều errors, join chúng lại với dấu xuống dòng hoặc dấu phẩy
          // Hoặc chỉ lấy error đầu tiên
          errorMessage = errorResponse.errors.length === 1 
            ? errorResponse.errors[0]
            : errorResponse.errors.join(', ');
        } else if (errorResponse.message) {
          // Fallback: sử dụng message nếu không có errors array
          errorMessage = errorResponse.message;
        }
      } else if (error.message) {
        // Fallback: sử dụng error.message nếu không có response
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-12 pb-4 overflow-y-auto"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl w-full max-w-sm my-auto transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* Header */}
              <div className={`relative p-4 border-b transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={onClose}
                  className={`absolute top-3 right-3 text-xl leading-none transition-colors duration-300 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ×
                </button>
                
                <div className="flex items-start gap-2.5">
                  {/* Icon gói */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <span className="text-2xl">🐿️</span>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold mb-0.5 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feeName}
                    </h2>
                    <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {description}
                    </p>
                  </div>
                </div>
                
                <p className={`mt-2 text-[10px] leading-tight transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Tin đăng của Gói Pro sẽ là tin đăng thường, hiện thị với vị trí kích thước tiêu chuẩn
                </p>
              </div>

              {/* Time Options - Chỉ hiển thị cho gói bình thường (Free), không hiển thị cho gói lẻ (Pay1v1) */}
              {!isPay1v1Package && (
                <div className="p-4 space-y-1.5">
                  {timeOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`relative border-2 rounded-lg p-2.5 cursor-pointer transition-all duration-300 ${
                        selectedOption === option.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : isDarkMode 
                            ? 'border-gray-700 hover:border-gray-600' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Radio button */}
                      <div className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedOption === option.id
                            ? 'border-green-500 bg-green-500'
                            : isDarkMode ? 'border-gray-500' : 'border-gray-300'
                        }`}>
                          {selectedOption === option.id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold text-xs transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {option.label}
                            </span>
                            <span className={`font-bold text-xs transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(option.totalPrice)}
                            </span>
                          </div>

                          <div className={`text-[10px] mt-0.5 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatNumber(option.pricePerMonth)} VNĐ / tháng
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hiển thị giá cho gói lẻ (Pay1v1) */}
              {isPay1v1Package && (
                <div className="p-4">
                  <div className={`border-2 rounded-lg p-4 text-center transition-colors duration-300 ${
                    isDarkMode ? 'border-emerald-500 bg-emerald-900/20' : 'border-green-500 bg-green-50'
                  }`}>
                    <div className="mb-2">
                      <span className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Giá gói lẻ
                      </span>
                    </div>
                    <div>
                      <span className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`}>
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className={`mt-2 text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Đăng được {packageInfo.maxListings || 1} tin đăng
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={handleBuyNow}
                  disabled={(!isPay1v1Package && !selectedOption) || isProcessing}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all duration-300 ${
                    (isPay1v1Package || selectedOption) && !isProcessing
                      ? 'bg-green-500 hover:bg-green-600'
                      : isDarkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : isPay1v1Package ? (
                    `Mua ngay - ${formatCurrency(amount)}`
                  ) : selectedOption ? (
                    `Mua ngay - ${formatCurrency(timeOptions.find(opt => opt.id === selectedOption)?.totalPrice || 0)}`
                  ) : (
                    'Thanh toán'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PackageModal;



