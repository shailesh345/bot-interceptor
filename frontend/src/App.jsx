import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'

// Components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import PWARegistration from './components/common/PWARegistration'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Domains from './pages/Domains'
import Rules from './pages/Rules'
import Analytics from './pages/Analytics'

import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Demo from './pages/Demo'
import TrafficInterception from './pages/TrafficInterception'
import MLModelManagement from './components/ml/MLModelManagement'
import ContentProtection from './components/protection/ContentProtection'
import Billing from './pages/Billing'
import SecurityManagement from './components/security/SecurityManagement'
import PerformanceMonitoring from './components/performance/PerformanceMonitoring'
import PerformanceOptimizer from './components/performance/PerformanceOptimizer'
import AdvancedReporting from './components/reporting/AdvancedReporting'
import APIManagement from './components/api/APIManagement'
import AdvancedSecurity from './components/security/AdvancedSecurity'
import BusinessIntelligence from './components/business/BusinessIntelligence'
import WebhookManagement from './components/webhook/WebhookManagement'
import EdgeComputing from './components/edge/EdgeComputing'
import DataAnalyticsDashboard from './components/analytics/DataAnalyticsDashboard'
import AdvancedMLDashboard from './components/ml/AdvancedMLDashboard'
import PredictiveAnalyticsEngine from './components/ml/PredictiveAnalyticsEngine'
import AdvancedAIInsights from './components/ai/AdvancedAIInsights'
import AIPoweredAnalytics from './components/ai/AIPoweredAnalytics'
import AIChatbot from './components/ai/AIChatbot'
import WorkflowAutomationEngine from './components/automation/WorkflowAutomationEngine'
import EnterpriseSecurityDashboard from './components/security/EnterpriseSecurityDashboard'
import IntelligentAnalytics from './components/analytics/IntelligentAnalytics'
import MultiTenancyManager from './components/enterprise/MultiTenancyManager'
import RoleBasedAccessControl from './components/enterprise/RoleBasedAccessControl'
import APIManagementCenter from './components/integration/APIManagementCenter'
import ThirdPartyIntegrations from './components/integration/ThirdPartyIntegrations'
import AdvancedDataVisualization from './components/visualization/AdvancedDataVisualization'
import InteractiveDashboard from './components/visualization/InteractiveDashboard'
import WorkflowBuilder from './components/automation/WorkflowBuilder'
import AutomationRulesEngine from './components/automation/AutomationRulesEngine'
import ComponentDemo from './pages/ComponentDemo'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSystemMonitoring from './pages/admin/AdminSystemMonitoring'
import AdminSecurityOperations from './pages/admin/AdminSecurityOperations'
import SystemHealth from './pages/admin/SystemHealth'
import ClientManagement from './pages/admin/ClientManagement'
import UserManagement from './pages/admin/UserManagement'
import NotFound from './pages/NotFound'
import TestAuth from './pages/TestAuth'

// MVP Components
import MVPDashboard from './components/mvp/MVPDashboard'



// Redux actions
import { fetchUserProfile } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)
  
  // Debug logging to understand the authentication state
  console.log('App - Auth State:', { isAuthenticated, loading, user: user ? 'exists' : 'null' })

  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('App - Fetching user profile')
      dispatch(fetchUserProfile())
    }
  }, [dispatch, isAuthenticated, user])

  if (loading) {
    console.log('App - Loading state')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  console.log('App - Rendering with auth state:', { isAuthenticated, user: user ? 'exists' : 'null' })

  return (
    <>
      <Helmet>
        <title>BI - The Bot Interceptor</title>
        <meta name="description" content="Advanced bot traffic management and interception with AI-powered analytics and protection." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Traffic Interceptor" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Helmet>
      
      {/* PWA Registration - Temporarily Disabled */}
      {/* <PWARegistration /> */}
      
      {/* AI Chatbot - Temporarily Disabled */}
      {/* <AIChatbot /> */}
      
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
          <Route path="component-demo" element={<ComponentDemo />} />
          <Route path="traffic-interception" element={<TrafficInterception />} />
          <Route path="ml-management" element={<MLModelManagement />} />
          <Route path="content-protection" element={<ContentProtection />} />
          <Route path="security" element={<SecurityManagement />} />
          <Route path="performance" element={<PerformanceMonitoring />} />
          <Route path="performance-optimizer" element={<PerformanceOptimizer />} />
          <Route path="reporting" element={<AdvancedReporting />} />
          <Route path="api-management" element={<APIManagement />} />
          <Route path="advanced-security" element={<AdvancedSecurity />} />
          <Route path="business-intelligence" element={<BusinessIntelligence />} />
          <Route path="webhook-management" element={<WebhookManagement />} />
          <Route path="edge-computing" element={<EdgeComputing />} />
          <Route path="intelligent-analytics" element={<IntelligentAnalytics />} />
          <Route path="data-analytics" element={<DataAnalyticsDashboard />} />
          <Route path="ml-dashboard" element={<AdvancedMLDashboard />} />
          <Route path="predictive-analytics" element={<PredictiveAnalyticsEngine />} />
          <Route path="ai-insights" element={<AdvancedAIInsights />} />
          <Route path="ai-analytics" element={<AIPoweredAnalytics />} />
          <Route path="workflow-automation" element={<WorkflowAutomationEngine />} />
          <Route path="enterprise-security" element={<EnterpriseSecurityDashboard />} />
          <Route path="multi-tenancy" element={<MultiTenancyManager />} />
          <Route path="rbac" element={<RoleBasedAccessControl />} />
          <Route path="api-management-center" element={<APIManagementCenter />} />
          <Route path="integrations" element={<ThirdPartyIntegrations />} />
          <Route path="data-visualization" element={<AdvancedDataVisualization />} />
          <Route path="interactive-dashboard" element={<InteractiveDashboard />} />
          <Route path="workflow-builder" element={<WorkflowBuilder />} />
          <Route path="automation-rules" element={<AutomationRulesEngine />} />
                          
                          {/* MVP Development Dashboard */}
          <Route path="mvp" element={
            import.meta.env.DEV ? <MVPDashboard /> : <Navigate to="/dashboard" replace />
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin/dashboard" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/users" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminUsers /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/user-management" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <UserManagement /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/system-monitoring" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminSystemMonitoring /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/system-health" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <SystemHealth /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/security-operations" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <AdminSecurityOperations /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="admin/client-management" element={
            user?.role === 'admin' || user?.role === 'super_admin' ? <ClientManagement /> : <Navigate to="/dashboard" replace />
          } />
          
          {/* Test Authentication Route */}
          <Route path="test-auth" element={<TestAuth />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
