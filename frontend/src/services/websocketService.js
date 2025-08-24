/**
 * WebSocket Service for Real-Time Communication
 * Handles connections, subscriptions, and real-time updates
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.connectionCallbacks = [];
  }

  /**
   * Initialize WebSocket connection
   */
  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Get the current hostname and port for WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '5001'; // Backend WebSocket port
        
        const wsUrl = `${protocol}//${host}:${port}`;
        console.log('Connecting to WebSocket:', wsUrl);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Authenticate the connection
          this.authenticate(token);
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => callback(true));
          
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          
          // Notify connection callbacks
          this.connectionCallbacks.forEach(callback => callback(false));
          
          // Attempt to reconnect if not manually closed
          if (event.code !== 1000) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Authenticate WebSocket connection
   */
  authenticate(token) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  /**
   * Subscribe to a specific room/channel
   */
  subscribe(room, callback) {
    if (!this.isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return false;
    }

    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.set(subscriptionId, { room, callback });

    this.socket.send(JSON.stringify({
      type: 'join_room',
      room: room
    }));

    console.log(`Subscribed to room: ${room}`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a room
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      this.socket.send(JSON.stringify({
        type: 'leave_room',
        room: subscription.room
      }));
      
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from room: ${subscription.room}`);
    }
  }

  /**
   * Subscribe to traffic updates
   */
  subscribeToTraffic(domain = 'all', callback) {
    return this.subscribe(`traffic_${domain}`, callback);
  }

  /**
   * Subscribe to alerts
   */
  subscribeToAlerts(callback) {
    return this.subscribe('alerts', callback);
  }

  /**
   * Subscribe to analytics updates
   */
  subscribeToAnalytics(callback) {
    return this.subscribe('analytics', callback);
  }

  /**
   * Subscribe to bot detection events
   */
  subscribeToBotDetection(callback) {
    return this.subscribe('bot_alerts', callback);
  }

  /**
   * Subscribe to system status updates
   */
  subscribeToSystemStatus(callback) {
    return this.subscribe('system', callback);
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(userId, callback) {
    return this.subscribe(`notifications_${userId}`, callback);
  }

  /**
   * Send message to WebSocket server
   */
  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('Received WebSocket message:', message);

      // Handle different message types
      switch (message.type) {
        case 'connected':
          console.log('WebSocket connection confirmed:', message.message);
          break;
          
        case 'room_joined':
          console.log('Joined room:', message.room);
          break;
          
        case 'traffic_update':
          this.handleTrafficUpdate(message);
          break;
          
        case 'new_alert':
          this.handleAlert(message);
          break;
          
        case 'analytics_update':
          this.handleAnalyticsUpdate(message);
          break;
          
        case 'bot_detected':
          this.handleBotDetection(message);
          break;
          
        case 'system_status':
          this.handleSystemStatus(message);
          break;
          
        case 'new_notification':
          this.handleNotification(message);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle traffic updates
   */
  handleTrafficUpdate(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room.startsWith('traffic_')) {
        subscription.callback(message);
      }
    });
  }

  /**
   * Handle alert messages
   */
  handleAlert(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room === 'alerts') {
        subscription.callback(message);
      }
    });
  }

  /**
   * Handle analytics updates
   */
  handleAnalyticsUpdate(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room === 'analytics') {
        subscription.callback(message);
      }
    });
  }

  /**
   * Handle bot detection events
   */
  handleBotDetection(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room === 'bot_alerts') {
        subscription.callback(message);
      }
    });
  }

  /**
   * Handle system status updates
   */
  handleSystemStatus(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room === 'system') {
        subscription.callback(message);
      }
    });
  }

  /**
   * Handle notification messages
   */
  handleNotification(message) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.room.startsWith('notifications_')) {
        subscription.callback(message);
      }
    });
  }

  /**
   * Add connection status callback
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Remove connection status callback
   */
  removeConnectionCallback(callback) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token).catch(error => {
            console.error('Reconnection failed:', error);
          });
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Generate unique subscription ID
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.entries()).map(([id, subscription]) => ({
      id,
      room: subscription.room
    }));
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
