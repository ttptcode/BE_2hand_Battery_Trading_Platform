import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaFilter, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaStar, 
  FaChevronDown,
  FaTh,
  FaTimes,
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaBicycle,
  FaCog,
  FaSearch
} from "react-icons/fa";
import { MdEnergySavingsLeaf } from "react-icons/md";
import { listingService, itemTypeService } from "../../../services"; // Thêm itemTypeService
import { toast } from "react-toastify";
import { userService } from "../../../services/users/userService";
import { normalizeImageUrl } from "../../../utils/imageUrlHelper";

// Utility: Transform API listing data to component format
const transformListingToProduct = (listing) => {
  const calculateTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Determine category based on itemTypeName
  const getCategoryId = (typeName) => {
    const typeMap = {
      "Ô tô": "o-to",
      "Xe máy": "xe-may",
      "Xe tải, xe ben": "xe-tai",
      "Xe điện": "xe-dien",
      "Xe đạp": "xe-dap",
      "Phụ tùng/ Phụ kiện": "phu-tung",
      "Ắc quy/ Pin": "pin"
    };
    return typeMap[typeName] || "phuong-tien-khac";
  };

  const item = listing.item || {};

  return {
    id: listing.listingId,
    title: listing.itemTitle || item.title || "Không có tiêu đề",
    description: `${item.brand || ''} ${item.model || ''} ${item.year || ''} - ${item.condition || ''}`.trim(),
    price: listing.buyNowPrice || item.price || 0,
    location: listing.address || (listing.userName ? `Người bán: ${listing.userName}` : "Việt Nam"),
    // Normalize image URL để proxy qua Netlify function
    image: item.imageUrls && item.imageUrls.length > 0 ? normalizeImageUrl(item.imageUrls[0]) : null,
    timeAgo: calculateTimeAgo(listing.createdAt),
    isPriority: listing.feeName && listing.feeName.includes("Ưu tiên"),
    isFeatured: listing.feeName && listing.feeName.includes("Nổi bật"),
    seller: {
      name: listing.userName || "Người dùng",
      rating: 4.5,
      soldCount: Math.floor(Math.random() * 100),
      isVerified: true
    },
    category: getCategoryId(item.itemTypeName),
    listingType: listing.listingType,
    condition: item.condition,
    brand: item.brand,
    year: item.year,
    createdAt: listing.createdAt,
    itemTypeName: item.itemTypeName // Thêm itemTypeName để lọc
  };
};

