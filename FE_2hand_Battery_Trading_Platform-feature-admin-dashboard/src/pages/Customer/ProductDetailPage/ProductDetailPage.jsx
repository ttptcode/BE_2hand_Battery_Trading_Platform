import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailImages from "./DetailImages";
import DetailInfo from "./DetailInfo";
import DetailSummary from "./DetailSummary";
import SellerInfoCard from "./SellerInfoCard";
import CommentsSection from "./CommentsSection";
import LoginModal from "../LoginPage/LoginPage";
import ProductCard from "../LandingPage/ProductCard"; // Import ProductCard
import { listingService } from "../../../services";
import { userService } from "../../../services/users/userService";
import { createConversation } from "../../../services/chats/chatService";
import { useAuthCheck } from "../../../hooks/useAuthCheck";
import backgroundPost from '../../../assets/img/backgroundpost.png';

// Transform Listing API data to component format
const transformListingToCarData = (listing, sellerPhone = "") => {
    if (!listing || !listing.item) {
        console.error('❌ Invalid listing data:', listing);
        return null;
    }

    const item = listing.item;

    return {
        carId: item.itemId,
        listingId: listing.listingId,
        seller: {
            userId: listing.userId || item.userId,
            userName: listing.userName || item.userName || "Người dùng",
            email: "",
            phone: sellerPhone || ""
        },
        title: item.title,
        carName: `${item.brand} ${item.model}`,
        year: item.year,
        kilometers: item.mileage / 1000,
        origin: "Việt Nam",
        price: listing.buyNowPrice || item.price,
        priceCurrency: "VND",
        sellerPhoneHidden: true,
        location: listing.address || "Không xác định",
        postedTime: calculateTimeAgo(listing.createdAt),
        images: item.imageUrls || [],
        videoUrl: item.videoUrl,
        description: listing.detail,
        specs: {
            brand: item.brand,
            modelLine: item.model,
            registrationYear: item.year,
            usageStatus: item.condition,
            type: item.itemTypeName,
            engineCapacityRange: item.capacity ? `${item.capacity} cc` : "N/A",
            origin: "Việt Nam",
            warranty: "Bảo hành người bán",
            weightCategory: "N/A",
            batteryCapacity: item.batteryCapacity,
            cycles: item.cycles,
            serialNumber: item.serialNumber
        },
        status: {
            isSold: listing.status?.toLowerCase() === "sold",
            isActive: listing.status?.toLowerCase() === "active"
        },
        // THÊM DÒNG NÀY - truyền item object vào car data
        item: item,
        // THÊM CÁC FIELD QUAN TRỌNG KHÁC
        warranty: listing.warranty,
        address: listing.address,
        youAre: listing.youAre
    };
};

