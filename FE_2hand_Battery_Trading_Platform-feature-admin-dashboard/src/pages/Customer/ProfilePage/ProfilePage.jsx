import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiCalendar, FiPhone, FiAward, FiKey } from "react-icons/fi";
import { userService } from "../../../services/users/userService";
import { userPackageService } from "../../../services/users/userPackageService";
import { tokenService } from "../../../services/auth/tokenService";
import avatarMale from "../../../assets/img/avatar-male.png";
import avatarFemale from "../../../assets/img/avatar-female.png";
import avatarDefault from "../../../assets/img/default-avatar.png";
import backgroundPost from '../../../assets/img/backgroundpost.png';
import PhoneUpdateModal from "../../../components/PhoneUpdateModal/PhoneUpdateModal";

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPhoneUpdateModal, setShowPhoneUpdateModal] = useState(false);
    const [activeTab, setActiveTab] = useState("profile"); // profile hoặc packages
    const [userPackages, setUserPackages] = useState([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(false);
    
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

    // Hàm lấy thông tin gói đăng tin
    const fetchUserPackages = async () => {
        try {
            setIsLoadingPackages(true);
            const response = await userPackageService.getUserPackages();
            console.log('📦 User Packages API Response:', response);
            
            // Response structure mới: response.data.packages là array
            const packages = response?.data?.packages || response?.data;
            
            if (response?.success && Array.isArray(packages)) {
                // ✅ Data là array các packages từ API
                setUserPackages(packages);
                console.log('✅ User packages loaded:', {
                    total: packages.length,
                    packages: packages.map(pkg => ({
                        name: pkg.feeCommission?.feeName,
                        status: pkg.status,
                        remaining: `${pkg.remainingListings}/${pkg.feeCommission?.maxListings}`,
                        expiredAt: pkg.expiredAt
                    }))
                });
            } else {
                console.warn('⚠️ No packages data or invalid format');
                setUserPackages([]);
            }
        } catch (error) {
            console.error('❌ Error fetching user packages:', error);
            setUserPackages([]);
        } finally {
            setIsLoadingPackages(false);
        }
    };

    // Hàm lấy thông tin tài khoản từ API - giữ lại cách lấy từ localStorage của API login
    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            
            // ✅ Lấy userId từ tokenService (từ response API login đã lưu vào localStorage)
                const userInfo = tokenService.getUserInfo();
            const userId = userInfo?.userId || localStorage.getItem("id") || JSON.parse(localStorage.getItem("user"))?.userId;

                if (!userId) {
                    console.warn("Không tìm thấy userId trong tokenService (có thể user chưa đăng nhập).");
                navigate("/");
                return;
            }

            // Lấy thông tin từ tokenService trước
            let avatar = userInfo?.avatar || null;
            let gender = userInfo?.gender || localStorage.getItem("gender");
            
            // Set avatar mặc định theo giới tính
            if (!avatar) {
                if (gender?.toUpperCase() === "MALE") {
                    avatar = avatarMale;
                } else if (gender?.toUpperCase() === "FEMALE") {
                    avatar = avatarFemale;
                } else {
                    avatar = avatarDefault;
                }
            }

            // Set thông tin cơ bản từ tokenService
            setFormData({
                fullName: userInfo?.fullName || "",
                email: userInfo?.email || "",
                dateOfBirth: userInfo?.dateOfBirth || "",
                sex: gender || "",
                identityCard: userInfo?.identityCard || "",
                phoneNumber: userInfo?.phone || userInfo?.phoneNumber || "",
                address: userInfo?.address || "",
                avatar: avatar,
                role: userInfo?.role || "User",
                score: 0,
                finalScore: 0,
                updatedDate: userInfo?.updatedDate || "",
                rank: "Thành viên",
                rankImage: "",
            });


            // --- Fetch chi tiết user profile từ API ---
                try {
                    const userResponse = await userService.getUserById(userId);
                    console.log('📊 User API Response:', userResponse.data);
                    
                    if (userResponse.data?.success && userResponse.data?.data) {
                        const userData = userResponse.data.data;
                        console.log('✅ User data from API:', userData);
                        
                    setFormData(prev => ({
                            ...prev,
                        fullName: userData.fullName || prev.fullName,
                        email: userData.email || prev.email,
                        phoneNumber: userData.phone || prev.phoneNumber,
                            // Keep avatar, address from localStorage if not in API
                            avatar: userData.avatar || prev.avatar,
                        address: userData.address || prev.address,
                            // Add new fields from API
                            userId: userData.userId,
                            status: userData.status,
                            createdAt: userData.createdAt,
                        }));
                    }
                } catch (err) {
                console.error("❌ User profile API error:", err);
                }

        } catch (err) {
            console.error("Không lấy được thông tin cá nhân!", err);
            } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const user = tokenService.getUserInfo();
        if (!user) {
            navigate("/");
            return;
        }
        fetchProfile();
        fetchUserPackages(); // Fetch packages khi load trang
        window.scrollTo(0, 0);
    }, [navigate]);

    return (
        <div className="relative min-h-screen w-full font-sans" style={{ fontFamily: 'Inter, Montserrat, Roboto, Arial, sans-serif' }}>
            {/* Background with overlay */}
            <div 
                className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
                style={{
                    backgroundImage: `url(${backgroundPost})`,
                }}
            >
                <div className={`absolute inset-0 backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/70'}`}></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    <main id="profile-main-content">
                        <div className={`rounded-2xl shadow-xl overflow-hidden border-2 border-[#00c9a7] transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00c9a7]"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Header với Avatar */}
                                    <div className="bg-gradient-to-r from-[#00c9a7] to-[#00b396] px-8 py-10">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="relative">
                            <img
                                src={formData?.avatar || avatarDefault}
                                                    alt="User Avatar"
                                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                                                />
                        </div>
                                            <div className="text-center md:text-left flex-1">
                                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {formData?.fullName || ""}
                                                </h2>
                                                <p className="text-white/90 text-sm mb-3">
                                                    {formData?.email || ""}
                                                </p>
                                                {formData?.status === "1" && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#00c9a7]">
                                                        ✓ Tài khoản đang hoạt động
                                </span>
                                )}
                            </div>
                            </div>
                            </div>

                                    {/* Tabs Navigation */}
                                    <div className={`border-b transition-colors duration-500 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex">
                                            <button
                                                onClick={() => setActiveTab("profile")}
                                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                                                    activeTab === "profile"
                                                        ? `text-[#00c9a7] border-b-2 border-[#00c9a7] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`
                                                        : isDarkMode 
                                                            ? 'text-gray-300 hover:text-[#00c9a7] hover:bg-gray-700'
                                                            : 'text-gray-600 hover:text-[#00c9a7] hover:bg-white/50'
                                                }`}
                                            >
                                                <FiUser className="inline-block mr-2" />
                                                Thông tin cá nhân
                                            </button>
                                <button
                                                onClick={() => setActiveTab("packages")}
                                                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                                                    activeTab === "packages"
                                                        ? `text-[#00c9a7] border-b-2 border-[#00c9a7] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`
                                                        : isDarkMode 
                                                            ? 'text-gray-300 hover:text-[#00c9a7] hover:bg-gray-700'
                                                            : 'text-gray-600 hover:text-[#00c9a7] hover:bg-white/50'
                                                }`}
                                            >
                                                <FiAward className="inline-block mr-2" />
                                                Gói đăng tin của bạn
                            </button>
                        </div>
                                </div>

                                    {/* Nội dung theo Tab */}
                                    <div className="p-8">
                                    {activeTab === "profile" && (
                                            <>
                                                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    <FiUser className="text-[#00c9a7]" />
                                                    Thông tin cá nhân
                                            </h3>

                                            {formData ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Họ và tên */}
                                                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00c9a7]/10 flex items-center justify-center">
                                                        <FiUser className="text-xl text-[#00c9a7]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Họ và tên</p>
                                                        <p className={`text-base font-semibold break-words transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {formData.fullName}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Email */}
                                                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00c9a7]/10 flex items-center justify-center">
                                                        <FiMail className="text-xl text-[#00c9a7]" />
                                            </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Địa chỉ Email</p>
                                                        <p className={`text-base break-words transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {formData.email}
                                                            </p>
                                                        </div>
                                                </div>

                                                {/* Số điện thoại */}
                                                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00c9a7]/10 flex items-center justify-center">
                                                        <FiPhone className="text-xl text-[#00c9a7]" />
                                        </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Số điện thoại</p>
                                                        <p className={`text-base break-words transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {formData.phoneNumber || (
                                                                <span className="text-gray-400 italic">Chưa cập nhật</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Ngày tạo tài khoản */}
                                                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#00c9a7]/10 flex items-center justify-center">
                                                        <FiCalendar className="text-xl text-[#00c9a7]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ngày tạo tài khoản</p>
                                                        <p className={`text-base transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {formData.createdAt
                                                                ? new Date(formData.createdAt).toLocaleDateString("vi-VN", {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : "Chưa có thông tin"}
                                                            </p>
                                                        </div>
                                                </div>
                                                </div>
                                            ) : (
                                            <p className={`text-center py-8 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Không có thông tin chi tiết để hiển thị.</p>
                                        )}

                                                {/* Action button */}
                                                <div className={`flex justify-center mt-8 pt-6 border-t transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                    <button
                                                        onClick={() => setShowPhoneUpdateModal(true)}
                                                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#00c9a7] hover:bg-[#00b396] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                                    >
                                                        <FiKey />
                                                        Cập nhật thông tin
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {activeTab === "packages" && (
                                            <>
                                                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    <FiAward className="text-[#00c9a7]" />
                                                    Gói đăng tin của bạn
                                                </h3>

                                                {isLoadingPackages ? (
                                                    <div className="flex justify-center items-center h-40">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00c9a7]"></div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {userPackages.length > 0 ? (
                                                            userPackages.map((pkg, index) => (
                                                                <div key={index} className={`rounded-xl border-2 overflow-hidden transition-colors duration-500 ${
                                                                    pkg.status === 'Active' 
                                                                        ? `border-[#00c9a7] ${isDarkMode ? 'bg-gray-700' : 'bg-white'}` 
                                                                        : isDarkMode 
                                                                            ? 'bg-gray-700/50 border-gray-600' 
                                                                            : 'bg-gray-50 border-gray-300'
                                                                }`}>
                                                                    {/* Header compact */}
                                                                    <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                        <div>
                                                                            <h4 className={`text-base font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                                {pkg.feeCommission?.feeName || 'Gói đăng tin'}
                                                                            </h4>
                                                                            <p className={`text-xs mt-0.5 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                {pkg.feeCommission?.description || 'Không có mô tả'}
                                                                            </p>
                                                                        </div>
                                                                        {pkg.status === 'Active' && (
                                                                            <span className="px-2 py-1 bg-[#00c9a7] text-white text-xs font-semibold rounded">
                                                                                Đang dùng
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Body compact */}
                                                                    <div className="p-4">
                                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                                            {/* Tin còn lại */}
                                                                            <div className={`text-center p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-50'}`}>
                                                                                <p className={`text-xs mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tin còn lại</p>
                                                                                <p className="text-xl font-bold text-[#00c9a7]">
                                                                                    {pkg.remainingListings}/{pkg.feeCommission?.maxListings || 0}
                                                                                </p>
                                                                            </div>
                                                                            
                                                                            {/* Hết hạn */}
                                                                            <div className={`text-center p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-50'}`}>
                                                                                <p className={`text-xs mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hết hạn</p>
                                                                                <p className="text-sm font-bold text-red-600">
                                                                                    {pkg.expiredAt ? new Date(pkg.expiredAt).toLocaleDateString("vi-VN") : 'N/A'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Thông tin chi tiết */}
                                                                        <div className={`mt-3 pt-3 border-t space-y-1.5 text-xs transition-colors duration-500 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                            <div className="flex justify-between">
                                                                                <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Kích hoạt:</span>
                                                                                <span className={`font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                                    {pkg.activatedAt ? new Date(pkg.activatedAt).toLocaleDateString("vi-VN") : 'N/A'}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            {pkg.totalAmount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Giá trị:</span>
                                                                                    <span className={`font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                                        {(pkg.totalAmount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {pkg.feeCommission?.savingAmount > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tiết kiệm:</span>
                                                                                    <span className="font-semibold text-green-600">
                                                                                        {(pkg.feeCommission.savingAmount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VNĐ
                                                                                    </span>
                                                                                </div>
                                            )}
                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-12">
                                                                <FiAward className={`mx-auto text-6xl mb-4 transition-colors duration-500 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                                                <p className={`mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bạn chưa có gói đăng tin nào</p>
                                                                <p className={`text-sm mb-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    Hãy nâng cấp gói để đăng nhiều tin hơn và có thêm nhiều tính năng hấp dẫn!
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="text-center py-8">
                                                            <button
                                                                onClick={() => navigate('/plans')}
                                                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[#00c9a7] font-semibold border-2 border-[#00c9a7] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
                                                            >
                                                                <FiAward />
                                                                {userPackages.length > 0 ? 'Nâng cấp gói đăng tin' : 'Xem các gói đăng tin'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                    )}
                                </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* PhoneUpdateModal */}
            <PhoneUpdateModal
                isOpen={showPhoneUpdateModal}
                onClose={() => setShowPhoneUpdateModal(false)}
                onSuccess={() => {
                    setShowPhoneUpdateModal(false);
                    fetchProfile(); // Refresh profile data sau khi cập nhật
                }}
            />
        </div>
    );
};

export default ProfilePage;

// import { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import { FaStar, FaMapMarkerAlt, FaBox, FaCheckCircle, FaHeart, FaRegAddressCard, FaRegUserCircle, FaPhone, FaEdit } from "react-icons/fa";
// import { CiSun } from "react-icons/ci";
// import { userService } from "../../../services/users/userService";
// import { listingService } from "../../../services/listings/listingService";
// import ProductCard from "../LandingPage/ProductCard";
// import { tokenService } from "../../../services/auth/tokenService";
// import { useNavigate } from "react-router-dom";

// // Utility: Transform API data
// const transformItemToProduct = (item) => {
//     const calculateTimeAgo = (createdAt) => {
//         const now = new Date();
//         const created = new Date(createdAt);
//         const diffMs = now - created;
//         const diffMins = Math.floor(diffMs / 60000);
//         const diffHours = Math.floor(diffMs / 3600000);
//         const diffDays = Math.floor(diffMs / 86400000);

//         if (diffMins < 1) return "Vừa xong";
//         if (diffMins < 60) return `${diffMins} phút trước`;
//         if (diffHours < 24) return `${diffHours} giờ trước`;
//         return `${diffDays} ngày trước`;
//     };

//     return {
//         id: item.itemId,
//         image: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
//         title: item.title,
//         description: `${item.brand || ''} ${item.model || ''} - ${item.condition || ''}`.trim(),
//         price: item.price,
//         location: item.userName ? `Người bán: ${item.userName}` : "Việt Nam",
//         timeAgo: calculateTimeAgo(item.createdAt),
//     };
// };

// const ProfilePage = () => {
//     const navigate = useNavigate();
//     const [isDarkMode, setIsDarkMode] = useState(false);

//     const [userProfile, setUserProfile] = useState({
//         fullName: "",
//         role: "",
//         phoneNumber: "",
//         joinDate: "",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//         location: "",
//         bio: "",
//     });

//     const [myItems, setMyItems] = useState([]);
//     const [myListings, setMyListings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [activeTab, setActiveTab] = useState("items");
//     const [favorites, setFavorites] = useState(new Set());

//     useEffect(() => {
//         const user = tokenService.getUserInfo();
//         if (!user) {
//             navigate("/");
//         }
//     }, [navigate]);

//     // Fetch user data
//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const userInfo = tokenService.getUserInfo();
//                 const userId = userInfo?.userId;

//                 if (!userId) {
//                     console.warn("Không tìm thấy userId trong tokenService");
//                     return;
//                 }

//                 if (userInfo) {
//                     setUserProfile(prev => ({
//                         ...prev,
//                         fullName: userInfo.fullName || prev.fullName,
//                         role: userInfo.role || prev.role,
//                         phoneNumber: userInfo.phone || userInfo.phoneNumber || prev.phoneNumber,
//                         joinDate: userInfo.joinDate || prev.joinDate,
//                     }));
//                 }

//                 // Fetch user's items
//                 try {
//                     const itemsResponse = await userService.getUserItems(userId);
//                     if (itemsResponse.data?.success) {
//                         const items = itemsResponse.data?.data || [];
//                         const transformedItems = Array.isArray(items)
//                             ? items.map(transformItemToProduct)
//                             : [];
//                         setMyItems(transformedItems);
//                     } else {
//                         setMyItems([]);
//                     }
//                 } catch (err) {
//                     setMyItems([]);
//                 }

//                 // Fetch user's listings
//                 try {
//                     const listingsResponse = await listingService.getListingsByUserId(userId);
//                     if (listingsResponse.data?.success && listingsResponse.data?.data) {
//                         const listings = listingsResponse.data.data;
//                         const transformedListings = listings.map(listing => ({
//                             id: listing.listingId,
//                             title: listing.itemTitle || listing.item?.title || "Không có tiêu đề",
//                             price: listing.buyNowPrice || listing.item?.price || 0,
//                             image: listing.item?.imageUrls?.[0] || "/placeholder.png",
//                             type: listing.listingType,
//                             status: listing.status,
//                             address: listing.address,
//                             startDate: listing.startDate,
//                             endDate: listing.endDate,
//                             warranty: listing.warranty,
//                         }));
//                         setMyListings(transformedListings);
//                     } else {
//                         setMyListings([]);
//                     }
//                 } catch (err) {
//                     setMyListings([]);
//                 }

//                 // Fetch user profile
//                 try {
//                     const userResponse = await userService.getUserById(userId);
//                     if (userResponse.data) {
//                         const userData = userResponse.data;
//                         setUserProfile(prev => ({
//                             ...prev,
//                             name: userData.name || prev.name,
//                             avatar: userData.avatar || prev.avatar,
//                             location: userData.location || prev.location,
//                             bio: userData.bio || prev.bio,
//                         }));
//                     }
//                 } catch (err) {
//                     console.log("User profile API error:", err.message);
//                 }

//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserData();
//         window.scrollTo(0, 0);
//     }, []);

//     const handleToggleFavorite = (id, isFavorite) => {
//         setFavorites(prev => {
//             const newFavorites = new Set(prev);
//             if (isFavorite) {
//                 newFavorites.add(id);
//             } else {
//                 newFavorites.delete(id);
//             }
//             return newFavorites;
//         });
//     };

//     const handleToggleDarkMode = () => {
//         setIsDarkMode(prev => !prev);
//     };

//     const stats = [
//         {
//             icon: FaBox,
//             label: "Sản phẩm đang bán",
//             value: myItems.length,
//             color: "emerald",
//             gradient: "from-emerald-500 to-green-400"
//         },
//         {
//             icon: FaCheckCircle,
//             label: "Tin đang hoạt động",
//             value: myListings.length,
//             color: "blue",
//             gradient: "from-blue-500 to-cyan-400"
//         },
//         {
//             icon: FaHeart,
//             label: "Sản phẩm yêu thích",
//             value: favorites.size,
//             color: "rose",
//             gradient: "from-rose-500 to-pink-400"
//         },
//         {
//             icon: FaStar,
//             label: "Đánh giá",
//             value: "4.8",
//             color: "amber",
//             gradient: "from-amber-500 to-yellow-400"
//         }
//     ];

//     return (
//         <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'}`}>
//             {/* Dark Mode Toggle */}
//             <button
//                 onClick={handleToggleDarkMode}
//                 className={`fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
//                     isDarkMode 
//                     ? 'bg-gray-700 text-amber-300 hover:bg-gray-600' 
//                     : 'bg-white text-amber-500 hover:bg-amber-50 border border-amber-200'
//                 }`}
//                 aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
//             >
//                 <CiSun className="w-6 h-6" />
//             </button>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Profile Header */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className={`relative rounded-2xl p-8 mb-8 overflow-hidden ${
//                         isDarkMode 
//                         ? 'bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl' 
//                         : 'bg-gradient-to-br from-white to-gray-50 shadow-xl'
//                     }`}
//                 >
//                     {/* Background Pattern */}
//                     <div className="absolute inset-0 opacity-5">
//                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400"></div>
//                     </div>
                    
//                     <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
//                         {/* Avatar Section */}
//                         <div className="flex-shrink-0">
//                             <div className="relative">
//                                 <motion.img
//                                     whileHover={{ scale: 1.05 }}
//                                     src={userProfile.avatar}
//                                     alt={userProfile.fullName}
//                                     className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
//                                     onError={(e) => {
//                                         e.target.onerror = null;
//                                         e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
//                                     }}
//                                 />
//                                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
//                                     <FaEdit className="w-3 h-3 text-white" />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* User Info */}
//                         <div className="flex-1 text-center lg:text-left">
//                             <motion.h1 
//                                 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 transition={{ delay: 0.2 }}
//                             >
//                                 {userProfile.fullName || "Chưa có tên"}
//                             </motion.h1>
                            
//                             <motion.p 
//                                 className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 transition={{ delay: 0.3 }}
//                             >
//                                 {userProfile.role || "Người dùng"}
//                             </motion.p>

//                             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
//                                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
//                                 }`}>
//                                     <FaPhone className="w-4 h-4 text-emerald-500" />
//                                     <span className="font-medium">{userProfile.phoneNumber || "Chưa có số điện thoại"}</span>
//                                 </div>
                                
//                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
//                                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
//                                 }`}>
//                                     <FaMapMarkerAlt className="w-4 h-4 text-blue-500" />
//                                     <span className="font-medium">{userProfile.location || "Chưa có địa chỉ"}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Edit Button */}
//                         <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             className="group relative bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
//                         >
//                             <span className="relative z-10 flex items-center gap-2">
//                                 <FaEdit className="w-4 h-4" />
//                                 Chỉnh sửa hồ sơ
//                             </span>
//                             <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                         </motion.button>
//                     </div>
//                 </motion.div>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//                     {stats.map((stat, index) => (
//                         <motion.div
//                             key={stat.label}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.5, delay: index * 0.1 }}
//                             className={`relative rounded-2xl p-6 overflow-hidden group cursor-pointer ${
//                                 isDarkMode ? 'bg-gray-800' : 'bg-white'
//                             } shadow-lg hover:shadow-xl transition-all duration-300`}
//                         >
//                             {/* Gradient Background */}
//                             <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                            
//                             <div className="relative z-10 flex items-center justify-between">
//                                 <div>
//                                     <p className={`text-sm font-medium mb-1 ${
//                                         isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                                     }`}>
//                                         {stat.label}
//                                     </p>
//                                     <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
//                                         {stat.value}
//                                     </p>
//                                 </div>
//                                 <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                                     <stat.icon className="w-6 h-6" />
//                                 </div>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>

//                 {/* Content Tabs */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.4 }}
//                     className={`rounded-2xl p-8 ${
//                         isDarkMode ? 'bg-gray-800' : 'bg-white'
//                     } shadow-xl`}
//                 >
//                     {/* Tab Headers */}
//                     <div className="flex flex-wrap gap-4 mb-8 border-b pb-4">
//                         {[
//                             { id: "items", label: "Sản phẩm của tôi", count: myItems.length },
//                             { id: "listings", label: "Tin đăng của tôi", count: myListings.length },
//                             { id: "favorites", label: "Yêu thích", count: favorites.size }
//                         ].map((tab) => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveTab(tab.id)}
//                                 className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
//                                     activeTab === tab.id
//                                         ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg'
//                                         : isDarkMode
//                                         ? 'text-gray-400 hover:text-white hover:bg-gray-700'
//                                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                                 }`}
//                             >
//                                 {tab.label}
//                                 <span className={`px-2 py-1 text-xs rounded-full ${
//                                     activeTab === tab.id
//                                         ? 'bg-white text-emerald-600'
//                                         : isDarkMode
//                                         ? 'bg-gray-600 text-gray-300'
//                                         : 'bg-gray-200 text-gray-600'
//                                 }`}>
//                                     {tab.count}
//                                 </span>
//                             </button>
//                         ))}
//                     </div>

//                     {/* Tab Content */}
//                     {loading ? (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                             {[1, 2, 3, 4].map((i) => (
//                                 <div key={i} className={`rounded-2xl overflow-hidden ${
//                                     isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
//                                 } animate-pulse`}>
//                                     <div className="h-48 bg-gray-600"></div>
//                                     <div className="p-4 space-y-3">
//                                         <div className="h-4 bg-gray-600 rounded w-3/4"></div>
//                                         <div className="h-4 bg-gray-600 rounded w-1/2"></div>
//                                         <div className="h-6 bg-gray-600 rounded w-1/3"></div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                             {(activeTab === "items" ? myItems : activeTab === "listings" ? myListings : []).map((item, index) => (
//                                 <motion.div
//                                     key={item.id}
//                                     initial={{ opacity: 0, scale: 0.9 }}
//                                     animate={{ opacity: 1, scale: 1 }}
//                                     transition={{ duration: 0.4, delay: index * 0.1 }}
//                                     className="transform hover:scale-105 transition-transform duration-300"
//                                 >
//                                     <ProductCard
//                                         id={item.id}
//                                         image={item.image}
//                                         title={item.title}
//                                         description={item.description}
//                                         price={item.price}
//                                         location={item.location}
//                                         timeAgo={item.timeAgo}
//                                         isFavorite={favorites.has(item.id)}
//                                         onToggleFavorite={handleToggleFavorite}
//                                         onClick={() => navigate(`/product/${item.id}`)}
//                                         darkMode={isDarkMode}
//                                     />
//                                 </motion.div>
//                             ))}
//                         </div>
//                     )}

//                     {/* Empty State */}
//                     {!loading && (activeTab === "items" ? myItems : activeTab === "listings" ? myListings : []).length === 0 && (
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             className="text-center py-12"
//                         >
//                             <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
//                                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
//                             }`}>
//                                 <FaBox className={`w-12 h-12 ${
//                                     isDarkMode ? 'text-gray-500' : 'text-gray-400'
//                                 }`} />
//                             </div>
//                             <h3 className={`text-xl font-semibold mb-2 ${
//                                 isDarkMode ? 'text-gray-300' : 'text-gray-600'
//                             }`}>
//                                 {activeTab === "items" ? "Chưa có sản phẩm nào" : "Chưa có tin đăng nào"}
//                             </h3>
//                             <p className={`mb-6 ${
//                                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                             }`}>
//                                 {activeTab === "items" 
//                                     ? "Bắt đầu thêm sản phẩm đầu tiên của bạn" 
//                                     : "Tạo tin đăng đầu tiên để bán sản phẩm"}
//                             </p>
//                             <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
//                             >
//                                 {activeTab === "items" ? "Thêm sản phẩm" : "Đăng tin mới"}
//                             </motion.button>
//                         </motion.div>
//                     )}
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default ProfilePage;