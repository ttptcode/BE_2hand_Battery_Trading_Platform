import { useState, useEffect, useRef } from "react";
import { 
  FaTimes, 
  FaMinus,
  FaExpand,
  FaSearch,
  FaCommentDots,
  FaUser
} from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import LoginModal from "../LoginPage/LoginPage";
import { 
  getUserConversations, 
  getMessages, 
  sendMessage, 
  createConversation,
  getConversation,
  markMessageAsRead
} from "../../../services/chats/chatService";
import websocketService from "../../../services/chats/websocketService";
import { tokenService } from "../../../services/auth/tokenService";
import { authService } from "../../../services/auth/authService";
import { useAuthCheck } from "../../../hooks/useAuthCheck";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";
import { 
  uploadToCloudinary, 
  uploadMultipleFiles,
  createMediaMessageContent 
} from "../../../services/upload/uploadService";

// ============ UTILITY FUNCTIONS ============

/**
 * Generate avatar SVG with first letter and color
 * @param {string} name - User's name
 * @param {string} userId - User's ID for color generation
 * @returns {string} SVG data URI
 */
const generateAvatarSVG = (name, userId = null) => {
  const letter = name.charAt(0).toUpperCase();
  const color = userId 
    ? `hsl(${parseInt(userId.slice(0, 8), 16) % 360}, 70%, 60%)`
    : '#10b981';
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial">${letter}</text></svg>`;
};

/**
 * Get display name and avatar from URL params or fallback
 * @param {string} sellerName - Seller name from URL
 * @param {string} buyerName - Buyer name from URL  
 * @param {string} fallbackName - Fallback name if no URL params
 * @returns {object} { name, avatar }
 */
const getInitialDisplayInfo = (sellerName, buyerName, fallbackName = 'Đang tải...') => {
  if (sellerName && buyerName) {
    const name = decodeURIComponent(sellerName);
    return {
      name,
      avatar: generateAvatarSVG(name)
    };
  }
  
  return {
    name: fallbackName,
    avatar: generateAvatarSVG('?')
  };
};

