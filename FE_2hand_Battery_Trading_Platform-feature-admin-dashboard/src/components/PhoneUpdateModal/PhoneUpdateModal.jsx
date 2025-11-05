import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { phoneUpdateService } from '../../services/auth/phoneUpdateService';

/**
 * PhoneUpdateModal Component
 * Modal to update user's phone number and password
 */
const PhoneUpdateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phone) => {
    // Vietnamese phone number format: 10 digits starting with 0
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validatePhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0.');
      return;
    }

    // Password is optional - only validate if user entered something
    if (formData.password && formData.password.trim() && !validatePassword(formData.password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      await phoneUpdateService.updatePhonePassword(formData);
      
      // Success
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      handleClose();
    } catch (err) {
      console.error('Error updating phone/password:', err);
      
      // More detailed error message
      let errorMsg = 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.';
      
      if (err.response?.status === 405) {
        errorMsg = 'Chức năng cập nhật tạm thời không khả dụng. Vui lòng liên hệ quản trị viên.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message && err.message !== 'Request failed with status code 405') {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ phone: '', password: '' });
      setError('');
      setShowPassword(false);
      onClose();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-white px-6 pt-6 pb-4">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 group"
                >
                  <FiX className="text-xl text-gray-400 group-hover:text-gray-600" />
                </button>

                <div className="pr-8">
                  {/* Icon */}
                  
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Cập Nhật Thông Tin
                  </h2>
                  <p className="text-sm text-gray-500">
                    Vui lòng cập nhật số điện thoại để tiếp tục đăng tin
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                  </motion.div>
                )}

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại (10 số)"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#00c9a7] transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#00c9a7] transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Để trống nếu không muốn đổi mật khẩu
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-[#00c9a7] text-white font-semibold rounded-xl hover:bg-[#00b396] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <span>Cập nhật</span>
                      
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhoneUpdateModal;

