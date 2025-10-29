/**
 * Chat UI Component
 * Giao diện chat với SignalR integration
 */
class ChatUI {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showTypingIndicator: true,
            showReadStatus: true,
            autoScroll: true,
            maxMessages: 100,
            ...options
        };
        
        this.signalRClient = null;
        this.currentConversationId = null;
        this.currentUserId = null;
        this.messages = [];
        this.typingUsers = new Set();
        this.typingTimeout = null;
        
        this.initializeUI();
    }

    /**
     * Khởi tạo giao diện chat
     */
    initializeUI() {
        if (!this.container) {
            console.error("Chat container not found");
            return;
        }

        this.container.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <h3 id="chat-title">Chat</h3>
                    <div class="connection-status" id="connection-status">
                        <span class="status-indicator offline"></span>
                        <span class="status-text">Disconnected</span>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <div class="no-messages">No messages yet</div>
                </div>
                
                <div class="typing-indicator" id="typing-indicator" style="display: none;">
                    <span class="typing-text"></span>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" id="message-input" placeholder="Type a message..." disabled>
                        <button id="send-button" disabled>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        // Gửi tin nhắn
        sendButton.addEventListener('click', () => this.sendMessage());
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Typing indicator
        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        messageInput.addEventListener('blur', () => {
            this.handleStopTyping();
        });
    }

    /**
     * Khởi tạo SignalR client
     */
    async initializeSignalR(token, userId) {
        try {
            this.currentUserId = userId;
            this.signalRClient = new SignalRChatClient();
            
            // Override event handlers
            this.signalRClient.onConnectionStateChanged = (isConnected) => {
                this.updateConnectionStatus(isConnected);
                this.toggleInput(isConnected);
            };

            this.signalRClient.onMessageReceived = (messageData) => {
                this.addMessage(messageData);
            };

            this.signalRClient.onJoinedConversation = (conversationId) => {
                this.currentConversationId = conversationId;
                this.updateChatTitle(`Conversation ${conversationId.substring(0, 8)}...`);
            };

            this.signalRClient.onUserTyping = (data) => {
                this.updateTypingIndicator(data);
            };

            this.signalRClient.onMessageRead = (data) => {
                this.updateMessageReadStatus(data);
            };

            this.signalRClient.onError = (errorMessage) => {
                this.showError(errorMessage);
            };

            await this.signalRClient.initialize(token, userId);
            
        } catch (error) {
            console.error("Failed to initialize SignalR:", error);
            this.showError("Failed to connect to chat server");
        }
    }

    /**
     * Tham gia conversation
     */
    async joinConversation(conversationId) {
        if (!this.signalRClient) {
            console.error("SignalR client not initialized");
            return;
        }

        try {
            await this.signalRClient.joinConversation(conversationId);
            this.currentConversationId = conversationId;
        } catch (error) {
            console.error("Failed to join conversation:", error);
            this.showError("Failed to join conversation");
        }
    }

    /**
     * Gửi tin nhắn
     */
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();
        
        if (!content || !this.signalRClient) return;

        try {
            await this.signalRClient.sendMessage(content);
            messageInput.value = '';
            this.handleStopTyping();
        } catch (error) {
            console.error("Failed to send message:", error);
            this.showError("Failed to send message");
        }
    }

    /**
     * Thêm tin nhắn vào UI
     */
    addMessage(messageData) {
        const messagesContainer = document.getElementById('chat-messages');
        const noMessagesDiv = messagesContainer.querySelector('.no-messages');
        
        if (noMessagesDiv) {
            noMessagesDiv.remove();
        }

        const messageElement = this.createMessageElement(messageData);
        messagesContainer.appendChild(messageElement);
        
        // Giới hạn số tin nhắn
        if (this.messages.length >= this.options.maxMessages) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }
        
        this.messages.push(messageData);
        
        if (this.options.autoScroll) {
            this.scrollToBottom();
        }
    }

    /**
     * Tạo element tin nhắn
     */
    createMessageElement(messageData) {
        const isOwnMessage = messageData.SenderId === this.currentUserId;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
        
        const time = new Date(messageData.CreatedAt).toLocaleTimeString();
        const readStatus = messageData.IsRead ? '✓✓' : '✓';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(messageData.Content)}</div>
                <div class="message-meta">
                    <span class="message-time">${time}</span>
                    ${isOwnMessage ? `<span class="read-status">${readStatus}</span>` : ''}
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    /**
     * Cập nhật trạng thái kết nối
     */
    updateConnectionStatus(isConnected) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (isConnected) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Connected';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Disconnected';
        }
    }

    /**
     * Bật/tắt input
     */
    toggleInput(enabled) {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        messageInput.disabled = !enabled;
        sendButton.disabled = !enabled;
    }

    /**
     * Cập nhật tiêu đề chat
     */
    updateChatTitle(title) {
        const chatTitle = document.getElementById('chat-title');
        chatTitle.textContent = title;
    }

    /**
     * Xử lý typing indicator
     */
    handleTyping() {
        if (!this.signalRClient || !this.currentConversationId) return;

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Start typing
        this.signalRClient.startTyping();

        // Stop typing after 3 seconds of inactivity
        this.typingTimeout = setTimeout(() => {
            this.signalRClient.stopTyping();
        }, 3000);
    }

    /**
     * Dừng typing indicator
     */
    handleStopTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        
        if (this.signalRClient) {
            this.signalRClient.stopTyping();
        }
    }

    /**
     * Cập nhật typing indicator
     */
    updateTypingIndicator(data) {
        const typingIndicator = document.getElementById('typing-indicator');
        const typingText = typingIndicator.querySelector('.typing-text');
        
        if (data.IsTyping) {
            this.typingUsers.add(data.UserId);
        } else {
            this.typingUsers.delete(data.UserId);
        }

        if (this.typingUsers.size > 0) {
            const userCount = this.typingUsers.size;
            typingText.textContent = `${userCount} user${userCount > 1 ? 's' : ''} typing...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    }

    /**
     * Cập nhật trạng thái đã đọc
     */
    updateMessageReadStatus(data) {
        // Implementation for read status updates
        console.log("Message read:", data);
    }

    /**
     * Cuộn xuống cuối
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Hiển thị lỗi
     */
    showError(message) {
        // Simple error display - you can enhance this
        alert(`Error: ${message}`);
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Ngắt kết nối
     */
    async disconnect() {
        if (this.signalRClient) {
            await this.signalRClient.disconnect();
        }
    }
}

// Export cho sử dụng global
window.ChatUI = ChatUI;
