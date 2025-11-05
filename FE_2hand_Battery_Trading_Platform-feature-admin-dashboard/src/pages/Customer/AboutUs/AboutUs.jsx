import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaUsers, FaShieldAlt, FaHandshake, FaChartLine, FaGlobe } from "react-icons/fa";
import { CiSun } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

// Parallax Background Component
const ParallaxBackground = ({ isDarkMode }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 80;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = isDarkMode ? 'rgba(0, 201, 167, 0.5)' : 'rgba(0, 201, 167, 0.3)';

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
};

// Scramble Text Component
const ScrambleText = ({ text, triggerKey, duration = 400, interval = 30, className = "" }) => {
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        let mounted = true;
        let frame = 0;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

const AboutUsPage = () => {
    const navigate = useNavigate();

    // === ĐỒNG BỘ DARK MODE GIỐNG WISHLIST ===
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem("landing_dark_mode");
        return stored === "true";
    });

    // Lắng nghe sự kiện thay đổi dark mode từ các trang khác
    useEffect(() => {
        const handleDarkModeChange = (event) => {
            setIsDarkMode(event.detail.isDarkMode);
        };
        window.addEventListener("darkModeChanged", handleDarkModeChange);
        return () => window.removeEventListener("darkModeChanged", handleDarkModeChange);
    }, []);

    // Đồng bộ khi reload trang
    useEffect(() => {
        const stored = localStorage.getItem("landing_dark_mode");
        if (stored !== null) {
            setIsDarkMode(stored === "true");
        }
    }, []);

    const handleToggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            localStorage.setItem("landing_dark_mode", String(newMode));
            window.dispatchEvent(
                new CustomEvent("darkModeChanged", { detail: { isDarkMode: newMode } })
            );
            return newMode;
        });
    };
    // === KẾT THÚC ĐỒNG BỘ ===

    const [decodeHero, setDecodeHero] = useState(false);
    const [decodeMission, setDecodeMission] = useState(false);
    const [decodeValues, setDecodeValues] = useState(false);
    const [decodeStats, setDecodeStats] = useState(false);

    const heroRef = useRef();
    const missionRef = useRef();
    const valuesRef = useRef();
    const statsRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target.id === "hero") setDecodeHero(entry.isIntersecting);
                    if (entry.target.id === "mission") setDecodeMission(entry.isIntersecting);
                    if (entry.target.id === "values") setDecodeValues(entry.isIntersecting);
                    if (entry.target.id === "stats") setDecodeStats(entry.isIntersecting);
                });
            },
            { threshold: 0.3 }
        );

        if (heroRef.current) observer.observe(heroRef.current);
        if (missionRef.current) observer.observe(missionRef.current);
        if (valuesRef.current) observer.observe(valuesRef.current);
        if (statsRef.current) observer.observe(statsRef.current);

        return () => {
            if (heroRef.current) observer.unobserve(heroRef.current);
            if (missionRef.current) observer.unobserve(missionRef.current);
            if (valuesRef.current) observer.unobserve(valuesRef.current);
            if (statsRef.current) observer.unobserve(statsRef.current);
        };
    }, []);

    const values = [
        {
            icon: <FaUsers className="w-8 h-8" />,
            title: "Kết nối cộng đồng",
            description: "Chúng tôi xây dựng nền tảng để mọi người dễ dàng mua bán, trao đổi và kết nối với nhau một cách tin cậy và thuận tiện."
        },
        {
            icon: <FaShieldAlt className="w-8 h-8" />,
            title: "An toàn & Minh bạch",
            description: "Cam kết bảo vệ quyền lợi người dùng với hệ thống xác thực chặt chẽ và chính sách minh bạch trong mọi giao dịch."
        },
        {
            icon: <FaHandshake className="w-8 h-8" />,
            title: "Uy tín & Tin cậy",
            description: "Xây dựng lòng tin thông qua dịch vụ chất lượng, hỗ trợ tận tình và đảm bảo quyền lợi cho cả người mua và người bán."
        },
        {
            icon: <FaChartLine className="w-8 h-8" />,
            title: "Phát triển bền vững",
            description: "Hướng tới tương lai với việc khuyến khích tái sử dụng, giảm thiểu lãng phí và tạo ra giá trị lâu dài cho cộng đồng."
        }
    ];

    const stats = [
        { number: "10M+", label: "Người dùng" },
        { number: "50M+", label: "Tin đăng" },
        { number: "63", label: "Tỉnh/Thành phố" },
        { number: "24/7", label: "Hỗ trợ" }
    ];

    const milestones = [
        { year: "2012", title: "Ra mắt", desc: "Nền tảng được thành lập với sứ mệnh kết nối mọi người" },
        { year: "2015", title: "Mở rộng", desc: "Phủ sóng toàn quốc với hơn 10 triệu người dùng" },
        { year: "2018", title: "Đổi mới", desc: "Ra mắt ứng dụng di động và các tính năng thông minh" },
        { year: "2020", title: "Dẫn đầu", desc: "Trở thành nền tảng mua bán trực tuyến số 1 Việt Nam" },
        { year: "2024", title: "Tương lai", desc: "Tiếp tục đổi mới với AI và công nghệ tiên tiến" }
    ];

    return (
        <div className="relative min-h-screen w-full" style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}>
            {/* Nút chuyển Dark Mode - Đồng bộ toàn cục */}
            <button
                onClick={handleToggleDarkMode}
                className="fixed top-20 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-emerald-100 border-gray-600 focus:outline-none"
                aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
            >
                <CiSun className={`w-8 h-8 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-emerald-400'}`} />
            </button>

            <ParallaxBackground isDarkMode={isDarkMode} />

            <div className="relative z-20 bg-transparent pl-8 pr-8 font-mono" style={{ color: isDarkMode ? '#e0e0e0' : '#0e0e0e' }}>
                <div className="absolute left-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{ top: 0, bottom: 0 }} />
                <div className="absolute right-8 w-px bg-black opacity-80 z-30 pointer-events-none" style={{ top: 0, bottom: 0 }} />

                {/* Hero Section */}
                <div id="hero" ref={heroRef} className="max-w-7xl mx-auto px-8 pt-32 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-[#00c9a7] tracking-tight">
                            <ScrambleText text="Về Chúng Tôi" triggerKey={decodeHero} />
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: isDarkMode ? '#b0b0b0' : '#333' }}>
                            Nền tảng mua bán trực tuyến hàng đầu Việt Nam, kết nối hàng triệu người dùng mỗi ngày
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold">Tin cậy</span>
                            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold">Tiện lợi</span>
                            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold">An toàn</span>
                        </div>
                    </motion.div>
                </div>

                {/* Mission Section */}
                <div id="mission" ref={missionRef} className="max-w-7xl mx-auto px-8 py-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#00c9a7] tracking-tight">
                        <ScrambleText text="Sứ Mệnh Của Chúng Tôi" triggerKey={decodeMission} />
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white p-8 rounded-lg shadow-lg"
                        >
                            <FaGlobe className="w-12 h-12 text-emerald-500 mb-4" />
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Kết nối mọi người</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Chúng tôi tin rằng mọi người đều có thứ gì đó để chia sẻ, từ những món đồ cũ đến sản phẩm mới.
                                Sứ mệnh của chúng tôi là tạo ra một nền tảng an toàn, minh bạch để mọi người có thể dễ dàng
                                mua bán, trao đổi và kết nối với nhau.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="bg-white p-8 rounded-lg shadow-lg"
                        >
                            <FaCheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Cam kết chất lượng</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Với hơn 10 triệu người dùng và hàng triệu tin đăng mỗi tháng, chúng tôi không ngừng cải thiện
                                dịch vụ để mang đến trải nghiệm tốt nhất. Từ việc xác thực người dùng đến hỗ trợ khách hàng 24/7,
                                chúng tôi luôn đặt sự hài lòng của bạn lên hàng đầu.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Core Values */}
                <div id="values" ref={valuesRef} className="max-w-7xl mx-auto px-8 py-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-[#00c9a7] tracking-tight text-center">
                        <ScrambleText text="Giá Trị Cốt Lõi" triggerKey={decodeValues} />
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-emerald-300"
                            >
                                <div className="text-emerald-500 mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div id="stats" ref={statsRef} className="max-w-7xl mx-auto px-8 py-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-[#00c9a7] tracking-tight text-center">
                        <ScrambleText text="Chúng Tôi Bằng Số Liệu" triggerKey={decodeStats} />
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-emerald-500 mb-2">{stat.number}</div>
                                <div className="text-gray-700 font-semibold">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: isDarkMode ? '#e0e0e0' : '#0e0e0e' }}>
                            Hành Trình Phát Triển
                        </h3>
                        <div className="space-y-8">
                            {milestones.map((milestone, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className={`flex items-center gap-6 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
                                        <div className="text-emerald-500 font-bold text-xl mb-2">{milestone.year}</div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h4>
                                        <p className="text-gray-700">{milestone.desc}</p>
                                    </div>
                                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0 shadow-lg"></div>
                                    <div className="flex-1"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-7xl mx-auto px-8 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 p-12 rounded-lg shadow-2xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Sẵn sàng tham gia cùng chúng tôi?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Hãy trở thành một phần của cộng đồng hàng triệu người dùng đang mua bán tin cậy mỗi ngày
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={() => navigate('/post-item')}
                                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
                            >
                                Đăng tin ngay
                            </button>
                            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-emerald-600 hover:scale-105 transition-all duration-300">
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="h-16"></div>
            </div>
        </div>
    );
};

export default AboutUsPage;