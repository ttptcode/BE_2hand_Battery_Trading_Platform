/**
 * ========================================
 * CATEGORY FIELD DEFINITIONS
 * ========================================
 * Định nghĩa fields nào thuộc danh mục nào
 * Backend trả về TẤT CẢ fields (response tổng), cần filter theo danh mục
 */

/**
 * Common fields - Có trong TẤT CẢ danh mục
 */
export const COMMON_FIELDS = [
  'title',
  'price', 
  'description',
  'address',
  'condition', // Tình trạng
];

/**
 * Car-specific fields
 */
export const CAR_FIELDS = [
  ...COMMON_FIELDS,
  'brand',           // Hãng xe
  'year',            // Năm sản xuất
  'version',         // Phiên bản (maps to model)
  'transmission',    // Hộp số (maps to gearbox)
  'fuelType',        // Nhiên liệu (maps to fuel)
  'origin',          // Xuất xứ
  'bodyType',        // Kiểu dáng (maps to style)
  'seats',           // Số chỗ ngồi (maps to seat)
  'color',           // Màu sắc
  'licensePlate',    // Biển số xe
  'mileage',         // Số km đã đi
  // localStorage fields (backend không hỗ trợ)
  'previousOwners',      // Số đời chủ
  'hasAccessories',      // Có phụ kiện đi kèm
  'hasValidInspection',  // Còn hạn đăng kiểm
  'sellerType',          // Bạn là (Cá nhân/Bán chuyên/Cửa hàng)
];

/**
 * Moto-specific fields
 */
export const MOTO_FIELDS = [
  ...COMMON_FIELDS,
  'brand',
  'type',         // Loại xe (maps to model)
  'year',
  'engineSize',   // Dung tích động cơ
  'origin',
  'licensePlate',
  'mileage',
];

/**
 * Truck-specific fields
 */
export const TRUCK_FIELDS = [
  ...COMMON_FIELDS,
  'brand',
  'payload',      // Tải trọng
  'year',
  'fuelType',     // Nhiên liệu
  'origin',
  'color',
  'licensePlate',
  'mileage',
];

/**
 * Electric Bike-specific fields
 */
export const ELECTRIC_BIKE_FIELDS = [
  ...COMMON_FIELDS,
  'brand',
  'vehicleType',  // Loại xe (maps to model)
  'motor',        // Công suất động cơ
  'origin',
  'color',
  'warranty',     // Bảo hành
];

/**
 * Bike-specific fields
 */
export const BIKE_FIELDS = [
  ...COMMON_FIELDS,
  'brand',
  'bikeType',       // Loại xe đạp (maps to model)
  'origin',
  'color',
  'frameSize',      // Kích thước khung
  'frameMaterial',  // Chất liệu khung
  'warranty',
];

/**
 * Battery-specific fields
 */
export const BATTERY_FIELDS = [
  ...COMMON_FIELDS,
  'brand',
  'batteryType',  // Loại ắc quy (maps to model)
  'voltage',      // Điện áp (localStorage - backend không hỗ trợ)
  'capacity',     // Dung lượng
  'origin',
  'color',
  'warranty',
  'sellerType',   // localStorage - backend không hỗ trợ
];

/**
 * Accessories-specific fields
 */
export const ACCESSORIES_FIELDS = [
  ...COMMON_FIELDS,
  'category',  // Danh mục phụ tùng (maps to model)
  'origin',
];

/**
 * Mapping backend field names → frontend field names
 */
export const BACKEND_TO_FRONTEND_FIELD_MAP = {
  // Common mappings
  itemTitle: 'title',
  buyNowPrice: 'price',
  detail: 'description',
  
  // Item mappings
  model: 'version',      // Car: version, Others: type/bikeType/vehicleType/batteryType/category
  gearbox: 'transmission',
  fuel: 'fuelType',
  style: 'bodyType',
  seat: 'seats',
};

/**
 * Get fields theo category
 */
export const getCategoryFields = (category) => {
  switch (category) {
    case 'car':
      return CAR_FIELDS;
    case 'moto':
      return MOTO_FIELDS;
    case 'truck':
      return TRUCK_FIELDS;
    case 'electricBike':
      return ELECTRIC_BIKE_FIELDS;
    case 'bike':
      return BIKE_FIELDS;
    case 'battery':
      return BATTERY_FIELDS;
    case 'accessories':
      return ACCESSORIES_FIELDS;
    default:
      return COMMON_FIELDS;
  }
};

/**
 * Check nếu field thuộc category
 */
export const isFieldInCategory = (fieldName, category) => {
  const categoryFields = getCategoryFields(category);
  return categoryFields.includes(fieldName);
};

