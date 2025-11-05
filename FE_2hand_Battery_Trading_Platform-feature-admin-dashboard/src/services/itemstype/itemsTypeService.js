import apiClient from "../api";
import { API_ENDPOINTS } from "../api/config";

/**
 * Item Type Service
 * Quản lý các API calls liên quan đến Item Types (loại sản phẩm)
 */

// Mapping các tên danh mục frontend với tên trong API
const CATEGORY_NAME_MAPPING = {
  'Ô tô': ['Ô tô', 'Oto', 'oto', 'ô tô'],
  'Xe máy': ['Xe máy', 'Xe may', 'xe máy', 'xe may'],
  'Xe đạp': ['Xe đạp', 'Xe dap', 'xe đạp', 'xe dap'],
  'Xe điện': ['Xe điện', 'Xe dien', 'xe điện', 'xe dien'],
  'Xe tải, xe ben': ['Xe tải, xe ben', 'Xe tai, xe ben', 'xe tải, xe ben', 'Xe tải'],
  'Ắc quy/ Pin': ['Ắc quy/ Pin', 'Ac quy/ Pin', 'ắc quy/ pin', 'Ắc quy'],
  'Phụ tùng/ Phụ kiện': ['Phụ tùng/ Phụ kiện', 'Phu tung/ Phu kien', 'phụ tùng/ phụ kiện'],
};

export const itemTypeService = {
  /**
   * Get all item types từ API
   * @returns {Promise} Response với danh sách item types
   */
  async getAllItemTypes() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ITEM_TYPES.LIST);
      console.log('Item Types từ API:', response.data?.data);
      return response;
    } catch (error) {
      console.error("Error getting item types:", error);
      throw error;
    }
  },

  /**
   * Get item type ID by name (Sử dụng logic lọc của Frontend)
   * @param {string} categoryName - Tên danh mục (Ô tô, Xe máy, Xe đạp, etc.)
   * @returns {Promise<string|null>} Item type ID hoặc null nếu không tìm thấy
   */
  async getItemTypeIdByName(categoryName) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ITEM_TYPES.LIST);
      const itemTypes = response.data?.data || [];

      console.log('Tìm itemTypeId cho:', categoryName);
      console.log('Danh sách ItemTypes:', itemTypes);

      // Lấy danh sách các tên có thể có của category
      const possibleNames = CATEGORY_NAME_MAPPING[categoryName] || [categoryName];

      // Tìm item type theo name (so sánh với nhiều biến thể)
      const itemType = itemTypes.find((type) => {
        const typeName = type.name.trim().toLowerCase();
        return possibleNames.some(name => name.toLowerCase().trim() === typeName);
      });

      if (itemType) {
        console.log('Tìm thấy ItemType:', itemType);
        return itemType.itemTypeId;
      } else {
        console.warn('Không tìm thấy ItemType cho:', categoryName);
        return null;
      }
    } catch (error) {
      console.error("Error getting item type by name:", error);
      throw error;
    }
  },

  /**
   * Get item type name mapping
   * @returns {Promise<Object>} Object mapping tên sang itemTypeId
   */
  async getItemTypeMapping() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ITEM_TYPES.LIST);
      const itemTypes = response.data?.data || [];

      // Tạo mapping object { "Ô tô": "itemTypeId", ... }
      const mapping = {};
      itemTypes.forEach((type) => {
        mapping[type.name] = type.itemTypeId;
      });

      console.log('Item Type Mapping:', mapping);
      return mapping;
    } catch (error) {
      console.error("Error getting item type mapping:", error);
      throw error;
    }
  },

  // --- CÁC HÀM MỚI ĐƯỢC BỔ SUNG ---

  /**
   * Tạo một Item Type mới
   * @param {Object} itemTypeData - Dữ liệu của Item Type mới (ví dụ: { name: 'Xe Limousine' })
   * @returns {Promise} Response từ server
   */
  async createItemType(itemTypeData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ITEM_TYPES.CREATE, itemTypeData);
      console.log('Item Type created:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating item type:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một Item Type
   * @param {string} itemTypeId - ID của Item Type cần cập nhật
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} Response từ server
   */
  async updateItemType(itemTypeId, updateData) {
    if (!itemTypeId) throw new Error("itemTypeId is required");
    try {
      const path = API_ENDPOINTS.ITEM_TYPES.UPDATE.replace(':itemTypeId', itemTypeId);
      const response = await apiClient.put(path, updateData);
      console.log('Item Type updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating item type with ID ${itemTypeId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một Item Type
   * @param {string} itemTypeId - ID của Item Type cần xóa
   * @returns {Promise} Response từ server
   */
  async deleteItemType(itemTypeId) {
    if (!itemTypeId) throw new Error("itemTypeId is required");
    try {
      const path = API_ENDPOINTS.ITEM_TYPES.DELETE.replace(':itemTypeId', itemTypeId);
      const response = await apiClient.delete(path);
      console.log('Item Type deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting item type with ID ${itemTypeId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết Item Type bằng ID
   * @param {string} itemTypeId - ID của Item Type
   * @returns {Promise} Response với chi tiết Item Type
   */
  async getItemTypeById(itemTypeId) {
    if (!itemTypeId) throw new Error("itemTypeId is required");
    try {
      const path = API_ENDPOINTS.ITEM_TYPES.GET_BY_ID.replace(':itemTypeId', itemTypeId);
      const response = await apiClient.get(path);
      console.log('Item Type details:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting item type with ID ${itemTypeId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết Item Type bằng Tên (sử dụng API endpoint)
   * @param {string} name - Tên của Item Type
   * @returns {Promise} Response với chi tiết Item Type
   */
  async getItemTypeByName(name) {
    if (!name) throw new Error("name is required");
    try {
      const path = API_ENDPOINTS.ITEM_TYPES.GET_BY_NAME.replace(':name', name);
      const response = await apiClient.get(path);
      console.log('Item Type details by name:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting item type with name ${name}:`, error);
      throw error;
    }
  },
};
