import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Nếu path bắt đầu bằng /admin thì về /admin, ngược lại về /
  const isAdmin = location.pathname.startsWith("/admin");
  const handleBack = () => {
    navigate(isAdmin ? "/admin" : "/");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30" style={{
        background: 'repeating-linear-gradient(90deg, #333 0 1px, transparent 1px 60px), repeating-linear-gradient(180deg, #333 0 1px, transparent 1px 60px)'
      }} />
      
      {/* Main content */}
      <div className="bg-neutral-50 rounded-2xl shadow-2xl px-8 pt-12 pb-8 min-w-[340px] min-h-[260px] flex flex-col items-center z-20 relative">
        {/* 404 bounce animation */}
        <div className="font-mono font-black text-[5rem] leading-none text-red-600 tracking-widest mb-2 drop-shadow-[0_0_8px_rgba(229,62,62,0.5)] animate-bounce404" style={{textShadow: '0 2px 0 #ffe066, 0 4px 12px #e53e3e88'}}>
          404
        </div>
        <style>{`
          @keyframes bounce404 {
            0%, 100% { transform: translateY(0); }
            10% { transform: translateY(-4px); }
            20% { transform: translateY(-8px); }
            30% { transform: translateY(-12px); }
            40% { transform: translateY(-14px); }
            50% { transform: translateY(-12px); }
            60% { transform: translateY(-8px); }
            70% { transform: translateY(-4px); }
            80% { transform: translateY(-2px); }
            90% { transform: translateY(-1px); }
          }
          .animate-bounce404 {
            animation: bounce404 2.2s infinite cubic-bezier(.45,0,.55,1);
            display: inline-block;
          }
        `}</style>
        <div className="text-[1.5rem] font-bold mb-3 text-orange-500 text-center">
          Không tìm thấy trang
        </div>
        <div className="text-base text-gray-600 mb-4 text-center">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.<br />Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </div>
        {/* Button quay về trang chủ */}
        <button
          onClick={handleBack}
          className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow-lg hover:scale-105 hover:from-orange-500 hover:to-orange-600 transition-all duration-200"
        >
          Quay về trang chủ
        </button>
        {/* Simple animated line */}
        <div className="w-20 h-1.5 rounded bg-gradient-to-r from-yellow-300 via-cyan-200 to-yellow-300 mt-3 animate-pulse" />
      </div>
    </div>
  );
};

export default NotFound;
