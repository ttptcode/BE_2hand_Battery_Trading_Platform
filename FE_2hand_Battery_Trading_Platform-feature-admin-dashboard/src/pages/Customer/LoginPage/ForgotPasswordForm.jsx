import { useState, useRef } from "react";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChangeOtp = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value[0];
    setOtp(newOtp);
    if (idx < OTP_LENGTH - 1 && value) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDownOtp = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        inputsRef.current[idx - 1].focus();
      }
    }
  };

  const handlePasteOtp = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste.length === OTP_LENGTH) {
      setOtp(paste.split(""));
      inputsRef.current[OTP_LENGTH - 1].focus();
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const onlyDigits = phoneNumber.replace(/\D/g, "");
    if (!onlyDigits || onlyDigits.length < 9 || onlyDigits.length > 11) {
      setLoading(false);
      toast.error("Vui lòng nhập số điện thoại hợp lệ (9-11 số).");
      return;
    }
    setLoading(false);
    toast.error("BE chưa sẵn sàng. Không thể gửi OTP qua số điện thoại lúc này.");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (
      otpValue.length !== OTP_LENGTH ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    setLoading(false);
    toast.error("BE chưa sẵn sàng. Không thể đặt lại mật khẩu.");
    setOtp(Array(OTP_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Đặt lại mật khẩu của bạn</h2>
      {step === 1 && (
        <>
          <p className="text-sm text-gray-600">
            Nhập số điện thoại của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
          </p>
          <form className="space-y-6" onSubmit={handleSendOTP}>
            <div>
              <input
                type="tel"
                placeholder="Số điện thoại *"
                className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-sm text-gray-600">
            Nhập mã OTP đã gửi về số điện thoại và đặt lại mật khẩu mới.
          </p>
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="flex gap-2 mb-4" onPaste={handlePasteOtp}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangeOtp(e, idx)}
                  onKeyDown={(e) => handleKeyDownOtp(e, idx)}
                  className="w-12 h-12 text-center text-2xl border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  autoFocus={idx === 0}
                  disabled={loading}
                />
              ))}
            </div>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full p-3 border-b border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-gray-900 placeholder-gray-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition"
              disabled={loading || otp.join("").length !== OTP_LENGTH}
            >
              {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">Bạn đã nhớ mật khẩu chưa?</p>
        <button
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
        >
          Quay lại đăng nhập
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;