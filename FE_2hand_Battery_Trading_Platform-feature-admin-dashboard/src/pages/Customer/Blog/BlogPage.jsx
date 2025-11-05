import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaClock, FaEye, FaTag, FaArrowRight } from "react-icons/fa";
import { CiSun } from "react-icons/ci";
import { mockBlogPosts, blogCategories, popularTags } from "./blogMockData";

const BlogPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(mockBlogPosts);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('blog_dark_mode');
    return stored === 'true';
  });

  // Simulate API call - Replace with actual API later
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await blogService.getAllPosts();
      // setPosts(response.data);
      
      // Simulate loading delay
      setTimeout(() => {
        setPosts(mockBlogPosts);
        setLoading(false);
      }, 500);
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem('blog_dark_mode', !prev);
      return !prev;
    });
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = posts.filter(post => post.featured);
  const latestPosts = [...posts].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  ).slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 60,
      },
    }),
  };

  return (
    <div 
      className="min-h-screen w-full font-mono -mt-16"
      style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}
    >
      <button
        onClick={handleToggleDarkMode}
        className="fixed top-20 right-1 z-50 w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-emerald-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-emerald-400'}`} />
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Blog Xe Máy Điện
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Cập nhật kiến thức, xu hướng và mẹo hay về xe điện
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-lg text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {blogCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Posts */}
            {selectedCategory === "all" && !searchQuery && featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-emerald-700 mb-6">Bài viết nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post, idx) => (
                    <motion.div
                      key={post.id}
                      custom={idx}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Nổi bật
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                          <span className="flex items-center">
                            <FaClock className="w-3 h-3 mr-1" />
                            {post.readTime} phút đọc
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span className="text-sm text-gray-700">{post.author.name}</span>
                          </div>
                          <FaArrowRight className="text-emerald-600 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-6">
                {searchQuery ? `Kết quả tìm kiếm (${filteredPosts.length})` : 'Tất cả bài viết'}
              </h2>
              
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      custom={idx}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                            <span className="flex items-center">
                              <FaClock className="w-3 h-3 mr-1" />
                              {post.readTime} phút đọc
                            </span>
                            <span className="flex items-center">
                              <FaEye className="w-3 h-3 mr-1" />
                              {post.views.toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-700">{post.author.name}</div>
                                <div className="text-xs text-gray-500">{formatDate(post.publishedAt)}</div>
                              </div>
                            </div>
                            <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                              Đọc thêm <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Latest Posts */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-600">
                  Bài viết mới nhất
                </h3>
                <div className="space-y-4">
                  {latestPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
                    >
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-600">
                  Tag phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex items-center"
                    >
                      <FaTag className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;