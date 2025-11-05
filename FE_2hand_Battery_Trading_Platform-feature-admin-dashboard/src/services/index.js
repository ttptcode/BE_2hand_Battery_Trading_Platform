// Export tất cả services
import apiClient from './api';
import { API_CONFIG, API_ENDPOINTS } from './api/config';
import { authService } from './auth/authService';
import { tokenService } from './auth/tokenService';
import { phoneUpdateService } from './auth/phoneUpdateService';
import { itemService } from './items/itemService';
import { itemTypeService } from './itemstype/itemsTypeService';
import { listingService } from './listings/listingService';
import { vnpayService } from './payment/vnpayService';

// Named exports
export { apiClient, API_CONFIG, API_ENDPOINTS };
export { authService };
export { tokenService };
export { phoneUpdateService };
export { itemService };
export { itemTypeService };
export { listingService };
export { userPackageService } from './users/userPackageService';
export { vnpayService };

// Default export for convenience
export default {
  apiClient,
  API_CONFIG,
  API_ENDPOINTS,
  authService,
  tokenService,
  phoneUpdateService,
  itemService,
  itemTypeService,
  listingService,
  vnpayService
};
