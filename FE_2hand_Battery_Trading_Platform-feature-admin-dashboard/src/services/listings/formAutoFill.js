/**
 * ========================================
 * FORM AUTO-FILL SERVICE
 * ========================================
 * Centralized auto-fill logic cho tất cả danh mục Post forms
 * Load và fill form từ API response (draft data hoặc existing listing)
 */

import { listingService } from './listingService';
import { loadDraftMetadata, saveDraftMetadata, clearDraftMetadata } from './draftMetadata';
import { getCategoryFields, isFieldInCategory } from './categoryFields';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

// ✅ Export để các components sử dụng
export { saveDraftMetadata, clearDraftMetadata };

/**
 * ==================== VALUE MAPPING ====================
 * Map API response values (Vietnamese) → Frontend form values (ENGLISH codes)
 * Backend trả về tiếng Việt, nhưng frontend formData lưu English codes
 */

/**
 * Map condition value: Vietnamese (backend) → English (frontend)
 * Backend: "Đã qua sử dụng", "Mới"
 * Frontend: "used", "new"
 */
const mapCondition = (apiValue) => {
  if (!apiValue) return "";
  const value = String(apiValue).toLowerCase();
  if (value.includes("mới") || value === "new") return "new";
  if (value.includes("qua sử dụng") || value.includes("đã sử dụng") || value.includes("cũ") || value === "used") {
    return "used";
  }
  return ""; // Default rỗng nếu không match
};

/**
 * Map transmission: Vietnamese (backend) → English (frontend)
 * Backend: "Số tự động", "Số sàn"
 * Frontend: "automatic", "manual"
 */
const mapTransmission = (apiValue) => {
  if (!apiValue) return "";
  const value = String(apiValue).toLowerCase();
  if (value.includes("tự động") || value === "automatic") return "automatic";
  if (value.includes("sàn") || value === "manual") return "manual";
  return "";
};

/**
 * Map fuel type: Vietnamese (backend) → English (frontend)
 * Backend: "Xăng", "Dầu", "Điện", "Động cơ Hybrid"
 * Frontend: "gasoline", "diesel", "electric", "hybrid"
 */
const mapFuelType = (apiValue) => {
  if (!apiValue) return "";
  const value = String(apiValue).toLowerCase();
  if (value.includes("xăng") || value === "gasoline") return "gasoline";
  if (value.includes("dầu") || value === "diesel") return "diesel";
  if (value.includes("điện") || value === "electric") return "electric";
  if (value.includes("hybrid")) return "hybrid";
  return "";
};

/**
 * Map seller type: Vietnamese (backend) → English (frontend)
 * Backend: "Cá nhân", "Bán chuyên", "Cửa hàng"
 * Frontend: "individual", "professional", "dealer"
 */
const mapSellerType = (apiValue) => {
  if (!apiValue) return "";
  const value = String(apiValue).toLowerCase();
  if (value.includes("cá nhân") || value === "individual") return "individual";
  if (value.includes("bán chuyên") || value === "professional") return "professional";
  if (value.includes("cửa hàng") || value === "dealer") return "dealer";
  return "";
};

/**
 * Map Yes/No: Vietnamese (backend) → English (frontend)
 * Backend: "Có", "Không", true, false
 * Frontend: "yes", "no"
 */
const mapYesNo = (apiValue) => {
  if (!apiValue) return "";
  
  if (typeof apiValue === 'boolean') {
    return apiValue ? "yes" : "no";
  }
  
  const value = String(apiValue).toLowerCase();
  if (value.includes("có") || value === "true" || value === "yes") return "yes";
  if (value.includes("không") || value === "false" || value === "no") return "no";
  
  return "";
};

/**
 * Map accessories: BOOLEAN (backend) → "yes"/"no" (frontend)
 * Backend: true, false
 * Frontend: "yes", "no"
 */
const mapAccessories = (apiValue) => {
  if (apiValue === null || apiValue === undefined) return "";
  if (typeof apiValue === 'boolean') {
    return apiValue ? "yes" : "no";
  }
  return "";
};

