import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiCamera, FiChevronDown, FiChevronRight, FiX, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import postImage from "../../../assets/img/post.png";
import backgroundPost from "../../../assets/img/backgroundpost.png";
import { itemTypeService } from "../../../services";

// Import các form component cho từng danh mục
import BatteryPost from "./BatteryPost";
import BikePost from "./BikePost";
import CarPost from "./CarPost";
import MotoPost from "./MotoPost";
import TruckPost from "./TruckPost";
import ElectricBikePost from "./ElectricBikePost";
import AccessoriesPost from "./AccessoriesPost";

// Mapping giữa category id và tên trong API
const CATEGORY_API_NAME_MAP = {
  "battery": "Ắc quy/ Pin",
  "car": "Ô tô",
  "moto": "Xe máy", // Chú ý: API có thể không có danh mục này
  "truck": "Xe tải, xe ben",
  "electric-bike": "Xe điện",
  "bike": "Xe đạp",
  "accessories": "Phụ tùng/ Phụ kiện",
};

const CATEGORIES = [
  { id: "", label: "Danh Mục Tin Đăng *", component: null },
  { id: "battery", label: "Ắc quy / Pin", component: BatteryPost },
  { id: "car", label: "Ô tô", component: CarPost },
  { id: "moto", label: "Xe máy", component: MotoPost },
  { id: "truck", label: "Xe tải, xe ben", component: TruckPost },
  { id: "electric-bike", label: "Xe điện", component: ElectricBikePost },
  { id: "bike", label: "Xe đạp", component: BikePost },
  { id: "accessories", label: "Phụ tùng / Phụ kiện", component: AccessoriesPost },
];

