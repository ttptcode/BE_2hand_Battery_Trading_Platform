import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const NotificationModal = ({ isOpen, message, type = 'success', onClose, autoClose = false, autoCloseDelay = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: FaCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      buttonBg: 'bg-green-500 hover:bg-green-600',
      title: 'Thành công!'
    },
    error: {
      icon: FaTimesCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      buttonBg: 'bg-red-500 hover:bg-red-600',
      title: 'Lỗi!'
    },
    warning: {
      icon: FaExclamationCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
      title: 'Cảnh báo!'
    }
  };

  const currentConfig = config[type] || config.success;
  const IconComponent = currentConfig.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4">
      {/* Backdrop with fade animation */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal content with scale animation */}
      <div className="relative z-10 w-full max-w-md animate-scaleIn">
        <div className={`bg-white rounded-2xl shadow-2xl border-2 ${currentConfig.borderColor} overflow-hidden transform transition-all duration-300`}>
          {/* Header with gradient */}
          <div className={`${currentConfig.bgColor} px-6 py-4 border-b ${currentConfig.borderColor} relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Đóng"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            {/* Icon with pulse animation */}
            <div className="mx-auto mb-4 relative">
              <div className={`w-20 h-20 mx-auto ${currentConfig.iconColor} animate-bounce`}>
                <IconComponent className="w-full h-full drop-shadow-lg" />
              </div>
              {/* Ripple effect */}
              <div className={`absolute inset-0 rounded-full ${currentConfig.iconColor} opacity-20 animate-ping`} />
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold ${currentConfig.titleColor} mb-3`}>
              {currentConfig.title}
            </h3>

            {/* Message */}
            <p className={`text-base ${currentConfig.messageColor} leading-relaxed mb-6`}>
              {message}
            </p>

            {/* Action button */}
            <button
              onClick={onClose}
              className={`w-full px-6 py-3 ${currentConfig.buttonBg} text-white font-semibold rounded-xl 
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'yellow'}-300
                         shadow-lg hover:shadow-xl`}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default NotificationModal; 