const ChatBubble = () => {
  // Dark mode state synced with localStorage & Header event
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);
  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.userId;
      }
    } catch (error) {
      console.error('❌ Error parsing userInfo from localStorage:', error);
    }
    return null;
  };
  
  // Hooks - PHẢI luôn gọi cùng số lượng hooks mỗi lần render
  const { requireAuth, showLoginModal, handleLoginSuccess, closeLoginModal } = useAuthCheck();
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  const { unreadCount } = useUnreadMessages(10000); // Poll every 10 seconds
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatList, setShowChatList] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const chatListRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const currentConversationIdRef = useRef(null); // Track current conversation ID to prevent race conditions
  
  // Debug logging for unread count
  useEffect(() => {
  }, [unreadCount]);
  
  // Listen for auth changes (login/logout)
  useEffect(() => {
    const checkAndUpdateUserId = () => {
      const userId = getCurrentUserId();
      if (userId !== currentUserId) {
        setCurrentUserId(userId);
      }
    };
    
    // Check immediately
    checkAndUpdateUserId();
    
    // Listen for storage changes (login/logout in same or different tab)
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo' || e.key === 'accessToken') {
        checkAndUpdateUserId();
      }
    };
    
    // Listen for custom auth event (dispatched after login success)
    const handleAuthChange = () => {
      setTimeout(() => checkAndUpdateUserId(), 100); // Small delay to ensure localStorage is updated
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    // Poll every 2 seconds as fallback
    const interval = setInterval(checkAndUpdateUserId, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
      clearInterval(interval);
    };
  }, [currentUserId]);
  
  // Get URL parameters manually
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      conversationId: urlParams.get('conversationId'),
      preset: urlParams.get('preset'),
      sellerName: urlParams.get('sellerName'),
      buyerName: urlParams.get('buyerName')
    };
  };


  useEffect(() => {
    // Kiểm tra user đã đăng nhập chưa - Skip nếu chưa đăng nhập
    if (!currentUserId) {
      return;
    }
    
    // Kiểm tra authentication status
    const checkAuthStatus = () => {
      const currentToken = tokenService.getAccessToken();
      
      if (currentToken && !tokenService.isTokenExpired()) {
        return true;
      } else {
        return false;
      }
    };

    const isAuthenticated = checkAuthStatus();
    if (!isAuthenticated) {
      // Không hiển thị chat nếu user chưa đăng nhập
      return;
    }

    // Load conversations when component mounts
    loadConversations();
    
    // Set vị trí ban đầu về góc dưới bên phải
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80
    });

    // Initialize WebSocket connection
    const initWebSocket = () => {
      // Clean up any existing polling first
      if (window.chatPollingInterval) {
        clearInterval(window.chatPollingInterval);
        window.chatPollingInterval = null;
      }

      // Enable WebSocket by default, fallback to polling if not available
      const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
      
      if (!enableWebSocket) {
        startPolling();
        return;
      }

      // Mock token - trong thực tế sẽ lấy từ auth context
      const token = tokenService.getAccessToken();
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";
      
      // Chỉ kết nối WebSocket nếu có server
      websocketService.connect(wsUrl, token);
      
      // Listen for new messages
      websocketService.onNewMessage((messageData) => {
        // Handle different message data structures
        const conversationId = messageData.conversationId || messageData.payload?.conversationId;
        const content = messageData.content || messageData.payload?.content || messageData.message?.content;
        const createdAt = messageData.createdAt || messageData.payload?.createdAt || messageData.message?.createdAt;
        
        if (conversationId && content) {
          // Always update the conversation list with the latest message
          setConversations(prev => {
            const updatedConversations = prev.map(conv => {
              if (conv.conversationId === conversationId) {
                return {
                  ...conv,
                  lastMessage: content,
                  time: new Date(createdAt || new Date()).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  updatedAt: createdAt || new Date().toISOString()
                };
              }
              return conv;
            });
            return updatedConversations;
          });
        }
        
        // Only update messages if the message is for the currently selected conversation
        if (selectedChat && conversationId === selectedChat.conversationId && currentConversationIdRef.current === conversationId) {
          
          // Update message with real data from server
          setMessages(prev => {
            
            // Double-check that we're still on the same conversation to prevent race conditions
            if (selectedChat?.conversationId === conversationId) {
              const messageId = messageData.id || messageData.payload?.id || messageData.message?.id;
              const existingIndex = prev.findIndex(msg => msg.id === messageId);
              
              if (existingIndex >= 0) {
                // Update existing message with server data
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  content: content,
                  createdAt: createdAt || new Date().toISOString(),
                  sender: messageData.sender || messageData.payload?.sender || 'other'
                };
                return updated;
              } else {
                // Add new message
                const newMessage = {
                  id: messageId || Date.now(),
                  sender: messageData.sender || messageData.payload?.sender || 'other',
                  content: content,
                  createdAt: createdAt || new Date().toISOString(),
                  isRead: false
                };
                const updated = [...prev, newMessage];
                return updated;
              }
            } else {
              return prev;
            }
          });
        }
      });

      // Listen for message read status updates
      websocketService.onMessageRead((readData) => {
        
        setMessages(prev => prev.map(msg => 
          msg.id === readData.messageId 
            ? { ...msg, isRead: readData.isRead }
            : msg
        ));
      });

      // Listen for connection status
      websocketService.on('connected', () => {
      });

      websocketService.on('disconnected', () => {
      });

      websocketService.on('serverUnavailable', () => {
        websocketService.stopReconnecting();
        startPolling();
      });

      websocketService.on('error', () => {
        websocketService.stopReconnecting();
        startPolling();
      });

      websocketService.on('maxReconnectAttemptsReached', () => {
        startPolling();
      });

      // Add a general message handler for any WebSocket messages
      websocketService.on('message', (data) => {
        
        // Handle different message types
        if (data.type === 'new_message' && data.payload) {
          // Trigger the onNewMessage handler
          websocketService.onNewMessage(data.payload);
        } else if (data.type === 'message' && data.payload) {
          // Handle direct message format
          websocketService.onNewMessage(data.payload);
        } else if (data.conversationId || data.content) {
          // Handle direct message format
          websocketService.onNewMessage(data);
        }
      });
    };

    // Polling fallback mechanism
    const startPolling = () => {
      // Prevent duplicate polling
      if (window.chatPollingInterval) {
        return;
      }

      const pollInterval = setInterval(async () => {
        // Also refresh conversations list periodically to catch any missed updates
        try {
          const conversationsResponse = await getUserConversations(currentUserId);
          if (conversationsResponse.success && conversationsResponse.data) {
            setConversations(prev => {
              // Only update if there are actual changes to prevent unnecessary re-renders
              const hasChanges = JSON.stringify(prev) !== JSON.stringify(conversationsResponse.data);
              if (hasChanges) {
                return conversationsResponse.data;
              }
              return prev;
            });
          }
        } catch (error) {
        }
        
        // Poll for the currently selected conversation using ref to avoid state issues
        const currentConversationId = currentConversationIdRef.current;
        
        if (currentConversationId) {
          try {
            const response = await getMessages(currentConversationId);
            if (response.success && response.data) {
              const transformedMessages = response.data.map(msg => {
                const isFromCurrentUser = msg.senderId === currentUserId;
                return {
                  id: msg.messageId,
                  sender: isFromCurrentUser ? 'user' : 'other',
                  content: msg.content,
                  time: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  isRead: msg.isRead,
                  createdAt: msg.createdAt,
                  senderId: msg.senderId
                };
              });
              
              // Only update if messages changed
              setMessages(prev => {
                if (currentConversationIdRef.current === currentConversationId) {
                  if (JSON.stringify(prev) !== JSON.stringify(transformedMessages)) {
                    
                    // Update conversation list with latest message
                    if (transformedMessages.length > 0) {
                      const latestMessage = transformedMessages[transformedMessages.length - 1];
                      setConversations(prevConversations => {
                        return prevConversations.map(conv => {
                          if (conv.conversationId === currentConversationId) {
                            return {
                              ...conv,
                              lastMessage: latestMessage.content,
                              time: latestMessage.time,
                              updatedAt: latestMessage.createdAt
                            };
                          }
                          return conv;
                        });
                      });
                    }
                    
                    return transformedMessages;
                  }
                } else {
                }
                return prev;
              });
            }
          } catch (error) {
          }
        } else {
        }
      }, 5000);

      // Store interval for cleanup
      window.chatPollingInterval = pollInterval;
    };

    initWebSocket();

    // Cleanup WebSocket and polling on unmount
    return () => {
      websocketService.disconnect();
      if (window.chatPollingInterval) {
        clearInterval(window.chatPollingInterval);
        window.chatPollingInterval = null;
      }
    };
  }, [currentUserId]); // Add currentUserId to dependencies

  // Handle URL parameters for direct conversation access
  useEffect(() => {
    const { conversationId, preset, sellerName, buyerName } = getUrlParams();
    
    if (conversationId) {
      
      // If we have conversations, try to find the target one
      if (conversations.length > 0) {
        const targetConversation = conversations.find(conv => conv.conversationId === conversationId);
        if (targetConversation) {
          
          // PRIORITY 1: Use URL params for instant name display
          const displayInfo = getInitialDisplayInfo(
            sellerName, 
            buyerName, 
            targetConversation.name || 'Đang tải...'
          );
          
          const displayName = displayInfo.name;
          const displayAvatar = displayInfo.avatar || targetConversation.avatar;
          
          // Set conversation with instant name from URL params
          setSelectedChat({
            ...targetConversation,
            name: displayName,
            avatar: displayAvatar
          });
          
          setShowChatList(false);
          
          // PRIORITY 2: Fetch API in background for accurate info
          const updateConversationName = async () => {
            try {
              const response = await getConversation(conversationId);
              
              if (response.success && response.data) {
                const { seller, buyer } = response.data;
                
                // Determine other person based on current user ID
                const otherPerson = seller?.userId === currentUserId ? buyer : seller;
                
                // Use API fullName if available, otherwise keep URL param name
                const finalName = otherPerson?.fullName || displayName;
                const finalAvatar = otherPerson?.avatar || generateAvatarSVG(finalName, otherPerson?.userId);
                
                // Update the conversation with complete info
                const updatedConversation = {
                  ...targetConversation,
                  name: finalName,
                  avatar: finalAvatar,
                  seller: seller,
                  buyer: buyer,
                  otherPerson: otherPerson
                };
                
                setSelectedChat(updatedConversation);
                
                // Update conversations list
                setConversations(prev => 
                  prev.map(conv => 
                    conv.conversationId === conversationId 
                      ? updatedConversation 
                      : conv
                  )
                );
              }
            } catch (error) {
              console.warn('⚠️ ChatBubble - API call failed, using URL params:', error);
            }
          };
          
          updateConversationName();
          // Don't call loadMessages here to avoid infinite loop
          // loadMessages(conversationId);
        }
      } else {
        // If no conversations loaded yet OR conversation not found,
        // try to get conversation from API (happens when navigating from ProductDetailPage)
        
        const loadConversationFromAPI = async () => {
          try {
            setLoading(true);
            setError(null);
            
            // PRIORITY 1: Use URL params immediately for instant display (no waiting!)
            const displayInfo = getInitialDisplayInfo(sellerName, buyerName);
            const initialName = displayInfo.name;
            const initialAvatar = displayInfo.avatar;
            
            // Show conversation with URL params name immediately (FAST!)
            const tempConv = {
              conversationId: conversationId,
              name: initialName,
              lastMessage: '',
              time: '',
              isRead: true,
              avatar: initialAvatar,
              isOnline: false,
              lastActive: "Vừa xong",
              type: "individual"
            };
            
            setSelectedChat(tempConv);
            setConversations([tempConv]);
            setShowChatList(false);
            
            // Set preset message if available
            if (preset) {
              setNewMessage(decodeURIComponent(preset));
            }
            
            // Now load messages immediately (don't wait for API)
            loadMessages(conversationId);
            
            setLoading(false);
            
            // PRIORITY 2: Fetch API in background to get complete info (for accuracy)
            // This runs async and updates the conversation when ready
            try {
              const response = await getConversation(conversationId);
              
              if (response?.success && response.data?.seller && response.data?.buyer) {
                const { seller, buyer } = response.data;
                const otherPerson = seller?.userId === currentUserId ? buyer : seller;
                
                // Use API fullName if available, otherwise keep URL param name
                const finalName = otherPerson?.fullName || initialName;
                const finalAvatar = otherPerson?.avatar || generateAvatarSVG(finalName, otherPerson?.userId);
                
                const updatedConv = {
                  ...tempConv,
                  name: finalName,
                  avatar: finalAvatar,
                  seller: seller,
                  buyer: buyer,
                  otherPerson: otherPerson
                };
                
                // Update with complete info
                setSelectedChat(updatedConv);
                setConversations([updatedConv]);
              }
              // If API fails, we already have URL params displayed - no problem!
            } catch (apiError) {
              // Silently fail - we already have name from URL params
              console.warn('⚠️ ChatBubble - API call failed, using URL params:', apiError);
            }
          } catch (error) {
            console.error('❌ ChatBubble - Error loading conversation:', error);
            setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
            setLoading(false);
          }
        };
        
        loadConversationFromAPI();
      }
    }
  }, [conversations]);

  // Route change detection with explicit allowed routes
  useEffect(() => {
    const isAllowedPath = (path) => {
      if (!path) return false;
      return (
        path === '/' ||
        path === '/home' ||
        path.startsWith('/product') || // product detail and possibly product list
        path.startsWith('/products') ||
        path.startsWith('/product-list') ||
        path.startsWith('/profile') ||
        path.startsWith('/my-ads') || // quản lý tin đăng
        path.startsWith('/post-item') || // đăng tin
        path.startsWith('/post')
      );
    };

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (!isAllowedPath(currentPath)) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    };

    // Initial check
    handleRouteChange();

    // Listen for browser navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Drag and drop functions for chat bubble button only
  const handleMouseDown = (e) => {
    dragging.current = true;
    setIsDragging(true);
    setHasDragged(false);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    startPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    
    // Tính khoảng cách di chuyển
    const deltaX = Math.abs(e.clientX - startPosition.current.x);
    const deltaY = Math.abs(e.clientY - startPosition.current.y);
    const threshold = 5; // Ngưỡng 5px để phân biệt click và drag
    
    // Nếu di chuyển quá ngưỡng, coi như đang drag
    if (deltaX > threshold || deltaY > threshold) {
      setHasDragged(true);
    }
    
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    
    // Giới hạn vị trí trong màn hình
    const bubbleSize = 56; // w-14 h-14 = 56px
    const maxX = window.innerWidth - bubbleSize;
    const maxY = window.innerHeight - bubbleSize;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    
    // Reset hasDragged sau một khoảng thời gian ngắn
    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Close emoji picker, chat list, settings menu and chat bubble when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close emoji picker
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      
      // Close chat list (but keep chat bubble open)
      if (chatListRef.current && !chatListRef.current.contains(event.target)) {
        setShowChatList(false);
      }
      
      // Close settings menu
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
      
      // Close chat bubble when clicking outside (but not when minimized)
      if (isOpen && !isMinimized) {
        const chatBubble = document.querySelector('[data-chat-bubble]');
        if (chatBubble && !chatBubble.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMinimized]);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserConversations(currentUserId);
      
      if (response.success) {
        setConversations(response.data || []);
        
        // Chỉ tự động chọn cuộc trò chuyện nếu có URL parameter
        const { conversationId } = getUrlParams();
        if (response.data && response.data.length > 0 && conversationId) {
            // Chỉ xử lý khi có conversationId từ URL
            const targetConversation = response.data.find(conv => conv.conversationId === conversationId);
            if (targetConversation) {
              const otherPerson = targetConversation.seller?.userId === currentUserId ? targetConversation.buyer : targetConversation.seller;
              
              const transformedConv = {
                conversationId: targetConversation.conversationId,
                name: otherPerson?.fullName || 'Unknown User',
                lastMessage: targetConversation.lastMessage || 'Chưa có tin nhắn',
                time: targetConversation.updatedAt ? new Date(targetConversation.updatedAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '',
                isRead: true,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                isOnline: false,
                lastActive: "Không xác định",
                type: "individual",
                listing: targetConversation.listing,
                seller: targetConversation.seller,
                buyer: targetConversation.buyer,
                currentUserId: currentUserId,
                otherPerson: otherPerson
              };
            
              setSelectedChat(transformedConv);
              setShowChatList(false);
              await loadMessages(targetConversation.conversationId);
            }
        } else {
          // Nếu không có URL parameter, hiển thị danh sách chat
          setShowChatList(true);
          setSelectedChat(null);
        }
      }
    } catch (err) {
      console.error('❌ ChatBubble - Error loading conversations:', err);
      setError('Không thể tải danh sách cuộc trò chuyện');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      
      // Update the current conversation ID ref
      currentConversationIdRef.current = conversationId;
      
      // Check if conversationId is valid
      if (!conversationId) {
        setMessages([]);
        return;
      }
      
      const response = await getMessages(conversationId);
      
      if (response.success) {
        // Transform API response to match component format
        // Handle case where data might be null or empty for new conversations
        const messageData = response.data || [];
        
        const transformedMessages = messageData.map(msg => {
          const isFromCurrentUser = msg.senderId === currentUserId;
          
          return {
            id: msg.messageId,
            sender: isFromCurrentUser ? 'user' : 'other',
            content: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            isRead: msg.isRead,
            createdAt: msg.createdAt,
            senderId: msg.senderId
          };
        });
        setMessages(transformedMessages);
        
        // Mark messages as read for current user (only if there are messages)
        if (transformedMessages.length > 0) {
          markMessagesAsRead(transformedMessages);
        }
        
        // Clear any previous errors
        setError(null);
      } else {
        // For new conversations, no messages is not an error
        setMessages([]);
        setError(null);
      }
    } catch (err) {
      console.error('❌ ChatBubble - Error loading messages:', err);
      
      // For new conversations, API might return 404 or empty - treat as no messages
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        setMessages([]);
        setError(null); // Don't show error for new conversations
      } else {
        // Only show error for real failures
        setMessages([]);
        // Don't set error message - just clear messages
        setError(null);
      }
    }
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() || selectedFiles.length > 0) && selectedChat) {
      try {
        // Create temporary message ID for optimistic update
        const tempId = Date.now();
        
        // Save message and files to send
        const messageText = newMessage.trim();
        const filesToUpload = [...selectedFiles];
        
        let messageContentToSend = messageText;
        let uploadedFiles = [];
        
        // Check if there are files to upload
        if (filesToUpload.length > 0) {
          // Show uploading status
          const tempMessage = {
            id: tempId,
            sender: "user",
            content: "📤 Đang tải lên...",
            createdAt: new Date().toISOString(),
            isRead: false,
            isUploading: true
          };
          
          setMessages(prev => [...prev, tempMessage]);
          
          // Clear input immediately
          setNewMessage("");
          setSelectedFiles([]);
          setImagePreview(null);
          
          try {
            // Upload files to Cloudinary
            console.log(`📤 Uploading ${filesToUpload.length} file(s)...`);
            const uploadResults = await uploadMultipleFiles(
              filesToUpload.map(f => f.file),
              { folder: 'chat_messages' }
            );
            
            // Check if all uploads succeeded
            const successfulUploads = uploadResults.filter(r => r.success);
            const failedUploads = uploadResults.filter(r => !r.success);
            
            if (failedUploads.length > 0) {
              console.error('❌ Some uploads failed:', failedUploads);
              setError(`Không thể tải lên ${failedUploads.length} file`);
            }
            
            if (successfulUploads.length === 0) {
              // All uploads failed
              setMessages(prev => prev.filter(msg => msg.id !== tempId));
              setError('Không thể tải lên file. Vui lòng thử lại.');
              return;
            }
            
            uploadedFiles = successfulUploads;
            
            // Create message content with media
            // For single file: send as media message with text
            // For multiple files: send each as separate message (or combine in array)
            if (uploadedFiles.length === 1) {
              const upload = uploadedFiles[0];
              messageContentToSend = createMediaMessageContent(
                upload.data.resourceType,
                upload.data.url,
                messageText,
                {
                  width: upload.data.width,
                  height: upload.data.height,
                  format: upload.data.format,
                  size: upload.data.size,
                  duration: upload.data.duration,
                  thumbnail: upload.data.thumbnail
                }
              );
            } else {
              // Multiple files: create array of media
              messageContentToSend = JSON.stringify({
                type: 'multiple',
                text: messageText,
                media: uploadedFiles.map(upload => ({
                  type: upload.data.resourceType,
                  url: upload.data.url,
                  metadata: {
                    width: upload.data.width,
                    height: upload.data.height,
                    format: upload.data.format,
                    size: upload.data.size,
                    duration: upload.data.duration,
                    thumbnail: upload.data.thumbnail
                  }
                }))
              });
            }
            
            console.log('✅ All files uploaded successfully');
          } catch (uploadError) {
            console.error('❌ Upload error:', uploadError);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setError('Không thể tải lên file. Vui lòng thử lại.');
            return;
          }
        } else {
          // No files, just text message
          const tempMessage = {
            id: tempId,
            sender: "user",
            content: messageText,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          
          setMessages(prev => [...prev, tempMessage]);
          
          // Clear input immediately
          setNewMessage("");
          setSelectedFiles([]);
          setImagePreview(null);
        }

        // Send message via API (with uploaded URLs if any)
        const response = await sendMessage(
          selectedChat.conversationId,
          currentUserId,
          messageContentToSend
        );

        if (response.success) {
          // Replace temporary message with real message from server
          const realMessage = {
            id: response.data.messageId || tempId,
            sender: "user",
            content: messageContentToSend,
            createdAt: response.data.createdAt || new Date().toISOString(),
            isRead: false
          };

          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? realMessage : msg
          ));

          // Update conversation list with the sent message
          // Show preview text for media messages
          let previewText = messageText || '📷 Đã gửi ảnh';
          if (uploadedFiles.length > 0) {
            const firstFile = uploadedFiles[0];
            if (firstFile.data.resourceType === 'video') {
              previewText = messageText || '🎥 Đã gửi video';
            } else if (uploadedFiles.length > 1) {
              previewText = messageText || `📷 Đã gửi ${uploadedFiles.length} file`;
            }
          }
          
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.conversationId === selectedChat.conversationId) {
                return {
                  ...conv,
                  lastMessage: previewText,
                  time: new Date(realMessage.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  updatedAt: realMessage.createdAt
                };
              }
              return conv;
            });
          });

          // Send via WebSocket for real-time updates (if enabled and connected)
          const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
          if (enableWebSocket && websocketService.isConnected()) {
            try {
              websocketService.send({
                type: 'new_message',
                payload: {
                  conversationId: selectedChat.conversationId,
                  message: realMessage
                }
              });
            } catch (wsError) {
            }
          } else {
          }
        } else {
          // Remove temporary message if API failed
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
          setError('Không thể gửi tin nhắn');
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Không thể gửi tin nhắn');
        
        // Remove temporary message on error
        const tempId = Date.now();
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    }
  };

  const handleChatSelect = async (chat) => {
    
    // Update the current conversation ID ref immediately
    currentConversationIdRef.current = chat.conversationId;
    
    setSelectedChat(chat);
    setShowChatList(false);
    await loadMessages(chat.conversationId);
  };

  // Mark messages as read
  const markMessagesAsRead = async (messages) => {
    try {
      // Only mark messages that are not from current user and not read yet
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== currentUserId && !msg.isRead
      );
      
      if (unreadMessages.length === 0) {
        return;
      }
      
      
      // Mark each unread message as read
      for (const message of unreadMessages) {
        try {
          await markMessageAsRead(message.id);
        } catch (error) {
          // Log error but don't throw - this is not critical functionality
        }
      }
    } catch (error) {
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
    setMessages([]);
  };

  // Close chat bubble
  const closeChatBubble = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setShowChatList(true);
    setSelectedChat(null);
    setMessages([]);
    setNewMessage("");
    setSelectedFiles([]);
    setImagePreview(null);
    setShowEmojiPicker(false);
    setShowSettingsMenu(false);
    setSearchQuery("");
    setActiveTab("all");
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    
    if (newFiles.length === 0) return;
    
    const processedFilesPromises = newFiles.map(file => {
      return new Promise((resolve, reject) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({ file, dataURL: event.target.result });
          };
          reader.onerror = () => {
            resolve({ file }); // Fallback to file without dataURL
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ file });
        }
      });
    });

    Promise.all(processedFilesPromises).then(processed => {
      setSelectedFiles(prev => [...prev, ...processed]);
      const firstImage = processed.find(item => item.dataURL);
      if (firstImage && firstImage.dataURL) {
        setImagePreview(firstImage.dataURL);
      }
    }).catch(error => {
      console.error('Error processing files:', error);
      // Fallback: just add files without preview
      setSelectedFiles(prev => [...prev, ...newFiles.map(file => ({ file }))]);
    });
    
    // Reset file input
    e.target.value = '';
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage = {
          id: Date.now(),
          sender: "user",
          content: "🎤 Tin nhắn thoại",
          createdAt: new Date().toISOString(),
          isRead: false,
          isVoice: true
        };
        setTimeout(() => {
          setMessages(prev => [...prev, voiceMessage]);
        }, 50);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (imagePreview && !newFiles.some(f => f.dataURL === imagePreview)) {
        const nextImage = newFiles.find(f => f.dataURL);
        setImagePreview(nextImage ? nextImage.dataURL : null);
      }
      return newFiles;
    });
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setSelectedFiles(prev => prev.filter(f => !f.dataURL));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setImagePreview(null);
  };

  // Ẩn ChatBubble khi ở trang /chat hoặc khi chưa đăng nhập
  if (window.location.pathname === '/chat' || !currentUserId) {
    return null;
  }

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <div 
          className="fixed z-50" 
          data-chat-bubble
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          <button
       onClick={(e) => {
         if (hasDragged) {
           e.preventDefault();
           return;
         }
         requireAuth(() => setIsOpen(true));
       }}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            {/* Notification badge - Hiển thị số lượng tin nhắn chưa đọc */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
          <div 
            data-chat-bubble
            className={`fixed bottom-2 right-6 z-50 rounded-lg shadow-2xl transition-all duration-300 ${
          isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            } ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'} flex flex-col`}
        >
          {/* Header */}
          <div className={`rounded-t-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          >
              {showChatList ? (
                // Header đơn giản cho danh sách chat
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>Đoạn chat</h3>
                  <div className="flex items-center gap-2">
                    {/* Maximize/Minimize button */}
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100'}`}
                    >
                      {isMinimized ? (
                        <FaExpand className="w-4 h-4" />
                      ) : (
                        <FaMinus className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Close button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-red-600 hover:bg-red-100'}`}
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                </div>
            ) : selectedChat ? (
              // Layout khi đang chat với người cụ thể
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={handleBackToList}
                      className={`p-1 rounded transition-colors mr-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="Quay lại danh sách"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                  </button>
                  <div className="relative">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {selectedChat.isOnline && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} rounded-full`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : ''}`}>{selectedChat.name}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {selectedChat.isOnline ? "Trực tuyến" : `Hoạt động ${selectedChat.lastActive}`}
                    </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                      className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isMinimized ? <FaExpand className="w-3 h-3" /> : <FaMinus className="w-3 h-3" />}
              </button>
              <button
                      onClick={closeChatBubble}
                      className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="Đóng chat"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
              </div>
            ) : null}
          </div>

          {!isMinimized && (
            <>
              {showChatList ? (
                // Layout cho danh sách chat với nút cố định ở dưới
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 flex min-h-0">
                    <ChatList
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      selectedChat={selectedChat}
                      onChatSelect={handleChatSelect}
                      showSettingsMenu={showSettingsMenu}
                      setShowSettingsMenu={setShowSettingsMenu}
                      settingsMenuRef={settingsMenuRef}
                      conversations={conversations}
                      loading={loading}
                      error={error}
                      isFullWidth={true}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  {/* Nút "Xem tất cả tin nhắn trong ChatBox" cố định ở dưới */}
                  <div className={`border-t flex-shrink-0 rounded-b-lg ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                    <button
                      onClick={() => {
                        requireAuth(() => {
                          window.location.href = '/chat';
                          setIsOpen(false);
                        });
                      }}
                      className={`w-full text-center text-sm font-medium py-3 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
                    >
                      Xem tất cả tin nhắn trong ChatBox
                    </button>
                  </div>
                </div>
              ) : selectedChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[300px] scrollbar-hide">
                    <MessageList 
                      messages={messages}
                      messagesEndRef={messagesEndRef}
                      showBackground={false}
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  {/* Input Area */}
                  <div className={`p-3 flex-shrink-0 rounded-b-lg border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <MessageInput 
                      newMessage={newMessage}
                      setNewMessage={setNewMessage}
                      onSendMessage={handleSendMessage}
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                      isRecording={isRecording}
                      onVoiceRecord={handleVoiceRecord}
                      onFileSelect={handleFileSelect}
                      onRemoveFile={removeFile}
                      onRemoveImagePreview={removeImagePreview}
                      onClearAllFiles={clearAllFiles}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
        navigate={(path) => window.location.href = path}
      />
    </>
  );
};

export default ChatBubble;

