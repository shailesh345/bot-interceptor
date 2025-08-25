import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Menu, User, LogOut } from 'lucide-react'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import NotificationBell from '../common/NotificationBell'
import NotificationCenter from '../notifications/NotificationCenter'
import ThemeToggle from '../common/ThemeToggle'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  const handleOpenNotifications = () => {
    setShowNotifications(true)
  }

  const handleCloseNotifications = () => {
    setShowNotifications(false)
  }

  return (
    <header className="border-b transition-all duration-200" style={{ 
      backgroundColor: 'var(--primary-bg)', 
      borderColor: 'var(--border-primary)',
      boxShadow: 'var(--shadow-soft)'
    }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg transition-all duration-200 md:hidden interactive"
            style={{ 
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--accent-bg)'
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="ml-4 md:ml-0">
            <h1 className="text-2xl font-bold font-yandex" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationBell onOpenNotifications={handleOpenNotifications} />
          
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold font-yandex" style={{ color: 'var(--text-primary)' }}>
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs font-yandex" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg transition-all duration-200 interactive"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--accent-bg)'
                  }}
                >
                  <User className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg transition-all duration-200 interactive"
                  style={{ 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--accent-bg)'
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={handleCloseNotifications} 
      />
    </header>
  )
}

export default Header