// Transform listing to ProductCard format
const transformListingToProductCard = (listing) => {
    if (!listing || !listing.item) return null;

    const item = listing.item;

    const calculateTimeAgo = (createdAt) => {
        if (!createdAt) return "";
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
        id: listing.listingId, // Sử dụng listingId làm id
        listingId: listing.listingId,
        image: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
        title: item.title || 'Không có tiêu đề',
        description: listing.detail || 'Không có mô tả',
        price: listing.buyNowPrice || item.price || 0,
        location: listing.address || 'Không xác định',
        timeAgo: calculateTimeAgo(listing.createdAt),
    };
};

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

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { requireAuth, showLoginModal, handleLoginSuccess, closeLoginModal } = useAuthCheck();
    const [car, setCar] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [similarListings, setSimilarListings] = useState([]); // State cho tin đăng tương tự
    const [loading, setLoading] = useState(true);
    const [similarLoading, setSimilarLoading] = useState(false); // Loading cho similar listings
    const [error, setError] = useState(null);
    const [chatLoading, setChatLoading] = useState(false);
    const [favorites, setFavorites] = useState(new Set()); // State cho favorites

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4;

    const startIndex = currentPage * itemsPerPage;
    const visibleListings = similarListings.slice(startIndex, startIndex + itemsPerPage);

    const totalPages = Math.ceil(similarListings.length / itemsPerPage);

    // Dark mode state synced with localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem('landing_dark_mode');
        return stored === 'true';
    });

    useEffect(() => {
        setCurrentPage(0);
    }, [similarListings]);

    // Listen for dark mode changes from Header
    useEffect(() => {
        const handleDarkModeChange = (event) => {
            setIsDarkMode(event.detail.isDarkMode);
        };

        window.addEventListener('darkModeChanged', handleDarkModeChange);
        return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
    }, []);

    const userInfo = localStorage.getItem('userInfo');
    const user = JSON.parse(userInfo);
    console.log('✅ Current user from localStorage:', user);
    console.log('✅ Seller info from localStorage:', sellerInfo);
    const [commentUpdatedAt, setCommentUpdatedAt] = useState(Date.now());


    // Lấy current user ID từ localStorage
    const getCurrentUserId = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const user = JSON.parse(userInfo);
                return user.userId;
            }
        } catch (error) {
            console.error('❌ Error parsing userInfo from localStorage:', error);
        }
        return null;
    };

    const currentUserId = getCurrentUserId();
    const isLoggedIn = !!currentUserId; // Sửa lại isLoggedIn để check đúng

    // Fetch seller information
    const fetchSellerInfo = async (sellerId) => {
        try {
            console.log('🔄 Fetching seller info for:', sellerId);
            const response = await userService.getUserById(sellerId);
            console.log('✅ Seller info response:', response);

            if (response.data && response.data.success && response.data.data) {
                const sellerData = response.data.data;
                setSellerInfo(sellerData);
                console.log('✅ Seller data received:', sellerData);
                return sellerData;
            } else {
                console.warn('⚠️ No seller info found');
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching seller info:', error);
            return null;
        }
    };

    // Fetch similar listings
    const fetchSimilarListings = async (currentItemTypeName, currentListingId) => {
        try {
            setSimilarLoading(true);
            console.log('🔄 Fetching similar listings for:', currentItemTypeName);

            const response = await listingService.getAllListings();

            if (response.success && response.data) {
                // Lọc listings có cùng itemTypeName và loại trừ listing hiện tại
                const similar = response.data
                    .filter(listing =>
                        listing.item?.itemTypeName === currentItemTypeName &&
                        listing.listingId !== currentListingId &&
                        listing.status === 'Active' // Chỉ lấy listings Active
                    )
                    // .slice(0, 4) // Giới hạn 4 tin đăng
                    .map(transformListingToProductCard)
                    .filter(item => item !== null); // Lọc bỏ items null

                console.log('✅ Similar listings found:', similar.length);
                setSimilarListings(similar);
            } else {
                console.warn('⚠️ No similar listings found');
                setSimilarListings([]);
            }
        } catch (error) {
            console.error('❌ Error fetching similar listings:', error);
            setSimilarListings([]);
        } finally {
            setSimilarLoading(false);
        }
    };

    // Kiểm tra xem sản phẩm có phải của chính người dùng hiện tại không
    const isOwnProduct = car && currentUserId && car.seller?.userId === currentUserId;

    // Handle favorite toggle
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

    // Handle product card click
    const handleProductCardClick = (listingId) => {
        navigate(`/product/${listingId}`);
    };

    useEffect(() => {
        const fetchListingDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔄 Fetching listing by ID:', id);

                const response = await listingService.getListingById(id);
                console.log('✅ API Response:', response);

                if (response && response.success && response.data) {
                    const listingData = response.data;
                    console.log('✅ Listing data received:', listingData);

                    let sellerPhone = "";
                    if (listingData.userId) {
                        const sellerData = await fetchSellerInfo(listingData.userId);
                        sellerPhone = sellerData?.phone || "";
                        console.log('📞 Seller phone retrieved:', sellerPhone);
                        console.log('✅ Seller info set in state:', sellerData);
                    }

                    const transformedData = transformListingToCarData(listingData, sellerPhone);

                    if (transformedData) {
                        setCar(transformedData);
                        console.log('✅ Car data transformed successfully with seller phone');

                        // Fetch similar listings sau khi có car data
                        if (listingData.item?.itemTypeName) {
                            await fetchSimilarListings(listingData.item.itemTypeName, listingData.listingId);
                        }
                    } else {
                        setError("Dữ liệu sản phẩm không hợp lệ.");
                    }
                } else {
                    console.error('❌ Invalid response format:', response);
                    setError("Không tìm thấy sản phẩm hoặc sản phẩm không khả dụng.");
                }
            } catch (error) {
                console.error("❌ ProductDetailPage - Error fetching listing:", error);

                if (error.response?.status === 404) {
                    setError("Không tìm thấy sản phẩm. Có thể sản phẩm đã bị xóa hoặc không tồn tại.");
                } else if (error.response?.status === 403) {
                    setError("Bạn không có quyền truy cập sản phẩm này.");
                } else {
                    setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchListingDetail();
        } else {
            setError("ID sản phẩm không hợp lệ.");
            setLoading(false);
        }

        window.scrollTo(0, 0);
    }, [id]);

    // Update car data với seller info khi có sellerInfo
    useEffect(() => {
        if (car && sellerInfo) {
            const updatedCar = {
                ...car,
                seller: {
                    ...car.seller,
                    email: sellerInfo.email || "",
                    phone: sellerInfo.phone || car.seller.phone,
                    fullName: sellerInfo.fullName || car.seller.userName
                }
            };
            setCar(updatedCar);
            console.log('✅ Car data updated with seller info:', updatedCar);
        }
    }, [sellerInfo]);

    const handleChat = async (preset) => {
        if (!car) return;

        requireAuth(async () => {
            try {
                setChatLoading(true);
                const userId = getCurrentUserId();

                if (!userId) {
                    console.error('❌ No user ID found after authentication');
                    alert('Không thể xác định thông tin người dùng. Vui lòng thử đăng nhập lại.');
                    return;
                }

                if (!car.listingId) {
                    console.error('❌ No listingId found for this product');
                    alert('Sản phẩm này chưa được đăng bán hoặc không khả dụng.');
                    return;
                }

                console.log('🔄 Creating conversation for listing:', car.listingId);
                const conversationResponse = await createConversation(car.listingId, userId);

                if (conversationResponse && conversationResponse.data) {
                    const { conversationId, seller, buyer } = conversationResponse.data;

                    if (!conversationId) {
                        console.error('❌ No conversationId in response:', conversationResponse);
                        alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
                        return;
                    }

                    const sellerName = seller?.fullName || seller?.userName || car.seller?.userName || 'Người bán';
                    const buyerName = buyer?.fullName || buyer?.userName || 'Người mua';

                    const chatUrl = `/chat?conversationId=${conversationId}&preset=${encodeURIComponent(preset || '')}&sellerName=${encodeURIComponent(sellerName)}&buyerName=${encodeURIComponent(buyerName)}`;

                    console.log('✅ Navigating to chat:', chatUrl);
                    setTimeout(() => {
                        navigate(chatUrl);
                    }, 200);
                } else {
                    console.error('❌ Invalid response structure:', conversationResponse);
                    alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('❌ Error in handleChat:', error);
                alert('Có lỗi xảy ra khi tạo cuộc trò chuyện. Vui lòng thử lại.');
            } finally {
                setChatLoading(false);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col font-mono min-h-screen relative">
                {/* Background with overlay */}
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
                    style={{
                        backgroundImage: `url(${backgroundPost})`,
                    }}
                >
                    <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
                </div>

                <div className="flex gap-6 p-6 animate-pulse">
                    <div className="basis-3/5 space-y-4">
                        <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`h-96 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className={`p-4 border rounded-lg space-y-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`h-8 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <div className={`h-4 rounded w-2/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        </div>
                    </div>
                    <div className="basis-2/5 space-y-4">
                        <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`h-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className={`h-48 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300"
                    >
                        Quay lại danh sách sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm.</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen relative">
                {/* Background with overlay */}
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
                    style={{
                        backgroundImage: `url(${backgroundPost})`,
                    }}
                >
                    <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
                </div>

                <div className="container mx-auto font-mono relative">
                    <div className="flex flex-1 flex-col p-6">
                        <div className="flex md:flex-row flex-col gap-6">
                            {/* Cột trái: ảnh + info */}
                            <div className="basis-3/5 space-y-6">
                                <div className={`p-4 border rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    }`}>
                                    <DetailImages images={car.images} videoUrl={car.videoUrl} isDarkMode={isDarkMode} />
                                </div>
                                <DetailInfo car={car} isLoggedIn={isLoggedIn} requireAuth={requireAuth} isDarkMode={isDarkMode} />
                            </div>

                            {/* Cột phải */}
                            <div className="basis-2/5 space-y-6">
                                <DetailSummary
                                    car={car}
                                    isLoggedIn={isLoggedIn}
                                    onChat={() => handleChat()}
                                    chatLoading={chatLoading}
                                    isOwnProduct={isOwnProduct}
                                    requireAuth={requireAuth}
                                    isDarkMode={isDarkMode}
                                />
                                <SellerInfoCard
                                    seller={car.seller}
                                    onQuickChat={(q) => handleChat(q)}
                                    isOwnProduct={isOwnProduct}
                                    requireAuth={requireAuth}
                                    isDarkMode={isDarkMode}
                                    listingId={car.listingId}
                                    commentUpdatedAt={commentUpdatedAt}
                                />


                                <CommentsSection
                                    listingId={car.listingId}
                                    currentUser={{
                                        id: currentUserId,
                                        name: user?.fullName || "Người dùng"
                                    }}
                                    sellerInfo={sellerInfo ? {
                                        id: sellerInfo.userId,
                                        name: sellerInfo.fullName
                                    } : {
                                        id: car.seller?.userId,
                                        name: car.seller?.userName || "Người bán"
                                    }}
                                    requireAuth={requireAuth}
                                    isDarkMode={isDarkMode}
                                    onCommentChange={() => setCommentUpdatedAt(Date.now())}
                                />

                            </div>
                        </div>

                        {/* Tin đăng tương tự */}
                        <div
                            className={`p-6 mt-6 border rounded-lg transition-colors duration-500 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                }`}
                        >
                            <h3
                                className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                Tin đăng tương tự
                            </h3>

                            {similarLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`rounded-lg shadow-md overflow-hidden animate-pulse ${isDarkMode ? "bg-gray-700" : "bg-white"
                                                }`}
                                        >
                                            <div className={`h-48 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                                            <div className="p-4 space-y-3">
                                                <div className={`h-4 rounded w-3/4 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                                                <div className={`h-4 rounded w-1/2 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                                                <div className={`h-6 rounded w-1/3 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : visibleListings.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {visibleListings.map((listing) => (
                                            <ProductCard
                                                isDarkMode={isDarkMode}
                                                key={listing.id}
                                                id={listing.id}
                                                image={listing.image}
                                                title={listing.title}
                                                description={listing.description}
                                                price={listing.price}
                                                location={listing.location}
                                                timeAgo={listing.timeAgo}
                                                isFavorite={favorites.has(listing.id)}
                                                onToggleFavorite={handleToggleFavorite}
                                                onClick={() => handleProductCardClick(listing.id)}
                                                showDefaultBorder={true}
                                            />
                                        ))}
                                    </div>

                                    {/* Nút phân trang */}
                                    <div className="flex justify-center items-center gap-4 mt-6">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                            disabled={currentPage === 0}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === 0
                                                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                }`}
                                        >
                                            ← Trước
                                        </button>

                                        <span
                                            className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                                }`}
                                        >
                                            Trang {currentPage + 1}/{totalPages}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(prev + 1, totalPages - 1)
                                                )
                                            }
                                            disabled={currentPage >= totalPages - 1}
                                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage >= totalPages - 1
                                                ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                }`}
                                        >
                                            Tiếp →
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p
                                    className={`text-center py-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                        }`}
                                >
                                    Không có tin đăng tương tự
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={closeLoginModal}
                onLoginSuccess={handleLoginSuccess}
                navigate={navigate}
            />
        </>
    );
}