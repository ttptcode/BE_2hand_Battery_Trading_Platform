import React, { useState, useRef } from "react";
import { Modal, Input, Button, Form } from "antd";
import { toast } from "react-toastify";
// Bỏ gọi API reset password admin khi chưa có BE

const OTP_LENGTH = 6;

const ResetPassword = ({ visible, onCancel }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleSendOtp = async () => {
    setLoading(true);
    setLoading(false);
    toast.error("BE chưa sẵn sàng. Không thể gửi OTP.");
  };

  // Xử lý nhập từng ô OTP
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

  // Xử lý phím Backspace
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

  // Xử lý dán mã OTP
  const handlePasteOtp = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste.length === OTP_LENGTH) {
      setOtp(paste.split(""));
      inputsRef.current[OTP_LENGTH - 1].focus();
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH || otp.includes("")) {
      toast.error("Vui lòng nhập đủ mã OTP!");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    setLoading(false);
    toast.error("BE chưa sẵn sàng. Không thể đổi mật khẩu.");
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      title="Đổi mật khẩu"
      destroyOnHidden
    >
      {step === 1 && (
        <Form layout="vertical" onFinish={handleSendOtp}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email admin"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Gửi OTP
          </Button>
        </Form>
      )}
      {step === 2 && (
        <Form layout="vertical" onFinish={handleResetPassword}>
          <label className="ant-form-item-label">Mã OTP</label>
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
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value === newPassword) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Mật khẩu xác nhận không khớp!");
                },
              }),
            ]}
          >
            <Input.Password
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đổi mật khẩu
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default ResetPassword;