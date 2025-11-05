import React, { useState, useRef } from "react";
import { Modal, Input, Button, Form } from "antd";
import { toast } from "react-toastify";
// Bỏ gọi API forgot/reset admin khi chưa có BE

const ForgotPassword = ({ visible, onCancel }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleSendOtp = async () => {
    setLoading(true);
    setLoading(false);
    toast.error("BE chưa sẵn sàng. Không thể gửi OTP.");
  };

  const handleChangeOtp = (e, idx) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);

      if (value && idx < 5) {
        inputsRef.current[idx + 1].focus();
      }
    }
  };

  const handleKeyDownOtp = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handlePasteOtp = e => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").split("");
    const newOtp = [...otp];

    pasteData.forEach((char, idx) => {
      if (idx < 6 && /^[0-9]$/.test(char)) {
        newOtp[idx] = char;
        inputsRef.current[idx].value = char;
      }
    });

    setOtp(newOtp);
    if (newOtp.every(digit => digit !== "")) {
      inputsRef.current[5].focus();
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || otp.includes("")) {
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
      title="Quên mật khẩu"
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
              placeholder="Nhập email"
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

export default ForgotPassword;