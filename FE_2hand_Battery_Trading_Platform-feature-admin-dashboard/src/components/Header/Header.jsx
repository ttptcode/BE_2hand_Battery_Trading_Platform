import { useState, useRef, useEffect } from "react";
import { FiSearch, FiMessageCircle, FiMapPin, FiMenu, FiUser, FiMoon, FiSun } from "react-icons/fi";
import { FaHeart, FaCarSide, FaCar, FaMotorcycle, FaTruck, FaBicycle, FaBolt, FaCogs } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import LoginModal from "../../pages/Customer/LoginPage/LoginPage";
import { useScrollspy, useAuth } from "../../context/ScrollspyContext";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useUnreadMessages } from "../../hooks/useUnreadMessages";
import logo from "../../assets/img/logo.png";

import ScrambleText from "./ScrambleText";
import AnimatedNavText from "./AnimatedNavText";

// Header configuration
const HEADER_CONFIG = {
  MIN_HEIGHT: 64,
  SEARCH_DEBOUNCE_MS: 300,
  SCROLL_DEBOUNCE_MS: 50,
  SCROLL_THRESHOLD: 50, // Scroll bao nhiêu px thì header mới compact
};

// Quick categories for vehicle types
const QUICK_CATEGORIES = [
  { key: 'car', label: 'Ô tô', icon: FaCar, type: 'Ô tô' },
  { key: 'motor', label: 'Xe máy', icon: FaMotorcycle, type: 'Xe máy' },
  { key: 'truck', label: 'Xe tải, xe ben', icon: FaTruck, type: 'Xe tải' },
  { key: 'ev', label: 'Xe điện', icon: FaBolt, type: 'Xe điện' },
  { key: 'bike', label: 'Xe đạp', icon: FaBicycle, type: 'Xe đạp' },
  { key: 'other', label: 'Phương tiện khác', icon: FaCarSide, type: 'Khác' },
  { key: 'parts', label: 'Phụ tùng xe', icon: FaCogs, type: 'Phụ tùng' },
];

// Cities for search
const CITIES = [
  'Tp Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
];

// Vehicle categories for search
const VEHICLE_CATEGORIES = [
  'Tất cả Xe cộ',
  'Ô tô',
  'Xe máy',
  'Xe tải',
];

// CSS class constants
const ICON_BUTTON_CLASS = "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-transparent hover:border-[#00c9a7] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out";
const PRIMARY_BUTTON_CLASS = "px-1.5 md:px-4 py-1.5 md:py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out border hover:border-[#00c9a7]";
const NAV_LINK_CLASS = "px-2 py-2 text-xs font-semibold rounded hover:bg-[#00c9a7]/10 transition-colors duration-150";
const BUTTON_TEXT_HOVER_CLASS = "text-[11px] md:text-xs whitespace-nowrap inline-block hover:scale-110 transition-transform duration-300 ease-in-out";

// Utility functions
const normalizeString = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

const getActiveNavigationStates = (location, activeSection) => {
  return {
    isActiveAllProducts: location.pathname === '/products',
    // (1) CẬP NHẬT: isActivePromotion giờ sẽ dựa trên pathname
    isActivePromotion: location.pathname === '/plans',
    isActiveAboutUs: activeSection === 'about-us' && location.pathname === '/',
  };
};

