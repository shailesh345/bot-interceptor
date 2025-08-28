import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import UserGuide from '../common/UserGuide'

const Layout = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [showUserGuide, setShowUserGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(() => {
    // Initialize from localStorage on component mount
    return localStorage.getItem('botInterceptor_guide_completed') === 'true'
  })

  // Get current page from location
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    return path === 'dashboard' ? 'dashboard' : path
  }

  useEffect(() => {
    // Only show guide for new users who haven't completed it
    const shouldShowGuide = !hasSeenGuide && (
      getCurrentPage() === 'dashboard' || 
      getCurrentPage() === 'domains' || 
      getCurrentPage() === 'rules'
    )
    
    if (shouldShowGuide) {
      // Add a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setShowUserGuide(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [location.pathname, hasSeenGuide])

  const handleGuideComplete = () => {
    setShowUserGuide(false)
    setHasSeenGuide(true)
    localStorage.setItem('botInterceptor_guide_completed', 'true')
  }

  const handleGuideSkip = () => {
    setShowUserGuide(false)
    setHasSeenGuide(true)
    localStorage.setItem('botInterceptor_guide_completed', 'true')
  }

  const handleShowHelp = () => {
    setShowUserGuide(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onShowHelp={handleShowHelp} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* User Guide - Only show for new users or when help is requested */}
      {showUserGuide && (
        <UserGuide
          currentPage={getCurrentPage()}
          userRole={user?.role || 'user'}
          onComplete={handleGuideComplete}
          onSkip={handleGuideSkip}
        />
      )}
    </div>
  )
}

export default Layout
