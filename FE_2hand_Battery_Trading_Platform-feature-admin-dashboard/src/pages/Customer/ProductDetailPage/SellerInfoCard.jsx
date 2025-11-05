import React, { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa6";
import { reviewService } from "../../../services/review/reviewService";

export default function SellerInfoCard({
  seller,
  onQuickChat,
  isOwnProduct,
  isDarkMode,
  listingId,
  commentUpdatedAt 
}) {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🟢 Lấy tổng số bình luận của người bán (theo listing)
  useEffect(() => {
    if (!listingId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await reviewService.getReviewsByListing(listingId);

        if (res?.success && Array.isArray(res.data)) {
          // Đếm tất cả review có comment (không cần rating)
          const comments = res.data.filter(
            (r) => r.comment && r.comment.trim().length > 0
          );
          setCommentCount(comments.length);
        } else {
          console.warn("⚠️ API không trả về dữ liệu hợp lệ:", res);
          setCommentCount(0);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy bình luận người bán:", err);
        setCommentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [listingId, commentUpdatedAt]);

  return (
    <section
      className={`rounded-lg p-4 md:p-5 border transition-colors duration-500 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={seller?.avatarUrl || "https://placehold.co/48x48"}
          alt={seller?.userName}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="min-w-0">
          <div
            className={`font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {seller?.userName || "Người bán"}
          </div>

          <div
            className={`text-sm flex flex-wrap items-center gap-x-5 gap-y-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {loading ? (
              <span className="text-gray-400 text-sm">Đang tải...</span>
            ) : (
              <p className="inline-flex items-center gap-1">
                <FaCommentDots className="text-emerald-500" />
                {commentCount} bình luận
              </p>
            )}
          </div>

          <div
            className={`mt-1 text-xs flex flex-wrap gap-x-5 gap-y-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p className="text-green-600">• Đang hoạt động</p>
            <p>
              • Phản hồi: <span className="text-green-600">70%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ẩn phần Chat nhanh nếu đây là sản phẩm của chính mình */}
      {!isOwnProduct && (
        <>
          <div
            className={`mt-3 font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Chat nhanh:
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Xe này còn không ạ?", "Giá xe có thể thương lượng?"].map(
              (q, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm border transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => onQuickChat?.(q)}
                >
                  {q}
                </button>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}