const Header = () => {
  // Hooks
  const { activeSection } = useScrollspy();
  const { isLoggedIn, logout: authLogout } = useAuth();
  const { requireAuth, showLoginModal, handleLoginSuccess, closeLoginModal } = useAuthCheck();
  const { unreadMessages, unreadCount } = useUnreadMessages(10000); // Poll every 10 seconds
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging for unread messages
  useEffect(() => {
  }, [unreadCount, unreadMessages]);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [headerKeyword, setHeaderKeyword] = useState("");
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedCategory, setSelectedCategory] = useState(VEHICLE_CATEGORIES[0]);

  // UI state
  const [scrollY, setScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(HEADER_CONFIG.MIN_HEIGHT);
  
  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Refs
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const headerRef = useRef(null);
  const searchTimeout = useRef();

  // Computed values
  const isHomePage = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/landing';
  const isScrolled = scrollY > HEADER_CONFIG.SCROLL_THRESHOLD;
  // Chỉ home page mới có hiệu ứng scroll, các trang khác luôn compact
  const shouldBeCompact = isHomePage ? isScrolled : true;
  const activeStates = getActiveNavigationStates(location, activeSection);

  // Smooth transition với interpolation (0-1)
  const scrollProgress = Math.min(scrollY / HEADER_CONFIG.SCROLL_THRESHOLD, 1);

  // Dynamic classes với smooth transition
  const headerHeightClass = shouldBeCompact ? 'md:h-16 py-1' : 'py-4';
  const logoSizeClass = shouldBeCompact ? 'h-9 w-9 md:h-11 md:w-11' : 'h-16 w-16 md:h-20 md:w-20';
  const titleTextClass = shouldBeCompact ? 'text-base md:text-2xl' : 'text-xl md:text-4xl';

  // Event handlers
  const handleSearch = () => {
    if (searchResults && searchResults.length > 0) {
      navigate(`/products/${normalizeString(searchResults[0].title)}`);
      setShowSearch(false);
      setSearchValue("");
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    navigate('/');
    authLogout();
    setShowUserMenu(false);
    localStorage.clear();
    window.location.reload();
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
  };

  const handleMenuClick = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#' + sectionId);
    }
  };

  const handleHeaderSearch = () => {
    const params = new URLSearchParams();
    if (headerKeyword.trim()) params.set('q', headerKeyword.trim());
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('type', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategorySelect = (type) => {
    setSelectedCategory(type);
    const params = new URLSearchParams();
    params.set('type', type);
    navigate(`/products?${params.toString()}`);
    setShowCategoryMenu(false);
  };

  // Effects
  // Handle scroll events với smooth transition - CHỈ cho home page
  useEffect(() => {
    let scrollTimeout;
    let rafId;

    const handleScroll = () => {
      // Chỉ track scroll trên home page
      const isHome = location.pathname === '/' || location.pathname === '/landing';

      if (isHome) {
        // Cancel previous animation frame
        if (rafId) cancelAnimationFrame(rafId);

        // Use requestAnimationFrame for smooth 60fps updates
        rafId = requestAnimationFrame(() => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setScrollY(window.scrollY);
          }, HEADER_CONFIG.SCROLL_DEBOUNCE_MS);
        });
      }
    };

    // Set initial scroll position
    setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  // Force compact header cho tất cả trang NGOẠI TRỪ home page
  useEffect(() => {
    const isHome = location.pathname === '/' || location.pathname === '/home' || location.pathname === '/landing';

    if (!isHome) {
      // Tất cả trang không phải home → force compact
      setScrollY(HEADER_CONFIG.SCROLL_THRESHOLD + 1);
    } else {
      // Home page → cho phép scroll tự nhiên
      setScrollY(window.scrollY);
    }
  }, [location.pathname]);

  // Update header height for spacer
  useEffect(() => {
    const updateHeaderHeight = () => {
      const h = headerRef.current ? headerRef.current.offsetHeight : HEADER_CONFIG.MIN_HEIGHT;
      setHeaderHeight(h);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('scroll', updateHeaderHeight);
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('scroll', updateHeaderHeight);
    };
  }, [isScrolled, showSearch]);

  // Handle click outside for all dropdowns/menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!searchValue.trim()) setShowSearch(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [searchValue]);

  // Handle search with debounce
  useEffect(() => {
    if (!showSearch) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      setSearchResults([]);
    }, HEADER_CONFIG.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(searchTimeout.current);
  }, [searchValue, showSearch]);

  return (
    <>
      <header
        ref={headerRef}
        className="w-full fixed top-0 left-0 right-0 z-50 border-b-2 border-[#00c9a7] font-mono text-[#0e0e0e] text-base leading-[1.4] shadow-sm bg-[rgba(228,228,228,0.82)] backdrop-blur-[2px]"
        style={{ minHeight: `${HEADER_CONFIG.MIN_HEIGHT}px` }}
      >
        <div className={`w-full max-w-screen-2xl mx-auto px-2 md:px-4 flex flex-col items-stretch h-auto ${headerHeightClass} gap-y-2 transition-all duration-700 ease-out`}>
          <div className="flex items-center justify-between w-full gap-2 md:gap-4">
            {/* Logo - Bên trái */}
            <div className="flex items-center flex-shrink-0 gap-1 md:gap-3">
              {shouldBeCompact && (
                <div className="relative mr-2" ref={categoryMenuRef}>
                  <button
                    className={`h-9 w-9 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30 border border-transparent hover:border-[#00c9a7] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out`}
                    onClick={(e) => { e.stopPropagation(); setShowCategoryMenu(!showCategoryMenu); }}
                    title="Danh mục"
                  >
                    <FiMenu size={20} className="md:text-[24px] text-[#00c9a7]" />
                  </button>
                  {showCategoryMenu && (
                    <div className="absolute left-0 top-16 w-64 bg-white border-2 border-[#00c9a7] rounded-xl shadow-xl overflow-hidden z-[9999]">
                      <div className="px-4 py-3 bg-[#00c9a7] text-white font-bold text-lg">Danh mục</div>
                      <div className="p-3 space-y-2">
                        {QUICK_CATEGORIES.map(({ key, label, icon: Icon, type }) => (
                          <button
                            key={key}
                            onClick={() => handleCategorySelect(type)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#00c9a7]/10 transition-colors text-left"
                          >
                            <Icon className="text-xl text-[#0e0e0e]" />
                            <span className="text-sm font-semibold text-gray-800">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Link
                to="/"
                className="flex items-center gap-1 md:gap-2"
                onClick={(e) => {
                  // Force navigation to home when clicking logo
                  if (window.location.pathname === '/chat') {
                    e.preventDefault();
                    window.location.href = '/';
                  }
                }}
              >
                <img
                  src={logo}
                  alt="EV Trading Logo"
                  className={`${logoSizeClass} object-contain border-2 border-[#00c9a7] rounded-lg bg-white transition-all duration-700 ease-out`}
                />
                {activeSection === 'hero' ? (
                  <span
                    className={`relative ${titleTextClass} font-extrabold tracking-tight text-black select-none transition-all duration-700 ease-out`}
                    style={{ letterSpacing: 2, marginLeft: '6px' }}
                  >
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -left-2 -top-1 text-[#00c9a7] font-extrabold"
                      style={{ fontWeight: 900, fontSize: '1.5rem' }}
                    >
                      ⌜
                    </motion.span>
                    <span className="relative z-10 inline-block">
                      <ScrambleText text="2H AUTO" triggerKey={activeSection} className="inline-block" />
                    </span>
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -right-2 -bottom-1 text-[#00c9a7] font-extrabold"
                      style={{ fontWeight: 900, fontSize: '1.5rem' }}
                    >
                      ⌟
                    </motion.span>
                  </span>
                ) : (
                  <span
                    className={`${titleTextClass} font-extrabold tracking-tight text-black select-none transition-all duration-700 ease-out`}
                    style={{ letterSpacing: 2, marginLeft: '6px', fontWeight: 900 }}
                  >
                    2H AUTO
                  </span>
                )}
              </Link>
            </div>

            {/* Nav - Ở giữa */}
            <nav
              className={`hidden md:flex flex-1 items-center ${showSearch ? 'justify-start scale-75 opacity-50 pointer-events-none' : 'justify-center scale-100 opacity-100'} gap-x-1 transition-all duration-700 ease-out ml-24`}
            >
              <Link to="/products" className={NAV_LINK_CLASS}>
                <AnimatedNavText
                  isActive={activeStates.isActiveAllProducts}
                  text="Tất Cả Xe"
                  triggerKey={location.pathname}
                />
              </Link>

              {/* (2) CẬP NHẬT: Thay thế <Link> bằng <button> và dùng requireAuth */}
              <button
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    navigate('/plans');
                  });
                }}
                className={NAV_LINK_CLASS}
              >
                <AnimatedNavText
                  isActive={activeStates.isActivePromotion}
                  text="Khuyến Mãi"
                  triggerKey={location.pathname}
                />
              </button>

              <button type="button" onClick={() => navigate('/about-us')} className={`${NAV_LINK_CLASS} bg-transparent border-0 focus:outline-none`}>
                <AnimatedNavText
                  isActive={activeStates.isActiveAboutUs}
                  text="Về Chúng Tôi"
                  triggerKey={activeSection}
                />
              </button>
            </nav>

            {/* Icons & Buttons - Bên phải */}
            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
              {shouldBeCompact && (
                <div className="relative group flex items-center" ref={searchRef}>
                  {showSearch && (
                    <input
                      type="text"
                      className="w-36 md:w-48 text-xs md:text-sm border border-[#00c9a7] rounded-lg px-3 md:px-4 py-2 focus:ring-2 focus:ring-[#00c9a7] outline-none bg-white text-black placeholder:text-gray-500 transition-all duration-200 absolute right-10 md:right-12 top-1/2 -translate-y-1/2 shadow-lg z-[9999]"
                      placeholder="Tìm xe..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                    />
                  )}
                  <button
                    className={`${ICON_BUTTON_CLASS} bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30`}
                    onClick={e => { e.stopPropagation(); setShowSearch(prev => !prev); }}
                    style={{ zIndex: 52 }}
                    title="Tìm kiếm"
                  >
                    <FiSearch size={18} className="md:text-[20px] text-[#00c9a7]" />
                  </button>
                </div>
              )}
              {/* Dark Mode Toggle Switch */}
              <button
                onClick={() => {
                  setIsDarkMode((prev) => {
                    const newValue = !prev;
                    localStorage.setItem('landing_dark_mode', newValue);
                    // Dispatch event để các component khác biết dark mode đã thay đổi
                    window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { isDarkMode: newValue } }));
                    return newValue;
                  });
                }}
                className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c9a7] ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
                }`}
                title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
              >
                <span
                  className={`inline-flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                >
                  {isDarkMode ? (
                    <FiMoon size={14} className="text-slate-700" />
                  ) : (
                    <FiSun size={14} className="text-yellow-500" />
                  )}
                </span>
              </button>

              <Link to="/wishlist" className={`${ICON_BUTTON_CLASS} bg-red-50 hover:bg-red-100`} title="Yêu thích">
                <FaHeart size={18} className="md:text-[20px] text-[#ff3b6b]" />
              </Link>
              <button
                onClick={() => {
                  requireAuth(() => {
                    navigate('/chat');
                  });
                }}
                className={`${ICON_BUTTON_CLASS} bg-blue-50 hover:bg-blue-100 relative`}
                title="Chat"
              >
                <FiMessageCircle size={18} className="md:text-[20px] text-[#1e90ff]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Nút Đăng nhập / Quản lý tin */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    navigate('/my-ads');
                  } else {
                    requireAuth(() => navigate('/'));
                  }
                }}
                className={`${PRIMARY_BUTTON_CLASS} bg-white hover:bg-gray-100 text-black border-gray-300`}
                title={isLoggedIn ? 'Quản lý tin' : 'Đăng nhập'}
              >
                <span className={BUTTON_TEXT_HOVER_CLASS}>
                  {isLoggedIn ? 'Quản lý tin' : 'Đăng nhập'}
                </span>
              </button>

              {/* Nút Đăng tin - Luôn hiển thị */}
              <button
                onClick={() => requireAuth(() => navigate('/post-item'))}
                className={`${PRIMARY_BUTTON_CLASS} bg-black hover:bg-gray-800 text-white border-black`}
                title="Đăng tin"
              >
                <span className={BUTTON_TEXT_HOVER_CLASS}>Đăng tin</span>
              </button>

              {/* User Menu - Chỉ hiện khi đã đăng nhập */}
              {isLoggedIn && (
                <div className="relative group" ref={menuRef}>
                  <button
                    className={`${ICON_BUTTON_CLASS} bg-gray-100 hover:bg-gray-200`}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    title="Profile"
                  >
                    <FiUser size={18} className="md:text-[20px] text-black" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-14 w-48 bg-black/90 rounded-lg shadow-lg py-2 z-[9999]">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-emerald-700 transition-colors"
                        onClick={handleProfileClick}
                      >
                        Thông tin cá nhân
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full hover:bg-emerald-700 text-left px-4 py-2 text-sm text-white transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search bar - Khi không compact */}
          {!shouldBeCompact && (
            <div className="hidden md:flex items-center gap-2 bg-white/95 rounded-2xl border-2 border-[#00c9a7] px-2 py-2 shadow-sm max-w-3xl mx-auto transition-all duration-700 ease-out">
              <FiSearch className="text-gray-500" />
              <input
                value={headerKeyword}
                onChange={(e) => setHeaderKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleHeaderSearch(); }}
                placeholder="Tìm xe cộ..."
                className="w-48 bg-transparent outline-none text-sm"
              />
              <div className="h-6 w-px bg-gray-200 mx-1" />
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-gray-200 bg-white">
                <FiMapPin className="text-yellow-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                >
                  {CITIES.map(city => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-gray-200 bg-white">
                <FaCarSide className="text-yellow-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                >
                  {VEHICLE_CATEGORIES.map(category => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleHeaderSearch}
                className="ml-2 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors"
              >
                Tìm xe
              </button>
            </div>
          )}

          {/* Quick Categories - Khi không compact */}
          {!shouldBeCompact && (
            <div className="hidden md:grid grid-cols-7 gap-3 mt-2 transition-all duration-700 ease-out">
              {QUICK_CATEGORIES.map(({ key, label, icon: Icon, type }) => (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(type)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 hover:border-[#00c9a7] hover:shadow-sm transition p-3 bg-transparent"
                >
                  <Icon className="text-2xl text-[#0e0e0e] mb-1" />
                  <span className="text-xs font-semibold text-gray-800 text-center">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Spacer để tránh content bị che bởi fixed header */}
      <div style={{ height: headerHeight }} />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
        navigate={navigate}
      />
    </>
  );
};

export default Header;