import { useState, useMemo, useCallback } from "react";
import NotificationModal from "../../../components/Nofication/NotificationModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authService } from "../../../services";

// Constants
const INITIAL_FORM_STATE = {
  fullName: "",
  phoneNumber: "",
  password: ""
};

const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Vui lòng nhập đúng thông tin yêu cầu.",
  TIMEOUT: "Kết nối timeout. Vui lòng kiểm tra kết nối mạng và thử lại.",
  INVALID_INFO: "Thông tin không hợp lệ. Vui lòng kiểm tra lại.",
  SERVICE_NOT_FOUND: "Không tìm thấy dịch vụ. Vui lòng thử lại sau.",
  REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại.",
  UNKNOWN_ERROR: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.",
  REGISTER_SUCCESS: "Đăng ký thành công! Vui lòng đăng nhập."
};

const PHONE_REGEX = /^\d{9,11}$/;
const PASSWORD_RULES = {
  LENGTH: { min: 8, max: 32 },
  UPPER_CASE: /[A-Z]/,
  LOWER_CASE: /[a-z]/,
  DIGIT: /\d/
};

// Validation utilities
const validatePhone = (phone) => PHONE_REGEX.test(phone);

const validatePassword = (password) => {
  return {
    length: password.length >= PASSWORD_RULES.LENGTH.min && password.length <= PASSWORD_RULES.LENGTH.max,
    upper: PASSWORD_RULES.UPPER_CASE.test(password),
    lower: PASSWORD_RULES.LOWER_CASE.test(password),
    digit: PASSWORD_RULES.DIGIT.test(password)
  };
};

const isPasswordValid = (rules) => Object.values(rules).every(Boolean);

// Error handler utility
const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 401) {
    return ERROR_MESSAGES.INVALID_INFO;
  }
  if (error.response?.status === 404) {
    return ERROR_MESSAGES.SERVICE_NOT_FOUND;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Components
const FloatingLabel = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out 
               pointer-events-none 
               peer-placeholder-shown:text-base peer-placeholder-shown:top-3 
               peer-focus:top-[-8px] peer-focus:text-sm peer-focus:text-[#00c9a7] 
               peer-focus:bg-white peer-focus:px-2 peer-focus:font-medium
               peer-[&:not(:placeholder-shown)]:top-[-8px] peer-[&:not(:placeholder-shown)]:text-sm 
               peer-[&:not(:placeholder-shown)]:text-[#00c9a7] peer-[&:not(:placeholder-shown)]:bg-white 
               peer-[&:not(:placeholder-shown)]:px-2 peer-[&:not(:placeholder-shown)]:font-medium
               z-10"
  >
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const PasswordRequirement = ({ isValid, text }) => (
  <li className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${isValid ? "bg-green-500" : "bg-gray-300"}`} />
    {text}
  </li>
);

// Main Component
const RegisterForm = ({ onBackToLogin }) => {
  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [modalInfo, setModalInfo] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });

  // Memoized validation
  const phoneValid = useMemo(() => validatePhone(formData.phoneNumber), [formData.phoneNumber]);
  const passwordRules = useMemo(() => validatePassword(formData.password), [formData.password]);
  const passwordValid = useMemo(() => isPasswordValid(passwordRules), [passwordRules]);
  const canSubmit = useMemo(
    () => formData.fullName.trim() && phoneValid && passwordValid,
    [formData.fullName, phoneValid, passwordValid]
  );

  // Event handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    handleInputChange("phoneNumber", numericValue);
  }, [handleInputChange]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const showModal = useCallback((message, type) => {
    setModalInfo({ isOpen: true, message, type });
  }, []);

  const closeModal = useCallback(() => {
    setModalInfo(prev => ({ ...prev, isOpen: false }));
    if (isRegisterSuccess) {
      setIsRegisterSuccess(false);
      onBackToLogin();
    }
  }, [isRegisterSuccess, onBackToLogin]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) {
      showModal(ERROR_MESSAGES.VALIDATION_FAILED, "error");
      return;
    }

    try {
      const response = await authService.register(formData);
      
      if (response.data?.success === true) {
        showModal(
          response.data.message || ERROR_MESSAGES.REGISTER_SUCCESS,
          "success"
        );
        
        resetForm();
        setIsRegisterSuccess(true);
      } else {
        showModal(
          response.data?.message || ERROR_MESSAGES.REGISTER_FAILED,
          "error"
        );
      }
    } catch (error) {
      showModal(getErrorMessage(error), "error");
    }
  };

  // Render
  return (
    <div className="space-y-4">
      <NotificationModal
        isOpen={modalInfo.isOpen}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={closeModal}
      />

      <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>

      <form className="space-y-4" onSubmit={handleRegister} noValidate>
        {/* Full Name Input */}
        <div className="relative group">
          <input
            type="text"
            id="fullName"
            className="peer w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg 
                       focus:outline-none focus:border-[#00c9a7] 
                       transition-colors duration-300 ease-in-out
                       placeholder-transparent"
            placeholder=" "
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            required
          />
          <FloatingLabel htmlFor="fullName" required>
            Họ và tên
          </FloatingLabel>
        </div>

        {/* Phone Number Input */}
        <div className="relative group">
          <input
            type="tel"
            id="phoneNumber"
            className={`peer w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg 
                       focus:outline-none focus:border-[#00c9a7] 
                       transition-colors duration-300 ease-in-out
                       placeholder-transparent
                       ${formData.phoneNumber && !phoneValid ? "border-red-300" : "border-gray-300"}`}
            placeholder=" "
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            inputMode="numeric"
            pattern="[0-9]{9,11}"
            required
          />
          <FloatingLabel htmlFor="phoneNumber" required>
            Số điện thoại
          </FloatingLabel>
        </div>

        {/* Password Input */}
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className={`peer w-full px-4 py-3 pr-12 text-gray-900 bg-white border-2 rounded-lg
                       focus:outline-none focus:border-[#00c9a7] 
                       transition-colors duration-300 ease-in-out
                       placeholder-transparent
                       ${formData.password && !passwordValid ? "border-red-300" : "border-gray-300"}`}
            placeholder=" "
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
          <FloatingLabel htmlFor="password" required>
            Mật khẩu
          </FloatingLabel>
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00c9a7] 
                       transition-colors duration-200 focus:outline-none z-20"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
          <ul className="space-y-2">
            <PasswordRequirement isValid={passwordRules.length} text="Giới hạn từ 8-32 ký tự." />
            <PasswordRequirement isValid={passwordRules.upper} text="Tối thiểu 01 ký tự IN HOA." />
          </ul>
          <ul className="space-y-2">
            <PasswordRequirement isValid={passwordRules.lower} text="Tối thiểu 01 ký tự in thường." />
            <PasswordRequirement isValid={passwordRules.digit} text="Tối thiểu 01 chữ số." />
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full px-4 py-3 text-lg font-semibold rounded-2xl transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-offset-2
                     ${canSubmit 
                       ? "bg-[#00c9a7] hover:bg-[#0b5e54] text-white focus:ring-[#00c9a7] transform hover:scale-[1.02]" 
                       : "bg-gray-200 text-gray-500 cursor-not-allowed focus:ring-gray-400"
                     }`}
        >
          Đăng ký
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center pt-2">
        <span className="text-sm text-gray-600 mr-2">Đã có tài khoản?</span>
        <button 
          type="button"
          onClick={onBackToLogin} 
          className="text-sm font-medium text-gray-900 hover:text-[#00c9a7] hover:underline 
                     transition-colors duration-200 ease-in-out
                     focus:outline-none rounded"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
