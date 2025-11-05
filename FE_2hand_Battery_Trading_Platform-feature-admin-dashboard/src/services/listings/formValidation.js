/**
 * ========================================
 * FORM VALIDATION SERVICE
 * ========================================
 * Centralized validation logic cho tất cả danh mục Post forms
 * Hỗ trợ: Car, Moto, Truck, Electric Bike, Bike, Battery, Accessories
 */

/**
 * ==================== REQUIRED FIELDS BY CATEGORY ====================
 */
const REQUIRED_FIELDS = {
  car: {
    // Thông tin xe
    brand: 'Vui lòng chọn hãng xe',
    year: 'Vui lòng chọn năm sản xuất',
    version: 'Vui lòng nhập phiên bản',
    origin: 'Vui lòng chọn xuất xứ',
    bodyType: 'Vui lòng chọn kiểu dáng',
    seats: 'Vui lòng chọn số chỗ',
    color: 'Vui lòng chọn màu sắc',
    mileage: 'Vui lòng nhập số km đã đi',
    licensePlate: 'Vui lòng nhập biển số xe',
    previousOwners: 'Vui lòng chọn số đời chủ', // ✅ Backend đã hỗ trợ
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    transmission: 'Vui lòng chọn hộp số',
    fuelType: 'Vui lòng chọn nhiên liệu',
    hasAccessories: 'Vui lòng chọn có phụ kiện đi kèm không', // ✅ Backend đã hỗ trợ
    hasValidInspection: 'Vui lòng chọn còn hạn đăng kiểm không', // ✅ Backend đã hỗ trợ
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Backend đã hỗ trợ
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết',
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  moto: {
    // Thông tin xe máy
    brand: 'Vui lòng chọn hãng xe',
    vehicleType: 'Vui lòng chọn loại xe', // ✅ Sửa từ 'type' → 'vehicleType'
    year: 'Vui lòng chọn năm sản xuất',
    engineSize: 'Vui lòng chọn dung tích động cơ',
    origin: 'Vui lòng chọn xuất xứ',
    mileage: 'Vui lòng nhập số km đã đi',
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Thêm sellerType validation
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết', // ✅ Thêm description validation
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  truck: {
    // Thông tin xe tải
    brand: 'Vui lòng chọn hãng xe',
    payload: 'Vui lòng chọn tải trọng',
    capacity: 'Vui lòng nhập dung tích xe', // ✅ Thêm capacity validation
    year: 'Vui lòng chọn năm sản xuất',
    origin: 'Vui lòng chọn xuất xứ',
    color: 'Vui lòng chọn màu sắc',
    mileage: 'Vui lòng nhập số km đã đi',
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Thêm sellerType validation
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết', // ✅ Thêm description validation
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  electricBike: {
    // Thông tin xe điện
    brand: 'Vui lòng chọn hãng xe',
    vehicleType: 'Vui lòng chọn loại xe điện', // ✅ Sửa từ 'type' → 'vehicleType'
    // motor, batteryCapacity, batteryIncluded: không bắt buộc
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Thêm sellerType validation
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết', // ✅ Thêm description validation
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  bike: {
    // Thông tin xe đạp
    brand: 'Vui lòng chọn hãng xe đạp',
    type: 'Vui lòng chọn loại xe đạp',
    origin: 'Vui lòng chọn xuất xứ',
    color: 'Vui lòng chọn màu sắc',
    frameSize: 'Vui lòng chọn kích thước khung',
    frameMaterial: 'Vui lòng chọn chất liệu khung',
    warranty: 'Vui lòng chọn bảo hành',
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Thêm sellerType validation
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết',
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  battery: {
    // Thông tin ắc quy/pin
    brand: 'Vui lòng chọn hãng ắc quy/pin',
    batteryType: 'Vui lòng chọn loại ắc quy/pin',
    voltage: 'Vui lòng chọn điện áp',
    capacity: 'Vui lòng chọn dung lượng',
    origin: 'Vui lòng chọn xuất xứ',
    color: 'Vui lòng chọn màu sắc',
    warranty: 'Vui lòng chọn bảo hành',
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai',
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết',
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
  
  accessories: {
    // Thông tin phụ tùng
    category: 'Vui lòng chọn danh mục phụ tùng',
    // origin: không bắt buộc
    // Button groups
    condition: 'Vui lòng chọn tình trạng',
    sellerType: 'Vui lòng chọn bạn là ai', // ✅ Thêm sellerType validation
    // Common
    title: 'Vui lòng nhập tiêu đề tin đăng',
    price: 'Vui lòng nhập giá bán hợp lệ',
    description: 'Vui lòng nhập mô tả chi tiết', // ✅ Thêm description validation
    address: 'Vui lòng nhập địa chỉ',
    images: 'Vui lòng tải lên ít nhất 1 hình ảnh',
  },
};

/**
 * ==================== VALIDATION FUNCTIONS ====================
 */

/**
 * Validate a single field
 * @param {string} fieldName - Tên field
 * @param {any} value - Giá trị field
 * @param {string} errorMessage - Error message tùy chỉnh
 * @returns {string|null} - Error message hoặc null nếu valid
 */
const validateField = (fieldName, value, errorMessage) => {
  // Special case: images (array)
  if (fieldName === 'images') {
    return value.length === 0 ? errorMessage : null;
  }
  
  // Special case: price (number)
  if (fieldName === 'price') {
    const numValue = parseFloat(value);
    return !value || isNaN(numValue) || numValue <= 0 ? errorMessage : null;
  }
  
  // General case: string fields
  if (typeof value === 'string') {
    return !value || value.trim() === '' ? errorMessage : null;
  }
  
  // Other types (boolean, number, etc.)
  return !value ? errorMessage : null;
};

/**
 * Main validation function - Validate toàn bộ form theo category
 * @param {Object} formData - Form data object
 * @param {string} category - Category name (car, moto, truck, etc.)
 * @param {Array} uploadedImages - Uploaded images array
 * @returns {Object} - Errors object { fieldName: errorMessage }
 */
export const validateForm = (formData, category, uploadedImages = []) => {
  const errors = {};
  const requiredFields = REQUIRED_FIELDS[category];
  
  if (!requiredFields) {
    console.error(`[validateForm] Invalid category: ${category}`);
    return errors;
  }
  
  // Validate từng field theo required fields của category
  Object.keys(requiredFields).forEach(fieldName => {
    const errorMessage = requiredFields[fieldName];
    let value;
    
    // Special case: images
    if (fieldName === 'images') {
      value = uploadedImages;
    } else {
      value = formData[fieldName];
    }
    
    const error = validateField(fieldName, value, errorMessage);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * Validate for Save Draft - Chỉ validate images
 * @param {Array} uploadedImages - Uploaded images array
 * @returns {Object} - Errors object
 */
export const validateDraft = (uploadedImages = []) => {
  const errors = {};
  
  if (uploadedImages.length === 0) {
    errors.images = 'Vui lòng tải lên ít nhất 1 ảnh';
  }
  
  return errors;
};

/**
 * ==================== HELPER FUNCTIONS ====================
 */

/**
 * Check if errors object has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean} - True nếu có lỗi
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message from errors object
 * @param {Object} errors - Errors object
 * @returns {string|null} - First error message hoặc null
 */
export const getFirstError = (errors) => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};

/**
 * Get all error messages as array
 * @param {Object} errors - Errors object
 * @returns {Array} - Array of error messages
 */
export const getAllErrors = (errors) => {
  return Object.values(errors);
};

/**
 * Clear error for a specific field
 * @param {Object} errors - Current errors object
 * @param {string} fieldName - Field name to clear
 * @returns {Object} - New errors object without the field
 */
export const clearFieldError = (errors, fieldName) => {
  if (!errors[fieldName]) return errors;
  
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Create a handleFieldChange function với auto error clearing
 * @param {Function} setFormData - setState function for formData
 * @param {Function} setValidationErrors - setState function for validationErrors
 * @param {Function} setTitleLength - setState function for titleLength (optional)
 * @param {Function} setDescriptionLength - setState function for descriptionLength (optional)
 * @returns {Function} - handleChange function
 */
export const createHandleFieldChange = (
  setFormData,
  setValidationErrors,
  setTitleLength = null,
  setDescriptionLength = null
) => {
  return (e) => {
    const { name, value } = e.target;
    
    // Character limits
    if (name === "title" && value.length > 50) return;
    if (name === "description" && value.length > 1500) return;
    
    // Clear error cho field này
    setValidationErrors((prevErrors) => clearFieldError(prevErrors, name));
    
    // Update formData
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update character counters
    if (name === "title" && setTitleLength) {
      setTitleLength(value.length);
    }
    if (name === "description" && setDescriptionLength) {
      setDescriptionLength(value.length);
    }
  };
};

/**
 * Create a clearError function
 * @param {Function} setValidationErrors - setState function for validationErrors
 * @returns {Function} - clearError(fieldName) function
 */
export const createClearError = (setValidationErrors) => {
  return (fieldName) => {
    setValidationErrors((prevErrors) => clearFieldError(prevErrors, fieldName));
  };
};

/**
 * Show validation summary toast (helper for UI)
 * @param {Object} errors - Errors object
 * @returns {string} - Toast message
 */
export const getValidationSummary = (errors) => {
  const errorCount = Object.keys(errors).length;
  return `Vui lòng điền đầy đủ thông tin bắt buộc (${errorCount} trường còn thiếu)`;
};

