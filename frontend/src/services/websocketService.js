import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.eventHandlers = new Map()
    this.connectionStatus = 'disconnected' // disconnected, connecting, connected, error
  }

  // Initialize WebSocket connection
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return Promise.resolve()
    }

    this.connectionStatus = 'connecting'
    
    return new Promise((resolve, reject) => {
      try {
        // Connect to WebSocket server
        this.socket = io(import.meta.env.VITE_WS_URL || 'http://127.0.0.1:9889', {
          auth: token ? { token } : undefined,
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
          maxReconnectionAttempts: this.maxReconnectAttempts,
        })

        // Connection events
        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.connectionStatus = 'connected'
          this.reconnectAttempts = 0
          toast.success('Real-time connection established')
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          this.isConnected = false
          this.connectionStatus = 'disconnected'
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            this.socket.connect()
          }
          
          toast.error('Real-time connection lost')
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          this.connectionStatus = 'error'
          this.reconnectAttempts++
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            toast.error('Failed to establish real-time connection')
            reject(error)
          }
        })

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('WebSocket reconnected after', attemptNumber, 'attempts')
          this.isConnected = true
          this.connectionStatus = 'connected'
          toast.success('Real-time connection restored')
        })

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log('WebSocket reconnection attempt:', attemptNumber)
          this.connectionStatus = 'connecting'
        })

        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed')
          this.connectionStatus = 'error'
          toast.error('Real-time connection failed permanently')
        })

        // Handle custom events
        this.setupEventHandlers()

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        this.connectionStatus = 'error'
        reject(error)
      }
    })
  }

  // Setup event handlers for real-time updates
  setupEventHandlers() {
    // Traffic updates
    this.socket.on('traffic_update', (data) => {
      this.emit('traffic_update', data)
    })

    // Security alerts
    this.socket.on('security_alert', (data) => {
      this.emit('security_alert', data)
      // Show toast notification for critical alerts
      if (data.severity === 'critical') {
        toast.error(`🚨 ${data.message}`, { duration: 10000 })
      } else if (data.severity === 'high') {
        toast.error(`⚠️ ${data.message}`, { duration: 8000 })
      } else {
        toast(data.message, { duration: 5000 })
      }
    })

    // System status updates
    this.socket.on('system_status', (data) => {
      this.emit('system_status', data)
    })

    // Performance metrics
    this.socket.on('performance_update', (data) => {
      this.emit('performance_update', data)
    })

    // Webhook delivery status
    this.socket.on('webhook_status', (data) => {
      this.emit('webhook_status', data)
    })

    // Edge node updates
    this.socket.on('edge_node_update', (data) => {
      this.emit('edge_node_update', data)
    })

    // User activity
    this.socket.on('user_activity', (data) => {
      this.emit('user_activity', data)
    })
  }

  // Subscribe to events
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  // Unsubscribe from events
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Emit events to subscribers
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // Send message to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }

  // Join a room/channel
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', room)
    }
  }

  // Leave a room/channel
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', room)
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.connectionStatus
  }

  // Check if connected
  isConnected() {
    return this.isConnected
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.connectionStatus = 'disconnected'
    }
  }

  // Reconnect manually
  reconnect() {
    if (this.socket) {
      this.socket.connect()
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

export default websocketService
