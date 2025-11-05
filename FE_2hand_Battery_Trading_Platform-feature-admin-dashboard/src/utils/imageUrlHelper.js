/**
 * Image URL Helper
 * Normalize image URLs từ API để proxy qua Netlify Functions
 * Giải quyết vấn đề Mixed Content và ERR_CONNECTION_RESET
 */

const BACKEND_DOMAIN = 'vehiclemarket.runasp.net';
const BACKEND_URL_PATTERN = /^https?:\/\/(?:www\.)?vehiclemarket\.runasp\.net/;

/**
 * Normalize image URL - convert từ absolute URL sang relative URL để proxy
 * @param {string} url - Original URL từ API
 * @returns {string} - Normalized URL
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Nếu là Cloudinary URL hoặc external URL khác (KHÔNG PHẢI backend), giữ nguyên
  if (url.startsWith('https://res.cloudinary.com') || 
      url.startsWith('http://res.cloudinary.com') ||
      (url.startsWith('http://') || url.startsWith('https://')) && !url.includes(BACKEND_DOMAIN)) {
    return url;
  }

  // QUAN TRỌNG: Nếu là absolute URL từ backend (HTTP hoặc HTTPS), convert sang relative
  if (BACKEND_URL_PATTERN.test(url)) {
    // Extract path sau domain
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Trong production, dùng relative URL để proxy qua Netlify function
    const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
    
    if (isProduction) {
      // Return relative path để proxy qua Netlify function
      return path;
    } else {
      // Development - giữ nguyên HTTP URL
      return url;
    }
  }

  // Nếu đã là relative URL, giữ nguyên
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) {
    return url;
  }

  // Nếu là relative path khác, thêm leading slash nếu cần
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return `/${url}`;
  }

  return url;
};

/**
 * Normalize multiple image URLs
 * @param {string[]|Object[]} urls - Array of URLs or objects with url property
 * @returns {Array} - Array of normalized URLs or objects
 */
export const normalizeImageUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return urls;
  }

  return urls.map(item => {
    if (typeof item === 'string') {
      return normalizeImageUrl(item);
    }
    
    if (item && typeof item === 'object') {
      // Nếu là object có property 'url', normalize nó
      if (item.url) {
        return {
          ...item,
          url: normalizeImageUrl(item.url),
        };
      }
      
      // Nếu là object có property 'preview', normalize nó
      if (item.preview) {
        return {
          ...item,
          preview: normalizeImageUrl(item.preview),
        };
      }
    }
    
    return item;
  });
};

/**
 * Check if URL is from backend
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isBackendUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return BACKEND_URL_PATTERN.test(url);
};

