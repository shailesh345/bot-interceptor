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
  const [hasSeenGuide, setHasSeenGuide] = useState(false)

  // Get current page from location
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    return path === 'dashboard' ? 'dashboard' : path
  }

  useEffect(() => {
    // Show user guide for new users or when visiting certain pages for the first time
    const shouldShowGuide = !hasSeenGuide && (
      getCurrentPage() === 'dashboard' || 
      getCurrentPage() === 'domains' || 
      getCurrentPage() === 'rules'
    )
    
    if (shouldShowGuide) {
      setShowUserGuide(true)
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* User Guide */}
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