/**
 * Map inspection valid: BOOLEAN (backend) → "yes"/"no" (frontend)
 * Backend: true, false
 * Frontend: "yes", "no"
 */
const mapInspection = (apiValue) => {
  if (apiValue === null || apiValue === undefined) return "";
  if (typeof apiValue === 'boolean') {
    return apiValue ? "yes" : "no";
  }
  return "";
};

/**
 * Map owner count: STRING (backend) → Display text (frontend)
 * Backend: API field "ownerCount" (string: "1", "2", "3", "4")
 * Frontend: "Chủ đầu tiên", "2 chủ", "3 chủ", "4 chủ trở lên"
 */
const mapOwnerCount = (apiValue) => {
  if (!apiValue) return "";
  const count = parseInt(apiValue);
  if (isNaN(count)) return "";
  if (count === 1) return "Chủ đầu tiên";
  if (count === 2) return "2 chủ";
  if (count === 3) return "3 chủ";
  if (count >= 4) return "4 chủ trở lên";
  return "";
};

/**
 * ==================== AUTO-FILL BY CATEGORY ====================
 */

/**
 * Auto-fill Car form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillCar = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  console.log('🔍 AUTO-FILL CAR - API Data:', {
    ownerCount: item.ownerCount,
    accessories: item.accessories,
    inspectionValidUntil: item.inspectionValidUntil,
    youAre: listing.youAre,
  });
  console.log('🔍 Type check:', {
    ownerCountType: typeof item.ownerCount,
    accessoriesType: typeof item.accessories,
    inspectionValidUntilType: typeof item.inspectionValidUntil,
    youAreType: typeof listing.youAre,
  });
  
  const result = {
    // Common fields
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    
    // Car-specific fields (map Vietnamese → English codes)
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    year: item.year ? String(item.year) : "",
    version: item.model || "",
    transmission: mapTransmission(item.gearbox),
    fuelType: mapFuelType(item.fuel),
    origin: item.origin || "",
    bodyType: item.style || "",
    seats: item.seat || "", // ✅ STRING - không cần convert
    color: item.color || "",
    licensePlate: item.licensePlate || "",
    mileage: item.mileage || "", // ✅ STRING - không cần convert
    
    // ✅ Map từ API fields (KHÔNG dùng localStorage)
    previousOwners: mapOwnerCount(item.ownerCount), // ✅ Map từ API field 'ownerCount' (string)
    hasAccessories: mapAccessories(item.accessories), // ✅ Map từ API field 'accessories' (boolean)
    hasValidInspection: mapInspection(item.inspectionValidUntil), // ✅ Map từ API field 'inspectionValidUntil' (boolean)
    sellerType: mapSellerType(listing.youAre), // ✅ Map từ API field 'youAre' (string)
  };
  
  console.log('✅ AUTO-FILL CAR - Mapped Result:', {
    previousOwners: result.previousOwners,
    hasAccessories: result.hasAccessories,
    hasValidInspection: result.hasValidInspection,
    sellerType: result.sellerType,
  });
  
  return result;
};

/**
 * Auto-fill Moto form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillMoto = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    vehicleType: item.model || "", // ✅ Sửa từ 'type' → 'vehicleType'
    year: item.year ? String(item.year) : "",
    engineSize: item.engine || item.capacity || "", // ✅ Map từ API fields 'engine' hoặc 'capacity'
    origin: item.origin || "",
    licensePlate: item.licensePlate || "",
    mileage: item.mileage ? String(item.mileage) : "",
    sellerType: mapSellerType(listing.youAre), // ✅ Thêm sellerType từ youAre
  };
};

/**
 * Auto-fill Truck form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillTruck = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    payload: item.weight || "", // ✅ Map từ API field 'weight' → frontend 'payload'
    capacity: item.capacity ? String(item.capacity) : "", // ✅ Map từ API field 'capacity'
    year: item.year ? String(item.year) : "",
    fuelType: mapFuelType(item.fuel),
    origin: item.origin || "",
    color: item.color || "",
    licensePlate: item.licensePlate || "",
    mileage: item.mileage ? String(item.mileage) : "",
    sellerType: mapSellerType(listing.youAre), // ✅ Map từ API field 'youAre'
  };
};

/**
 * Auto-fill Electric Bike form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillElectricBike = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    vehicleType: item.model || "",
    motor: item.motor || item.power || "",
    batteryCapacity: item.batteryCapacity ? String(item.batteryCapacity) : (item.capacity ? String(item.capacity) : ""), // ✅ Map từ batteryCapacity hoặc capacity
    batteryIncluded: mapYesNo(item.batteryIncluded), // ✅ Thêm batteryIncluded
    origin: item.origin || "",
    color: item.color || "",
    warranty: item.warranty || listing.warranty || "",
    sellerType: mapSellerType(listing.youAre), // ✅ Map từ API field 'youAre'
  };
};

/**
 * Auto-fill Bike form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillBike = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    type: item.model || "", // ✅ Sửa từ 'bikeType' → 'type'
    origin: item.origin || "",
    color: item.color || "",
    frameSize: item.frameSize || "", // ✅ Map frameSize
    frameMaterial: item.frameMaterial || "", // ✅ Map frameMaterial
    warranty: item.warranty || listing.warranty || "",
    sellerType: mapSellerType(listing.youAre), // ✅ Map từ API field 'youAre'
  };
};

/**
 * Auto-fill Battery form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillBattery = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  const metadata = loadDraftMetadata(listing.listingId);
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    brand: item.brand || "",
    batteryType: item.batteryType || "", // ✅ Map từ API field 'batteryType'
    voltage: item.voltage || "", // ✅ Map từ API field 'voltage'
    capacity: item.capacity || "", // ✅ Map từ API field 'capacity'
    origin: item.origin || "",
    color: item.color || "",
    warranty: item.warranty || listing.warranty || "",
    sellerType: metadata.sellerType || "", // localStorage (backend không hỗ trợ)
  };
};

/**
 * Auto-fill Accessories form data
 * Backend trả về tất cả fields (tổng), fields null = chưa điền hoặc không thuộc danh mục
 */
