import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, HelpCircle, Bell, User, Settings, LogOut } from 'lucide-react'
import EnhancedSidebar from './EnhancedSidebar'
import EnhancedHeader from './EnhancedHeader'

const EnhancedLayout = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('')

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    setCurrentPage(path)
  }, [location.pathname])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen bg-white font-ys-text">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Enhanced Header */}
        <EnhancedHeader 
          onMenuClick={toggleSidebar}
          currentPage={currentPage}
          user={user}
        />

        {/* Page Content */}
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EnhancedLayout
