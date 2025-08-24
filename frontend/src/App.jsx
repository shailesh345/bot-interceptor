import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'

// Components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Domains from './pages/Domains'
import Rules from './pages/Rules'
import Analytics from './pages/Analytics'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Demo from './pages/Demo'
import TrafficInterception from './pages/TrafficInterception'
import MLModelManagement from './components/ml/MLModelManagement'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSystemMonitoring from './pages/admin/AdminSystemMonitoring'
import AdminSecurityOperations from './pages/admin/AdminSecurityOperations'
import NotFound from './pages/NotFound'

// MVP Components
import MVPDashboard from './components/mvp/MVPDashboard'



// Redux actions
import { fetchUserProfile } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)
  
  // Debug logging
  console.log('App - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user)

  useEffect(() => {
    console.log('App useEffect - isAuthenticated:', isAuthenticated, 'user:', user)
    if (isAuthenticated && !user) {
      console.log('App - Fetching user profile...')
      dispatch(fetchUserProfile())
    }
  }, [dispatch, isAuthenticated, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Traffic Interceptor - Bot Traffic Management SaaS</title>
        <meta name="description" content="Monitor, control, and monetize bot traffic with advanced analytics and content protection." />
      </Helmet>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><Login /></AuthLayout>
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <AuthLayout><Register /></AuthLayout>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="domains" element={<Domains />} />
          <Route path="rules" element={<Rules />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="demo" element={<Demo />} />
          <Route path="traffic-interception" element={<TrafficInterception />} />
          <Route path="ml-management" element={<MLModelManagement />} />
          
          {/* MVP Development Dashboard */}
          <Route path="mvp" element={
            process.env.NODE_ENV === 'development' ? <MVPDashboard /> : <Navigate to="/dashboard" replace />
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin/dashboard" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/users" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminUsers /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/system-monitoring" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminSystemMonitoring /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/security-operations" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminSecurityOperations /> : <Navigate to="/dashboard" replace />
          } />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
