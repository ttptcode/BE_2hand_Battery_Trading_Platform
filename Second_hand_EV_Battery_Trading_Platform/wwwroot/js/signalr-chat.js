/**
 * SignalR Chat Client
 * Real-time chat functionality using SignalR
 */
class SignalRChatClient {
    constructor() {
        this.connection = null;
        this.currentConversationId = null;
        this.currentUserId = null;
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    /**
     * Khởi tạo kết nối SignalR
     */
    async initialize(token, userId) {
        try {
            this.currentUserId = userId;
            
            // Tạo kết nối SignalR với JWT token
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/chathub", {
                    accessTokenFactory: () => token,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Đăng ký các event handlers
            this.setupEventHandlers();

            // Bắt đầu kết nối
            await this.connection.start();
            this.isConnected = true;
            this.retryCount = 0;
            
            console.log("SignalR connected successfully");
            this.onConnectionStateChanged(true);
            
        } catch (error) {
            console.error("SignalR connection failed:", error);
            this.handleConnectionError(error);
        }
    }

    /**
     * Thiết lập các event handlers
     */
    setupEventHandlers() {
        // Kết nối thành công
        this.connection.onclose((error) => {
            this.isConnected = false;
            console.log("SignalR connection closed:", error);
            this.onConnectionStateChanged(false);
        });

        // Lỗi kết nối
        this.connection.onreconnecting((error) => {
            console.log("SignalR reconnecting:", error);
            this.onConnectionStateChanged(false);
        });

        // Kết nối lại thành công
        this.connection.onreconnected((connectionId) => {
            this.isConnected = true;
            console.log("SignalR reconnected:", connectionId);
            this.onConnectionStateChanged(true);
        });

        // Nhận tin nhắn mới
        this.connection.on("ReceiveMessage", (messageData) => {
            console.log("Received message:", messageData);
            this.onMessageReceived(messageData);
        });

        // Tham gia conversation thành công
        this.connection.on("JoinedConversation", (conversationId) => {
            console.log("Joined conversation:", conversationId);
            this.onJoinedConversation(conversationId);
        });

        // Rời khỏi conversation
        this.connection.on("LeftConversation", (conversationId) => {
            console.log("Left conversation:", conversationId);
            this.onLeftConversation(conversationId);
        });

        // User đang typing
        this.connection.on("UserTyping", (data) => {
            this.onUserTyping(data);
        });

        // Tin nhắn đã đọc
        this.connection.on("MessageRead", (data) => {
            this.onMessageRead(data);
        });

        // Lỗi từ server
        this.connection.on("Error", (errorMessage) => {
            console.error("Server error:", errorMessage);
            this.onError(errorMessage);
        });
    }

    /**
     * Tham gia conversation
     */
    async joinConversation(conversationId) {
        try {
            if (!this.isConnected) {
                throw new Error("SignalR not connected");
            }

            await this.connection.invoke("JoinConversation", conversationId);
            this.currentConversationId = conversationId;
            
        } catch (error) {
            console.error("Failed to join conversation:", error);
            this.onError("Failed to join conversation");
        }
    }

    /**
     * Rời khỏi conversation
     */
    async leaveConversation() {
        try {
            if (this.currentConversationId && this.isConnected) {
                await this.connection.invoke("LeaveConversation", this.currentConversationId);
                this.currentConversationId = null;
            }
        } catch (error) {
            console.error("Failed to leave conversation:", error);
        }
    }

    /**
     * Gửi tin nhắn
     */
    async sendMessage(content) {
        try {
            if (!this.isConnected || !this.currentConversationId) {
                throw new Error("Not connected or no active conversation");
            }

            await this.connection.invoke("SendMessage", this.currentConversationId, content);
            
        } catch (error) {
            console.error("Failed to send message:", error);
            this.onError("Failed to send message");
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    async markAsRead(messageId) {
        try {
            if (!this.isConnected || !this.currentConversationId) {
                return;
            }

            await this.connection.invoke("MarkAsRead", this.currentConversationId, messageId);
            
        } catch (error) {
            console.error("Failed to mark message as read:", error);
        }
    }

    /**
     * Bắt đầu typing indicator
     */
    async startTyping() {
        try {
            if (this.isConnected && this.currentConversationId) {
                await this.connection.invoke("StartTyping", this.currentConversationId);
            }
        } catch (error) {
            console.error("Failed to start typing:", error);
        }
    }

    /**
     * Dừng typing indicator
     */
    async stopTyping() {
        try {
            if (this.isConnected && this.currentConversationId) {
                await this.connection.invoke("StopTyping", this.currentConversationId);
            }
        } catch (error) {
            console.error("Failed to stop typing:", error);
        }
    }

    /**
     * Ngắt kết nối
     */
    async disconnect() {
        try {
            if (this.connection) {
                await this.connection.stop();
                this.isConnected = false;
                this.currentConversationId = null;
            }
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    }

    /**
     * Xử lý lỗi kết nối
     */
    handleConnectionError(error) {
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
            console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`);
            setTimeout(() => {
                this.initialize(this.getStoredToken(), this.currentUserId);
            }, 2000 * this.retryCount);
        } else {
            console.error("Max retries reached. Connection failed.");
            this.onError("Connection failed after multiple attempts");
        }
    }

    /**
     * Lấy token từ localStorage
     */
    getStoredToken() {
        return localStorage.getItem('jwt_token');
    }

    // ===== EVENT HANDLERS (Override these methods) =====

    /**
     * Khi trạng thái kết nối thay đổi
     */
    onConnectionStateChanged(isConnected) {
        // Override this method in your implementation
        console.log("Connection state changed:", isConnected);
    }

    /**
     * Khi nhận tin nhắn mới
     */
    onMessageReceived(messageData) {
        // Override this method in your implementation
        console.log("Message received:", messageData);
    }

    /**
     * Khi tham gia conversation
     */
    onJoinedConversation(conversationId) {
        // Override this method in your implementation
        console.log("Joined conversation:", conversationId);
    }

    /**
     * Khi rời khỏi conversation
     */
    onLeftConversation(conversationId) {
        // Override this method in your implementation
        console.log("Left conversation:", conversationId);
    }

    /**
     * Khi user đang typing
     */
    onUserTyping(data) {
        // Override this method in your implementation
        console.log("User typing:", data);
    }

    /**
     * Khi tin nhắn đã đọc
     */
    onMessageRead(data) {
        // Override this method in your implementation
        console.log("Message read:", data);
    }

    /**
     * Khi có lỗi
     */
    onError(errorMessage) {
        // Override this method in your implementation
        console.error("Error:", errorMessage);
    }
}

// Export cho sử dụng global
window.SignalRChatClient = SignalRChatClient;
