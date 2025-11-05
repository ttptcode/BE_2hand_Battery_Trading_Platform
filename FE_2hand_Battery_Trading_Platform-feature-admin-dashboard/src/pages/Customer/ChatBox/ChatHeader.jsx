import { FaEllipsisV } from "react-icons/fa";

const ChatHeader = ({ selectedChat, isDarkMode = false }) => {
  if (!selectedChat) return null;

  return (
    <div className={`border-b px-6 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full"
            />
            {selectedChat.isOnline && (
              <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full ${isDarkMode ? 'border-gray-800' : 'border-white'}`}></div>
            )}
          </div>
          <div>
            <h2 className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedChat.name}
              {selectedChat.name === 'Đang tải...' && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedChat.listing ? `Sản phẩm: ${selectedChat.listing.item?.title || 'N/A'}` : 'Hoạt động gần đây'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button 
            className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            title="Thông tin"
          >
            <FaEllipsisV className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
