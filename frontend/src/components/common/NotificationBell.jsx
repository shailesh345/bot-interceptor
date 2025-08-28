import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useSelector } from 'react-redux'
import Badge from './Badge'

const NotificationBell = ({ onOpenNotifications }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Simulate real-time notification count updates
    const interval = setInterval(() => {
      // Mock unread count - in real app this would come from WebSocket
      const mockCount = Math.floor(Math.random() * 5)
      if (mockCount !== unreadCount) {
        setUnreadCount(mockCount)
        if (mockCount > unreadCount) {
          // Animate when new notifications arrive
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 1000)
        }
      }
    }, 98890) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [unreadCount])

  const handleClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
        isAnimating ? 'animate-pulse' : ''
      }`}
      title="Notifications"
    >
      <Bell className={`w-5 h-5 ${isAnimating ? 'text-blue-600' : ''}`} />
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1">
          <Badge 
            variant="danger" 
            size="sm"
            className="min-w-[18px] h-[18px] text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        </div>
      )}
      
      {/* Pulse animation for new notifications */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-lg bg-blue-200 opacity-20 animate-ping" />
      )}
    </button>
  )
}

export default NotificationBell
