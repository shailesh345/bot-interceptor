import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Menu, User, LogOut, HelpCircle, ChevronDown } from 'lucide-react'
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
  const [showUserMenu, setShowUserMenu] = useState(false)

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
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="
          sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50
          shadow-sm transition-all duration-300 ease-out
          hover:shadow-md hover:bg-white
        "
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => dispatch(toggleSidebar())}
              className="
                p-2 rounded-lg transition-all duration-200 md:hidden
                bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black
                border border-gray-300 hover:border-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="flex flex-col">
                <motion.h1
                  className="text-lg font-bold text-black tracking-tight"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  BI
                </motion.h1>
                <motion.p
                  className="text-xs text-gray-500 -mt-1 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  The Bot Interceptor
                </motion.p>
                {import.meta.env.DEV && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                  >
                    Demo Mode
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            {/* Help Button */}
            <motion.button
              onClick={() => {
                toast('Help guide will be available soon!', {
                  icon: 'ℹ️',
                  position: 'top-center'
                })
              }}
              className="
                p-2 rounded-lg transition-all duration-200
                bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black
                border border-gray-300 hover:border-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
                group relative overflow-hidden
              "
              title="Help & Documentation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full"
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              <HelpCircle className="w-4 h-4 relative z-10" />
            </motion.button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <NotificationBell onOpenNotifications={handleOpenNotifications} />

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="
                  flex items-center space-x-3 p-2 rounded-lg transition-all duration-200
                  bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black
                  border border-gray-200 hover:border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
                  group relative overflow-hidden
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />

                {/* User Avatar/Initials */}
                <motion.div
                  className="
                    w-8 h-8 rounded-full bg-gradient-to-br from-black to-gray-800
                    flex items-center justify-center text-white text-sm font-semibold
                    shadow-sm
                  "
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </motion.div>

                {/* User Info - Hidden on small screens */}
                <div className="hidden sm:block text-left">
                  <motion.p
                    className="text-sm font-semibold text-black leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    {user?.first_name} {user?.last_name}
                  </motion.p>
                  <motion.p
                    className="text-xs text-gray-500 leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  >
                    {user?.email}
                  </motion.p>
                </div>

                {/* Dropdown Arrow */}
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
              </motion.button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="
                    absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg
                    border border-gray-200 py-1 z-50
                  "
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-black">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 mt-1 capitalize">{user?.role}</p>
                  </div>

                  <div className="py-1">
                    <motion.button
                      onClick={() => {
                        navigate('/profile')
                        setShowUserMenu(false)
                      }}
                      className="
                        w-full px-4 py-2 text-sm text-left text-gray-700
                        hover:bg-gray-50 hover:text-black transition-colors
                        flex items-center space-x-2
                      "
                      whileHover={{ backgroundColor: '#f9fafb' }}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        navigate('/settings')
                        setShowUserMenu(false)
                      }}
                      className="
                        w-full px-4 py-2 text-sm text-left text-gray-700
                        hover:bg-gray-50 hover:text-black transition-colors
                        flex items-center space-x-2
                      "
                      whileHover={{ backgroundColor: '#f9fafb' }}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Preferences</span>
                    </motion.button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <motion.button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="
                        w-full px-4 py-2 text-sm text-left text-red-600
                        hover:bg-red-50 hover:text-red-700 transition-colors
                        flex items-center space-x-2
                      "
                      whileHover={{ backgroundColor: '#fef2f2' }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  )
}

export default Header