const PostPage = () => {
  const location = useLocation();
  const { draftData, isEditMode } = location.state || {};
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [itemTypeMapping, setItemTypeMapping] = useState({});
  const [isLoadingItemTypes, setIsLoadingItemTypes] = useState(false);
  
  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Listen for dark mode changes from Header
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  // Lấy danh sách ItemTypes khi component mount
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        setIsLoadingItemTypes(true);
        const response = await itemTypeService.getAllItemTypes();
        const itemTypes = response.data?.data || [];
        
        // Tạo mapping: category id -> itemTypeId
        const mapping = {};
        const reverseMapping = {}; // itemTypeId -> category id
        itemTypes.forEach((itemType) => {
          // Tìm category id tương ứng với tên API
          const categoryId = Object.keys(CATEGORY_API_NAME_MAP).find(
            (key) => {
              const apiName = CATEGORY_API_NAME_MAP[key];
              // So sánh không phân biệt hoa thường và loại bỏ khoảng trắng thừa
              return apiName.toLowerCase().trim() === itemType.name.toLowerCase().trim();
            }
          );
          
          if (categoryId) {
            mapping[categoryId] = itemType.itemTypeId;
            reverseMapping[itemType.itemTypeId] = categoryId;
            console.log(`✓ Mapped ${categoryId} -> ${itemType.itemTypeId} (${itemType.name})`);
          }
        });
        
        setItemTypeMapping(mapping);
        console.log('Item Type Mapping:', mapping);
        console.log('Reverse Mapping:', reverseMapping);
        
        // Nếu có draftData, tự động select category tương ứng
        if (draftData && draftData.item?.itemTypeId) {
          const categoryId = reverseMapping[draftData.item.itemTypeId];
          if (categoryId) {
            setSelectedCategory(categoryId);
            console.log(`✓ Auto-selected category: ${categoryId} for itemTypeId: ${draftData.item.itemTypeId}`);
          }
        }
      } catch (error) {
        console.error('Error fetching item types:', error);
      } finally {
        setIsLoadingItemTypes(false);
      }
    };
    
    fetchItemTypes();
  }, [draftData]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const SelectedComponent = CATEGORIES.find((cat) => cat.id === selectedCategory)?.component;

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryModal(false);
  };

  const getCategoryLabel = () => {
    const category = CATEGORIES.find((cat) => cat.id === selectedCategory);
    return category ? category.label : "Chọn danh mục";
  };

  // Disable scroll when modal is open
  useEffect(() => {
    if (showCategoryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCategoryModal]);

  return (
    <div 
      className="min-h-screen py-6 px-4 relative"
    >
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${backgroundPost})`,
        }}
      >
        <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900/80' : 'bg-white/70'
        }`}></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Đăng tin bán xe
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Điền thông tin để bắt đầu đăng tin của bạn</p>
        </motion.div>

        <div className={`grid gap-6 ${selectedCategory ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`space-y-4 min-w-0 w-full ${selectedCategory ? 'max-w-3xl mx-auto' : ''}`}
          >
            {/* Category Selector */}
            <div className={`rounded-xl shadow-md p-5 border-2 border-[#00c9a7]/20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Chọn danh mục tin đăng
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className={`w-full px-4 py-2.5 text-left border-2 border-[#00c9a7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c9a7] focus:border-transparent transition-all cursor-pointer hover:border-[#00b897] flex items-center justify-between ${
                  isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={selectedCategory ? "font-semibold text-sm" : `text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {getCategoryLabel()}
                </span>
                <FiChevronRight className="text-[#00c9a7] text-lg" />
              </button>
            </div>

            {/* Image Upload Section - Only show when no category selected */}
            {!selectedCategory && (
              <div className={`rounded-xl shadow-md p-5 border-2 border-[#00c9a7]/20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-base font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hình ảnh và Video sản phẩm
                </h2>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                  Xem thêm về{" "}
                  <a href="#" className="text-[#00c9a7] hover:underline font-semibold">
                    Quy định đăng tin của 2H AUTO
                  </a>
                </p>

                {/* Message when no category selected */}
                <div className={`relative border-2 border-dashed rounded-lg p-6 text-center opacity-60 cursor-not-allowed ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <FiCamera className={`text-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  
                  <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
                    Vui lòng chọn danh mục trước
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}>
                    Chọn danh mục tin đăng để kích hoạt tính năng upload
                  </p>
                  <div className={`absolute inset-0 rounded-lg pointer-events-none ${
                    isDarkMode ? 'bg-gray-800/30' : 'bg-gray-200/30'
                  }`}></div>
                </div>
              </div>
            )}

            {/* Category-specific Form */}
            <AnimatePresence mode="wait">
              {SelectedComponent && !itemTypeMapping[selectedCategory] && (
                <motion.div
                  key={`${selectedCategory}-error`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
                >
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">Danh mục chưa được hỗ trợ</h3>
                  <p className="text-gray-600 mb-4">
                    Backend chưa có ItemType cho danh mục <strong>"{getCategoryLabel()}"</strong>.
                  </p>
                  <p className="text-sm text-gray-500">
                    Vui lòng liên hệ admin để thêm danh mục này vào hệ thống.
                  </p>
                </motion.div>
              )}
              {SelectedComponent && itemTypeMapping[selectedCategory] && (
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SelectedComponent 
                    images={uploadedImages} 
                    itemTypeId={itemTypeMapping[selectedCategory]}
                    draftData={isEditMode ? draftData : null}
                    isEditMode={isEditMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Illustration */}
          {!selectedCategory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex flex-col items-center justify-center"
            >
              <div className="relative w-full max-w-sm">
                {/* Post Image */}
                <div className="bg-gradient-to-br from-[#00c9a7]/10 to-[#00c9a7]/5 rounded-2xl p-6 text-center">
                  <div className="mb-4">
                    <img 
                      src={postImage} 
                      alt="Đăng tin" 
                      className="w-full h-auto max-w-xs mx-auto"
                    />
          </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 bg-[#00c9a7]/10 rounded-lg p-2.5 shadow-sm border border-[#00c9a7]/50"
                  >
                    <p className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      <span className="font-semibold">Mẹo:</span> Chọn đúng danh mục để tiếp cận khách hàng!
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
        <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCategoryModal(false)}
            >
              <div 
                className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`relative border-b px-6 py-4 transition-colors duration-500 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
          <button
                    onClick={() => setShowCategoryModal(false)}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
          >
                    <FiArrowLeft className={`text-xl transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`} />
          </button>
                  <h2 className={`text-center text-lg font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Đăng tin
                  </h2>
                </div>

                {/* Modal Body */}
                <div className="p-4">
                  <h3 className={`text-sm font-bold mb-3 px-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CHỌN DANH MỤC
                  </h3>
                  <div className="space-y-1">
                    {CATEGORIES.slice(1).map((category) => (
          <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        } ${
                          selectedCategory === category.id
                            ? "bg-[#00c9a7]/10 border border-[#00c9a7]"
                            : "border border-transparent"
                        }`}
                      >
                        <span className={`text-sm ${
                          selectedCategory === category.id
                            ? "font-semibold text-[#00c9a7]"
                            : isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {category.label}
                        </span>
                        <FiChevronRight className={`text-lg ${
                          selectedCategory === category.id
                            ? "text-[#00c9a7]"
                            : isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`} />
          </button>
                    ))}
                  </div>
      </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostPage;

