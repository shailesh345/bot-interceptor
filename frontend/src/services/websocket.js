import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.url = import.meta.env.VITE_WS_URL || 'http://127.0.0.1:9889';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
    this.isConnecting = false;
    this.autoReconnect = true;
  }

  // Connect to Socket.IO
  connect() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;
    
    try {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });
      
      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
        
        // Send authentication if token exists
        const token = localStorage.getItem('token');
        if (token) {
          this.send('auth', { token });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        this.isConnecting = false;
        this.emit('disconnected', { reason });
        
        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      });

      // Listen for Socket.IO events from backend
      this.socket.on('traffic_update', (data) => {
        this.handleTrafficUpdate(data);
      });

      this.socket.on('new_alert', (data) => {
        this.handleSystemAlert(data);
      });

      this.socket.on('analytics_update', (data) => {
        this.emit('analytics_update', data);
      });

      this.socket.on('system_status', (data) => {
        this.emit('system_status', data);
      });

      this.socket.on('bot_detected', (data) => {
        this.emit('bot_detected', data);
      });

      this.socket.on('new_notification', (data) => {
        this.handleNotification(data);
      });

      this.socket.on('connected', (data) => {
        console.log('Socket.IO connected event received:', data);
      });

      this.socket.on('subscribed', (data) => {
        console.log('Subscribed to room:', data);
      });

    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload, timestamp } = data;
    
    // Emit event for message type
    this.emit(type, payload, timestamp);
    
    // Handle specific message types
    switch (type) {
      case 'notification':
        this.handleNotification(payload);
        break;
      case 'traffic_update':
        this.handleTrafficUpdate(payload);
        break;
      case 'system_alert':
        this.handleSystemAlert(payload);
        break;
      case 'performance_metrics':
        this.handlePerformanceMetrics(payload);
        break;
      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;
      case 'auth_error':
        console.error('WebSocket authentication failed:', payload);
        break;
      default:
        console.log('Unhandled WebSocket message type:', type);
    }
  }

  // Handle notification messages
  handleNotification(notification) {
    // Emit to notification system
    this.emit('new_notification', notification);
    
    // Show toast notification
    if (notification.showToast !== false) {
      const icon = this.getNotificationIcon(notification.type);
      toast(notification.message, {
        icon,
        duration: notification.duration || 4000,
        style: {
          background: this.getNotificationColor(notification.type),
          color: 'white',
        },
      });
    }
  }

  // Handle traffic updates
  handleTrafficUpdate(trafficData) {
    this.emit('traffic_update', trafficData);
  }

  // Handle system alerts
  handleSystemAlert(alert) {
    this.emit('system_alert', alert);
    
    // Show critical alerts as toasts
    if (alert.severity === 'critical') {
      toast.error(alert.message, {
        duration: 0, // Don't auto-dismiss critical alerts
      });
    }
  }

  // Handle performance metrics
  handlePerformanceMetrics(metrics) {
    this.emit('performance_update', metrics);
  }

  // Send message via Socket.IO
  send(type, payload) {
    if (this.socket?.connected) {
      this.socket.emit(type, payload);
    } else {
      console.warn('Socket.IO not connected, cannot send message');
    }
  }

  // Subscribe to events
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Unsubscribe from events
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit events to handlers
  emit(event, ...args) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Schedule reconnection
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect();
      }
    }, delay);
  }

  // Disconnect WebSocket
  disconnect() {
    this.autoReconnect = false;
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
  }

  // Get connection status
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Get notification icon
  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      security: '🔒',
      performance: '⚡',
      system: '🖥️'
    };
    return icons[type] || icons.info;
  }

  // Get notification color
  getNotificationColor(type) {
    const colors = {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      security: '#8B5CF6',
      performance: '#F97316',
      system: '#6B7280'
    };
    return colors[type] || colors.info;
  }

  // Request specific data
  requestData(type, params = {}) {
    this.send('request', { type, params });
  }

  // Subscribe to data stream
  subscribe(stream, params = {}) {
    this.send('subscribe', { stream, params });
  }

  // Unsubscribe from data stream
  unsubscribe(stream) {
    this.send('unsubscribe', { stream });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
