import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

/**
 * Enhanced WebSocket service with robust connection handling and error recovery
 */
class EnhancedWebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.connectionStatus = 'disconnected' // disconnected, connecting, connected, error
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.eventHandlers = new Map()
    this.messageQueue = []
    this.connectionStatusListeners = []
    this.domainSubscriptions = new Map() // domainId -> Set of callback functions
    this.connectionMonitorInterval = null
    this.pingInterval = null
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - Authentication token
   * @returns {Promise} - Resolves when connected, rejects on failure
   */
  connect(token = null) {
    if (this.socket && this.isConnected) {
      return Promise.resolve()
    }

    this._setConnectionStatus('connecting')
    
    return new Promise((resolve, reject) => {
      try {
        // Connect to WebSocket server
        this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8960', {
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
          this._setConnectionStatus('connected')
          this.reconnectAttempts = 0
          
          // Resubscribe to domains
          this._resubscribeAll()
          
          // Process any queued messages
          this._processMessageQueue()
          
          // Start connection monitoring
          this._startConnectionMonitoring()
          
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          this.isConnected = false
          this._setConnectionStatus('disconnected')
          
          // Stop connection monitoring
          this._stopConnectionMonitoring()
          
          // Attempt reconnection if not closed intentionally
          if (reason !== 'io client disconnect') {
            this._attemptReconnect()
          }
        })

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          this._setConnectionStatus('error')
          
          // Attempt reconnection
          this._attemptReconnect()
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error)
          }
        })

        // Custom events
        this.socket.on('traffic_update', (data) => {
          this._handleTrafficUpdate(data)
        })
        
        this.socket.on('system_status', (data) => {
          this._handleSystemStatus(data)
        })
        
        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error)
          toast.error(`WebSocket error: ${error.message || 'Unknown error'}`)
        })

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        this._setConnectionStatus('error')
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this._setConnectionStatus('disconnected')
      this._stopConnectionMonitoring()
    }
  }

  /**
   * Subscribe to domain traffic updates
   * @param {string} domainId - Domain ID to subscribe to
   * @param {Function} callback - Function to call when traffic updates are received
   */
  subscribeToDomain(domainId, callback) {
    if (!domainId) {
      console.error('No domain ID provided for subscription')
      return
    }
    
    // Add to subscriptions
    if (!this.domainSubscriptions.has(domainId)) {
      this.domainSubscriptions.set(domainId, new Set())
    }
    this.domainSubscriptions.get(domainId).add(callback)
    
    // Send subscription to server if connected
    if (this.isConnected && this.socket) {
      this.socket.emit('subscribe_domains', { domains: [domainId] }, (response) => {
        if (response && response.success) {
          console.log(`Subscribed to domain: ${domainId}`)
        } else {
          console.error(`Failed to subscribe to domain: ${domainId}`, response)
        }
      })
    } else {
      // Queue the subscription for when connection is established
      this.messageQueue.push({
        type: 'subscribe',
        domainId,
        callback
      })
    }
  }

  /**
   * Unsubscribe from domain traffic updates
   * @param {string} domainId - Domain ID to unsubscribe from
   * @param {Function} callback - Specific callback to remove (optional)
   */
  unsubscribeFromDomain(domainId, callback = null) {
    if (!domainId) return
    
    if (callback) {
      // Remove specific callback
      const callbacks = this.domainSubscriptions.get(domainId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.domainSubscriptions.delete(domainId)
        }
      }
    } else {
      // Remove all callbacks for this domain
      this.domainSubscriptions.delete(domainId)
    }
    
    // Send unsubscribe to server if connected
    if (this.isConnected && this.socket) {
      this.socket.emit('unsubscribe_domains', { domains: [domainId] }, (response) => {
        if (response && response.success) {
          console.log(`Unsubscribed from domain: ${domainId}`)
        } else {
          console.error(`Failed to unsubscribe from domain: ${domainId}`, response)
        }
      })
    }
  }

  /**
   * Register a connection status change listener
   * @param {Function} listener - Function to call when connection status changes
   * @returns {Function} - Function to call to remove the listener
   */
  onConnectionStatusChange(listener) {
    this.connectionStatusListeners.push(listener)
    
    // Call immediately with current status
    listener(this.connectionStatus)
    
    // Return function to remove listener
    return () => {
      const index = this.connectionStatusListeners.indexOf(listener)
      if (index !== -1) {
        this.connectionStatusListeners.splice(index, 1)
      }
    }
  }

  /**
   * Get the current connection status
   * @returns {string} - Connection status
   */
  getConnectionStatus() {
    return this.connectionStatus
  }

  /**
   * Send a ping to the server to check connection
   * @returns {Promise} - Resolves with response time in ms, rejects on timeout
   */
  ping() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.socket) {
        reject(new Error('Not connected'))
        return
      }
      
      const startTime = Date.now()
      this.socket.emit('ping', {}, (response) => {
        if (response && response.success) {
          const endTime = Date.now()
          resolve(endTime - startTime)
        } else {
          reject(new Error('Ping failed'))
        }
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Ping timeout'))
      }, 5000)
    })
  }

  /**
   * Set connection status and notify listeners
   * @private
   * @param {string} status - New connection status
   */
  _setConnectionStatus(status) {
    this.connectionStatus = status
    
    // Notify listeners
    this.connectionStatusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in connection status listener:', error)
      }
    })
  }

  /**
   * Attempt to reconnect to the server
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      this._setConnectionStatus('error')
      return
    }
    
    this.reconnectAttempts++
    
    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1)
    console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  /**
   * Process any queued messages
   * @private
   */
  _processMessageQueue() {
    if (!this.isConnected || !this.socket) return
    
    const queue = [...this.messageQueue]
    this.messageQueue = []
    
    queue.forEach(message => {
      if (message.type === 'subscribe') {
        this.subscribeToDomain(message.domainId, message.callback)
      }
    })
  }

  /**
   * Resubscribe to all domains
   * @private
   */
  _resubscribeAll() {
    if (!this.isConnected || !this.socket) return
    
    const domains = Array.from(this.domainSubscriptions.keys())
    if (domains.length === 0) return
    
    this.socket.emit('subscribe_domains', { domains }, (response) => {
      if (response && response.success) {
        console.log(`Resubscribed to domains: ${domains.join(', ')}`)
      } else {
        console.error(`Failed to resubscribe to domains: ${domains.join(', ')}`, response)
      }
    })
  }

  /**
   * Handle traffic update from server
   * @private
   * @param {Object} data - Traffic update data
   */
  _handleTrafficUpdate(data) {
    if (!data || !data.domain_id) return
    
    const callbacks = this.domainSubscriptions.get(data.domain_id)
    if (!callbacks) return
    
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in traffic update callback:', error)
      }
    })
  }

  /**
   * Handle system status update from server
   * @private
   * @param {Object} data - System status data
   */
  _handleSystemStatus(data) {
    console.log('System status update:', data)
    // Could notify listeners or update UI
  }

  /**
   * Start connection monitoring
   * @private
   */
  _startConnectionMonitoring() {
    this._stopConnectionMonitoring()
    
    // Check connection every 30 seconds
    this.connectionMonitorInterval = setInterval(() => {
      if (!this.isConnected) return
      
      this.ping()
        .then(pingTime => {
          console.log(`Ping: ${pingTime}ms`)
        })
        .catch(error => {
          console.error('Ping failed:', error)
          if (this.isConnected) {
            // Connection might be dead, try to reconnect
            this.socket.disconnect()
            this.socket.connect()
          }
        })
    }, 30000)
    
    // Send ping every 25 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (!this.isConnected) return
      
      this.socket.emit('ping', {})
    }, 25000)
  }

  /**
   * Stop connection monitoring
   * @private
   */
  _stopConnectionMonitoring() {
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval)
      this.connectionMonitorInterval = null
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }
}

// Create singleton instance
const enhancedWebSocketService = new EnhancedWebSocketService()

export default enhancedWebSocketService
