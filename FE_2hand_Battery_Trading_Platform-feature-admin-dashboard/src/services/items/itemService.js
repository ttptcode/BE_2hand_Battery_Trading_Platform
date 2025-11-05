import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

/**
 * Item Service
 * Quản lý các API calls liên quan đến Items (bài đăng)
 */
export const itemService = {
  /**
   * Get all items
   * @returns {Promise} Response với danh sách items
   */
  async getAllItems() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ITEMS.LIST);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Promise} Response với chi tiết item
   */
  async getItemById(id) {
    try {
      const endpoint = API_ENDPOINTS.ITEMS.DETAIL.replace(":id", id);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new item
   * @param {Object} itemData - Dữ liệu item mới
   * @returns {Promise} Response với item được tạo
   */
  async createItem(itemData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ITEMS.CREATE, itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update item
   * @param {string} id - Item ID
   * @param {Object} itemData - Dữ liệu cập nhật
   * @returns {Promise} Response với item đã cập nhật
   */
  async updateItem(id, itemData) {
    try {
      const endpoint = API_ENDPOINTS.ITEMS.UPDATE.replace(":id", id);
      const response = await apiClient.put(endpoint, itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete item
   * @param {string} id - Item ID
   * @returns {Promise} Response xác nhận xóa
   */
  async deleteItem(id) {
    try {
      const endpoint = API_ENDPOINTS.ITEMS.DELETE.replace(":id", id);
      const response = await apiClient.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create listing with item (multipart/form-data)
   * Tạo bài đăng nháp - CHỈ gửi các field có giá trị từ form frontend
   * 
   * @param {Object} listingData - Dữ liệu listing và item từ form
   * @param {File[]} images - Mảng file ảnh
   * @param {File} video - File video (optional)
   * @param {Function} onProgress - Callback function cho upload progress (optional)
   * @returns {Promise} Response với listing và item được tạo
   * 
   * LƯU Ý:
   * - Đây là API tạo bài đăng NHÁP - cho phép bỏ trống nhiều field
   * - Backend gộp tất cả field của mọi danh mục vào 1 API
   * - CHỈ truyền các field có trong object listingData
   * - KHÔNG thêm field mặc định nếu frontend không gửi
   */
  async createListingWithItem(listingData, images = [], video = null, onProgress = null) {
    try {
      console.log('=== BẮT ĐẦU TẠO LISTING ===');
      console.log('Dữ liệu nhận được:', listingData);
      console.log('Số lượng ảnh:', images?.length || 0);
      console.log('Có video:', video ? 'Có' : 'Không');

      const formData = new FormData();

      // Validate required fields
      if (!listingData.serialNumber) {
        throw new Error('SerialNumber là bắt buộc');
      }
      if (!listingData.itemTypeId) {
        throw new Error('ItemTypeId là bắt buộc');
      }

      // Helper function: CHỈ append nếu có giá trị
      const appendIfExists = (key, value) => {
        // ✅ Xử lý riêng cho boolean - Convert sang "True"/"False" cho ASP.NET
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'True' : 'False');
          console.log(`✓ Đã thêm ${key}:`, value ? 'True' : 'False', '(boolean → string for ASP.NET)');
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
          console.log(`✓ Đã thêm ${key}:`, value);
        }
      };

      // === REQUIRED FIELDS ===
      formData.append('SerialNumber', listingData.serialNumber);
      formData.append('ItemTypeId', listingData.itemTypeId);
      formData.append('ListingType', listingData.listingType ?? 0);
      
      console.log('✓ SerialNumber:', listingData.serialNumber);
      console.log('✓ ItemTypeId:', listingData.itemTypeId);
      console.log('✓ ListingType:', listingData.listingType ?? 0);

      // Title - CHỈ gửi nếu có giá trị (không gửi nếu empty)
      if (listingData.title && listingData.title.trim() !== '') {
        formData.append('Title', listingData.title);
        console.log('✓ Đã thêm Title:', listingData.title);
      } else {
        console.log('⚠️ Title trống - KHÔNG gửi');
      }

      // === OPTIONAL ITEM FIELDS ===
      // CHỈ append các field mà frontend truyền vào
      appendIfExists('Brand', listingData.brand);
      appendIfExists('Model', listingData.model);
      appendIfExists('Year', listingData.year);
      appendIfExists('Mileage', listingData.mileage);
      appendIfExists('BatteryCapacity', listingData.batteryCapacity);
      appendIfExists('Capacity', listingData.capacity);
      appendIfExists('Cycles', listingData.cycles);
      appendIfExists('Condition', listingData.condition);
      // KHÔNG gửi Price - chỉ dùng BuyNowPrice
      // appendIfExists('Price', listingData.price);
      appendIfExists('Style', listingData.style);
      appendIfExists('Color', listingData.color);
      appendIfExists('Seat', listingData.seat);
      appendIfExists('BatteryIncluded', listingData.batteryIncluded);
      appendIfExists('Weight', listingData.weight);
      appendIfExists('LicensePlate', listingData.licensePlate);
      appendIfExists('Origin', listingData.origin);
      appendIfExists('Fuel', listingData.fuel);
      appendIfExists('Gearbox', listingData.gearbox);
      appendIfExists('Version', listingData.version);
      appendIfExists('Engine', listingData.engine);
      appendIfExists('OwnerCount', listingData.ownerCount);
      appendIfExists('InspectionValidUntil', listingData.inspectionValidUntil);
      appendIfExists('Accessories', listingData.accessories);
      appendIfExists('BatteryType', listingData.batteryType);
      appendIfExists('Voltage', listingData.voltage);
      appendIfExists('FrameMaterial', listingData.frameMaterial);
      appendIfExists('FrameSize', listingData.frameSize);
      appendIfExists('PartType', listingData.partType);
      appendIfExists('Warranty', listingData.warranty);

      // === OPTIONAL LISTING FIELDS ===
      appendIfExists('YouAre', listingData.youAre);
    // BuyNowPrice - LUÔN gửi (kể cả khi = 0)
    if (listingData.buyNowPrice !== null && listingData.buyNowPrice !== undefined && typeof listingData.buyNowPrice === 'number') {
      formData.append('BuyNowPrice', listingData.buyNowPrice);
      console.log('✓ Đã thêm BuyNowPrice:', listingData.buyNowPrice, typeof listingData.buyNowPrice);
    } else {
      console.warn('⚠️ BuyNowPrice KHÔNG được thêm vào FormData (CREATE)');
      console.warn('   listingData.buyNowPrice:', listingData.buyNowPrice);
      console.warn('   typeof:', typeof listingData.buyNowPrice);
    }
      
      // KHÔNG gửi StartPrice - để null
      // appendIfExists('StartPrice', listingData.startPrice);
      appendIfExists('BidIncrement', listingData.bidIncrement);
      appendIfExists('EndDate', listingData.endDate);
      appendIfExists('FeeId', listingData.feeId);
      appendIfExists('Detail', listingData.detail);
      appendIfExists('Address', listingData.address);

      // === FILES ===
      // Append images
      if (images && images.length > 0) {
        console.log(`✓ Thêm ${images.length} ảnh`);
        images.forEach((image, index) => {
          formData.append('Images', image);
          console.log(`  - Ảnh ${index + 1}:`, image.name);
        });
      }

      // Append video
      if (video) {
        formData.append('Video', video);
        console.log('✓ Thêm video:', video.name);
      }

      console.log('=== GỬI REQUEST ===');
      
      // Gửi request qua Netlify function (production) hoặc trực tiếp (local)
      // QUAN TRỌNG: Trên production, phải qua Netlify function để tránh Mixed Content
      const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
      
      if (isProduction) {
        // Production: Dùng apiClient để proxy qua Netlify function
        // Axios sẽ tự động set Content-Type với boundary cho FormData
        const response = await apiClient.post(
          API_ENDPOINTS.LISTINGS.CREATE_WITH_ITEM,
          formData,
          {
            timeout: 120000, // 120 giây (2 phút) cho upload file lớn
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`📤 Upload progress: ${percentCompleted}%`);
              if (onProgress && typeof onProgress === 'function') {
                onProgress(percentCompleted);
              }
            },
          }
        );
        
        console.log('=== THÀNH CÔNG ===');
        console.log('Response:', response.data);
        return response;
      } else {
        // Local development: Gửi trực tiếp đến backend HTTP
        const backendBaseUrl = 'http://vehiclemarket.runasp.net/api';
        const fullUrl = `${backendBaseUrl}${API_ENDPOINTS.LISTINGS.CREATE_WITH_ITEM}`;
        
        const token = localStorage.getItem('accessToken');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: headers,
          body: formData,
        });
        
        const contentType = response.headers.get('content-type') || '';
        let responseData;
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        if (!response.ok) {
          throw {
            response: {
              status: response.status,
              statusText: response.statusText,
              data: responseData
            },
            message: `Request failed with status code ${response.status}`
          };
        }
        
        console.log('=== THÀNH CÔNG ===');
        console.log('Response:', responseData);
        
        return {
          data: responseData
        };
      }
    } catch (error) {
      console.error('=== LỖI KHI TẠO LISTING ===');
      console.error('Error:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // Log chi tiết validation errors
      if (error.response?.data?.errors) {
        console.error('=== CHI TIẾT VALIDATION ERRORS ===');
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          console.error(`❌ ${key}:`, errors[key]);
        });
      }
      
      throw error;
    }
  },

  /**
   * Update listing with item (cập nhật tin đăng nháp)
   * Dùng để tiếp tục đăng tin nháp đã lưu trước đó
   * 
   * @param {string} listingId - Listing ID cần cập nhật
   * @param {string} itemId - Item ID cần cập nhật
   * @param {Object} listingData - Dữ liệu cập nhật
   * @param {File[]} images - Mảng file ảnh mới (optional)
   * @param {File} video - File video mới (optional)
   * @returns {Promise} Response với listing và item đã cập nhật
   * 
   * LƯU Ý:
   * - API này cập nhật CẢ listing VÀ item
   * - Dùng cho tin đăng nháp và tin đăng chính thức
   * - Structure giống createListingWithItem nhưng dùng PUT method
   * - CHỈ gửi các field có giá trị từ form frontend
   * - CẦN CẢ listingId VÀ itemId để backend biết update record nào
   */
  /**
   * Update listing - PHIÊN BẢN TỐI ƯU
   * @param {string} listingId - ID của listing
   * @param {string} itemId - ID của item
   * @param {object} listingData - Dữ liệu cần update
   * @param {Array<string>} imageUrlsToKeep - Danh sách URL ảnh cần GIỮ LẠI
   * @param {Array<File>} newImages - Danh sách ảnh MỚI cần thêm
   * @param {string|null} videoUrlToKeep - URL video cần giữ lại (hoặc null để xóa)
   * @param {File|null} newVideo - Video mới (hoặc null)
   * @param {Function} onProgress - Callback function cho upload progress (optional)
   */
  async updateListingWithItem(listingId, itemId, listingData, imageUrlsToKeep = [], newImages = [], videoUrlToKeep = null, newVideo = null, onProgress = null) {
    try {
      console.log('=== BẮT ĐẦU CẬP NHẬT LISTING (TỐI ƯU) ===');
      console.log('Listing ID:', listingId);
      console.log('Item ID:', itemId);
      console.log('Dữ liệu cập nhật:', listingData);
      console.log('📸 Ảnh cũ giữ lại:', imageUrlsToKeep.length);
      console.log('📸 Ảnh mới thêm vào:', newImages.length);
      console.log('🎬 Video giữ lại:', videoUrlToKeep ? 'Có' : 'Không');
      console.log('🎬 Video mới:', newVideo ? 'Có' : 'Không');

      if (!listingId) {
        throw new Error('Listing ID là bắt buộc');
      }
      if (!itemId) {
        throw new Error('Item ID là bắt buộc');
      }

      const formData = new FormData();

      // Thêm ListingId và ItemId vào formData
      formData.append('ListingId', listingId);
      formData.append('ItemId', itemId);
      
      // ===== DANH SÁCH URL CẦN GIỮ LẠI =====
      if (imageUrlsToKeep && imageUrlsToKeep.length > 0) {
        imageUrlsToKeep.forEach(url => {
          formData.append('existingImageUrls', url); // Backend expect "existingImageUrls"
        });
        console.log(`✓ Sẽ giữ lại ${imageUrlsToKeep.length} ảnh cũ`);
      }
      
      if (videoUrlToKeep) {
        formData.append('existingVideoUrl', videoUrlToKeep); // Backend expect "existingVideoUrl"
        console.log('✓ Sẽ giữ lại video cũ');
      }

      // Helper function: CHỈ append nếu có giá trị
      const appendIfExists = (key, value) => {
        // ✅ Xử lý riêng cho boolean - Convert sang "True"/"False" cho ASP.NET
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'True' : 'False');
          console.log(`✓ Đã thêm ${key}:`, value ? 'True' : 'False', '(boolean → string for ASP.NET)');
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
          console.log(`✓ Đã thêm ${key}:`, value);
        }
      };

      // === OPTIONAL FIELDS - CHỈ gửi nếu có giá trị ===
      // SerialNumber, ItemTypeId, Title có thể null khi update
      appendIfExists('SerialNumber', listingData.serialNumber);
      appendIfExists('ItemTypeId', listingData.itemTypeId);
      appendIfExists('Title', listingData.title);

      // === OPTIONAL ITEM FIELDS ===
      appendIfExists('Brand', listingData.brand);
      appendIfExists('Model', listingData.model);
      appendIfExists('Year', listingData.year);
      appendIfExists('Mileage', listingData.mileage);
      appendIfExists('BatteryCapacity', listingData.batteryCapacity);
      appendIfExists('Capacity', listingData.capacity);
      appendIfExists('Cycles', listingData.cycles);
      appendIfExists('Condition', listingData.condition);
      
      // Price - CHỈ gửi nếu có giá trị (number hợp lệ)
      if (listingData.price !== null && listingData.price !== undefined && typeof listingData.price === 'number') {
        formData.append('Price', listingData.price);
        console.log('✓ Đã thêm Price:', listingData.price);
      }
      
      appendIfExists('Style', listingData.style);
      appendIfExists('Color', listingData.color);
      appendIfExists('Seat', listingData.seat);
      appendIfExists('BatteryIncluded', listingData.batteryIncluded);
      appendIfExists('Weight', listingData.weight);
      appendIfExists('LicensePlate', listingData.licensePlate);
      appendIfExists('Origin', listingData.origin);
      appendIfExists('Fuel', listingData.fuel);
      appendIfExists('Gearbox', listingData.gearbox);
      appendIfExists('Version', listingData.version);
      appendIfExists('Engine', listingData.engine);
      appendIfExists('OwnerCount', listingData.ownerCount);
      appendIfExists('InspectionValidUntil', listingData.inspectionValidUntil);
      appendIfExists('Accessories', listingData.accessories);
      appendIfExists('BatteryType', listingData.batteryType);
      appendIfExists('Voltage', listingData.voltage);
      appendIfExists('FrameMaterial', listingData.frameMaterial);
      appendIfExists('FrameSize', listingData.frameSize);
      appendIfExists('PartType', listingData.partType);
      appendIfExists('Warranty', listingData.warranty);

      // === OPTIONAL LISTING FIELDS ===
      appendIfExists('YouAre', listingData.youAre);
      appendIfExists('Status', listingData.status);
      
      // StartPrice - CHỈ gửi nếu có giá trị (number hợp lệ)
      if (listingData.startPrice !== null && listingData.startPrice !== undefined && typeof listingData.startPrice === 'number') {
        formData.append('StartPrice', listingData.startPrice);
        console.log('✓ Đã thêm StartPrice:', listingData.startPrice);
      }
      
      // BuyNowPrice - CHỈ gửi nếu có giá trị (number hợp lệ)
      if (listingData.buyNowPrice !== null && listingData.buyNowPrice !== undefined && typeof listingData.buyNowPrice === 'number') {
        formData.append('BuyNowPrice', listingData.buyNowPrice);
        console.log('✓ Đã thêm BuyNowPrice:', listingData.buyNowPrice, typeof listingData.buyNowPrice);
      } else {
        console.warn('⚠️ BuyNowPrice KHÔNG được thêm vào FormData (UPDATE)');
        console.warn('   listingData.buyNowPrice:', listingData.buyNowPrice);
        console.warn('   typeof:', typeof listingData.buyNowPrice);
      }
      
      appendIfExists('BidIncrement', listingData.bidIncrement);
      appendIfExists('EndDate', listingData.endDate);
      appendIfExists('FeeId', listingData.feeId);
      appendIfExists('Detail', listingData.detail);
      appendIfExists('Address', listingData.address);

      // === FILES ===
      // Append images (nếu có ảnh mới)
      if (newImages && newImages.length > 0) {
        console.log(`✓ Thêm ${newImages.length} ảnh mới`);
        newImages.forEach((image, index) => {
          formData.append('Images', image);
          console.log(`  - Ảnh ${index + 1}:`, image.name);
        });
      }

      // Append video (nếu có video mới)
      if (newVideo) {
        formData.append('Video', newVideo);
        console.log('✓ Thêm video mới:', newVideo.name);
      }

      console.log('=== GỬI REQUEST CẬP NHẬT ===');
      
      // Gửi request qua Netlify function (production) hoặc trực tiếp (local)
      const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
      
      if (isProduction) {
        // Production: Dùng apiClient để proxy qua Netlify function
        const response = await apiClient.put(
          API_ENDPOINTS.LISTINGS.CREATE_WITH_ITEM,
          formData,
          {
            timeout: 120000,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`📤 Upload progress: ${percentCompleted}%`);
              if (onProgress && typeof onProgress === 'function') {
                onProgress(percentCompleted);
              }
            },
          }
        );
        
        console.log('=== CẬP NHẬT THÀNH CÔNG ===');
        console.log('Response:', response.data);
        return response;
      } else {
        // Local development: Gửi trực tiếp đến backend HTTP
        const backendBaseUrl = 'http://vehiclemarket.runasp.net/api';
        const fullUrl = `${backendBaseUrl}${API_ENDPOINTS.LISTINGS.CREATE_WITH_ITEM}`;
        
        const token = localStorage.getItem('accessToken');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: headers,
          body: formData,
        });
        
        const contentType = response.headers.get('content-type') || '';
        let responseData;
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        if (!response.ok) {
          throw {
            response: {
              status: response.status,
              statusText: response.statusText,
              data: responseData
            },
            message: `Request failed with status code ${response.status}`
          };
        }
        
        console.log('=== CẬP NHẬT THÀNH CÔNG ===');
        console.log('Response:', responseData);
        
        return {
          data: responseData
        };
      }
    } catch (error) {
      console.error('=== LỖI KHI CẬP NHẬT LISTING ===');
      console.error('Error:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // Log chi tiết validation errors
      if (error.response?.data?.errors) {
        console.error('=== CHI TIẾT VALIDATION ERRORS ===');
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          console.error(`❌ ${key}:`, errors[key]);
        });
      }
      
      throw error;
    }
  },

  /**
   * Delete listing with item (xóa cả tin đăng và item)
   * Xóa cả tin đăng nháp và tin đăng chính thức
   * 
   * @param {string} listingId - Listing ID cần xóa
   * @returns {Promise} Response xác nhận xóa
   * 
   * LƯU Ý:
   * - API này xóa CẢ listing VÀ item liên quan
   * - Dùng cho cả tin đăng nháp và tin đăng chính thức
   * - Không thể hoàn tác sau khi xóa
   */
  async deleteListingWithItem(listingId) {
    try {
      console.log('=== BẮT ĐẦU XÓA LISTING VÀ ITEM ===');
      console.log('Listing ID:', listingId);

      if (!listingId) {
        throw new Error('Listing ID là bắt buộc');
      }

      const endpoint = API_ENDPOINTS.LISTINGS.DELETE_WITH_ITEM.replace(':listingId', listingId);
      
      const response = await apiClient.delete(endpoint);

      console.log('=== XÓA THÀNH CÔNG ===');
      console.log('Response:', response.data);
      
      return response;
    } catch (error) {
      console.error('=== LỖI KHI XÓA LISTING VÀ ITEM ===');
      console.error('Error:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      throw error;
    }
  },
};

