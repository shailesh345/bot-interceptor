import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useSelector((state) => state.auth)
  
  // Debug logging
  console.log('ProtectedRoute - State:', { isAuthenticated, loading, user: user ? 'exists' : 'null', token: token ? 'exists' : 'null' })

  if (loading) {
    console.log('ProtectedRoute - Loading, showing spinner')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - Authenticated, rendering children')
  return children
}

export default ProtectedRoute
