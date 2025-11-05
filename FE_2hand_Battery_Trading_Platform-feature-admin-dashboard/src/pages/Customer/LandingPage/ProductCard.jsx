import { useState, useEffect, useMemo } from "react";
import { FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import { userService } from "../../../services/users/userService";
import { toast } from "react-toastify";
import { normalizeImageUrl } from "../../../utils/imageUrlHelper";

const ProductCard = ({
  id,
  listingId,
  image,
  title,
  description,
  price,
  location,
  timeAgo,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  isDarkMode = false,
  showDefaultBorder = false // Thêm prop để hiển thị viền màu xanh mặc định
}) => {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);


  useEffect(() => {
    const initFavoriteStatus = async () => {
      const userId = await userService.getCurrentUserId();
      setCurrentUserId(userId);

      if (!userId) {
        setIsLiked(false);
        return;
      }

      try {
        const res = await userService.getFavoritesByUser(userId);
        let favorites = [];

        if (res.data?.success && Array.isArray(res.data.data)) {
          favorites = res.data.data;
        } else if (Array.isArray(res.data)) {
          favorites = res.data;
        }

        const targetListingId = listingId || id;
        const isFav = favorites.some(
          (fav) => fav.listingId === targetListingId || fav.id === targetListingId
        );
        setIsLiked(isFav);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        setIsLiked(false);
      }
    };

    initFavoriteStatus();
  }, [listingId, id]);



  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để lưu tin!");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const targetListingId = listingId || id;
      await userService.toggleFavorite(currentUserId, targetListingId);

      const newLikedState = !isLiked;
      setIsLiked(newLikedState);

      if (onToggleFavorite) {
        onToggleFavorite(id, newLikedState);
      }


      if (newLikedState) {
        toast.success("✅ Đã thêm vào danh sách yêu thích");
      } else {
        toast.error("❌ Đã xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      const msg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "Không thể cập nhật. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  const formatPrice = (price) => {
    if (price === 0) return "0 VNĐ";
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedPrice + " VNĐ";
  };

  const formatTimeAgo = (time) => {
    if (!time) return "";
    return time;
  };

  // Normalize image URL
  const normalizedImage = useMemo(() => {
    return image ? normalizeImageUrl(image) : null;
  }, [image]);

  return (
    <div
      className={`rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden w-full h-96 flex flex-col group border-2 ${
        showDefaultBorder 
          ? 'border-[#00c9a7]' 
          : 'border-transparent'
      } ${isDarkMode ? 'bg-gray-700 hover:shadow-[#00c9a7]/20 hover:border-[#00c9a7]' : 'bg-white hover:shadow-[#00c9a7]/20 hover:border-[#00c9a7]'}`}
      onClick={onClick}
    >
      {/* Image Container - Fixed height */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gray-200">
        {normalizedImage ? (
          <img
            src={normalizedImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">No Image</span>
          </div>
        )}
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading || !currentUserId}
          className={`absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white hover:scale-110 hover:shadow-md transition-all duration-200 group-hover:bg-white/90 ${isLoading || !currentUserId
            ? "opacity-50 cursor-not-allowed"
            : ""
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
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FaHeart
              className={`w-4 h-4 transition-all duration-200 ${isLiked
                ? "text-red-500 fill-current scale-110"
                : "text-gray-400 hover:text-red-500"
                }`}
            />
          )}
        </button>

        {/* Time Badge */}
        {timeAgo && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded group-hover:bg-[#00c9a7]/80 transition-colors duration-300">
            {formatTimeAgo(timeAgo)}
          </div>
        )}
      </div>

      {/* Content - Fixed height with flex */}
      <div className={`p-4 flex-1 flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'group-hover:bg-gradient-to-br from-[#00c9a7]/20 to-transparent' : 'group-hover:bg-gradient-to-br from-[#00c9a7]/20 to-transparent'}`}>
        <div>
          {/* Title */}
          <h3 className={`font-bold text-lg mb-2 line-clamp-2 leading-tight transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-[#00c9a7]' : 'text-gray-900 group-hover:text-[#00c9a7]'}`}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'}`}>
              {description}
            </p>
          )}
        </div>

        <div>
          {/* Price */}
          <div className="text-xl font-bold text-red-600 mb-3 group-hover:text-red-700 group-hover:scale-105 transition-all duration-300">
            {formatPrice(price)}
          </div>

          {/* Location */}
          <div className={`flex items-center text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400 group-hover:text-[#00c9a7]' : 'text-gray-500 group-hover:text-[#00c9a7]'}`}>
            <FaMapMarkerAlt className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
