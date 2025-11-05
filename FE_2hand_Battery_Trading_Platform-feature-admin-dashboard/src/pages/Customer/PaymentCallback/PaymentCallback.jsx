import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  const status = searchParams.get('status');
  const paymentId = searchParams.get('paymentId');

  // Kiểm tra status (Success, Cancel, Failed)
  const isSuccess = status === 'Success';
  const isCancel = status === 'Cancel';
  const isFailed = !status || (status !== 'Success' && status !== 'Cancel');

  useEffect(() => {
    // Log payment info
    console.log('🎉 Payment Callback Received');
    console.log('📋 Status:', status);
    console.log('💳 Payment ID:', paymentId);
    console.log('🌐 Current URL:', window.location.href);

    // Xử lý redirect dựa trên status
    if (isSuccess) {
      // Thanh toán thành công → Redirect về trang đăng tin trước đó
      const returnPath = sessionStorage.getItem('returnAfterPayment') || '/post-item';
      console.log('✅ Payment success! Redirecting to:', returnPath);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Clear session storage
            sessionStorage.removeItem('returnAfterPayment');
            sessionStorage.removeItem('postingPath');
            // Redirect về trang đăng tin trước đó
            navigate(returnPath, { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Thanh toán thất bại hoặc hủy → Redirect về trang chọn gói sau 5 giây
      const timer = setTimeout(() => {
        const returnPath = sessionStorage.getItem('returnAfterPayment');
        if (returnPath) {
          // Nếu đang đăng tin, quay về trang đăng tin đó
          navigate(returnPath, { replace: true });
        } else {
          // Nếu không, về trang chọn gói
          navigate('/plans', { replace: true });
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate, status, paymentId, isCancel, isFailed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <FiCheckCircle className="text-green-500 text-5xl" />
            </motion.div>

            {/* Success Message */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              Thanh toán thành công! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-2"
            >
              Gói đăng tin của bạn đã được kích hoạt
            </motion.p>

            {paymentId && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-gray-400 mb-6"
              >
                Mã giao dịch: {paymentId}
              </motion.p>
            )}

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-500">
                Đang chuyển hướng đến trang đăng tin trong{' '}
                <span className="font-bold text-green-500 text-lg">{countdown}</span> giây...
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-1 bg-green-500 rounded-full mb-6"
            />

            {/* Manual Redirect Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => {
                const returnPath = sessionStorage.getItem('returnAfterPayment') || '/post-item';
                sessionStorage.removeItem('returnAfterPayment');
                sessionStorage.removeItem('postingPath');
                navigate(returnPath, { replace: true });
              }}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
            >
              Tiếp tục đăng tin
            </motion.button>
          </>
        ) : (
          <>
            {/* Failed Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <FiXCircle className="text-red-500 text-5xl" />
            </motion.div>

            {/* Failed Message */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              {isCancel ? 'Đã hủy thanh toán' : 'Thanh toán thất bại'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-3"
            >
              {isCancel
                ? 'Bạn đã hủy giao dịch thanh toán'
                : 'Có lỗi xảy ra trong quá trình thanh toán'}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mb-6"
            >
              Đang chuyển về trang chọn gói trong 5 giây...
            </motion.p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate('/plans', { replace: true })}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
              >
                Chọn gói ngay
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => navigate('/', { replace: true })}
                className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
              >
                Về trang chủ
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentCallback;

