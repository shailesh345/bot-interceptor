import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  Bell, 
  Search, 
  HelpCircle, 
  User, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react'
import { logoutUser } from '../../store/slices/authSlice'

const EnhancedHeader = ({ onMenuClick, currentPage, user }) => {
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    setShowUserMenu(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Add dark mode logic here
  }

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      domains: 'Domain Management',
      rules: 'Security Rules',
      'traffic-interception': 'Traffic Interception',
      analytics: 'Analytics & Reports',
      monitoring: 'System Monitoring',
      'ml-management': 'ML Model Management',
      'content-protection': 'Content Protection',
      security: 'Security & Compliance',
      performance: 'Performance Monitoring',
      'ai-insights': 'AI Insights',
      'workflow-automation': 'Workflow Automation',
      billing: 'Billing & Subscription',
      settings: 'Settings',
      profile: 'User Profile',
      admin: 'Administration'
    }
    return titles[currentPage] || 'Dashboard'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Menu button and page title */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:text-black hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-black">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Manage your traffic interception and security rules
              </p>
            </div>
          </div>

          {/* Right side - Search, notifications, user menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Help */}
            <button className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-black">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">New security rule created</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">Traffic spike detected</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">ML model updated</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name || 'User'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-black">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default EnhancedHeader
