/**
 * ========================================
 * DRAFT METADATA SERVICE  
 * ========================================
 * Lưu/load các field mà backend CHƯA hỗ trợ vào localStorage
 * Sử dụng khi auto-fill form từ draft data
 */

const METADATA_PREFIX = 'draft_metadata_';

/**
 * Lưu metadata của draft vào localStorage
 * @param {string} listingId - Listing ID
 * @param {Object} metadata - Object chứa các field cần lưu
 */
export const saveDraftMetadata = (listingId, metadata) => {
  if (!listingId) return;
  
  try {
    const key = `${METADATA_PREFIX}${listingId}`;
    localStorage.setItem(key, JSON.stringify(metadata));
    console.log('✓ Đã lưu metadata vào localStorage:', metadata);
  } catch (error) {
    console.error('❌ Lỗi khi lưu metadata:', error);
  }
};

/**
 * Load metadata của draft từ localStorage
 * @param {string} listingId - Listing ID
 * @returns {Object} - Metadata object hoặc empty object
 */
export const loadDraftMetadata = (listingId) => {
  if (!listingId) return {};
  
  try {
    const key = `${METADATA_PREFIX}${listingId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      const metadata = JSON.parse(data);
      console.log('✓ Đã load metadata từ localStorage:', metadata);
      return metadata;
    }
  } catch (error) {
    console.error('❌ Lỗi khi load metadata:', error);
  }
  
  return {};
};

/**
 * Xóa metadata của draft từ localStorage
 * @param {string} listingId - Listing ID
 */
export const clearDraftMetadata = (listingId) => {
  if (!listingId) return;
  
  try {
    const key = `${METADATA_PREFIX}${listingId}`;
    localStorage.removeItem(key);
    console.log('✓ Đã xóa metadata từ localStorage');
  } catch (error) {
    console.error('❌ Lỗi khi xóa metadata:', error);
  }
};

/**
 * Xóa TẤT CẢ metadata cũ (cleanup)
 */
export const clearAllDraftMetadata = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(METADATA_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('✓ Đã xóa tất cả metadata cũ');
  } catch (error) {
    console.error('❌ Lỗi khi xóa tất cả metadata:', error);
  }
};

