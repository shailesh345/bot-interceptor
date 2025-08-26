import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useSelector((state) => state.auth)
  
  // Debug logging
  // console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user, 'token:', token ? token.substring(0, 30) + '...' : 'null') // Commented to prevent console logs

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // console.log('ProtectedRoute - Redirecting to login, isAuthenticated:', isAuthenticated) // Commented to prevent console logs
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
