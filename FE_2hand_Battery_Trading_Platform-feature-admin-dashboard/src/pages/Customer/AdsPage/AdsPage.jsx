import React, { useState, useEffect } from 'react';
import { Avatar, Tag, Input, Button, Tabs, Modal, message, Form, Select, Spin, Switch, Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthCheck } from '../../../hooks/useAuthCheck';
import LoginModal from '../LoginPage/LoginPage';
import {
  FileProtectOutlined,
  SearchOutlined,
  PlusCircleFilled,
  UnorderedListOutlined,
  GiftOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FormOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { listingService } from '../../../services/listings/listingService';
import { itemService } from '../../../services/items/itemService';
import { authService } from '../../../services/auth/authService';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import logo from '../../../assets/img/logo.png';
import backgroundPost from '../../../assets/img/backgroundpost.png';

// Custom Icon Component for emoji icons
const EmojiIcon = ({ emoji }) => (
  <span style={{ fontSize: '14px', marginRight: '4px' }}>{emoji}</span>
);

// Helper function to get category label with emoji
const getCategoryLabel = (itemTypeName) => {
  if (!itemTypeName) return '❓ Khác';
  
  const categoryMap = {
    'Ô tô': '🚗 Ô tô',
    'Xe máy': '🏍️ Xe máy',
    'Xe tải, xe ben': '🚚 Xe tải, xe ben',
    'Xe đạp': '🚲 Xe đạp',
    'Xe điện': '⚡ Xe điện',
    'Ắc quy/ Pin': '🔋 Ắc quy/ Pin',
    'Phụ tùng/ Phụ kiện': '🛠️ Phụ tùng/ Phụ kiện'
  };
  
  return categoryMap[itemTypeName] || `❓ ${itemTypeName}`;
};

// Transform API data to display format
const transformListingData = (listing) => {
  // Normalize status to ensure consistency
  const normalizeStatus = (status) => {
    if (!status) return 'Active';
    const statusLower = status.toLowerCase();
    // Map common status variations
    if (statusLower === 'active') return 'Active';
    if (statusLower === 'draft') return 'Draft';
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'expired') return 'Expired';
    if (statusLower === 'hidden') return 'Hidden';
    // Return capitalized version of unknown status
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return {
    id: listing.listingId,
    title: listing.itemTitle,
    // Format price with dots and VNĐ
    price: listing.buyNowPrice ? `${listing.buyNowPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ` : '0 VNĐ',
    // Normalize image URL để proxy qua Netlify function
    image: normalizeImageUrl(listing.item?.imageUrls?.[0] || ''),
    date: new Date(listing.createdAt).toLocaleDateString('vi-VN'),
    location: listing.userName ? `Người bán: ${listing.userName}` : 'Không xác định',
    status: normalizeStatus(listing.status),
    itemTypeName: listing.item?.itemTypeName || 'Khác',
    // Keep original data for editing
    originalData: listing
  };
};

const UserFilters = ({ userInfo, isDarkMode }) => (
  <div className={`p-4 rounded-lg shadow-sm mb-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b space-y-4 md:space-y-0 transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center space-x-3">
        <Avatar size={40}>{userInfo?.fullName?.[0]}</Avatar>
        <div>
          <div className={`font-semibold text-sm md:text-base transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo?.fullName}</div>
          <Tag color="blue" icon={<FileProtectOutlined />} className="mt-1 text-xs">
            {userInfo?.role || 'User'}
          </Tag>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
        <Input
          placeholder="Tìm tin đăng của bạn..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className={`w-full md:w-72 ${isDarkMode ? 'dark-input' : ''}`}
          size="small"
          style={{
            backgroundColor: isDarkMode ? '#374151' : 'white',
            borderColor: isDarkMode ? '#4b5563' : '#d9d9d9',
            color: isDarkMode ? 'white' : 'inherit'
          }}
        />
        <div className="flex items-center space-x-1">
          <span className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>SĐT:</span>
          <span className={`font-bold text-sm transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo?.phone}</span>
        </div>
      </div>
    </div>
  </div>
);

const CategoryFilter = ({ categoryCounts, selectedCategory, onCategoryChange, isDarkMode }) => {
  const categories = [
    { key: 'all', label: 'Tất cả', icon: <EmojiIcon emoji="📦" />, count: categoryCounts.all },
    { key: 'Ô tô', label: 'Ô tô', icon: <EmojiIcon emoji="🚗" />, count: categoryCounts.car },
    { key: 'Xe tải, xe ben', label: 'Xe tải, xe ben', icon: <EmojiIcon emoji="🚚" />, count: categoryCounts.truck },
    { key: 'Xe máy', label: 'Xe máy', icon: <EmojiIcon emoji="🏍️" />, count: categoryCounts.motorcycle },
    { key: 'Xe đạp', label: 'Xe đạp', icon: <EmojiIcon emoji="🚲" />, count: categoryCounts.bike },
    { key: 'Xe điện', label: 'Xe điện', icon: <EmojiIcon emoji="⚡" />, count: categoryCounts.electricBike },
    { key: 'Ắc quy/ Pin', label: 'Ắc quy/ Pin', icon: <EmojiIcon emoji="🔋" />, count: categoryCounts.battery },
    { key: 'Phụ tùng/ Phụ kiện', label: 'Phụ tùng/ Phụ kiện', icon: <EmojiIcon emoji="🛠️" />, count: categoryCounts.accessory },
  ];

  return (
    <div className={`p-3 md:p-4 rounded-lg shadow-sm mb-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center mb-3">
        <span className={`font-semibold text-sm mr-3 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lọc theo danh mục:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.key}
            icon={cat.icon}
            size="small"
            type={selectedCategory === cat.key ? 'primary' : 'default'}
            onClick={() => onCategoryChange(cat.key)}
            className={`text-xs ${selectedCategory === cat.key ? 'bg-[#00C9A7] border-[#00C9A7]' : ''}`}
            style={selectedCategory === cat.key 
              ? { backgroundColor: '#00C9A7', borderColor: '#00C9A7' } 
              : isDarkMode 
                ? { backgroundColor: '#374151', borderColor: '#4b5563', color: 'white' }
                : {}
            }
          >
            {cat.label} ({cat.count})
          </Button>
        ))}
      </div>
    </div>
  );
};

const AdTabs = ({ counts, activeKey, onChange, isDarkMode }) => {
  const tabItems = [
    { key: 'active', label: `ĐANG HIỂN THỊ (${counts.active})` },
    { key: 'expired', label: `HẾT HẠN (${counts.expired})` },
    { key: 'draft', label: `TIN NHÁP (${counts.draft})` },
    { key: 'hidden', label: `ĐÃ ẨN (${counts.hidden})` },
  ];

  React.useEffect(() => {
    if (isDarkMode) {
      const style = document.createElement('style');
      style.id = 'dark-tabs-style';
      style.innerHTML = `
        .dark-tabs .ant-tabs-nav {
          color: white !important;
        }
        .dark-tabs .ant-tabs-tab {
          color: #9ca3af !important;
        }
        .dark-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
        }
        .dark-tabs .ant-tabs-ink-bar {
          background: #00C9A7 !important;
        }
      `;
      if (!document.getElementById('dark-tabs-style')) {
        document.head.appendChild(style);
      }
    } else {
      const existingStyle = document.getElementById('dark-tabs-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [isDarkMode]);

  return (
    <div className={`rounded-t-lg shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <Tabs
        activeKey={activeKey}
        onChange={onChange}
        items={tabItems}
        className={`px-2 md:px-4 ${isDarkMode ? 'dark-tabs' : ''}`}
        size="small"
      />
    </div>
  );
};

const EmptyContent = ({ requireAuth, navigate, isDarkMode }) => (
  <div className={`p-6 md:p-12 rounded-b-lg shadow-sm text-center transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <div className="flex justify-center mb-4 md:mb-6">
      <img
        src={logo}
        alt="Không tìm thấy tin đăng"
        className="w-32 h-32 md:w-48 md:h-48"
      />
    </div>
    <h2 className={`text-lg md:text-xl font-semibold mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Không tìm thấy tin đăng</h2>
    <p className={`text-sm md:text-base mb-4 md:mb-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      Bạn hiện tại không có tin đăng nào cho trạng thái này
    </p>
    <Button
      onClick={() => requireAuth(() => navigate('/post-item'))}
      style={{
        backgroundColor: '#00C9A7',
        borderColor: '#00C9A7',
        color: 'white',
      }}
      size="large"
      className="font-bold hover:opacity-80 w-full md:w-auto"
    >
      Đăng tin
    </Button>
  </div>
);

const AdCard = ({ ad, onEdit, onDelete, onView, onContinuePosting, onToggleStatus, isDarkMode }) => (
  <div className={`p-3 md:p-4 rounded-lg shadow-sm flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <img 
      src={normalizeImageUrl(ad.image)} 
      alt={ad.title} 
      className="w-full md:w-32 h-32 object-cover rounded mx-auto md:mx-0" 
    />
    <div className="flex-1 w-full">
      <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
        <h3 className={`font-semibold text-base md:text-lg line-clamp-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ad.title}</h3>
        <div className="flex space-x-2 justify-center md:justify-start items-center">
          {ad.status === 'Active' ? (
            // Hiển thị switch cho tin đang hiển thị
            <div className="flex items-center space-x-2">
              <span className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ẩn tin:</span>
              <Switch
                checked={true}
                onChange={() => onToggleStatus(ad, 'hide')}
                size="small"
                title="Ẩn tin đăng"
              />
            </div>
          ) : ad.status === 'Hidden' ? (
            // Hiển thị switch cho tin đã ẩn
            <div className="flex items-center space-x-2">
              <span className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hiện tin:</span>
              <Switch
                checked={false}
                onChange={() => onToggleStatus(ad, 'show')}
                size="small"
                title="Hiện tin đăng"
              />
            </div>
          ) : ad.status === 'Draft' || ad.status === 'Pending' ? (
            <Button
              icon={<FormOutlined />}
              onClick={() => onContinuePosting(ad)}
              className="text-green-500"
              size="small"
              title="Tiếp tục đăng tin"
            />
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(ad)}
              className="text-yellow-500"
              size="small"
              title="Chỉnh sửa"
            />
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(ad)}
            className="text-blue-500"
            size="small"
            title="Xem chi tiết"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDelete(ad.id)}
            className="text-red-500"
            size="small"
            title="Xóa"
          />
        </div>
      </div>
      <p className="text-red-500 font-bold text-sm md:text-base mt-2">{ad.price}</p>
      <p className={`text-xs md:text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ad.location}</p>
      <p className={`text-xs mt-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Đăng ngày: {ad.date}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <Tag 
          color={
            ad.status === 'Active' ? 'green' : 
            ad.status === 'Draft' ? 'orange' : 
            ad.status === 'Pending' ? 'blue' :
            ad.status === 'Expired' ? 'volcano' :
            ad.status === 'Hidden' ? 'red' :
            'default'
          } 
          className="text-xs"
        >
          {ad.status === 'Active' ? 'Đang hiển thị' : 
           ad.status === 'Draft' ? 'Tin nháp' : 
           ad.status === 'Pending' ? 'Cần thanh toán' :
           ad.status === 'Expired' ? 'Hết hạn' :
           ad.status === 'Hidden' ? 'Đã ẩn' :
           ad.status}
        </Tag>
        <Tag color="purple" className="text-xs">
          {getCategoryLabel(ad.itemTypeName)}
        </Tag>
      </div>
    </div>
  </div>
);

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Đang hiển thị' },
  { value: 'Hidden', label: 'Đã ẩn' },
  { value: 'Expired', label: 'Hết hạn' },
  { value: 'Draft', label: 'Tin nháp' },
  { value: 'Pending', label: 'Cần thanh toán' }
];

const LISTING_TYPES = {
  AUCTION: 'Auction',
  BUY_NOW: 'BuyNow'
};

const Ads = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [selectedListing, setSelectedListing] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { requireAuth, showLoginModal, handleLoginSuccess, closeLoginModal } = useAuthCheck();

  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Listen for dark mode changes from Header
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  // Inject dark mode styles for Ant Design components
  useEffect(() => {
    if (isDarkMode) {
      const style = document.createElement('style');
      style.id = 'ads-dark-mode-style';
      style.innerHTML = `
        .dark-input input::placeholder {
          color: #9ca3af !important;
        }
        /* Modal Dark Mode - Toàn bộ */
        .dark-modal .ant-modal-content {
          background-color: #1f2937 !important;
          color: white !important;
        }
        .dark-modal .ant-modal-header {
          background-color: #1f2937 !important;
          border-bottom-color: #374151 !important;
        }
        .dark-modal .ant-modal-title {
          color: white !important;
        }
        .dark-modal .ant-modal-close {
          color: white !important;
        }
        .dark-modal .ant-modal-close:hover {
          color: #9ca3af !important;
        }
        .dark-modal .ant-modal-close-x {
          color: white !important;
        }
        .dark-modal .ant-modal-footer {
          background-color: #1f2937 !important;
          border-top-color: #374151 !important;
        }
        .dark-modal .ant-modal-body {
          background-color: #1f2937 !important;
          color: white !important;
        }
        /* Form Dark Mode */
        .dark-modal .ant-form-item-label > label {
          color: #d1d5db !important;
        }
        .dark-modal .ant-select-selector {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }
        .dark-modal .ant-select-arrow {
          color: #9ca3af !important;
        }
        .dark-modal .ant-select-selection-item {
          color: white !important;
        }
        .dark-modal .ant-input,
        .dark-modal .ant-input-number,
        .dark-modal .ant-input-number-input,
        .dark-modal .ant-input-affix-wrapper,
        .dark-modal textarea.ant-input {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }
        .dark-modal .ant-input::placeholder,
        .dark-modal textarea.ant-input::placeholder {
          color: #9ca3af !important;
        }
        .dark-modal .ant-input-group-addon {
          background-color: #4b5563 !important;
          border-color: #4b5563 !important;
          color: #d1d5db !important;
        }
        /* Button Dark Mode */
        .dark-modal .ant-btn-default {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }
        .dark-modal .ant-btn-default:hover {
          background-color: #4b5563 !important;
          border-color: #6b7280 !important;
        }
        /* Spin Dark Mode */
        .dark-modal .ant-spin-dot-item {
          background-color: #00c9a7 !important;
        }
        /* Dropdown Dark Mode - áp dụng khi modal dark mode đang mở */
        body:has(.dark-modal) .ant-select-dropdown {
          background-color: #374151 !important;
        }
        body:has(.dark-modal) .ant-select-item {
          color: white !important;
        }
        body:has(.dark-modal) .ant-select-item-option-selected {
          background-color: #4b5563 !important;
        }
        body:has(.dark-modal) .ant-select-item-option-active {
          background-color: #4b5563 !important;
        }
        body:has(.dark-modal) .ant-select-item-option:hover {
          background-color: #4b5563 !important;
        }
        /* Scrollbar Dark Mode trong Modal */
        .dark-modal .ant-modal-body::-webkit-scrollbar {
          width: 8px;
        }
        .dark-modal .ant-modal-body::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark-modal .ant-modal-body::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .dark-modal .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `;
      if (!document.getElementById('ads-dark-mode-style')) {
        document.head.appendChild(style);
      }
    } else {
      const existingStyle = document.getElementById('ads-dark-mode-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [isDarkMode]);

  // Calculate counts for each tab
  const tabCounts = React.useMemo(() => {
    const counts = {
      active: 0,
      expired: 0,
      pending: 0,
      draft: 0,
      hidden: 0
    };

    listings.forEach(listing => {
      const status = listing.status;
      if (status === 'Active') {
        counts.active++;
      } else if (status === 'Expired') {
        counts.expired++;
      } else if (status === 'Pending') {
        counts.pending++;
      } else if (status === 'Draft') {
        counts.draft++;
      } else if (status === 'Hidden') {
        counts.hidden++;
      }
    });

    return counts;
  }, [listings]);

  // Calculate counts for each category
  const categoryCounts = React.useMemo(() => {
    const counts = {
      all: listings.length,
      car: 0,
      truck: 0,
      motorcycle: 0,
      bike: 0,
      electricBike: 0,
      battery: 0,
      accessory: 0
    };

    // Debug: Log unique itemTypeName values
    const uniqueTypes = new Set(listings.map(l => l.itemTypeName));
    console.log('🔍 Unique itemTypeName values:', Array.from(uniqueTypes));

    listings.forEach(listing => {
      const itemTypeName = listing.itemTypeName;
      
      if (itemTypeName === 'Ô tô') {
        counts.car++;
      } else if (itemTypeName === 'Xe tải, xe ben') {
        counts.truck++;
      } else if (itemTypeName === 'Xe máy') {
        counts.motorcycle++;
      } else if (itemTypeName === 'Xe đạp') {
        counts.bike++;
      } else if (itemTypeName === 'Xe điện') {
        counts.electricBike++;
      } else if (itemTypeName === 'Ắc quy/ Pin') {
        counts.battery++;
      } else if (itemTypeName === 'Phụ tùng/ Phụ kiện') {
        counts.accessory++;
      }
    });

    console.log('📈 Category Counts:', counts);
    return counts;
  }, [listings]);

  // Filter listings based on active tab and category
  const filteredListings = React.useMemo(() => {
    // Map tab key to status value
    const statusMap = {
      'active': 'Active',
      'expired': 'Expired',
      'pending': 'Pending',
      'draft': 'Draft',
      'hidden': 'Hidden'
    };

    const targetStatus = statusMap[activeTab];
    
    return listings.filter(listing => {
      // Filter by status
      const matchesStatus = listing.status === targetStatus;
      
      // Filter by category - exact match with API response
      const matchesCategory = selectedCategory === 'all' || listing.itemTypeName === selectedCategory;
      
      return matchesStatus && matchesCategory;
    });
  }, [listings, activeTab, selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          setError('Vui lòng đăng nhập để xem các tin đăng của bạn');
          setLoading(false);
          return;
        }

        const userData = authService.getUserInfo();
        if (!userData?.userId) {
          throw new Error('Không tìm thấy thông tin người dùng');
        }

        setUserInfo({
          fullName: userData.username || userData.fullName,
          userId: userData.userId,
          phone: userData.phone,
          role: userData.role
        });

        const listingsResponse = await listingService.getListingsByUserId(userData.userId);

        if (listingsResponse?.data?.success) {
          const transformedListings = listingsResponse.data.data.map(transformListingData);
          
          // Debug: Log itemTypeName from API
          console.log('📊 API Response Sample:', listingsResponse.data.data[0]);
          console.log('📊 Transformed Listings:', transformedListings);
          
          setListings(transformedListings);
        } else {
          throw new Error('Failed to fetch listings');
        }

      } catch (err) {
        console.error('Fetch Error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showLoginModal]);

  // Helper function to format date
  const formatDateDMY = (value) => {
    if (!value) return 'Không có';
    if (typeof value === 'string' && value.includes('/')) return value;
    try {
      const d = new Date(value);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return value;
    }
  };

  // Handle View
  const handleView = async (ad) => {
    try {
      setLoadingDetail(true);
      setIsViewModalVisible(true);

      const res = await listingService.getListingById(ad.id);
      const payload = res?.data ?? res;
      const fullListing = payload?.success && payload?.data ? payload.data : (payload?.listingId ? payload : null);

      if (!fullListing) {
        throw new Error('Không lấy được chi tiết tin đăng');
      }

      setSelectedListing(fullListing);
    } catch (err) {
      console.error('Get listing detail error:', err);
      message.error('Không lấy được chi tiết tin đăng: ' + err.message);
      setIsViewModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Edit
  const handleEdit = async (ad) => {
    try {
      setLoadingDetail(true);
      setIsEditModalVisible(true);

      // Fetch full listing data
      const res = await listingService.getListingById(ad.id);
      const payload = res?.data ?? res;
      const fullListing = payload?.success && payload?.data ? payload.data : (payload?.listingId ? payload : null);

      if (!fullListing) {
        throw new Error('Không lấy được chi tiết tin đăng');
      }

      setSelectedListing(fullListing);

      // Set form values with full data
      form.setFieldsValue({
        status: fullListing.status,
        buyNowPrice: fullListing.buyNowPrice,
        startPrice: fullListing.startPrice || 0,
        bidIncrement: fullListing.bidIncrement || 0,
        detail: fullListing.detail || '',
        address: fullListing.address || '',
        warranty: fullListing.warranty || ''
      });

    } catch (err) {
      console.error('Get listing detail error:', err);
      message.error('Không lấy được chi tiết tin đăng: ' + err.message);
      setIsEditModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Continue Posting (Tiếp tục đăng tin nháp)
  const handleContinuePosting = async (ad) => {
    try {
      setLoadingDetail(true);
      
      // Fetch full listing data
      const res = await listingService.getListingById(ad.id);
      const payload = res?.data ?? res;
      const fullListing = payload?.success && payload?.data ? payload.data : (payload?.listingId ? payload : null);

      if (!fullListing) {
        throw new Error('Không lấy được chi tiết tin đăng');
      }

      console.log('📦 Full listing data for draft:', fullListing);
      console.log('📦 Item data:', fullListing.item);
      console.log('📦 ItemType:', fullListing.item?.itemType);

      // Navigate to PostPage with draft data
      navigate('/post-item', {
        state: {
          draftData: fullListing,
          isEditMode: true
        }
      });
      
    } catch (err) {
      console.error('Get listing detail error:', err);
      toast.error('Không lấy được chi tiết tin đăng: ' + err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Delete
  const handleDelete = async (listingId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa tin đăng này? Hành động này sẽ xóa cả tin đăng và sản phẩm liên quan, không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // Sử dụng API xóa cả listing và item
          const response = await itemService.deleteListingWithItem(listingId);
          
          // Check response success
          if (response?.data?.success || response?.status === 200 || response?.status === 204) {
            // Hiển thị toast thành công
            toast.success('Xóa tin đăng nháp thành công!', {
              position: 'top-right',
              autoClose: 3000,
            });
            // Remove listing from state
            setListings(listings.filter(listing => listing.id !== listingId));
          } else {
            throw new Error(response?.data?.message || 'Xóa tin đăng thất bại');
          }
        } catch (error) {
          console.error('Delete listing error:', error);
          // Hiển thị toast lỗi
          toast.error(
            `Xóa tin đăng thất bại! ${error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi xóa tin đăng.'}`,
            {
              position: 'top-right',
              autoClose: 4000,
            }
          );
        }
      }
    });
  };

  // Handle Toggle Status (Ẩn/Hiện tin)
  const handleToggleStatus = (ad, action) => {
    const isHiding = action === 'hide';
    const newStatus = isHiding ? 'Hidden' : 'Active';
    
    Modal.confirm({
      title: isHiding ? 'Xác nhận ẩn tin' : 'Xác nhận hiện tin',
      content: isHiding 
        ? 'Bạn có chắc chắn muốn ẩn tin đăng này? Tin sẽ không hiển thị với người mua.'
        : 'Bạn có chắc chắn muốn hiển thị tin đăng này? Tin sẽ được hiển thị với người mua.',
      okText: isHiding ? 'Ẩn tin' : 'Hiện tin',
      cancelText: 'Hủy',
      okButtonProps: { danger: isHiding },
      onOk: async () => {
        try {
          // Get full listing data
          const res = await listingService.getListingById(ad.id);
          const payload = res?.data ?? res;
          const fullListing = payload?.success && payload?.data ? payload.data : (payload?.listingId ? payload : null);

          if (!fullListing) {
            throw new Error('Không lấy được chi tiết tin đăng');
          }

          // Update status
          const updateData = {
            listingId: fullListing.listingId,
            status: newStatus,
            buyNowPrice: fullListing.buyNowPrice,
            detail: fullListing.detail || '',
            address: fullListing.address || '',
            warranty: fullListing.warranty || ''
          };

          if (fullListing.listingType === LISTING_TYPES.AUCTION) {
            updateData.startPrice = fullListing.startPrice;
            updateData.bidIncrement = fullListing.bidIncrement;
          }

          const response = await listingService.updateListing(fullListing.listingId, updateData);

          if (response.data?.success) {
            toast.success(isHiding ? 'Ẩn tin đăng thành công!' : 'Hiện tin đăng thành công!', {
              position: 'top-right',
              autoClose: 3000,
            });

            // Update local state
            const updatedListings = listings.map(listing => {
              if (listing.id === fullListing.listingId) {
                return {
                  ...listing,
                  status: newStatus,
                  originalData: {
                    ...listing.originalData,
                    status: newStatus
                  }
                };
              }
              return listing;
            });

            setListings(updatedListings);
          } else {
            throw new Error(response.data?.message || (isHiding ? 'Ẩn tin thất bại' : 'Hiện tin thất bại'));
          }
        } catch (error) {
          console.error('Toggle Status Error:', error);
          toast.error(
            `${isHiding ? 'Ẩn' : 'Hiện'} tin đăng thất bại! ${error.response?.data?.message || error.message || 'Đã xảy ra lỗi.'}`,
            {
              position: 'top-right',
              autoClose: 4000,
            }
          );
        }
      }
    });
  };

  // Handle Update
  const handleUpdate = async (values) => {
    try {
      if (!selectedListing?.listingId) {
        throw new Error('Không tìm thấy ID tin đăng');
      }

      const updateData = {
        listingId: selectedListing.listingId,
        status: values.status,
        buyNowPrice: Number(values.buyNowPrice),
        detail: values.detail || '',
        address: values.address || '',
        warranty: values.warranty || ''
      };

      // Add auction fields if listing is auction type
      if (selectedListing.listingType === LISTING_TYPES.AUCTION) {
        updateData.startPrice = Number(values.startPrice);
        updateData.bidIncrement = Number(values.bidIncrement);
      }

      console.log('Updating listing:', updateData);

      const response = await listingService.updateListing(
        selectedListing.listingId,
        updateData
      );

      if (response.data?.success) {
        message.success('Cập nhật tin đăng thành công');

        // Update local state
        const updatedListings = listings.map(listing => {
          if (listing.id === selectedListing.listingId) {
            return {
              ...listing,
              status: values.status,
              // Format price with dots and VNĐ
              price: values.buyNowPrice ? `${values.buyNowPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ` : '0 VNĐ',
              originalData: {
                ...listing.originalData,
                ...updateData
              }
            };
          }
          return listing;
        });

        setListings(updatedListings);
        setIsEditModalVisible(false);
        form.resetFields();
      } else {
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update Error:', error);
      message.error('Cập nhật tin đăng thất bại: ' + error.message);
    }
  };

  // View Modal Content
  const renderViewContent = () => {
    if (loadingDetail) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      );
    }

    if (!selectedListing) {
      return <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Không có dữ liệu để hiển thị</div>;
    }

    const item = selectedListing.item || {};
    // Normalize image URLs để proxy qua Netlify function
    const images = (item.imageUrls || [])
      .filter(url => url) // Filter out null/undefined/empty
      .map(url => normalizeImageUrl(url))
      .filter(url => url); // Filter out normalized null/undefined
    const videoUrl = item.videoUrl ? normalizeImageUrl(item.videoUrl) : null;

    // Compact grid renderer: two columns, minimal spacing
    const renderGridFields = (entries) => {
      const visible = entries.filter(([_, value]) => value !== null && value !== undefined && value !== '');
      if (visible.length === 0) return null;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map(([label, value, transform], idx) => {
            const displayValue = transform ? transform(value) : value;
            return (
              <div
                key={idx}
                className={`rounded-md px-3 py-2 transition-colors ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</div>
                <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayValue}</div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 -mr-2">
        {/* Header: Title & Price & Status */}
        <div className={`rounded-lg p-5 shadow-sm border transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-3 leading-tight transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {selectedListing.itemTitle || item.title || 'Không có tiêu đề'}
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {selectedListing.buyNowPrice != null && selectedListing.buyNowPrice > 0
                ? `${selectedListing.buyNowPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ`
                : 'Liên hệ'}
            </div>
            <Tag color={
              selectedListing.status === 'Active' ? 'green' : 
              selectedListing.status === 'Draft' ? 'orange' :
              selectedListing.status === 'Pending' ? 'blue' :
              selectedListing.status === 'Hidden' ? 'red' :
              'volcano'
            } className="text-sm px-4 py-1.5 rounded-full">
              {selectedListing.status === 'Active' ? 'Đang hiển thị' :
               selectedListing.status === 'Draft' ? 'Tin nháp' :
               selectedListing.status === 'Pending' ? 'Cần thanh toán' :
               selectedListing.status === 'Hidden' ? 'Đã ẩn' :
               selectedListing.status}
            </Tag>
          </div>
        </div>

        {/* Collapsible Sections */}
        <Collapse
          bordered={false}
          defaultActiveKey={[images.length || videoUrl ? 'media' : '', 'listing', 'product']}
          className="bg-transparent"
        >
          {(images.length > 0 || videoUrl) && (
            <Collapse.Panel
              header={<span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`}>Hình ảnh / Video</span>}
              key="media"
              className={`${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'} rounded-lg !mb-4`}
            >
              <div className="space-y-4">
                {images.length > 0 && (
                  <div>
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hình ảnh ({images.length})</div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {images.map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`group relative overflow-hidden rounded-lg border hover:border-[#00c9a7] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          <img
                            src={imageUrl}
                            alt={`Ảnh ${index + 1}`}
                            className="w-full h-24 md:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {videoUrl && (
                  <div>
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Video</div>
                    <div className={`rounded-lg overflow-hidden border shadow-sm transition-colors duration-500 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <video controls className="w-full" style={{ maxHeight: '300px' }}>
                        <source src={videoUrl} type="video/mp4" />
                        Trình duyệt không hỗ trợ video.
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </Collapse.Panel>
          )}

          {/* Information Section (Listing) */}
          <Collapse.Panel
            header={<span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`}>Thông tin tin đăng</span>}
            key="listing"
            className={`${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'} rounded-lg !mb-4`}
          >
            <div className="p-1">
              {renderGridFields([
                ['Loại tin', selectedListing.listingType],
                ['Người bán', selectedListing.userName],
                ['Bạn là', selectedListing.youAre],
                ['Giá khởi điểm', selectedListing.startPrice, (v) => `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ`],
                ['Bước giá', selectedListing.bidIncrement, (v) => `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ`],
                ['Ngày bắt đầu', selectedListing.startDate, formatDateDMY],
                ['Ngày kết thúc', selectedListing.endDate, formatDateDMY],
                ['Địa chỉ', selectedListing.address],
                ['Bảo hành', selectedListing.warranty],
                ['Phí đăng tin', selectedListing.feeName],
                ['Chi tiết', selectedListing.detail]
              ])}
            </div>
          </Collapse.Panel>

          {/* Product Information Section */}
          <Collapse.Panel
            header={<span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`}>Thông tin sản phẩm</span>}
            key="product"
            className={`${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'} rounded-lg !mb-4`}
          >
            <div className="p-1">
              {renderGridFields([
                ['Danh mục', item.itemTypeName],
                ['Serial Number', item.serialNumber],
                ['Hãng', item.brand],
                ['Model', item.model],
                ['Phiên bản', item.version],
                ['Năm sản xuất', item.year],
                ['Tình trạng', item.condition],
                ['Trạng thái bán', item.status],
                ['Kiểu dáng', item.style],
                ['Màu sắc', item.color],
                ['Số chỗ ngồi', item.seat],
                ['Số km đã đi', item.mileage, (v) => `${v} km`],
                ['Biển số xe', item.licensePlate],
                ['Xuất xứ', item.origin],
                ['Nhiên liệu', item.fuel],
                ['Hộp số', item.gearbox],
                ['Động cơ', item.engine],
                ['Số đời chủ', item.ownerCount],
                ['Kiểm định', item.inspectionValidUntil, (v) => (typeof v === 'boolean' ? (v ? 'Còn hạn' : 'Hết hạn') : v)],
                ['Phụ kiện đi kèm', item.accessories, (v) => (typeof v === 'boolean' ? (v ? 'Có' : 'Không') : v)],
                ['Dung lượng pin', item.batteryCapacity, (v) => `${v} Ah`],
                ['Dung tích', item.capacity],
                ['Số chu kỳ sạc', item.cycles],
                ['Loại pin', item.batteryType],
                ['Điện áp', item.voltage, (v) => `${v} V`],
                ['Bao gồm pin', item.batteryIncluded, (v) => (typeof v === 'boolean' ? (v ? 'Có' : 'Không') : v)],
                ['Chất liệu khung', item.frameMaterial],
                ['Kích thước khung', item.frameSize],
                ['Trọng lượng', item.weight, (v) => `${v} kg`],
                ['Loại phụ tùng', item.partType],
                ['Giá niêm yết', item.price, (v) => `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ`],
                ['Người đăng', item.userName]
              ])}
            </div>
          </Collapse.Panel>
        </Collapse>

        

        {/* Timestamps Footer */}
        <div className={`rounded-lg px-5 py-3 shadow-sm border transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className={`flex justify-between text-xs transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span className="flex items-center">
              <span className="w-1 h-3 bg-gray-400 rounded-full mr-1.5"></span>
              Tạo: {formatDateDMY(item.createdAt || selectedListing.createdAt)}
            </span>
            <span className="flex items-center">
              <span className="w-1 h-3 bg-gray-400 rounded-full mr-1.5"></span>
              Cập nhật: {formatDateDMY(item.updatedAt || selectedListing.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Edit Modal Content
  const renderEditContent = () => {
    if (loadingDetail) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      );
    }

    if (!selectedListing) {
      return <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Không có dữ liệu để chỉnh sửa</div>;
    }

    return (
      <Form
        form={form}
        onFinish={handleUpdate}
        layout="vertical"
        size="small"
      >
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="buyNowPrice"
          label="Giá bán ngay"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập giá'
            },
            {
              validator: (_, value) => {
                if (value === '' || value === null || value === undefined) {
                  return Promise.reject(new Error('Vui lòng nhập giá'));
                }
                if (Number(value) <= 0) {
                  return Promise.reject(new Error('Giá phải lớn hơn 0'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="number"
            min={1000}
            addonAfter="VNĐ"
            placeholder="Nhập giá bán ngay"
          />
        </Form.Item>

        {selectedListing.listingType === LISTING_TYPES.AUCTION && (
          <>
            <Form.Item
              name="startPrice"
              label="Giá khởi điểm"
              rules={[
                { required: true, message: 'Vui lòng nhập giá khởi điểm' },
                { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
              ]}
            >
              <Input type="number" min={0} addonAfter="VNĐ" />
            </Form.Item>

            <Form.Item
              name="bidIncrement"
              label="Bước giá"
              rules={[
                { required: true, message: 'Vui lòng nhập bước giá' },
                { type: 'number', min: 0, message: 'Bước giá phải lớn hơn 0' }
              ]}
            >
              <Input type="number" min={0} addonAfter="VNĐ" />
            </Form.Item>
          </>
        )}

        <Form.Item name="detail" label="Chi tiết">
          <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết..." />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Nhập địa chỉ..." />
        </Form.Item>

        <Form.Item name="warranty" label="Bảo hành">
          <Input placeholder="Nhập thông tin bảo hành..." />
        </Form.Item>

        <Form.Item className="flex flex-col md:flex-row md:justify-end mb-0">
          <Button
            type="default"
            onClick={() => {
              setIsEditModalVisible(false);
              form.resetFields();
            }}
            className="w-full md:w-auto h-auto px-3 py-1 m-1"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ backgroundColor: '#00C9A7', borderColor: '#00C9A7'}}
            className="w-full md:w-auto h-auto px-3 py-1 m-1"
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // If not authenticated
  if (!authService.isAuthenticated()) {
    return (
      <div className="min-h-screen py-6 px-4 relative">
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundPost})`,
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
        </div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className={`text-center rounded-xl shadow-md p-8 border-2 border-[#00c9a7]/20 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`text-lg md:text-xl mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vui lòng đăng nhập để xem các tin đăng của bạn</div>
            <button
              onClick={() => requireAuth(() => navigate('/my-ads'))}
              className="bg-[#00c9a7] hover:bg-[#059669] px-6 py-3 rounded-lg text-white font-semibold w-full md:w-auto transition-colors"
            >
              Đăng nhập
            </button>

            <LoginModal
              isOpen={showLoginModal}
              onClose={closeLoginModal}
              onLoginSuccess={handleLoginSuccess}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-6 px-4 relative">
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundPost})`,
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
        </div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className={`text-center rounded-xl shadow-md p-8 border-2 border-[#00c9a7]/20 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Spin size="large" />
            <p className={`mt-4 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Đang tải danh sách tin đăng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-6 px-4 relative">
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundPost})`,
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
        </div>

        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className={`text-center rounded-xl shadow-md p-8 border-2 border-[#00c9a7]/20 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-red-500 text-lg md:text-xl mb-4">{error}</div>
            <Button
              onClick={() => window.location.reload()}
              type="primary"
              style={{ backgroundColor: '#00C9A7', borderColor: '#00C9A7' }}
              className="w-full md:w-auto"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 relative">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${backgroundPost})`,
        }}
      >
        <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900/80' : 'bg-white/70'
        }`}></div>
      </div>

      <div className="container mx-auto px-3 md:px-4 relative z-10">
        <UserFilters userInfo={userInfo} isDarkMode={isDarkMode} />
        <CategoryFilter 
          categoryCounts={categoryCounts}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isDarkMode={isDarkMode}
        />
        <AdTabs 
          counts={tabCounts} 
          activeKey={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {filteredListings.length === 0 ? (
          <EmptyContent
            requireAuth={requireAuth}
            navigate={navigate}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
            {filteredListings.map((listing) => (
              <AdCard
                key={listing.id}
                ad={listing}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onContinuePosting={handleContinuePosting}
                onToggleStatus={handleToggleStatus}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {/* View Modal */}
        <Modal
          title="Chi tiết tin đăng"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsViewModalVisible(false)}
              className="w-full md:w-auto"
            >
              Đóng
            </Button>
          ]}
          width="90vw"
          style={{ maxWidth: '900px', top: 20 }}
          wrapClassName={isDarkMode ? 'dark-modal' : ''}
        >
          {renderViewContent()}
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Chỉnh sửa tin đăng"
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width="90vw"
          style={{ maxWidth: '720px' }}
          wrapClassName={isDarkMode ? 'dark-modal' : ''}
        >
          {renderEditContent()}
        </Modal>
      </div>
    </div>
  );
};

export default Ads;