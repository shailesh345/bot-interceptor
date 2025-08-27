import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Menu, User, LogOut, HelpCircle } from 'lucide-react'
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
    <header className="border-b transition-all duration-200 bg-white border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-md transition-all duration-200 md:hidden hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="ml-3 md:ml-0 flex items-center">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-black">BI</h1>
                              <p className="text-xs text-gray-500 -mt-1">The Bot Interceptor</p>
                {import.meta.env.DEV && (
                  <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Mode
                  </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              toast.info('Help guide will be available soon!')
            }}
            className="p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-600"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <ThemeToggle />
          <NotificationBell onOpenNotifications={handleOpenNotifications} />
          
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-black">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-600"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 text-gray-600"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
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
