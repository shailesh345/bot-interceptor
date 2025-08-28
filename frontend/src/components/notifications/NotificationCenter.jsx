import React, { useState, useEffect, useRef } from 'react'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Settings, 
  Filter,
  Search,
  Clock,
  Star,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const NotificationCenter = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sound: true,
    desktop: true,
    critical: true,
    warning: true,
    info: true,
    success: true
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [webSocketStatus, setWebSocketStatus] = useState('disconnected')
  const wsRef = useRef(null)
  const audioRef = useRef(null)

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'critical',
      title: 'High Traffic Alert',
      message: 'Traffic spike detected on domain example.com',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'high',
      category: 'security',
      action: 'view',
      metadata: {
        domain: 'example.com',
        trafficIncrease: '300%',
        threshold: '1000 requests/min'
      }
    },
    {
      id: 2,
      type: 'warning',
      title: 'SSL Certificate Expiring',
      message: 'SSL certificate for api.example.com expires in 7 days',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'medium',
      category: 'security',
      action: 'renew',
      metadata: {
        domain: 'api.example.com',
        expiryDate: '2024-09-01',
        daysLeft: 7
      }
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: 'low',
      category: 'system',
      action: 'view',
      metadata: {
        backupSize: '2.5GB',
        duration: '15 minutes',
        files: 15420
      }
    },
    {
      id: 4,
      type: 'info',
      title: 'New Feature Available',
      message: 'Advanced analytics dashboard is now available',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      category: 'feature',
      action: 'explore',
      metadata: {
        feature: 'Advanced Analytics',
        version: '2.1.0',
        changelog: 'Enhanced data visualization'
      }
    }
  ]

  useEffect(() => {
    // Initialize notifications
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
    
    // Initialize WebSocket connection
    initializeWebSocket()
    
    // Load user preferences
    loadPreferences()
    
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, filter, searchTerm])

  const initializeWebSocket = () => {
    // Backend uses Socket.IO, but we'll simulate WebSocket for now
    // to avoid console errors until Socket.IO client is properly integrated
    if (import.meta.env.DEV) {
      // Simulate successful connection for development
      setWebSocketStatus('connected')
      // console.log('WebSocket simulation enabled - backend uses Socket.IO')
      return
    }
    
    try {
      // Backend uses Socket.IO, not raw WebSocket
      // TODO: Integrate socket.io-client for proper real-time communication
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8960'
      const fullWsUrl = `${wsUrl}/ws/notifications`
      
      const ws = new WebSocket(fullWsUrl)
      
      ws.onopen = () => {
        // console.log('WebSocket connected for notifications')
        // Send authentication token if available
        const token = localStorage.getItem('token')
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }))
        }
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'notification') {
            handleNewNotification(data.notification)
          }
        } catch (error) {
          // console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        // console.log('WebSocket disconnected, attempting to reconnect...')
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          initializeWebSocket()
        }, 5000)
      }
      
      ws.onerror = (error) => {
        // console.error('WebSocket error:', error)
        // Fall back to polling or show connection status
        fallbackToPolling()
      }
      
      wsRef.current = ws
      
    } catch (error) {
      // console.error('Failed to initialize WebSocket:', error)
      fallbackToPolling()
    }
  }
  
  const fallbackToPolling = () => {
    // console.log('Falling back to simulated notifications')
    // Simulate incoming notifications as fallback
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        type: 'info',
        title: 'Real-time Updates Unavailable',
        message: 'Using simulated notifications. Check WebSocket connection.',
        timestamp: new Date(),
        read: false,
        priority: 'low',
        category: 'system',
        action: 'view',
        metadata: {
          fallback: true
        }
      }
      handleNewNotification(newNotification)
    }, 10000)
  }

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
    
    // Play sound if enabled
    if (preferences.sound) {
      playNotificationSound()
    }
    
    // Show desktop notification if enabled
    if (preferences.desktop && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
    
    // Show toast notification
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right'
    })
  }

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      })
    }
  }

  const loadPreferences = () => {
    const savedPreferences = localStorage.getItem('notificationPreferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }

  const savePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
    toast.success('Notification preferences saved!')
  }

  const filterNotifications = () => {
    let filtered = notifications.filter(notification => {
      const matchesFilter = filter === 'all' || notification.type === filter
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
    
    setFilteredNotifications(filtered)
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
    toast.success('All notifications marked as read!')
  }

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId)
      return notification && !notification.read ? Math.max(0, prev - 1) : prev
    })
    toast.success('Notification deleted!')
  }

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'critical':
        return <AlertTriangle className={`${iconClass} text-red-600`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />
      default:
        return <Info className={`${iconClass} text-gray-600`} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="danger" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) => savePreferences({ ...preferences, email: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) => savePreferences({ ...preferences, push: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sound Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={(e) => savePreferences({ ...preferences, sound: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Desktop Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.desktop}
                    onChange={(e) => savePreferences({ ...preferences, desktop: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'critical' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'warning' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Warning
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredNotifications.length} notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Bell className="w-12 h-12 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        {notification.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(notification.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}

export default NotificationCenter
