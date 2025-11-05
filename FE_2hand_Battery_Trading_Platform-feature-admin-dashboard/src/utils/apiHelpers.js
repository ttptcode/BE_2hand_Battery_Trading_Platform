/**
 * API Helper Functions
 * Các hàm tiện ích để xử lý dữ liệu trước khi gửi lên API
 */

/**
 * Tạo SerialNumber tự động cho Item
 * @param {string} prefix - Prefix của serial (CAR, BIKE, BATTERY, etc.)
 * @param {string} brand - Tên hãng
 * @param {string} year - Năm sản xuất
 * @returns {string} Serial number unique
 */
export const generateSerialNumber = (prefix, brand = 'UNKNOWN', year = 'YEAR') => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${brand}_${year}_${randomStr}_${timestamp}`;
};

/**
 * Convert condition từ frontend format sang backend format
 * @param {string} condition - 'used' hoặc 'new'
 * @returns {string} 'Đã qua sử dụng' hoặc 'Mới'
 */
export const convertCondition = (condition) => {
  return condition === 'used' ? 'Đã qua sử dụng' : 'Mới';
};

/**
 * Convert fuel type từ frontend format sang backend format
 * @param {string} fuelType - 'gasoline', 'diesel', 'electric', 'hybrid'
 * @returns {string} Tên nhiên liệu tiếng Việt
 */
export const convertFuelType = (fuelType) => {
  const fuelMap = {
    gasoline: 'Xăng',
    diesel: 'Dầu',
    electric: 'Điện',
    hybrid: 'Động cơ Hybrid',
  };
  return fuelMap[fuelType] || '';
};

/**
 * Convert transmission từ frontend format sang backend format
 * @param {string} transmission - 'automatic' hoặc 'manual'
 * @returns {string} 'Số tự động' hoặc 'Số sàn'
 */
export const convertTransmission = (transmission) => {
  return transmission === 'automatic' ? 'Số tự động' : 'Số sàn';
};

/**
 * Parse number an toàn (trả về null nếu không parse được)
 * @param {any} value - Giá trị cần parse
 * @returns {number|null}
 */
export const safeParseInt = (value) => {
  if (!value) return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Parse float an toàn (trả về null nếu không parse được)
 * @param {any} value - Giá trị cần parse
 * @returns {number|null}
 */
export const safeParseFloat = (value) => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Extract File objects từ uploaded images/videos
 * @param {Array} uploadedFiles - Array of {file: File, preview: string}
 * @returns {Array<File>}
 */
export const extractFiles = (uploadedFiles) => {
  return uploadedFiles.map((item) => item.file);
};

