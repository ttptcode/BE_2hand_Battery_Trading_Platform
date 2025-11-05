/**
 * API Configuration
 * Quản lý base URL, timeout và các cấu hình chung
 */
// Tự động detect protocol dựa trên environment
const getApiBaseUrl = () => {
  // Nếu có biến môi trường, sử dụng nó (ưu tiên cao nhất)
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using API URL from environment:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Production (Netlify) - dùng relative URL để proxy qua serverless function
  // Local development - dùng HTTP trực tiếp
  const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
  
  if (isProduction) {
    // Trong production, dùng relative URL để proxy qua Netlify serverless function
    // Serverless function sẽ proxy đến HTTP backend (giải quyết Mixed Content)
    const apiUrl = '/api';
    console.log(`🌐 API URL (production, using proxy): ${apiUrl}`);
    return apiUrl;
  } else {
    // Local development - dùng HTTP trực tiếp
    const apiUrl = 'http://vehiclemarket.runasp.net/api';
    console.log(`🌐 API URL (development): ${apiUrl}`);
    return apiUrl;
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 giây
  RETRY_ATTEMPTS: 3,
  HEADERS: {
    "Content-Type": "application/json",
  },
};

/**
 * API Endpoints
 * Quản lý tất cả các endpoint paths
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    LOGOUT: "/Auth/logout",
    REFRESH: "/Auth/refresh",
    FORGOT_PASSWORD: "/Auth/forgot-password",
    RESET_PASSWORD: "/Auth/reset-password",
    VERIFY_OTP: "/Auth/verify-otp",
    ME: "/Auth/me",
    GOOGLE_LOGIN: "/auth/external-login/google",
    UPDATE_PHONE_PASSWORD: "/Auth/update-phone-password",
  },

  // Items endpoints
  ITEMS: {
    LIST: "/Items",
    DETAIL: "/Items/:id",
    CREATE: "/Items",
    UPDATE: "/Items/:id",
    DELETE: "/Items/:id",
    BY_USER: "/Items/user/:userId", 
  },

   USERS: {
    DETAIL: "/Users/:userId",
    UPDATE: "/Users/:userId",
    ITEMS: "/Items/user/:userId",
    PACKAGES: "/UserPackages/:userId",
    ACTIVE_PACKAGE: "/UserPackages/:userId/active",
  },


  FAVORITE: {
    TOGGLE: "/Favorites/toggle",
    USER_FAVORITES: "/Favorites/user/:userId",
  },
  // Chat & Messaging endpoints
  CHAT: {
    LISTINGS: "/Listings",
    CONVERSATIONS: {
      CREATE: "/Conversations/create",
      GET: "/Conversations/:id",
      USER: "/Conversations/user/:userId",
    },
    MESSAGES: {
      SEND: "/Messages",
      GET: "/Messages/:conversationId",
      MARK_READ: "/Messages/:messageId/read",
    },
  },

  //List endpoints
  LISTINGS: {
    PROXY_BID: "/Listings/proxy-bid",
    CREATE: "/Listings",
    CREATE_WITH_ITEM: "/Listings/with-item",
    LIST: "/Listings",
    DETAIL: "/Listings/:listingId",
    UPDATE: "/Listings/:listingId",
    DELETE: "/Listings/:listingId",
    DELETE_WITH_ITEM: "/Listings/with-item/:listingId",
    BY_USER: "/Listings/by-user/:userId",
    BY_TYPE: "/Listings/by-type/:listingType",
    BY_ITEM: "/Listings/by-item/:itemId"
  },

  //FeeCommissions endpoints
  FEE_COMMISSIONS: {
    GET_PACKAGES: "/FeeCommissions/packages",
    LIST: "/FeeCommissions",
    GET_BY_ID: "/FeeCommissions/:feeId",
    CREATE: "/FeeCommissions",
    UPDATE: "/FeeCommissions/:feeId",
    DELETE: "/FeeCommissions/:feeId",
  },

  // Item Types endpoints
  ITEM_TYPES: {
    LIST: "/ItemTypes",
    CREATE: "/ItemTypes",
    UPDATE: "/ItemTypes/:itemTypeId",
    DELETE: "/ItemTypes/:itemTypeId",
    GET_BY_NAME: "/ItemTypes/by-name/:name",
    GET_BY_ID: "/ItemTypes/:itemTypeId",
  },

  // Payment endpoints
  PAYMENT: {
    VNPAY_CREATE: "/VNpay/create-payment",
    PAYMENT_ALL: "Payments/all",
    PAYMENT_REPORT: "PaymentReport/monthly-revenue-pdf",
  },

 REVIEW: {
  CREATE: "/UserReputationReviews", // POST - tạo review hoặc comment
  DETAIL: "/UserReputationReviews/:id", // GET - chi tiết review
  UPDATE: "/UserReputationReviews/:id", // PUT - cập nhật review/comment
  DELETE: "/UserReputationReviews/:id", // DELETE - xóa review/comment
  BY_REVIEWEE: "/UserReputationReviews/reviewee/:revieweeId", // GET - danh sách review/bình luận của người đăng bài
  BY_REVIEWER: "/UserReputationReviews/reviewer/:reviewerId", // GET - danh sách review/bình luận của người đánh giá
  BY_LISTING: "/UserReputationReviews/listing/:listingId", // GET - review/bình luận theo listing
},

};
