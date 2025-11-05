import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaClock, FaEye, FaTag, FaArrowLeft, FaFacebook, 
  FaTwitter, FaLinkedin, FaLink, FaShare 
} from "react-icons/fa";
import { CiSun } from "react-icons/ci";
import { mockBlogPosts } from "./blogMockData";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('blog_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await blogService.getPostBySlug(slug);
      // setPost(response.data);
      
      // Simulate loading delay
      setTimeout(() => {
        const foundPost = mockBlogPosts.find(p => p.slug === slug);
        if (foundPost) {
          setPost(foundPost);
          
          // Get related posts from same category
          const related = mockBlogPosts
            .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
            .slice(0, 3);
          setRelatedPosts(related);
        }
        setLoading(false);
      }, 500);
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem('blog_dark_mode', !prev);
      return !prev;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  // Component to render HTML content with Tailwind styling
  const ArticleContent = ({ content }) => {
    return (
      <div 
        className="article-content text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.8'
        }}
      />
    );
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen w-full font-mono flex items-center justify-center"
        style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div 
        className="min-h-screen w-full font-mono flex items-center justify-center"
        style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
          <button
            onClick={() => navigate('/blog')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Quay lại Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full font-mono -mt-16"
      style={{ background: isDarkMode ? '#222' : '#d5d5d5' }}
    >
      {/* Global styles for article content */}
      <style jsx>{`
        .article-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #059669;
          line-height: 1.3;
        }
        .article-content h3 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #047857;
          line-height: 1.4;
        }
        .article-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #374151;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
        .article-content ul li {
          list-style-type: disc;
        }
        .article-content ol li {
          list-style-type: decimal;
        }
        .article-content strong {
          font-weight: 600;
          color: #111827;
        }
        .article-content a {
          color: #059669;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .article-content a:hover {
          color: #047857;
        }
        .article-content blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
          background: #f0fdf4;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        .article-content code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
          color: #dc2626;
        }
        .article-content pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .article-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .article-content th {
          background: #059669;
          color: white;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .article-content td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
        }
        .article-content tr:nth-child(even) {
          background: #f9fafb;
        }
        .article-content img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          max-width: 100%;
          height: auto;
        }
        .article-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
      `}</style>

      <button
        onClick={handleToggleDarkMode}
        className="fixed top-20 right-1 z-50 w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-gray-700 transition bg-emerald-100 border-gray-600 focus:outline-none"
        aria-label={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
      >
        <CiSun className={`w-7 h-7 transition-colors duration-200 ${isDarkMode ? 'text-black' : 'text-emerald-400'}`} />
      </button>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-96 overflow-hidden bg-gray-900 mt-0"
      >
        {/* Back Button - Positioned over hero image */}
        <div className="absolute top-4 left-4 md:left-8 z-20">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center bg-white/90 backdrop-blur-sm text-emerald-600 hover:text-emerald-700 hover:bg-white font-medium px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại Blog
          </button>
        </div>
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </motion.div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-8 -mt-32 relative z-10">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-xl p-8 md:p-12"
        >
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-semibold">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold text-gray-900">{post.author.name}</div>
                <div className="text-sm text-gray-500">{post.author.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="flex items-center">
                <FaClock className="w-4 h-4 mr-1" />
                {post.readTime} phút đọc
              </span>
              <span className="flex items-center">
                <FaEye className="w-4 h-4 mr-1" />
                {post.views.toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mb-8 flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">Chia sẻ:</span>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaShare className="w-4 h-4" />
                Chia sẻ
              </button>
              
              {showShareMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 min-w-[200px]">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                  >
                    <FaFacebook className="w-5 h-5 text-blue-600" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                  >
                    <FaTwitter className="w-5 h-5 text-sky-500" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                  >
                    <FaLinkedin className="w-5 h-5 text-blue-700" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                  >
                    <FaLink className="w-5 h-5 text-gray-600" />
                    <span>{copySuccess ? 'Đã sao chép!' : 'Sao chép link'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Article Content with custom styling */}
          <div className="mb-8">
            <ArticleContent content={post.content} />
          </div>

          {/* Tags */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <FaTag className="text-gray-400" />
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/blog?tag=${tag}`)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedPost.thumbnail}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">{relatedPost.category}</span>
                      <span className="flex items-center">
                        <FaClock className="w-3 h-3 mr-1" />
                        {relatedPost.readTime} phút
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;