const autoFillAccessories = (apiData) => {
  const item = apiData.item || {};
  const listing = apiData || {};
  
  return {
    title: listing.itemTitle || item.title || "",
    price: listing.buyNowPrice ? String(listing.buyNowPrice) : "",
    description: listing.detail || "",
    address: listing.address || "",
    condition: mapCondition(item.condition),
    category: item.partType || "", // ✅ Map từ API field 'partType' → frontend 'category'
    origin: item.origin || "",
    sellerType: mapSellerType(listing.youAre), // ✅ Map từ API field 'youAre'
  };
};

/**
 * ==================== MEDIA AUTO-FILL ====================
 */

/**
 * Extract images from API response
 * @param {Object} apiData - API response data
 * @returns {Array} - Array of image objects { preview, file, isExisting }
 */
const extractImages = (apiData) => {
  const item = apiData.item || {};
  const imageUrls = item.imageUrls || [];
  
  return imageUrls.map((url) => ({
    preview: normalizeImageUrl(url),
    file: null,
    isExisting: true,
  }));
};

/**
 * Extract video from API response
 * @param {Object} apiData - API response data
 * @returns {Object|null} - Video object hoặc null
 */
const extractVideo = (apiData) => {
  const item = apiData.item || {};
  const videoUrl = item.videoUrl || null;
  
  if (!videoUrl) return null;
  
  return {
    preview: normalizeImageUrl(videoUrl),
    file: null,
    isExisting: true,
    name: 'existing-video.mp4',
  };
};

/**
 * ==================== MAIN AUTO-FILL FUNCTIONS ====================
 */

/**
 * Auto-fill form data theo category
 * @param {Object} apiData - API response data (draft hoặc listing)
 * @param {string} category - Category name (car, moto, truck, etc.)
 * @returns {Object} - Form data object
 */
