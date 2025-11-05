import React from 'react';
// 1. Import useNavigate thay vì Link
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiTool } from 'react-icons/fi';
import { RiAuctionFill } from "react-icons/ri";
import Spline from '@splinetool/react-spline';

// 2. Import các hooks và modal cần thiết (dựa theo đường dẫn của Header.jsx)
import { useAuthCheck } from "../../hooks/useAuthCheck";
import LoginModal from "../../pages/Customer/LoginPage/LoginPage";

/**
 * HeroSection: Component chính cho trang chủ
 * Đã tích hợp logic yêu cầu đăng nhập (requireAuth)
 */
const HeroSection = () => {


    const navigate = useNavigate();
    const { requireAuth, showLoginModal, handleLoginSuccess, closeLoginModal } = useAuthCheck();

    return (
        <>
            <section className="relative w-full h-[65vh] bg-gradient-to-br from-[#00c9a7]/20 via-cyan-300/30 to-blue-400/20 text-white mt-16 flex items-center justify-center overflow-hidden">
                
                {/* Animated Liquid Background Blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Blob 1 */}
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-[#00c9a7]/40 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    {/* Blob 2 */}
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-br from-cyan-400/40 to-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    {/* Blob 3 */}
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-blue-300/40 to-[#00c9a7]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                    {/* Blob 4 */}
                    <div className="absolute bottom-0 right-20 w-72 h-72 bg-gradient-to-br from-cyan-300/40 to-teal-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-3000"></div>
                </div>

                {/* Glass Morphism Overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
                
                {/* 3D Spline Container with White Background */}
                {/* <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-[50%] max-w-3xl h-[80%] overflow-hidden">
                    <div className="absolute inset-0 w-full h-full scale-[2.4]">
                        <Spline 
                            scene="https://prod.spline.design/XLzQolnnW2PnsUMV/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>
                </div> */}
                <div className='text-4xl font-bold text-center text-black'>Nền tảng giao dịch xe và pin</div>

                {/* Buttons Overlay - Left and Right */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                        
                        {/* Left Button - Đăng Tin Bán */}
                        <button
                            onClick={() => requireAuth(() => navigate('/post-item'))}
                            className="pointer-events-auto flex items-center justify-center px-6 py-3 bg-white/90 hover:bg-white text-cyan-600 font-bold text-base rounded-full shadow-2xl backdrop-blur-sm transition-all transform hover:scale-110"
                        >
                            <FiPlusCircle className="w-5 h-5 mr-2" />
                            <span>Đăng Tin Bán</span>
                        </button>

                        {/* Right Button - Tìm Dịch Vụ */}
                        <button
                            onClick={() => requireAuth(() => navigate('/plans'))}
                            className="pointer-events-auto flex items-center justify-center px-6 py-3 bg-white/90 hover:bg-white text-green-600 font-bold text-base rounded-full shadow-2xl backdrop-blur-sm transition-all transform hover:scale-110"
                        >
                            <FiTool className="w-5 h-5 mr-2" />
                            <span>Tìm Dịch Vụ</span>
                        </button>

                    </div>
                </div>

            </section>

            {/* 6. Render LoginModal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={closeLoginModal}
                onLoginSuccess={handleLoginSuccess}
                navigate={navigate}
            />
        </>
    );
};

export default HeroSection;