import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { useEffect } from "react";

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Thành công!", 
  message = "Thao tác đã được thực hiện thành công.",
  autoRedirect = false,
  redirectUrl = null,
  redirectDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoRedirect && redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoRedirect, redirectUrl, redirectDelay]);

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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <FiX className="text-xl text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                  className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <FiCheckCircle className="text-5xl text-green-500" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6"
                >
                  {message}
                </motion.p>

                {/* Auto redirect message */}
                {autoRedirect && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-[#00c9a7] font-medium mb-6"
                  >
                    Đang chuyển hướng đến trang quản lý tin...
                  </motion.p>
                )}

                {/* Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    if (redirectUrl) {
                      window.location.href = redirectUrl;
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00c9a7] to-[#00b897] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  {redirectUrl ? "Đi đến trang quản lý tin" : "Đóng"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;