export const autoFillFormData = (apiData, category) => {
  if (!apiData) {
    console.warn('[autoFillFormData] No API data provided');
    return {};
  }
  
  switch (category) {
    case 'car':
      return autoFillCar(apiData);
    case 'moto':
      return autoFillMoto(apiData);
    case 'truck':
      return autoFillTruck(apiData);
    case 'electricBike':
      return autoFillElectricBike(apiData);
    case 'bike':
      return autoFillBike(apiData);
    case 'battery':
      return autoFillBattery(apiData);
    case 'accessories':
      return autoFillAccessories(apiData);
    default:
      console.error(`[autoFillFormData] Invalid category: ${category}`);
      return {};
  }
};

/**
 * Auto-fill media (images & video)
 * @param {Object} apiData - API response data
 * @returns {Object} - { images: Array, video: Object|null }
 */
export const autoFillMedia = (apiData) => {
  if (!apiData) {
    return { images: [], video: null };
  }
  
  return {
    images: extractImages(apiData),
    video: extractVideo(apiData),
  };
};

/**
 * ==================== LOAD DRAFT AND FILL ====================
 */

/**
 * Load draft/listing từ API và auto-fill form
 * @param {string|number} listingId - Listing ID
 * @param {string} category - Category name
 * @param {Function} setFormData - setState function for formData
 * @param {Function} setUploadedImages - setState function for uploadedImages
 * @param {Function} setUploadedVideos - setState function for uploadedVideos
 * @param {Function} setLoading - setState function for loading (optional)
 * @param {Function} setErrors - setState function for errors (optional)
 * @returns {Promise<Object|null>} - API response data hoặc null nếu có lỗi
 */
export const loadDraftAndFill = async (
  listingId,
  category,
  setFormData,
  setUploadedImages,
  setUploadedVideos,
  setLoading = null,
  setErrors = null
) => {
  try {
    // Set loading state
    if (setLoading) setLoading(true);
    
    // Clear errors
    if (setErrors) setErrors({});
    
    // Fetch listing data from API
    const response = await listingService.getListingById(listingId);
    const apiData = response?.data?.data || response?.data;
    
    if (!apiData) {
      throw new Error('Không thể tải dữ liệu tin đăng');
    }
    
    // Auto-fill form data
    const formData = autoFillFormData(apiData, category);
    setFormData((prev) => ({ ...prev, ...formData }));
    
    // Auto-fill media
    const { images, video } = autoFillMedia(apiData);
    
    if (images.length > 0) {
      setUploadedImages(images);
    }
    
    if (video) {
      setUploadedVideos([video]);
    }
    
    return apiData;
  } catch (error) {
    console.error('[loadDraftAndFill] Error:', error);
    
    if (setErrors) {
      setErrors({
        general: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải tin đăng',
      });
    }
    
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * ==================== DISPLAY VALUE HELPERS ====================
 */

/**
 * Get display value cho dropdown field (để hiển thị trong placeholder hoặc selected value)
 * @param {string} fieldName - Field name
 * @param {any} value - Field value
 * @returns {string} - Display value
 */
export const getDisplayValue = (fieldName, value) => {
  if (!value) return "";
  
  // Special mappings nếu cần
  switch (fieldName) {
    case 'condition':
      return mapCondition(value);
    case 'transmission':
      return mapTransmission(value);
    case 'fuelType':
      return mapFuelType(value);
    case 'sellerType':
      return mapSellerType(value);
    case 'hasAccessories':
    case 'hasValidInspection':
      return mapYesNo(value);
    default:
      return String(value);
  }
};

/**
 * ==================== HELPER: URL TO FILE ====================
 */

/**
 * Convert URL to File object (để gửi lại existing images/video khi update)
 * @param {string} url - URL của file
 * @param {string} filename - Tên file
 * @returns {Promise<File|null>} - File object hoặc null nếu có lỗi
 */
export const urlToFile = async (url, filename) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*,video/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new File([blob], filename, { 
      type: blob.type || 'application/octet-stream' 
    });
  } catch (error) {
    console.error('[urlToFile] Error:', error);
    return null;
  }
};

