/**
 * WebSocket Service
 * Quản lý kết nối WebSocket cho chat realtime
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  /**
   * Kết nối WebSocket
   * @param {string} url - URL WebSocket server
   * @param {string} token - JWT token để xác thực
   */
  connect(url, token) {
    try {
      // Disconnect existing connection first
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      
      // Store connection details for reconnect
      this.lastUrl = url;
      this.lastToken = token;
      
      this.socket = new WebSocket(`${url}?token=${token}`);
      
      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Tự động reconnect nếu không phải close bình thường và server có thể có sẵn
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else if (event.code === 1006) {
          // Connection closed abnormally - server might not be running
          this.emit('serverUnavailable');
        }
      };

      this.socket.onerror = (error) => {
        this.emit('error', error);
      };

    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Tự động reconnect
   */
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        // Use stored connection details instead of socket.url to avoid token duplication
        if (this.lastUrl && this.lastToken) {
          this.connect(this.lastUrl, this.lastToken);
        } else {
          this.emit('serverUnavailable');
        }
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  /**
   * Stop reconnection attempts
   */
  stopReconnecting() {
    this.reconnectAttempts = this.maxReconnectAttempts;
  }

  /**
   * Lấy token từ URL
   */
  getTokenFromUrl() {
    const url = new URL(this.socket.url);
    return url.searchParams.get('token');
  }

  /**
   * Gửi tin nhắn qua WebSocket
   * @param {Object} message - Tin nhắn cần gửi
   */
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    } else {
      return false;
    }
  }

  /**
   * Đăng ký listener cho event
   * @param {string} event - Tên event
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Hủy đăng ký listener
   * @param {string} event - Tên event
   * @param {Function} callback - Callback function cần hủy
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event đến tất cả listeners
   * @param {string} event - Tên event
   * @param {*} data - Dữ liệu
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Đăng ký lắng nghe tin nhắn mới
   * @param {Function} callback - Callback khi có tin nhắn mới
   */
  onNewMessage(callback) {
    this.on('message', (data) => {
      if (data.type === 'new_message') {
        callback(data.payload);
      }
    });
  }

  /**
   * Đăng ký lắng nghe cập nhật trạng thái đọc
   * @param {Function} callback - Callback khi có cập nhật trạng thái
   */
  onMessageRead(callback) {
    this.on('message', (data) => {
      if (data.type === 'message_read') {
        callback(data.payload);
      }
    });
  }

  /**
   * Đăng ký lắng nghe typing indicator
   * @param {Function} callback - Callback khi có typing
   */
  onTyping(callback) {
    this.on('message', (data) => {
      if (data.type === 'typing') {
        callback(data.payload);
      }
    });
  }

  /**
   * Gửi typing indicator
   * @param {string} conversationId - ID conversation
   * @param {string} userId - ID user
   * @param {boolean} isTyping - Đang typing hay không
   */
  sendTyping(conversationId, userId, isTyping) {
    this.send({
      type: 'typing',
      payload: {
        conversationId,
        userId,
        isTyping
      }
    });
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param {string} messageId - ID tin nhắn
   * @param {string} userId - ID user
   */
  markAsRead(messageId, userId) {
    this.send({
      type: 'mark_read',
      payload: {
        messageId,
        userId
      }
    });
  }

  /**
   * Đóng kết nối WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.listeners.clear();
    // Clear stored connection details
    this.lastUrl = null;
    this.lastToken = null;
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export default new WebSocketService();
