import { motion, AnimatePresence } from "framer-motion";
import { FiUpload } from "react-icons/fi";

const UploadProgressModal = ({ isOpen, progress }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Content */}
              <div className="p-8 text-center">
                {/* Upload Icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6"
                >
                  <FiUpload className="text-5xl text-blue-500" />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Đang tải lên...
                </h2>

                {/* Progress Text */}
                <p className="text-gray-600 mb-6">
                  Vui lòng đợi trong giây lát
                </p>

                {/* Progress Bar Container */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                  >
                    {progress > 10 && (
                      <span className="text-xs text-white font-semibold">
                        {progress}%
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Percentage Display */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tiến độ</span>
                  <motion.span 
                    key={progress}
                    initial={{ scale: 1.2, color: "#3B82F6" }}
                    animate={{ scale: 1, color: "#6B7280" }}
                    className="font-bold"
                  >
                    {progress}%
                  </motion.span>
                </div>

                {/* Additional Info */}
                <p className="text-xs text-gray-400 mt-4">
                  Đang tải ảnh và video lên server...
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UploadProgressModal;