// Mapping icon cho các loại xe
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    "Ô tô": FaCar,
    "Xe máy": FaMotorcycle,
    "Xe tải, xe ben": FaTruck,
    "Xe điện": FaBicycle,
    "Xe đạp": FaBicycle,
    "Phụ tùng/ Phụ kiện": FaCog,
    "Ắc quy/ Pin": MdEnergySavingsLeaf,
    "default": FaCog
  };
  
  return iconMap[categoryName] || iconMap.default;
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State cho categories từ API
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true); // Loading riêng cho categories
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    price: "all",
    condition: "all",
    location: "all",
    sellerType: "all",
    sortBy: "newest",
    brand: "all",
    year: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
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

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await itemTypeService.getAllItemTypes();
        
        if (response.data?.success && response.data?.data) {
          const categoryData = response.data.data.map(itemType => ({
            id: getCategoryIdFromName(itemType.name),
            name: itemType.name,
            icon: getCategoryIcon(itemType.name),
            originalName: itemType.name
          }));
          
          setCategories(categoryData);
          console.log('Categories loaded from API:', categoryData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function để convert tên category thành ID
  const getCategoryIdFromName = (name) => {
    const nameMap = {
      "Ô tô": "o-to",
      "Xe máy": "xe-may",
      "Xe tải, xe ben": "xe-tai",
      "Xe điện": "xe-dien",
      "Xe đạp": "xe-dap",
      "Phụ tùng/ Phụ kiện": "phu-tung",
      "Ắc quy/ Pin": "pin"
    };
    return nameMap[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await listingService.getAllListings();
        
        if (response.success && response.data) {
          const transformedListings = response.data.map(transformListingToProduct);
          setAllProducts(transformedListings);
          setProducts(transformedListings);
        } else {
          setAllProducts([]);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setAllProducts([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Apply filters whenever filters or search term change
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemTypeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Filter by price
    if (filters.price !== "all") {
      filtered = filtered.filter(p => {
        const price = p.price;
        switch(filters.price) {
          case "under-10m": return price < 10000000;
          case "10m-50m": return price >= 10000000 && price < 50000000;
          case "50m-100m": return price >= 50000000 && price < 100000000;
          case "100m-500m": return price >= 100000000 && price < 500000000;
          case "over-500m": return price >= 500000000;
          default: return true;
        }
      });
    }

    // Filter by condition
    if (filters.condition !== "all") {
      filtered = filtered.filter(p => 
        p.condition?.toLowerCase().includes(filters.condition)
      );
    }

    // Filter by location
    if (filters.location !== "all") {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by brand
    if (filters.brand !== "all") {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }

    // Filter by year
    if (filters.year !== "all") {
      const currentYear = new Date().getFullYear();
      switch(filters.year) {
        case "2020-2025":
          filtered = filtered.filter(p => p.year >= 2020 && p.year <= currentYear);
          break;
        case "2015-2019":
          filtered = filtered.filter(p => p.year >= 2015 && p.year <= 2019);
          break;
        case "2010-2014":
          filtered = filtered.filter(p => p.year >= 2010 && p.year <= 2014);
          break;
        case "before-2010":
          filtered = filtered.filter(p => p.year < 2010);
          break;
        default:
          break;
      }
    }

    // Sort
    switch(filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "most-viewed":
        // Giả lập số lượt xem
        filtered.sort((a, b) => Math.random() - 0.5);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setProducts(filtered);
  }, [filters, allProducts, searchTerm]);

  const formatPrice = (price) => {
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedPrice + " VNĐ";
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      price: "all",
      condition: "all",
      location: "all",
      sellerType: "all",
      sortBy: "newest",
      brand: "all",
      year: "all"
    });
    setSearchTerm("");
  };

  // Get unique brands from products
  const getUniqueBrands = () => {
    const brands = allProducts
      .map(p => p.brand)
      .filter(brand => brand && brand !== "")
      .filter((brand, index, self) => self.indexOf(brand) === index);
    return brands.sort();
  };

  const locations = [
    "Tp Hồ Chí Minh",
    "Hà Nội", 
    "Đà Nẵng",
    "Cần Thơ",
    "Bình Dương",
    "Gần tôi"
  ];

  const conditions = [
    { value: "mới", label: "Mới" },
    { value: "đã qua sử dụng", label: "Đã sử dụng" }
  ];

  const priceRanges = [
    { value: "under-10m", label: "Dưới 10 triệu" },
    { value: "10m-50m", label: "10-50 triệu" },
    { value: "50m-100m", label: "50-100 triệu" },
    { value: "100m-500m", label: "100-500 triệu" },
    { value: "over-500m", label: "Trên 500 triệu" }
  ];

  const yearRanges = [
    { value: "2020-2025", label: "2020-2025" },
    { value: "2015-2019", label: "2015-2019" },
    { value: "2010-2014", label: "2010-2014" },
    { value: "before-2010", label: "Trước 2010" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`border-b transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-2"> 
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Mua bán xe giá rẻ cập nhật tháng 10/2025 ({products.length} tin đăng)
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên xe, hãng, model, loại xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-emerald-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-emerald-400'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-emerald-500' 
                  : 'bg-gray-100 text-gray-900 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              <FaFilter className="w-4 h-4" />
              Lọc
            </button>

            <select 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={categoriesLoading}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select 
              value={filters.price}
              onChange={(e) => handleFilterChange('price', e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Khoảng giá</option>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            <select 
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Tình trạng</option>
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-emerald-500' 
                  : 'bg-gray-100 text-gray-900 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              <FaCog className="w-4 h-4" />
              Lọc nâng cao
            </button>

            <button 
              onClick={clearFilters}
              className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <FaTimes className="w-4 h-4" />
              Xoá lọc
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className={`p-4 rounded-lg mb-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lọc nâng cao</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hãng xe</label>
                  <select 
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">Tất cả hãng</option>
                    {getUniqueBrands().map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Năm sản xuất</label>
                  <select 
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">Tất cả năm</option>
                    {yearRanges.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Địa điểm</label>
                  <select 
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">Tất cả địa điểm</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Category Filter */}
          <div className="flex gap-6 mb-6 overflow-x-auto pb-2">
            {categoriesLoading ? (
              // Loading skeleton cho categories
              [...Array(7)].map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-3 rounded-lg flex-shrink-0 animate-pulse">
                  <div className={`w-6 h-6 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <div className={`h-3 rounded w-12 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>
              ))
            ) : (
              categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = filters.category === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleFilterChange('category', category.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-600 shadow-md'
                        : isDarkMode
                          ? 'text-white hover:bg-emerald-500 hover:text-white'
                          : 'text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs text-center whitespace-nowrap">{category.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleFilterChange('sellerType', 'all')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    filters.sellerType === 'all'
                      ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                      : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-emerald-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => handleFilterChange('sellerType', 'individual')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    filters.sellerType === 'individual'
                      ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                      : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-emerald-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  Cá nhân
                </button>
                <button 
                  onClick={() => handleFilterChange('sellerType', 'professional')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    filters.sellerType === 'professional'
                      ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                      : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-emerald-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  Bán chuyên
                </button>
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="newest">Tin mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="most-viewed">Xem nhiều nhất</option>
                </select>

                <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md ${
                  isDarkMode ? 'bg-gray-700 text-white hover:bg-emerald-500' : 'bg-gray-100 text-gray-900 hover:bg-emerald-500 hover:text-white'
                }`}>
                  <FaTh className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.category !== "all" || filters.price !== "all" || filters.condition !== "all" || searchTerm) && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-emerald-800">Bộ lọc đang áp dụng:</span>
                  {filters.category !== "all" && (
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                      {categories.find(c => c.id === filters.category)?.name}
                      <button 
                        onClick={() => handleFilterChange('category', 'all')}
                        className="ml-1 hover:text-emerald-200"
                      >×</button>
                    </span>
                  )}
                  {filters.price !== "all" && (
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                      {priceRanges.find(p => p.value === filters.price)?.label}
                      <button 
                        onClick={() => handleFilterChange('price', 'all')}
                        className="ml-1 hover:text-emerald-200"
                      >×</button>
                    </span>
                  )}
                  {filters.condition !== "all" && (
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                      {conditions.find(c => c.value === filters.condition)?.label}
                      <button 
                        onClick={() => handleFilterChange('condition', 'all')}
                        className="ml-1 hover:text-emerald-200"
                      >×</button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                      Tìm: "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:text-emerald-200"
                      >×</button>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`rounded-lg shadow-sm p-4 flex gap-4 animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className={`w-48 h-32 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className="flex-1 space-y-3">
                        <div className={`h-6 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        <div className={`h-8 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        <div className={`h-4 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className={`rounded-lg shadow-sm p-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Không tìm thấy sản phẩm nào</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                products.map((product) => (
                  <ProductListItem key={product.id} product={product} isDarkMode={isDarkMode} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar Filters */}
          <div className="w-80 space-y-6">
            <div className={`rounded-lg p-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lọc theo tình trạng</h3>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label key={condition.value} className="flex items-center">
                    <input 
                      type="radio" 
                      name="condition" 
                      value={condition.value}
                      checked={filters.condition === condition.value}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{condition.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`rounded-lg p-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Khoảng giá</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.value} className="flex items-center">
                    <input 
                      type="radio" 
                      name="price" 
                      value={range.value}
                      checked={filters.price === range.value}
                      onChange={(e) => handleFilterChange('price', e.target.value)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`rounded-lg p-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Địa điểm</h3>
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleFilterChange('location', location)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.location === location
                        ? 'bg-emerald-100 text-emerald-600'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-lg p-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tiện ích</h3>
              <div className="space-y-2">
                <button className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                  isDarkMode ? 'text-gray-300 hover:bg-emerald-500 hover:text-white' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}>
                  Kinh nghiệm mua bán
                </button>
                <button className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                  isDarkMode ? 'text-gray-300 hover:bg-emerald-500 hover:text-white' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}>
                  Hướng dẫn đăng tin
                </button>
                <button className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-sm ${
                  isDarkMode ? 'text-gray-300 hover:bg-emerald-500 hover:text-white' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}>
                  Chính sách bảo hành
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProductListItem component
const ProductListItem = ({ product, isDarkMode }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const initFavoriteStatus = async () => {
      const userId = await userService.getCurrentUserId();
      setCurrentUserId(userId);
      if (!userId) return;

      try {
        const res = await userService.getFavoritesByUser(userId);
        const favorites = res.data?.data || [];
        const isFav = favorites.some((f) => f.listingId === product.id);
        setIsLiked(isFav);
      } catch (err) {
        console.error("Lỗi khi tải danh sách yêu thích:", err);
      }
    };

    initFavoriteStatus();
  }, [product.id]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để lưu tin!");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      await userService.toggleFavorite(currentUserId, product.id);
      const newLiked = !isLiked;
      setIsLiked(newLiked);

      if (newLiked) toast.success("Đã thêm vào danh sách yêu thích");
      else toast.error("Đã xóa khỏi danh sách yêu thích");
    } catch (err) {
      console.error("Toggle favorite failed:", err);
      toast.error("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedPrice + " VNĐ";
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-4 flex gap-4 group border-2 border-transparent cursor-pointer ${
        isDarkMode
          ? "bg-gray-800 hover:shadow-emerald-500/30 hover:border-emerald-500"
          : "bg-white hover:shadow-emerald-200/50 hover:border-emerald-300"
      }`}
    >
      {/* Icon tim ở góc phải trên */}
      <button
        onClick={handleFavoriteClick}
        disabled={isLoading}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 hover:scale-110 z-10 ${
          isDarkMode 
            ? "bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm" 
            : "bg-white/80 hover:bg-gray-50 backdrop-blur-sm shadow-sm"
        }`}
        title={
          !currentUserId
            ? "Đăng nhập để lưu tin"
            : isLiked
            ? "Xóa yêu thích"
            : "Thêm yêu thích"
        }
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaHeart
            className={`w-5 h-5 transition-colors duration-200 ${
              isLiked ? "text-red-500 fill-current" : "text-gray-400"
            }`}
          />
        )}
      </button>

      <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">No Image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute bottom-2 left-2 flex gap-1">
          {product.isPriority && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded group-hover:bg-red-600 transition-colors duration-300">
              Tin ưu tiên
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded group-hover:bg-emerald-600 transition-colors duration-300">
              Tiêu biểu
            </span>
          )}
          {product.listingType === "Auction" && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded group-hover:bg-purple-600 transition-colors duration-300">
              Đấu giá
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded group-hover:bg-emerald-600/80 transition-colors duration-300">
          {product.timeAgo}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between group-hover:bg-gradient-to-br from-emerald-50/30 to-transparent transition-colors duration-300 p-2 rounded-lg">
        <div>
          <h3
            className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {product.title}
          </h3>

          <p
            className={`text-sm mb-2 transition-colors duration-300 ${
              isDarkMode
                ? "text-gray-400 group-hover:text-gray-300"
                : "text-gray-600 group-hover:text-gray-700"
            }`}
          >
            {product.description}
          </p>

          <div className="text-xl font-bold text-red-600 mb-2 group-hover:text-red-500 group-hover:-translate-y-0.5 transition-all duration-300">
            {formatPrice(product.price)}
          </div>

          <div
            className={`flex items-center text-sm mb-2 group-hover:text-emerald-500 transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <FaMapMarkerAlt className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
            <span>{product.location}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode
                  ? "text-gray-300 group-hover:text-white"
                  : "text-gray-700 group-hover:text-gray-800"
              }`}
            >
              {product.seller.name}
            </span>
            <div className="flex items-center gap-1">
              <FaStar className="w-3 h-3 text-yellow-400 group-hover:text-yellow-500 group-hover:scale-110 transition-all duration-200" />
              <span
                className={`text-xs transition-colors duration-300 ${
                  isDarkMode
                    ? "text-gray-400 group-hover:text-gray-300"
                    : "text-gray-600 group-hover:text-gray-700"
                }`}
              >
                {product.seller.rating} ({product.seller.soldCount} đã bán)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductList;