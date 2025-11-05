import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaTrash, FaRegSadTear, FaTimes } from "react-icons/fa";
import { userService } from "../../../services/users/userService";
import { listingService } from "../../../services/listings/listingService";
import { tokenService } from "../../../services/auth/tokenService";
import { toast } from "react-toastify";
import ProductCard from "../LandingPage/ProductCard";
import backgroundPost from "../../../assets/img/backgroundpost.png";

const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
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
    return () => {
      mounted = false;
    };
  }, [triggerKey, text, duration, interval]);

  return <span className={className}>{display}</span>; // Sửa: Trả về JSX, không phải object
};

// Modal xác nhận xóa
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, count, isDeleting }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Xác nhận xóa
              </h3>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bạn có chắc muốn xóa <strong>{count}</strong> sản phẩm khỏi danh sách yêu thích?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className={`px-5 py-2 rounded-lg font-medium transition shadow-md flex items-center gap-2 ${isDeleting
                  ? "bg-red-400 text-white cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("landing_dark_mode");
    return stored === "true";
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const wishlistRef = useRef();
  const headerCardRef = useRef();

  // Đồng bộ dark mode toàn cục
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    window.addEventListener("darkModeChanged", handleDarkModeChange);
    return () => window.removeEventListener("darkModeChanged", handleDarkModeChange);
  }, []);

  useEffect(() => {
    const loadWishlistData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userInfo = tokenService.getUserInfo();
        const userId = userInfo?.userId;

        if (!userId) {
          setError("Vui lòng đăng nhập.");
          setLoading(false);
          return;
        }

        const favoritesRes = await userService.getFavoritesByUser(userId);
        if (!favoritesRes?.data?.success || !Array.isArray(favoritesRes.data.data)) {
          setError("Không tải được danh sách yêu thích.");
          setLoading(false);
          return;
        }

        const favorites = favoritesRes.data.data;
        if (favorites.length === 0) {
          setWishlistItems([]);
          setLoading(false);
          return;
        }

        const detailedListings = await Promise.all(
          favorites.map(async (fav) => {
            try {
              const listingRes = await listingService.getListingById(fav.listingId);
              const l = listingRes?.data || listingRes;

              if (l && l.listingId) {
                return {
                  id: l.listingId,
                  favoriteId: fav.favoriteId,
                  title: l.itemTitle || "Không có tiêu đề",
                  image:
                    l.item?.imageUrls?.[0] ||
                    "https://via.placeholder.com/150/cccccc/000000?text=No+Image",
                  description: l.detail || "Không có mô tả",
                  price: l.buyNowPrice || 0,
                  location: l.address || "Không rõ địa chỉ",
                  timeAgo: l.createdAt
                    ? new Date(l.createdAt).toLocaleDateString("vi-VN")
                    : "Không rõ",
                  listingData: {
                    listingType: l.listingType,
                    status: l.status,
                    warranty: l.warranty,
                    youAre: l.youAre,
                    startDate: l.startDate,
                    endDate: l.endDate,
                    feeName: l.feeName,
                    bidIncrement: l.bidIncrement,
                    startPrice: l.startPrice,
                    userName: l.userName,
                    item: l.item,
                  },
                };
              } else {
                throw new Error("Dữ liệu listing không hợp lệ");
              }
            } catch {
              return {
                id: fav.listingId,
                favoriteId: fav.favoriteId,
                title: "Sản phẩm đã bị xóa",
                image: "https://via.placeholder.com/150/cccccc/000000?text=Deleted",
                description: "Tin đăng không còn tồn tại.",
                price: 0,
                location: "",
                timeAgo: "",
                isDeleted: true,
              };
            }
          })
        );

        setWishlistItems(detailedListings.filter((item) => !item.isDeleted));
      } catch (err) {
        console.error(err);
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadWishlistData();
    window.scrollTo(0, 0);
  }, []);

  // Intersection Observer để detect khi header card đi qua header chính
  useEffect(() => {
    if (!headerCardRef.current) return;

    // Lấy chiều cao header động từ DOM
    const getHeaderHeight = () => {
      // Tìm header element trước
      const header = document.querySelector('header[class*="fixed"]');
      if (header) {
        // Lấy chiều cao thực tế của header
        return header.offsetHeight;
      }
      // Fallback: tìm spacer div ngay sau header
      const spacer = document.querySelector('header + div');
      if (spacer && spacer.style.height) {
        const heightMatch = spacer.style.height.match(/(\d+)px/);
        if (heightMatch) {
          return parseInt(heightMatch[1], 10);
        }
      }
      return 80; // Default fallback nếu không tìm thấy
    };

    const updateObserver = () => {
      const headerHeight = getHeaderHeight();
      const rootMarginValue = `-${headerHeight}px 0px 0px 0px`;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Khi viền trên của card chạm viền dưới header, bật sticky
          setIsSticky(!entry.isIntersecting);
        },
        {
          threshold: 0,
          rootMargin: rootMarginValue,
        }
      );

      observer.observe(headerCardRef.current);

      return observer;
    };

    let observer = updateObserver();

    // Update observer khi window resize (header có thể thay đổi chiều cao)
    const handleResize = () => {
      if (observer && headerCardRef.current) {
        observer.unobserve(headerCardRef.current);
        observer.disconnect();
      }
      observer = updateObserver();
    };

    window.addEventListener('resize', handleResize);
    // Delay nhỏ để đảm bảo DOM đã render xong
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer && headerCardRef.current) {
        observer.unobserve(headerCardRef.current);
        observer.disconnect();
      }
    };
  }, []);

  const handleToggleFavorite = (id, isFavorite) => {
    if (!isFavorite) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleOpenDeleteModal = () => {
    if (selectedItems.size > 0) {
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const userInfo = tokenService.getUserInfo();
      const userId = userInfo?.userId;
      if (!userId) {
        toast.error("Vui lòng đăng nhập!");
        setShowDeleteModal(false);
        return;
      }

      const itemsToDelete = wishlistItems.filter((item) => selectedItems.has(item.id));

      await Promise.all(
        itemsToDelete.map(async ({ id }) => {
          await userService.toggleFavorite(userId, id);
        })
      );

      setWishlistItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      toast.success(`Đã xóa ${itemsToDelete.length} sản phẩm khỏi danh sách yêu thích`);
    } catch (error) {
      console.error("Xóa yêu thích thất bại:", error);
      toast.error("Không thể xóa. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const handleProductClick = (listingId) => {
    navigate(`/product/${listingId}`); // Sửa: Dùng template string đúng cách
  };

  const handleExploreClick = () => {
    navigate("/");
  };

  return (
    <>
      <div className="relative min-h-screen w-full px-4 -mt-4">
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
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-8 font-sans">
          {/* Sticky Header - Hiển thị khi scroll xuống */}
          {isSticky && (
            <div className={`fixed top-16 left-0 right-0 z-40 border-b-2 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/95 backdrop-blur-md border-[#00c9a7]/50' 
                : 'bg-white/95 backdrop-blur-md border-[#00c9a7]'
            }`}>
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                      <FaHeart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h1 className={`text-2xl font-bold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        Danh sách yêu thích
                      </h1>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {wishlistItems.length} sản phẩm
                      </p>
                    </div>
                  </div>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={handleOpenDeleteModal}
                      disabled={isDeleting}
                      className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all shadow-md ${isDeleting
                        ? "bg-red-400 text-white cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <FaTrash /> Xóa ({selectedItems.size})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <motion.div
            ref={headerCardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl shadow-xl p-8 mb-10 border-2 transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-gray-800 border-[#00c9a7]/50' 
                : 'bg-white border-[#00c9a7]'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center shadow-md">
                  <FaHeart className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Danh sách yêu thích
                  </h1>
                  <p className={`mt-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {wishlistItems.length} sản phẩm
                  </p>
                </div>
              </div>

              {selectedItems.size > 0 && (
                <button
                  onClick={handleOpenDeleteModal}
                  disabled={isDeleting}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all shadow-md ${isDeleting
                    ? "bg-red-400 text-white cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Xóa ({selectedItems.size})
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          <div ref={wishlistRef}>
            <h2 className="text-3xl font-extrabold mb-8 text-emerald-600 dark:text-emerald-400">
              <ScrambleText text="Danh sách yêu thích của bạn" triggerKey={wishlistItems.length} />
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden animate-pulse h-96"
                  >
                    <div className="h-48 bg-gray-300 dark:bg-slate-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-6 bg-emerald-300 dark:bg-emerald-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24"
              >
                <FaRegSadTear className="w-28 h-28 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
                  Chưa có sản phẩm
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Nhấn <FaHeart className="inline text-red-500" /> để thêm!
                </p>
                <button
                  onClick={handleExploreClick}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:scale-105 transition-all"
                >
                  Khám phá ngay
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectItem(item.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 left-3 z-20 w-5 h-5 text-emerald-600 bg-white rounded border-gray-300 focus:ring-emerald-500 cursor-pointer hover:scale-110 transition-transform"
                    />
                    <ProductCard
                      id={item.id}
                      image={item.image}
                      title={item.title}
                      description={item.description}
                      price={item.price}
                      location={item.location}
                      timeAgo={item.timeAgo}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                      listingData={item.listingData}
                      isDarkMode={isDarkMode}
                      onClick={() => handleProductClick(item.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        count={selectedItems.size}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default WishlistPage;