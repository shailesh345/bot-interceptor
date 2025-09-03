import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Settings,
  Filter,
  Search,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  RefreshCw
} from 'lucide-react';

const EnhancedNotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRead, setShowRead] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Enhanced notification types with better categorization
  const notificationTypes = {
    security: { label: 'Security', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle },
    performance: { label: 'Performance', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: RefreshCw },
    system: { label: 'System', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Info },
    success: { label: 'Success', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
    warning: { label: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertTriangle },
    info: { label: 'Info', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Info }
  };

  // Mock notifications - replace with real API calls
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'security',
        title: 'Bot Attack Detected',
        message: 'Suspicious bot activity detected from IP 192.168.1.100. Request blocked automatically.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        isRead: false,
        priority: 'high',
        actions: ['block_ip', 'investigate', 'dismiss']
      },
      {
        id: 2,
        type: 'performance',
        title: 'High CPU Usage Alert',
        message: 'Server CPU usage has exceeded 85% for the last 5 minutes.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actions: ['scale_up', 'investigate', 'dismiss']
      },
      {
        id: 3,
        type: 'system',
        title: 'System Update Available',
        message: 'New security patch v2.1.3 is available for installation.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true,
        priority: 'low',
        actions: ['update', 'schedule', 'dismiss']
      },
      {
        id: 4,
        type: 'success',
        title: 'Backup Completed',
        message: 'Daily backup completed successfully. 2.3GB of data backed up.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: true,
        priority: 'low',
        actions: ['view_logs', 'dismiss']
      },
      {
        id: 5,
        type: 'warning',
        title: 'Domain Expiry Warning',
        message: 'Domain example.com will expire in 30 days. Please renew to avoid service interruption.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        actions: ['renew', 'dismiss']
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  // Filter notifications based on current filter and search
  const filteredNotifications = useCallback(() => {
    let filtered = notifications;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply read status filter
    if (!showRead) {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [notifications, filter, searchQuery, showRead]);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const deleted = notifications.find(n => n.id === id);
      return deleted && !deleted.isRead ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  // Handle notification action
  const handleAction = useCallback((notificationId, action) => {
    console.log(`Action ${action} triggered for notification ${notificationId}`);
    // Implement action handling logic here
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600 group-hover:text-black" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-gray-500 hover:text-black transition-colors duration-200"
                    title="Mark all as read"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-black transition-colors duration-200"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {Object.entries(notificationTypes).map(([key, type]) => (
                      <button
                        key={key}
                        onClick={() => setFilter(filter === key ? 'all' : key)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                          filter === key 
                            ? `${type.bgColor} ${type.color} border-2 border-current`
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowRead(!showRead)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      showRead ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                    }`}
                    title={showRead ? 'Hide read' : 'Show read'}
                  >
                    {showRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredNotifications().map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 transition-all duration-200 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${notificationTypes[notification.type].bgColor}`}>
                        {React.createElement(notificationTypes[notification.type].icon, {
                          className: `w-4 h-4 ${notificationTypes[notification.type].color}`
                        })}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-black mb-1">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                            >
                              {notification.isRead ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          
                          <div className="flex space-x-1">
                            {notification.actions.map((action) => (
                              <button
                                key={action}
                                onClick={() => handleAction(notification.id, action)}
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-200 rounded transition-all duration-200"
                              >
                                {action.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredNotifications().length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No notifications found</p>
                  <p className="text-xs">Try adjusting your filters or search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{unreadCount} unread notifications</span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNotificationCenter;
