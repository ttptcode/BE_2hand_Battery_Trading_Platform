import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 

import { FaKey, FaSpinner } from "react-icons/fa";
import NotificationModal from "../../../components/Nofication/NotificationModal";

const OTP_LENGTH = 6;

const VerifyOTP = ({ onClose }) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const inputsRef = useRef([]);
  const navigate = useNavigate(); 

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value[0];
    setOtp(newOtp);

    if (idx < OTP_LENGTH - 1 && value) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
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

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste.length === OTP_LENGTH) {
      setOtp(paste.split(""));
      inputsRef.current[OTP_LENGTH - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) return;
    setLoading(true);
    setLoading(false);
    const res = { error: true };
    if (!res.error && res.success) {
      setModalInfo({
        isOpen: true,
        message: res.message || "Xác thực thành công! Bạn có thể đăng nhập.",
        type: "success",
      });
      setTimeout(() => {
        setModalInfo((prev) => ({ ...prev, isOpen: false }));
        if (onClose) onClose();
      }, 2000);
    } else {
      setModalInfo({
        isOpen: true,
        message: res.message || "OTP vừa nhập không hợp lệ!",
        type: "error",
      });
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0].focus();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <NotificationModal
        isOpen={modalInfo.isOpen}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
      />
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center"
        style={{ minWidth: 340 }}
      >
        <FaKey className="text-4xl text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Xác thực Email
        </h2>
        <p className="mb-6 text-gray-600 text-center">
          Nhập mã OTP gồm 6 số đã gửi đến email của bạn.
        </p>
        <div className="flex gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-center text-2xl border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              autoFocus={idx === 0}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || otp.join("").length !== OTP_LENGTH}
          className={`w-full flex items-center justify-center font-bold py-3 rounded-lg text-lg shadow transition
  ${
    loading || otp.join("").length !== OTP_LENGTH
      ? "bg-blue-200 text-black cursor-not-allowed"
      : "bg-black hover:bg-gray-800 text-white"
  }
`}
        >
          {loading && <FaSpinner className="animate-spin mr-2" />}
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>
        <button
          className="mt-6 text-blue-500 hover:text-blue-700 text-lg"
          onClick={onClose}
          type="button"
        >
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;