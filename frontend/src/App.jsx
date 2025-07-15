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
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTenants from './pages/admin/AdminTenants'
import ClientManagement from './pages/admin/ClientManagement'
import CommunicationHub from './pages/admin/CommunicationHub'
import AdvancedBilling from './pages/admin/AdvancedBilling'
import RevenueIntelligence from './pages/admin/RevenueIntelligence'
import UsageAnalytics from './pages/admin/UsageAnalytics'
import BIDashboard from './pages/admin/BIDashboard'
import TenantManagement from './pages/admin/TenantManagement'
import FeatureFlags from './pages/admin/FeatureFlags'
import WhiteLabel from './pages/admin/WhiteLabel'
import SystemPerformance from './pages/admin/SystemPerformance'
import SecurityOperations from './pages/admin/SecurityOperations'
import ComplianceCenter from './pages/admin/ComplianceCenter'
import Client360 from './pages/admin/Client360'
import NotFound from './pages/NotFound'

// MVP Components
import MVPDashboard from './components/mvp/MVPDashboard'

// New Admin Components
import AdminDashboardComponent from './components/admin/AdminDashboard'
import AdminUserManagement from './components/admin/AdminUserManagement'
import SystemMonitoring from './components/admin/SystemMonitoring'
import SecurityOperationsComponent from './components/admin/SecurityOperations'
import SystemHealth from './components/admin/SystemHealth'

// Redux actions
import { fetchUserProfile } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !user) {
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
          
          {/* MVP Development Dashboard */}
          <Route path="mvp" element={
            process.env.NODE_ENV === 'development' ? <MVPDashboard /> : <Navigate to="/dashboard" replace />
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin/dashboard" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminDashboardComponent /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/user-management" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminUserManagement /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/system-monitoring" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <SystemMonitoring /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/security-operations" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <SecurityOperationsComponent /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/system-health" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <SystemHealth /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/users" element={
            user?.role === 'super_admin' ? <AdminUsers /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/tenants" element={
            user?.role === 'super_admin' ? <AdminTenants /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/client-management" element={<ClientManagement />} />
          <Route path="admin/communication-hub" element={<CommunicationHub />} />
          <Route path="admin/advanced-billing" element={<AdvancedBilling />} />
          <Route path="admin/revenue-intelligence" element={<RevenueIntelligence />} />
          <Route path="admin/usage-analytics" element={<UsageAnalytics />} />
          <Route path="admin/bi-dashboard" element={<BIDashboard />} />
          <Route path="admin/tenant-management" element={<TenantManagement />} />
          <Route path="admin/feature-flags" element={<FeatureFlags />} />
          <Route path="admin/white-label" element={<WhiteLabel />} />
          <Route path="admin/system-performance" element={<SystemPerformance />} />
          <Route path="admin/security-operations" element={<SecurityOperations />} />
          <Route path="admin/compliance-center" element={<ComplianceCenter />} />
          <Route path="admin/client-360" element={<Client360 />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
