import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCommentDots, FaUser } from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
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

const ChatBoxHome = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingConversationName, setLoadingConversationName] = useState(false);
  
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
  
  // Debug logging for selectedChat changes
  useEffect(() => {
    
    if (selectedChat === null) {
      
      // Try to restore selectedChat from conversations if available
      if (conversations.length > 0 && currentConversationIdRef.current) {
        const restoredChat = conversations.find(conv => conv.conversationId === currentConversationIdRef.current);
        if (restoredChat) {
          setSelectedChat(restoredChat);
        }
      }
    }
  }, [selectedChat, conversations]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const urlConversationLoaded = useRef(false); // Track if URL conversation was already loaded
  const currentConversationIdRef = useRef(null); // Track current conversation ID to prevent race conditions

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
    // Không có fallback - yêu cầu user phải đăng nhập
    console.error('❌ No user ID found - user must be logged in');
    return null;
  };
  
  const currentUserId = getCurrentUserId();
  
  // Kiểm tra user đã đăng nhập chưa
  if (!currentUserId) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để sử dụng tính năng chat</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg transition-colors duration-300"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }
  
  // Get URL parameters
  const conversationId = searchParams.get('conversationId');
  const preset = searchParams.get('preset');
  const sellerName = searchParams.get('sellerName');
  const buyerName = searchParams.get('buyerName');


  // Load conversation name with loading state
  const loadConversationName = async (conversation) => {
    try {
      setLoadingConversationName(true);
      
      // ALWAYS fetch from API to get complete seller/buyer info
      // URL parameters alone are not enough because we need userId to determine who is the other person
      const response = await getConversation(conversation.conversationId);
      
      if (response.success && response.data) {
        const { seller, buyer } = response.data;
        
        // Determine other person based on current user ID
        const otherPerson = seller?.userId === currentUserId ? buyer : seller;
        
        // Prefer name from URL params if available (faster), otherwise use API response
        let otherPersonName = otherPerson?.fullName || 'Unknown User';
        if (sellerName && buyerName) {
          // Use URL params to get the correct name
          otherPersonName = seller?.userId === currentUserId ? buyerName : sellerName;
        }
        
        // Generate avatar placeholder using first letter of name
        const avatarLetter = otherPersonName.charAt(0).toUpperCase();
        const avatarColor = otherPerson?.userId 
          ? `hsl(${parseInt(otherPerson.userId.slice(0, 8), 16) % 360}, 70%, 60%)`
          : '#10b981';
        
        const updatedConversation = {
          ...conversation,
          name: otherPersonName,
          seller: seller,
          buyer: buyer,
          otherPerson: otherPerson,
          avatar: otherPerson?.avatar || conversation.avatar || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${avatarColor}"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial">${avatarLetter}</text></svg>`
        };
        
        setSelectedChat(updatedConversation);
        setConversations(prev => 
          prev.map(conv => 
            conv.conversationId === conversation.conversationId 
              ? updatedConversation 
              : conv
          )
        );
        setLoadingConversationName(false);
        return updatedConversation;
      } else {
        setLoadingConversationName(false);
        return conversation;
      }
    } catch (error) {
      console.error('❌ ChatBoxHome - Error loading conversation name:', error);
      setLoadingConversationName(false);
      return conversation;
    }
  };

  // Refresh conversations without resetting selected chat (for real-time updates)
  const refreshConversations = async () => {
    try {
      
      // CRITICAL: Don't refresh conversations if we have a selected chat
      // This prevents conversation jumping during real-time updates
      if (selectedChat) {
        return;
      }
      
      const response = await getUserConversations(currentUserId);
      
      if (response.success) {
        setConversations(response.data || []);
        
        // Check if selectedChat is still valid after refresh
        if (selectedChat) {
          const stillExists = response.data.find(conv => conv.conversationId === selectedChat.conversationId);
          if (!stillExists) {
          }
        }
      }
    } catch (err) {
      console.error('❌ ChatBoxHome - Error refreshing conversations:', err);
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations(); // Only load once on mount, don't reload on real-time updates
    
    // Initialize real-time messaging
    const initRealTimeMessaging = () => {
      // Clean up any existing polling first
      if (window.chatBoxPollingInterval) {
        clearInterval(window.chatBoxPollingInterval);
        window.chatBoxPollingInterval = null;
      }

      // Enable WebSocket by default, fallback to polling if not available
      const enableWebSocket = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
      
      if (!enableWebSocket) {
        startPolling();
        return;
      }

      // Try WebSocket first
      const token = tokenService.getAccessToken();
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";
      
      
      // Set a timeout to fallback to polling if WebSocket doesn't connect quickly
      const wsTimeout = setTimeout(() => {
        if (!websocketService.isConnected()) {
          websocketService.stopReconnecting();
          startPolling();
        }
      }, 5000); // 5 second timeout
      
      // Only connect if not already connected
      if (!websocketService.isConnected()) {
        websocketService.connect(wsUrl, token);
      } else {
        clearTimeout(wsTimeout);
      }
      
      // Clear timeout if WebSocket connects successfully
      websocketService.on('connected', () => {
        clearTimeout(wsTimeout);
      });
      
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
        if (selectedChat && conversationId === selectedChat.conversationId) {
          
          // Update message with real data from server
          setMessages(prev => {
            // Double-check that we're still on the same conversation to prevent race conditions
            if (currentConversationIdRef.current === conversationId) {
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
                return [...prev, {
                  id: messageId || Date.now(),
                  sender: messageData.sender || messageData.payload?.sender || 'other',
                  content: content,
                  createdAt: createdAt || new Date().toISOString(),
                  isRead: false
                }];
              }
            } else {
              return prev;
            }
          });
        }
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
      if (window.chatBoxPollingInterval) {
        return;
      }

      const pollInterval = setInterval(async () => {
        // Poll for the currently selected conversation using ref to avoid state issues
        const currentConversationId = currentConversationIdRef.current;
        
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
        
        // CRITICAL: Only poll if we have a selected conversation
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
              
              // Only update if messages changed and we're still on the same conversation
              setMessages(prev => {
                // Double-check that we're still on the same conversation to prevent race conditions
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
      }, 5000); // Increased to 5 seconds to reduce server load

      // Store interval for cleanup
      window.chatBoxPollingInterval = pollInterval;
    };

    initRealTimeMessaging();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      if (window.chatBoxPollingInterval) {
        clearInterval(window.chatBoxPollingInterval);
        window.chatBoxPollingInterval = null;
      }
    };
  }, []);

  // Handle URL parameters for direct conversation access
  useEffect(() => {
    if (conversationId && !urlConversationLoaded.current) {
      
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
          
          // Load messages immediately
          loadMessages(conversationId);
          
          urlConversationLoaded.current = true;
          
          // If there's a preset message, set it in the input
          if (preset) {
            setNewMessage(decodeURIComponent(preset));
          }
          
          // PRIORITY 2: Load full conversation details in background for accuracy
          loadConversationName(targetConversation).then((updatedConv) => {
            // API response will update with more accurate info if available
            // But UI already shows name from URL params - no blocking!
          });
          
          return; // Exit early
        }
      }
      
      // If no conversations loaded yet OR conversation not found in list,
      // try to get conversation from API (happens when navigating from ProductDetailPage)
      if (conversations.length === 0 || !conversations.find(conv => conv.conversationId === conversationId)) {
        
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
            
            // Mark as loaded BEFORE API call to prevent multiple calls
            urlConversationLoaded.current = true;
            
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
              console.warn('⚠️ ChatBoxHome - API call failed, using URL params:', apiError);
            }
          } catch (error) {
            console.error('❌ ChatBoxHome - Error loading conversation:', error);
            setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
            setLoading(false);
            urlConversationLoaded.current = false;
          }
        };
        
        loadConversationFromAPI();
      } else {
        // If there's a preset message, set it in the input
        if (preset) {
          setNewMessage(decodeURIComponent(preset));
        }
      }
    }
  }, [conversationId, conversations.length, preset]); // Add conversations.length to properly detect when list is loaded

  // Load conversations from API
  const loadConversations = async (preserveSelectedChat = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserConversations(currentUserId);
      
      if (response.success) {
        setConversations(response.data || []);
        
        // Only set first conversation as selected if no chat is currently selected
        // and not preserving selected chat (i.e., not from real-time updates)
        // Also check if we have a current conversation ID to preserve
        if (response.data && response.data.length > 0 && !selectedChat && !preserveSelectedChat && !currentConversationIdRef.current) {
            // Transform the first conversation to match expected format
            const firstConv = response.data[0];
            const otherPerson = firstConv.seller?.userId === currentUserId ? firstConv.buyer : firstConv.seller;
            
            const transformedConv = {
              conversationId: firstConv.conversationId,
              name: otherPerson?.fullName || 'Đang tải...', // Show loading if no name
              lastMessage: firstConv.lastMessage || 'Chưa có tin nhắn',
              time: firstConv.updatedAt ? new Date(firstConv.updatedAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '',
              isRead: true,
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
              isOnline: false,
              lastActive: "Không xác định",
              type: "individual",
              listing: firstConv.listing,
              seller: firstConv.seller,
              buyer: firstConv.buyer,
              // Thêm thông tin để phân biệt
              currentUserId: currentUserId,
              otherPerson: otherPerson
            };
          
          
          // If name is not available, load it from API
          if (!otherPerson?.fullName) {
            setSelectedChat(transformedConv);
            const updatedConv = await loadConversationName(transformedConv);
            await loadMessages(updatedConv.conversationId);
          } else {
            setSelectedChat(transformedConv);
            await loadMessages(firstConv.conversationId);
          }
        } else if (preserveSelectedChat && selectedChat) {
        } else if (currentConversationIdRef.current && !selectedChat) {
          // Try to restore selectedChat if we have a conversation ID but no selected chat
          const restoredChat = response.data.find(conv => conv.conversationId === currentConversationIdRef.current);
          if (restoredChat) {
            setSelectedChat(restoredChat);
          }
        } else {
        }
      }
    } catch (err) {
      console.error('❌ ChatBoxHome - Error loading conversations:', err);
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
      console.error('❌ Error loading messages:', err);
      
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

  // Mark messages as read
  const markMessagesAsRead = async (messages) => {
    try {
      // Only mark messages that are not from current user and not read yet
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== currentUserId && !msg.isRead
      );
      
      
      // Mark each unread message as read
      for (const message of unreadMessages) {
        try {
          await markMessageAsRead(message.id);
        } catch (error) {
          console.error('❌ Error marking message as read:', message.id, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in markMessagesAsRead:', error);
    }
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
    // Only scroll to bottom when new messages are added, not on initial load
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            senderId: currentUserId,
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
            isRead: false,
            senderId: currentUserId
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
            isRead: false,
            senderId: currentUserId
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


          // Try to send via WebSocket for real-time updates (optional)
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
          console.error('❌ Failed to send message:', response);
        }
      } catch (err) {
        console.error('❌ Error sending message:', err);
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
    
    // Clear messages immediately when switching chat rooms
    setMessages([]);
    
    // Clear any input state when switching chat rooms
    setNewMessage("");
    setSelectedFiles([]);
    setImagePreview(null);
    setShowEmojiPicker(false);
    
    // Set chat immediately with current name (or loading state if name is Unknown)
    if (chat.name === 'Unknown User' || !chat.name) {
      setSelectedChat({
        ...chat,
        name: 'Đang tải...'
      });
      
      // Load full conversation details to get correct name
      const updatedChat = await loadConversationName(chat);
      await loadMessages(updatedChat.conversationId);
    } else {
      setSelectedChat(chat);
      await loadMessages(chat.conversationId);
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    const processedFilesPromises = newFiles.map(file => {
      return new Promise(resolve => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({ file, dataURL: event.target.result });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ file }); // For non-image files, just store the file object
        }
      });
    });

    Promise.all(processedFilesPromises).then(processed => {
      setSelectedFiles(prev => [...prev, ...processed]);
      // If there's an image among the newly selected files, set the preview
      const firstImage = processed.find(item => item.dataURL);
      if (firstImage) {
        setImagePreview(firstImage.dataURL);
      }
    });
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // In real app, implement actual voice recording
      setTimeout(() => {
        setIsRecording(false);
        // Simulate voice message
        const voiceMessage = {
          id: Date.now(),
          sender: "user",
          content: "🎤 Tin nhắn thoại",
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
          isVoice: true
        };
        // Add message after a small delay to ensure smooth transition
        setTimeout(() => {
          setMessages(prev => [...prev, voiceMessage]);
        }, 50);
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // If the removed file was the one being previewed, clear preview or show another image
      if (imagePreview && !newFiles.some(f => f.dataURL === imagePreview)) {
        const nextImage = newFiles.find(f => f.dataURL);
        setImagePreview(nextImage ? nextImage.dataURL : null);
      }
      return newFiles;
    });
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    // Remove only image files from selectedFiles
    setSelectedFiles(prev => prev.filter(f => !f.dataURL));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setImagePreview(null);
  };

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ height: 'calc(100vh - 68px)' }}>
      {/* Left Sidebar */}
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
        showBorder={true}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {conversations.length === 0 ? (
          // Empty State when no chats
          <div className={`flex-1 flex flex-col items-center justify-center px-8 h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Illustration */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center space-x-8">
                {/* Male Profile */}
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <FaCommentDots className="w-3 h-3 text-emerald-800" />
                  </div>
                </div>

                {/* Female Profile */}
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <FaCommentDots className="w-3 h-3 text-emerald-800" />
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 right-1/4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 left-1/4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>

            {/* Main Message */}
            <h2 className={`text-2xl font-bold mb-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Bạn chưa có cuộc trò chuyện nào!
            </h2>

            {/* Description */}
            <p className={`text-center mb-8 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Trải nghiệm chat để làm rõ thông tin về mặt hàng trước khi bắt đầu thực hiện mua bán
            </p>

            {/* Call to Action */}
            <Link
              to="/"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg transition-colors duration-300 hover:scale-105 hover:shadow-lg"
            >
              Về trang chủ
            </Link>
          </div>
        ) : selectedChat ? (
          <>
            {/* Chat Header */}
            <ChatHeader selectedChat={selectedChat} isDarkMode={isDarkMode} />

            {/* Messages */}
            <MessageList 
              messages={messages}
              messagesEndRef={messagesEndRef}
              isDarkMode={isDarkMode}
            />

            {/* Input Area */}
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
          </>
        ) : (
          // Empty State when no chat selected
          <div className={`flex-1 flex flex-col items-center justify-center px-8 h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Illustration */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center space-x-8">
                {/* Male Profile */}
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <FaCommentDots className="w-3 h-3 text-emerald-800" />
                  </div>
                </div>

                {/* Female Profile */}
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <FaCommentDots className="w-3 h-3 text-emerald-800" />
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 right-1/4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 left-1/4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>

            {/* Main Message */}
            <h2 className={`text-2xl font-bold mb-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Bạn chưa có cuộc trò chuyện nào!
            </h2>

            {/* Description */}
            <p className={`text-center mb-8 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Trải nghiệm chat để làm rõ thông tin về mặt hàng trước khi bắt đầu thực hiện mua bán
            </p>

            {/* Call to Action */}
            <Link
              to="/"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg transition-colors duration-300 hover:scale-105 hover:shadow-lg"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBoxHome;