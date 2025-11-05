import React, { useState, useEffect } from "react";
import PhoneNumber from "./PhoneNumber";
import { FaPhone, FaClock, FaLocationDot, FaRegHeart, FaHeart } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { userService } from "../../../services/users/userService";
import { toast } from "react-toastify";

export default function DetailSummary({ car, isLoggedIn, onChat, chatLoading, isOwnProduct, requireAuth, isDarkMode }) {
    const [isSaved, setIsSaved] = useState(false); // thêm state để lưu trạng thái
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);



    useEffect(() => {
        const initFavoriteStatus = async () => {
            if (!car?.listingId) return;

            const userId = await userService.getCurrentUserId();
            setCurrentUserId(userId);

            if (!userId || !isLoggedIn) {
                setIsSaved(false);
                return;
            }

            try {
                const res = await userService.getFavoritesByUser(userId);


                let favorites = [];

                if (res.data?.success && Array.isArray(res.data.data)) {
                    favorites = res.data.data; // API trả { success: true, data: [...] }
                } else if (Array.isArray(res.data)) {
                    favorites = res.data; // API trả trực tiếp mảng
                }

                const isFav = favorites.some(fav =>
                    fav.listingId === car.listingId || fav.id === car.listingId
                );
                setIsSaved(isFav);
            } catch (error) {
                console.error("Lỗi kiểm tra yêu thích:", error);
                setIsSaved(false);
            }
        };

        initFavoriteStatus();
    }, [car?.listingId, isLoggedIn]);


    const handleSaveClick = async (e) => {
        e.stopPropagation();

        if (!isLoggedIn || !currentUserId) {
            toast.error("Vui lòng đăng nhập để lưu tin!");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        try {
            await userService.toggleFavorite(currentUserId, car.listingId);
            const newState = !isSaved;
            setIsSaved(newState);

            if (newState) {
                toast.success("Đã thêm vào danh sách yêu thích");
            } else {
                toast.error("Đã xóa khỏi danh sách yêu thích");
            }
        } catch (error) {
            const msg = error.response?.data?.errors?.[0]
                || error.response?.data?.message
                || "Không thể lưu tin. Vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };
    const locationText = `${car.location}`;
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const priceText = `${(car.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ${car.priceCurrency || "VNĐ"}`;

    return (
        <section className={`rounded-lg border p-4 md:p-5 shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            {/* Title + Save */}
            <header className="flex items-start justify-between gap-3">
                <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {car.title}
                </h1>
                <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={isLoading || !isLoggedIn}
                    className={`shrink-0 inline-flex p-3 h-10 w-auto items-center justify-center rounded-full border hover:bg-gray-50 flex-row gap-2 transition-all
            ${isSaved ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-700"}
            ${isLoading || !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label="Lưu tin"
                    title={isSaved ? "Bỏ lưu" : "Lưu"}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : isSaved ? (
                        <FaHeart className="text-pink-600" />
                    ) : (
                        <FaRegHeart />
                    )}
                    <p className="font-semibold">{isLoading ? "Đang..." : "Lưu"}</p>
                </button>
            </header>

            {/* Price */}
            <div className="mt-2 text-red-500 font-bold text-xl md:text-2xl">
                {priceText}
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Ẩn button Chat nếu đây là sản phẩm của chính mình */}
                {!isOwnProduct && (
                    <button
                        type="button"
                        onClick={() => onChat?.()}
                        disabled={chatLoading}
                        className={`inline-flex items-center justify-center rounded-md px-5 py-2 font-semibold gap-2 transition-colors duration-300 ${chatLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isDarkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                    >
                        <IoChatboxEllipsesOutline />
                        <p>{chatLoading ? 'Đang tạo...' : 'Chat'}</p>
                    </button>
                )}

                <PhoneNumber
                    phone={car.seller?.phone}
                    isLoggedIn={isLoggedIn}
                    requireAuth={requireAuth}
                    className="flex items-center rounded-md border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-500 px-5 py-2"
                    label="" // ẩn chữ "SĐT liên hệ"
                    maskedPrefix={6}
                    icon={<FaPhone className="text-xl" />}
                />
            </div>

            {/* Meta */}
            <ul className={`mt-3 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center gap-2">
                    <FaLocationDot className="text-md" />
                    <span>{locationText}</span>
                </li>
                <li className="flex items-center gap-2">
                    <FaClock className="text-md" />
                    <span>Đăng {car.postedTime}</span>
                </li>
            </ul>
        </section>
    );
}
