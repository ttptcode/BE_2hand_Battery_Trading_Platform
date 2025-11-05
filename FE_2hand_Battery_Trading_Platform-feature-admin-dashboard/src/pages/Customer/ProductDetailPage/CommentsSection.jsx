import React, { useState, useEffect } from "react";
import {
  FaPaperPlane,
  FaCommentDots,
  FaEdit,
  FaTrash,
  FaReply,
} from "react-icons/fa";
import { reviewService } from "../../../services/review/reviewService";

// ================== Helper ==================
function timeAgo(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return `${Math.floor(diff / 86400)} ngày`;
}

function Avatar({ src, alt }) {
  return (
    <img
      src={src || "https://i.pravatar.cc/100?img=12"}
      alt={alt || "avatar"}
      className="h-9 w-9 rounded-full object-cover"
    />
  );
}

function SellerBadge() {
  return (
    <span className="ml-2 rounded px-2 py-[2px] text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      Người bán
    </span>
  );
}

// ================== Comment Item ==================
function CommentItem({
  comment,
  currentUser,
  onReplySubmit,
  onEditSubmit,
  onDelete,
  isDarkMode,
  isReply = false,
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);

  const canEdit = currentUser?.id === comment.reviewerId;

  const bg = isDarkMode
    ? isReply
      ? "bg-gray-700"
      : "bg-gray-800"
    : isReply
      ? "bg-gray-100"
      : "bg-gray-50";

  return (
    <li className={`flex gap-3 ${isReply ? "ml-8" : ""}`}>
      <Avatar src={comment.reviewerAvatar} />
      <div className="flex-1">
        <div className={`rounded-xl px-3 py-2 ${bg}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
            >
              {comment.reviewerName || "Ẩn danh"}
            </span>
            {comment.isSeller && <SellerBadge />}
            <span className="text-xs text-gray-400">
              · {timeAgo(comment.createdAt)}
            </span>
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-black"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => {
                    onEditSubmit(comment.reputationReviewId, editText);
                    setEditing(false);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 bg-gray-300 rounded-md text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`mt-1 whitespace-pre-line ${isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
            >
              {comment.comment}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          {canEdit && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 hover:text-blue-500"
              >
                <FaEdit size={12} /> Sửa
              </button>
              <button
                onClick={() => onDelete(comment.reputationReviewId)}
                className="inline-flex items-center gap-1 hover:text-red-500"
              >
                <FaTrash size={12} /> Xóa
              </button>
            </>
          )}
        </div>

        {/* Replies */}
        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <ul className="mt-3 space-y-3">
            {comment.replies.map((r) => (
              <CommentItem
                key={r.reputationReviewId}
                comment={r}
                currentUser={currentUser}
                onReplySubmit={onReplySubmit}
                onEditSubmit={onEditSubmit}
                onDelete={onDelete}
                isDarkMode={isDarkMode}
                isReply={true}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

// ================== Composer ==================
function Composer({ onSubmit, isDarkMode }) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0;

  return (
    <div
      className={`border-t px-4 py-3 space-y-3 mb-2 transition-colors duration-500 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        }`}
    >
      <div
        className={`flex items-center gap-2 rounded-full pl-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
      >
        <input
          type="text"
          className={`w-full bg-transparent py-3 outline-none ${isDarkMode ? "text-gray-100 placeholder-gray-400" : ""
            }`}
          placeholder="Bình luận..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          aria-label="Gửi bình luận"
          disabled={!canSend}
          onClick={() => {
            if (!canSend) return;
            onSubmit?.(value);
            setValue("");
          }}
          className={`inline-flex h-12 w-auto px-3 gap-2 items-center justify-center rounded-full transition-all duration-200 shadow-sm ${canSend
              ? "bg-[#00C9A7] text-white hover:bg-[#0D7C5C] hover:scale-105"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
        >
          <FaPaperPlane className="text-lg" />
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
}

function LoginPrompt({ requireAuth, isDarkMode }) {
  return (
    <div
      className={`border-t border-gray-200 px-4 py-6 mb-2 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
    >
      <div className="flex flex-col items-center justify-center py-4">
        <FaCommentDots className={`text-3xl mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
        <p className={`font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          Đăng nhập để có thể bình luận
        </p>
        <button
          onClick={() => {
            if (requireAuth) {
              requireAuth(() => {
                // Sau khi đăng nhập thành công, page sẽ reload và hiển thị form bình luận
                window.location.reload();
              });
            }
          }}
          className={`mt-3 px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-sm ${isDarkMode
              ? "bg-[#00C9A7] text-white hover:bg-[#0D7C5C]"
              : "bg-[#00C9A7] text-white hover:bg-[#0D7C5C]"
            }`}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

// ================== Main ==================
export default function CommentsSection({
  listingId,
  currentUser,
  sellerInfo,
  isDarkMode = false,
  onCommentChange,
  requireAuth
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10); // 👈 số bình luận hiển thị ban đầu

  useEffect(() => {
    if (!listingId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await reviewService.getReviewsByListing(listingId);
        if (res?.success && Array.isArray(res.data)) setComments(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải bình luận:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [listingId]);

  const handleAddComment = async (text) => {
    try {
      const payload = {
        reviewerId: currentUser?.id,
        revieweeId: sellerInfo?.id,
        listingId,
        comment: text,
      };

      const res = await reviewService.createReviewOrComment(payload);
      if (res?.success) {
        const newCmt = Array.isArray(res.data) ? res.data[0] : res.data;
        setComments((prev) => [newCmt, ...prev]);
        onCommentChange?.();
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi bình luận:", err);
    }
  };

  const handleEditSubmit = async (id, newText) => {
    try {
      const res = await reviewService.updateReviewOrComment(id, {
        comment: newText,
      });
      if (res?.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.reputationReviewId === id ? { ...c, comment: newText } : c
          )
        );
      }
    } catch (err) {
      console.error("❌ Lỗi khi sửa bình luận:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await reviewService.deleteReview(id);
      if (res?.success) {
        setComments((prev) => prev.filter((c) => c.reputationReviewId !== id));
        onCommentChange?.();
      }
    } catch (err) {
      console.error("❌ Lỗi khi xóa bình luận:", err);
    }
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = comments.length > visibleCount;

  return (
    <section
      className={`rounded-lg border overflow-hidden transition-colors duration-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
    >
      <div className="px-4 pt-4 pb-3 flex justify-between items-center">
        <h3 className="text-lg font-bold">Bình luận</h3>
      </div>

      {currentUser?.id ? (
        <Composer onSubmit={handleAddComment} isDarkMode={isDarkMode} />
      ) : (
        <LoginPrompt requireAuth={requireAuth} isDarkMode={isDarkMode} />
      )}

      {loading ? (
        <div className="px-4 pb-4 text-center text-gray-500">Đang tải...</div>
      ) : comments.length === 0 ? (
        <div className="px-4 pb-4">
          <div
            className={`flex flex-col items-center justify-center rounded-xl py-10 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
          >
            <FaCommentDots className="text-3xl text-gray-400" />
            <p className="mt-3 font-medium">Chưa có bình luận nào.</p>
            <p className="text-gray-500 text-sm">
              Hãy để lại bình luận cho người bán.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-4">
          <ul className="space-y-5">
            {visibleComments.map((c) => (
              <CommentItem
                key={c.reputationReviewId}
                comment={c}
                currentUser={currentUser}
                onEditSubmit={handleEditSubmit}
                onDelete={handleDelete}
                isDarkMode={isDarkMode}
              />
            ))}
          </ul>

          {/* 👇 Nút xem thêm */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + 10)}
                className="text-[#00C9A7] hover:text-[#0D7C5C] text-sm font-medium"
              >
                Xem thêm bình luận...
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
