import { Link } from "react-router-dom";
import { FaArrowRight, FaCheck, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import HeroSection from "../../../components/HeroSection/HeroSection";
import { useNavigate } from "react-router-dom";
import { FaRegSadTear } from "react-icons/fa";
import { useScrollspy } from "../../../context/ScrollspyContext";
import ParallaxBackground from "./ParallaxBackground";
import { FaGamepad, FaGift, FaStar } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { listingService } from "../../../services";
import { itemTypeService } from "../../../services"; // Import itemTypeService

// Utility function: Transform Listing API data to component format
const transformListingToProduct = (listing) => {
  if (!listing || !listing.item) {
    return null;
  }

  const item = listing.item; // Lấy item từ listing

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

  return {
    id: item.itemId,
    listingId: listing.listingId, // Thêm listingId để dùng cho chat
    image: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
    title: item.title || 'Không có tiêu đề',
    description: `${item.brand || 'N/A'} ${item.model || 'N/A'} - ${item.condition || 'N/A'}`,
    price: listing.buyNowPrice || item.price || 0, // Ưu tiên lấy giá từ listing
    location: listing.userName || item.userName ? `Người bán: ${listing.userName || item.userName}` : "Việt Nam",
    timeAgo: calculateTimeAgo(listing.createdAt),
    // Thêm các fields cần thiết cho stores section
    products: [], // Empty products list (Listings API không có data này)
    name: listing.userName || item.userName || 'Người bán',
    logo: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
    banner: item.imageUrls && item.imageUrls.length > 1 ? item.imageUrls[1] : null,
  };
};

const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
    setDisplay(textArr.map(() => "").join(""));
    const totalFrames = Math.ceil(duration / interval);
    const scramble = () => {
      if (!mounted) return;
      if (frame < totalFrames) {
        revealCount = Math.floor((frame / totalFrames) * textArr.length);
        const scrambled = textArr.map((c, i) => {
          if (i < revealCount) return c;
          if (c === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        });
        setDisplay(scrambled.join(""));
        frame++;
        setTimeout(scramble, interval);
      } else {
        setDisplay(text);
      }
    };
    scramble();
    return () => { mounted = false; };
  }, [triggerKey, text]);
  return <span className={className}>{display}</span>;
};

const LandingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [stores, setStores] = useState([]);
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();
  const { setActiveSection } = useScrollspy();
  const [vehicleCategories, setVehicleCategories] = useState([]);
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

  const [decodeLatestListings, setDecodeLatestListings] = useState(false);
  const [decodeOfficialStores, setDecodeOfficialStores] = useState(false);
  const [decodeFeaturedStores, setDecodeFeaturedStores] = useState(false);
  const latestListingsRef = useRef();
  const officialStoresRef = useRef();
  const featuredStoresRef = useRef();

  const [latestListingsStart, setLatestListingsStart] = useState(0);
  const [featuredStoresStart, setFeaturedStoresStart] = useState(0);

  const [visibleStoreCount, setVisibleStoreCount] = useState(6);
  const [showAllStores, setShowAllStores] = useState(false);

  // Fetch vehicle categories từ API
  useEffect(() => {
    const fetchVehicleCategories = async () => {
      try {
        const response = await itemTypeService.getAllItemTypes();

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const categoriesFromApi = response.data.data.map(itemType => ({
            id: itemType.itemTypeId,
            name: itemType.name
          }));

          // Thêm option "Tất cả" vào đầu danh sách
          const allCategories = [
            { id: "all", name: "Tất cả" },
            ...categoriesFromApi
          ];

          setVehicleCategories(allCategories);
          console.log('✅ Vehicle categories loaded from API:', allCategories);
        } else {
          console.warn('⚠️ No vehicle categories data from API, using default');
          setVehicleCategories([{ id: "all", name: "Tất cả" }]);
        }
      } catch (error) {
        console.error('❌ Error fetching vehicle categories:', error);
        // Fallback to default categories if API fails
        setVehicleCategories([
          { id: "all", name: "Tất cả" },
          { id: "o-to", name: "Ô tô" },
          { id: "xe-may", name: "Xe máy" },
          { id: "xe-tai", name: "Xe tải, xe ben" },
          { id: "xe-dien", name: "Xe điện" },
          { id: "xe-dap", name: "Xe đạp" },
          { id: "phu-tung", name: "Phụ tùng" }
        ]);
      }
    };

    fetchVehicleCategories();
  }, []);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sử dụng Listings API thay vì Items API
        const response = await listingService.getAllListings();

        if (response.success && response.data && Array.isArray(response.data)) {
          const listings = response.data;

          // Transform Listings API data to component format
          const transformedItems = listings
            .map(transformListingToProduct)
            .filter(item => item !== null); // Filter out invalid items

          // Sort by newest first (không cần createdAt nữa vì đã dùng timeAgo)
          const sortedItems = transformedItems;

          // Set các state cần thiết cho display
          setVehicles(sortedItems);
          setTotalItems(sortedItems.length);
          setBatteries(sortedItems); // Tạm dùng chung data
          setStores(sortedItems); // Tạm dùng chung data
          setFeaturedStores(sortedItems); // Tạm dùng chung data

        } else {
          console.error('❌ LandingPage - Invalid response format:', response);
          setError("Không có dữ liệu từ API");
          setVehicles([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("❌ LandingPage - Error fetching listings:", error);
        setError("Không thể tải danh sách sản phẩm");
        setVehicles([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "latest-listings") {
            setDecodeLatestListings(entry.isIntersecting);
          }
          if (entry.target.id === "official-stores") {
            setDecodeOfficialStores(entry.isIntersecting);
          }
          if (entry.target.id === "featured-stores") {
            setDecodeFeaturedStores(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (latestListingsRef.current) observer.observe(latestListingsRef.current);
    if (officialStoresRef.current) observer.observe(officialStoresRef.current);
    if (featuredStoresRef.current) observer.observe(featuredStoresRef.current);
    return () => {
      if (latestListingsRef.current) observer.unobserve(latestListingsRef.current);
      if (officialStoresRef.current) observer.unobserve(officialStoresRef.current);
      if (featuredStoresRef.current) observer.unobserve(featuredStoresRef.current);
    };
  }, []);

  const handleToggleFavorite = (id, isFavorite) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.add(id);
      } else {
        newFavorites.delete(id);
      }
      return newFavorites;
    });
  };

  const filteredStores = selectedCategory === "all"
    ? featuredStores
    : featuredStores.filter(store => store.category === selectedCategory);

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const slideIn = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        type: "spring",
        stiffness: 60,
      },
    }),
  };



  useEffect(() => {
    const headerOffset = 140;
    let ticking = false;

    const heroEl = document.querySelector('.HeroSection-root, #hero-section');
    const latestListingsEl = document.getElementById('latest-listings');
    const officialStoresEl = document.getElementById('official-stores');
    const featuredStoresEl = document.getElementById('featured-stores');

    const inView = (rect) => rect && rect.top <= headerOffset && rect.bottom > headerOffset;

    const updateActive = () => {
      const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
      const latestListingsRect = latestListingsEl ? latestListingsEl.getBoundingClientRect() : null;
      const officialStoresRect = officialStoresEl ? officialStoresEl.getBoundingClientRect() : null;
      const featuredStoresRect = featuredStoresEl ? featuredStoresEl.getBoundingClientRect() : null;

      if (inView(heroRect)) {
        setActiveSection('hero');
      } else if (inView(latestListingsRect)) {
        setActiveSection('latest-listings');
      } else if (inView(officialStoresRect)) {
        setActiveSection('official-stores');
      } else if (inView(featuredStoresRect)) {
        setActiveSection('featured-stores');
      } else {
        setActiveSection('latest-listings');
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateActive();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [setActiveSection]);

  return (
    <div className="relative min-h-screen w-full" style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}>
      <ParallaxBackground isDarkMode={isDarkMode} />
      <div className="relative z-20 bg-transparent pl-8 pr-8 font-mono text-[#0e0e0e] text-base leading-[1.4]">
        <div className="absolute left-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{ top: 0, bottom: 0 }} />
        <div className="absolute right-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{ top: 0, bottom: 0 }} />
        <HeroSection />

        <div id="latest-listings" ref={latestListingsRef} className="max-w-7xl mx-auto p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#00c9a7] tracking-tight">
            <ScrambleText text="Tin đăng mới nhất" triggerKey={decodeLatestListings} className="inline-block" />
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mb-8 w-full px-4 lg:px-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`rounded-lg shadow-md overflow-hidden animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`h-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <div className="p-4 space-y-3">
                      <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-6 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="mb-8 w-full px-4 lg:px-12 text-center py-12">
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Chưa có tin đăng nào.</p>
            </div>
          ) : (
            <div className="mb-8 w-full relative flex items-center">
              <button
                className={`hidden lg:block absolute left-0 z-10 rounded-full shadow p-2 -ml-6 border hover:scale-110 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-gray-700 disabled:hover:text-gray-400' : 'bg-white border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-white disabled:hover:text-gray-400'}`}
                onClick={() => setLatestListingsStart(s => Math.max(0, s - 1))}
                disabled={latestListingsStart === 0}
                aria-label="Xem tin trước"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 lg:px-12">
                {vehicles.slice(latestListingsStart, latestListingsStart + 4).map((vehicle, idx) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-full"
                  >
                    <ProductCard
                      id={vehicle.id}
                      listingId={vehicle.listingId}
                      image={vehicle.image}
                      title={vehicle.title}
                      description={vehicle.description}
                      price={vehicle.price}
                      location={vehicle.location}
                      timeAgo={vehicle.timeAgo}
                      isFavorite={favorites.has(vehicle.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onClick={() => navigate(`/product/${vehicle.listingId}`)}
                      isDarkMode={isDarkMode}
                    />
                  </motion.div>
                ))}
              </div>

              <button
                className={`hidden lg:block absolute right-0 z-10 rounded-full shadow p-2 -mr-6 border hover:scale-110 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-gray-700 disabled:hover:text-gray-400' : 'bg-white border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-white disabled:hover:text-gray-400'}`}
                onClick={() => setLatestListingsStart(s => Math.min(vehicles.length - 4, s + 1))}
                disabled={latestListingsStart >= vehicles.length - 4}
                aria-label="Xem tin tiếp"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <Link
              to="/products"
              className={`border px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]' : 'border-gray-300 bg-white text-gray-700 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]'}`}
            >
              Xem thêm {totalItems.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} tin đăng
            </Link>
          </div>
        </div>

        <div id="official-stores" ref={officialStoresRef} className="max-w-7xl mx-auto p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#00c9a7] tracking-tight">
            <ScrambleText text="Đặt Xe Online CHÍNH HÃNG" triggerKey={decodeOfficialStores} className="inline-block" />
          </h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaCheck className="w-4 h-4 mr-2" />
              <span className="text-sm">Đổi trả miễn phí</span>
            </div>
            <div className="flex items-center text-green-600">
              <FaCheck className="w-4 h-4 mr-2" />
              <span className="text-sm">Hàng chính hãng 100%</span>
            </div>
            <div className="flex items-center text-green-600">
              <FaCheck className="w-4 h-4 mr-2" />
              <span className="text-sm">Hỗ trợ mua trả góp</span>
            </div>
          </div>

          {/* DEBUG: Hiển thị số lượng cửa hàng để kiểm tra */}
          <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Đang hiển thị {showAllStores ? stores.length : Math.min(stores.length, 6)} / {stores.length} cửa hàng
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stores.slice(0, showAllStores ? stores.length : 6).map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-lg">
                            {store.name ? store.name.charAt(0).toUpperCase() : 'S'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{store.name}</h3>
                        <div className="flex items-center text-green-600">
                          <FaCheck className="w-3 h-3 mr-1" />
                          <span className="text-xs">Chính hãng</span>
                        </div>
                      </div>
                    </div>
                    <FaChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div className="relative bg-gray-200">
                  {store.banner ? (
                    <img
                      src={store.banner}
                      alt={store.name}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        // Nếu banner lỗi, chuyển sang hiển thị "No Banner"
                        e.target.style.display = 'none';
                        // Tìm phần tử chứa "No Banner" và hiển thị nó
                        const parent = e.target.parentElement;
                        const noBannerDiv = parent.querySelector('.no-banner-placeholder');
                        if (noBannerDiv) {
                          noBannerDiv.style.display = 'flex';
                        }
                      }}
                      loading="lazy"
                    />
                  ) : null}

                  {/* Luôn có phần "No Banner" nhưng ẩn đi nếu có banner */}
                  <div
                    className={`w-full h-32 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center ${store.banner ? 'hidden' : 'flex'
                      } no-banner-placeholder`}
                  >
                    <span className="text-gray-500 text-sm font-medium">No Banner</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {(store.products || []).slice(0, 3).map((product, productIdx) => (
                      <div key={productIdx} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{product.name}</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">
                          {product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ
                        </span>
                      </div>
                    ))}
                    {/* Hiển thị thông báo nếu không có sản phẩm */}
                    {(store.products || []).length === 0 && (
                      <div className={`text-center text-sm py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Chưa có sản phẩm
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {stores.length > visibleStoreCount && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAllStores(!showAllStores)}
                className={`border px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]' : 'border-gray-300 bg-white text-gray-700 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]'}`}
              >
                Xem thêm 3 cửa hàng
              </button>
            </div>
          )}

          {visibleStoreCount > 6 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleStoreCount(6)}
                className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-500 hover:text-white hover:border-gray-500 transition-all duration-300 font-medium text-sm"
              >
                Thu gọn
              </button>
            </div>
          )}
        </div>

        <div id="featured-stores" ref={featuredStoresRef} className="max-w-7xl mx-auto p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#00c9a7] tracking-tight">
            <ScrambleText text="Cửa hàng xe nổi bật" triggerKey={decodeFeaturedStores} className="inline-block" />
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {vehicleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                  ? isDarkMode ? 'bg-[#00c9a7] text-white border border-[#00c9a7]' : 'bg-[#00c9a7] text-white border border-[#00c9a7]'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:border-[#00c9a7] hover:text-[#00c9a7]' : 'bg-white text-gray-700 border border-gray-300 hover:border-[#00c9a7] hover:text-[#00c9a7]'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="mb-8 w-full relative flex items-center">
            <button
              className={`hidden lg:block absolute left-0 z-10 rounded-full shadow p-2 -ml-6 border hover:scale-110 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-gray-700 disabled:hover:text-gray-400' : 'bg-white border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-white disabled:hover:text-gray-400'}`}
              onClick={() => setFeaturedStoresStart(s => Math.max(0, s - 1))}
              disabled={featuredStoresStart === 0}
              aria-label="Xem cửa hàng trước"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full px-4 lg:px-12">
              {filteredStores.slice(featuredStoresStart, featuredStoresStart + 5).map((store, idx) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-full rounded-lg shadow-md p-4 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border-2 border-transparent ${isDarkMode ? 'bg-gray-800 hover:shadow-[#00c9a7]/20 hover:border-[#00c9a7]' : 'bg-white hover:shadow-[#00c9a7]/20 hover:border-[#00c9a7]'}`}
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="relative mb-3">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 bg-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-2xl">
                            {store.name ? store.name.charAt(0).toUpperCase() : 'S'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#00c9a7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className={`font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-[#00c9a7]' : 'text-gray-900 group-hover:text-[#00c9a7]'}`}>{store.name}</h3>

                    <div className="flex items-center mb-2">
                      <FaStar className="w-4 h-4 text-yellow-400 mr-1 group-hover:text-yellow-500 group-hover:scale-110 transition-all duration-200" />
                      <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'}`}>
                        {store.rating} ({store.reviewCount} đánh giá)
                      </span>
                    </div>

                    <div className={`text-xs mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400 group-hover:text-[#00c9a7]' : 'text-gray-500 group-hover:text-[#00c9a7]'}`}>
                      Đang bán: {store.currentListings} | Đã bán: {store.soldItems}
                    </div>

                    <div className={`text-xs mb-3 flex-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400 group-hover:text-[#00c9a7]' : 'text-gray-500 group-hover:text-[#00c9a7]'}`}>
                      📍 {store.location}
                    </div>

                    <button className={`border px-4 py-1 rounded text-sm hover:scale-105 transition-all duration-300 group-hover:shadow-md ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]' : 'border-gray-300 bg-white text-gray-700 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]'}`}>
                      Theo dõi
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              className={`hidden lg:block absolute right-0 z-10 rounded-full shadow p-2 -mr-6 border hover:scale-110 hover:shadow-lg disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-gray-700 disabled:hover:text-gray-400' : 'bg-white border-[#00c9a7] hover:bg-[#00c9a7] hover:text-white disabled:hover:bg-white disabled:hover:text-gray-400'}`}
              onClick={() => setFeaturedStoresStart(s => Math.min(filteredStores.length - 5, s + 1))}
              disabled={featuredStoresStart >= filteredStores.length - 5}
              aria-label="Xem cửa hàng tiếp"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center">
            <button className={`border px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]' : 'border-gray-300 bg-white text-gray-700 hover:bg-[#00c9a7] hover:text-white hover:border-[#00c9a7]'}`}>
              Xem thêm cửa hàng xe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;