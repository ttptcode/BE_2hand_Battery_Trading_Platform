import React, { useState, useRef, useEffect } from "react";
import { 
  FaPaperPlane, 
  FaSmile, 
  FaImage, 
  FaMicrophone, 
  FaStop,
  FaTimes
} from "react-icons/fa";
import EmojiPicker from "./EmojiPicker";
import FilePreview from "./FilePreview";

// Quick reply templates
const quickReplies = [
  "Giá bao nhiêu?",
  "Xe còn không?",
  "Địa chỉ ở đâu?",
  "Có fix giá không?",
  "Cảm ơn"
];

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  selectedFiles, 
  setSelectedFiles, 
  imagePreview, 
  setImagePreview,
  isRecording,
  onVoiceRecord,
  onFileSelect,
  onRemoveFile,
  onRemoveImagePreview,
  onClearAllFiles,
  isDarkMode = false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Inject compact scrollbar for quick replies
  useEffect(() => {
    const id = 'quick-replies-scroll-style';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.innerHTML = `
        .quick-replies{ scrollbar-width: thin; }
        .quick-replies::-webkit-scrollbar{ height: 6px; }
        .quick-replies::-webkit-scrollbar-track{ background: transparent; }
        .quick-replies::-webkit-scrollbar-thumb{ background-color: #00c9a7; border-radius: 9999px; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleQuickReply = (reply) => {
    setNewMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-3 flex-shrink-0`}>
      {/* File Preview */}
      <FilePreview 
        imagePreview={imagePreview}
        selectedFiles={selectedFiles}
        onRemoveImagePreview={onRemoveImagePreview}
        onRemoveFile={onRemoveFile}
        onClearAllFiles={onClearAllFiles}
      />

      {/* Quick Reply Bubbles */}
      <div className="flex gap-2 mb-3 overflow-x-auto quick-replies">
        {quickReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => handleQuickReply(reply)}
            className={`flex-shrink-0 px-3 py-2 text-sm rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-3">
        {/* Emoji Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaSmile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <EmojiPicker 
              ref={emojiPickerRef}
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full px-4 py-3 rounded-full focus:ring-2 focus:ring-emerald-500 outline-none ${
              isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-600' : 'bg-white text-gray-900 border border-gray-300 focus:border-emerald-500'
            }`}
          />
        </div>

        <button
          onClick={onVoiceRecord}
          className={`p-2 transition-colors ${
            isRecording 
              ? 'text-red-500' 
              : (isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700')
          }`}
        >
          {isRecording ? <FaStop className="w-4 h-4" /> : <FaMicrophone className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FaImage className="w-4 h-4" />
        </button>

        <button
          onClick={onSendMessage}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
        >
          <FaPaperPlane className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={onFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default MessageInput;
