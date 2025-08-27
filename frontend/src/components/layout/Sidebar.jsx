import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { toggleSidebarCollapsed, toggleAdvancedFeatures } from '../../store/slices/uiSlice'
import { 
  BarChart3, 
  Shield, 
  Globe, 
  Users, 
  Building2,
  TrendingUp,
  Play,
  Activity,
  Heart,
  Cpu,
  Gauge,
  Code,
  Zap,
  Palette,
  Bot,
  ShieldCheck,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  Server,
  Network,
  ShieldAlert,
  UserCheck,
  Wallet,
  Receipt,
  Flag,
  Settings,
  Webhook,
  Brain,
  Target,
  Sparkles,
  Workflow,
  Link,
  Layout
} from 'lucide-react'
import { MVP_CONFIG } from '../../config/mvp'

const Sidebar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sidebarCollapsed, showAdvancedFeatures } = useSelector((state) => state.ui)

    // MVP Core Navigation - Essential features only
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, mvpKey: 'dashboard' },
    { name: 'Domains', href: '/domains', icon: Globe, mvpKey: 'domains' },
    { name: 'Rules', href: '/rules', icon: ShieldCheck, mvpKey: 'rules' },
    { name: 'Traffic Interception', href: '/traffic-interception', icon: Network, mvpKey: 'traffic_interception' },
    { name: 'Analytics', href: '/analytics', icon: LineChart, mvpKey: 'analytics' },
    { name: 'Monitoring', href: '/monitoring', icon: Activity, mvpKey: 'monitoring' },
    { name: 'ML Model Management', href: '/ml-management', icon: Bot, mvpKey: 'ml_management' },
    { name: 'Content Protection', href: '/content-protection', icon: ShieldAlert, mvpKey: 'content_protection' },
    { name: 'Billing & Subscription', href: '/billing', icon: Wallet, mvpKey: 'billing' },
    { name: 'Security & Compliance', href: '/security', icon: Shield, mvpKey: 'security' },
        { name: 'Performance & Monitoring', href: '/performance', icon: Zap, mvpKey: 'performance' },
    { name: 'Performance Optimizer', href: '/performance-optimizer', icon: TrendingUp, mvpKey: 'performance_optimizer' },
    { name: 'Advanced Reporting', href: '/reporting', icon: PieChart, mvpKey: 'reporting' },
    { name: 'API Management', href: '/api-management', icon: Code, mvpKey: 'api_management' },
    { name: 'Advanced Security', href: '/advanced-security', icon: ShieldCheck, mvpKey: 'advanced_security' },
    { name: 'Business Intelligence', href: '/business-intelligence', icon: TrendingUp, mvpKey: 'business_intelligence' },
            { name: 'Webhook Management', href: '/webhook-management', icon: Webhook, mvpKey: 'webhook_management' },
        { name: 'Edge Computing', href: '/edge-computing', icon: Server, mvpKey: 'edge_computing' },
        { name: 'Intelligent Analytics', href: '/intelligent-analytics', icon: Brain, mvpKey: 'intelligent_analytics' },
        { name: 'Data Analytics', href: '/data-analytics', icon: BarChart3, mvpKey: 'data_analytics' },
        { name: 'ML Dashboard', href: '/ml-dashboard', icon: Brain, mvpKey: 'ml_dashboard' },
        { name: 'Predictive Analytics', href: '/predictive-analytics', icon: Target, mvpKey: 'predictive_analytics' },
            { name: 'AI Insights', href: '/ai-insights', icon: Sparkles, mvpKey: 'ai_insights' },
    { name: 'AI Analytics', href: '/ai-analytics', icon: Brain, mvpKey: 'ai_analytics' },
    { name: 'Workflow Automation', href: '/workflow-automation', icon: Workflow, mvpKey: 'workflow_automation' },
        { name: 'Enterprise Security', href: '/enterprise-security', icon: Shield, mvpKey: 'enterprise_security' },
    { name: 'Multi-Tenancy', href: '/multi-tenancy', icon: Building2, mvpKey: 'multi_tenancy' },
    { name: 'Role-Based Access', href: '/rbac', icon: UserCheck, mvpKey: 'rbac' },
    { name: 'API Management', href: '/api-management', icon: Code, mvpKey: 'api_management' },
    { name: 'Integrations', href: '/integrations', icon: Link, mvpKey: 'integrations' },
    { name: 'Data Visualization', href: '/data-visualization', icon: BarChart3, mvpKey: 'data_visualization' },
    { name: 'Interactive Dashboard', href: '/interactive-dashboard', icon: Layout, mvpKey: 'interactive_dashboard' },
    { name: 'Workflow Builder', href: '/workflow-builder', icon: Workflow, mvpKey: 'workflow_builder' },
    { name: 'Automation Rules', href: '/automation-rules', icon: Zap, mvpKey: 'automation_rules' },
    { name: 'Profile', href: '/profile', icon: UserCheck, mvpKey: 'profile' },
    { name: 'Settings', href: '/settings', icon: Settings, mvpKey: 'settings' },
  ].filter(item => MVP_CONFIG.CORE_FEATURES[item.mvpKey]?.enabled)

  // MVP Admin Navigation - Essential admin features only
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, mvpKey: 'admin_dashboard' },
    { name: 'Admin Overview', href: '/admin/dashboard', icon: Activity, mvpKey: 'admin_overview' },
    { name: 'User Management', href: '/admin/user-management', icon: UserCheck, mvpKey: 'user_management' },
    { name: 'System Monitoring', href: '/admin/system-monitoring', icon: Server, mvpKey: 'system_monitoring' },
    { name: 'Security Operations', href: '/admin/security-operations', icon: ShieldCheck, mvpKey: 'security_operations' },
    { name: 'System Health', href: '/admin/system-health', icon: Heart, mvpKey: 'system_health' },
    { name: 'Users', href: '/admin/users', icon: Users, mvpKey: 'users' },
    { name: 'Client Management', href: '/admin/client-management', icon: Building2, mvpKey: 'client_management' },
  ].filter(item => MVP_CONFIG.ADMIN_FEATURES[item.mvpKey]?.enabled)

  // Advanced features for post-MVP
  const advancedFeatures = [
    { name: 'API Demo', href: '/demo', icon: Play, mvpKey: 'api_demo' },
    { name: 'Tenants', href: '/admin/tenants', icon: Building2, mvpKey: 'tenants' },
    { name: 'Advanced Billing', href: '/admin/advanced-billing', icon: Receipt, mvpKey: 'advanced_billing' },
    { name: 'Revenue Intelligence', href: '/admin/revenue-intelligence', icon: TrendingUp, mvpKey: 'revenue_intelligence' },
    { name: 'Usage Analytics', href: '/admin/usage-analytics', icon: BarChart, mvpKey: 'usage_analytics' },
    { name: 'BI Dashboard', href: '/admin/bi-dashboard', icon: BarChart3, mvpKey: 'bi_dashboard' },
    { name: 'Feature Flags', href: '/admin/feature-flags', icon: Flag, mvpKey: 'feature_flags' },
    { name: 'White-Label', href: '/admin/white-label', icon: Palette, mvpKey: 'white_label' },
    { name: 'System Performance', href: '/admin/system-performance', icon: Gauge, mvpKey: 'system_performance' },
    { name: 'Security Operations', href: '/admin/security-operations', icon: ShieldCheck, mvpKey: 'security_operations' },
    { name: 'Client 360 View', href: '/admin/client-360', icon: Eye, mvpKey: 'client_360' },
  ]

  // Check if advanced features should be shown
  // const showAdvancedFeaturesFromConfig = MVP_CONFIG.FEATURE_FLAGS.showAdvancedFeatures || user?.preferences?.showAdvancedFeatures

  return (
    <div className={`sidebar min-h-screen h-full overflow-y-auto flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between py-3 px-3 border-b border-gray-200">
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-black">BI</h1>
            <p className="text-xs text-gray-500 -mt-1">The Bot Interceptor</p>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      
      <nav className="sidebar-nav flex-1">
        {/* MVP Core Features */}
        <div className="mb-4">
          {!sidebarCollapsed && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Core Features
              </h3>
            </div>
          )}
          {navigation.map((item) => {
            // Add 'end' prop for routes that might have sub-routes
            const shouldUseEnd = ['/dashboard', '/admin'].includes(item.href)
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={shouldUseEnd}
                className={({ isActive }) => 
                  `group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-black text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
              {({ isActive }) => (
                <>
                  {/* Active State Ripple Effect */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black"
                    />
                  )}
                  
                  {/* White Circle Indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                      className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full bg-white rounded-full opacity-60"
                      />
                    </motion.div>
                  )}
                  
                  <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className={`font-medium relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed sidebar */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                  
                  {/* Hover ripple effect */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-md"
                  />
                </>
              )}
            </NavLink>
            )
          })}
        </div>
        
        {/* MVP Admin Features */}
        {user?.role === 'super_admin' && (
          <div className="mb-4">
            <div className="border-t my-2 border-gray-200" />
            {!sidebarCollapsed && (
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Admin Features
                </h3>
              </div>
            )}
            {adminNavigation.map((item) => {
              // Add 'end' prop to prevent partial matching for admin routes
              const shouldUseEnd = item.href === '/admin'
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={shouldUseEnd}
                  className={({ isActive }) =>
                    `group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? 'bg-black text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`
                  }
                  title={sidebarCollapsed ? item.name : undefined}
                >
                {({ isActive }) => (
                  <>
                    {/* Active State Ripple Effect */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black"
                      />
                    )}
                    
                    {/* White Circle Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                        className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-full h-full bg-white rounded-full opacity-60"
                        />
                      </motion.div>
                    )}
                    
                    <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className={`font-medium relative z-10 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {item.name}
                      </span>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                    
                    {/* Hover ripple effect */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 0.1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-md"
                    />
                </>
              )}
            </NavLink>
            )
          })}
          </div>
        )}

        {/* Advanced Features (Post-MVP) */}
        {(showAdvancedFeatures || MVP_CONFIG.FEATURE_FLAGS.showAdvancedFeatures) && user?.role === 'super_admin' && (
          <div className="mb-4">
            <div className="border-t my-2 border-gray-200" />
            {!sidebarCollapsed && (
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Advanced Features
                </h3>
                <p className="text-xs mt-1 text-gray-400">Coming Soon</p>
              </div>
            )}
            {advancedFeatures.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors opacity-50 ${
                    isActive 
                      ? 'bg-gray-100 text-black' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`
                }
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && item.name}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* MVP Toggle Button */}
        {user?.role === 'super_admin' && !sidebarCollapsed && (
          <div className="border-t mt-4 pt-4 border-gray-200">
            <button
              onClick={() => dispatch(toggleAdvancedFeatures())}
              className="w-full px-3 py-2 text-xs text-left transition-all duration-200 text-gray-500 hover:text-black hover:bg-gray-50 rounded-md"
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
            </button>
          </div>
        )}

        {/* MVP Dashboard Link (Development Only) */}
        {import.meta.env.DEV && (
          <div className="border-t mt-4 pt-4 border-gray-200">
            <NavLink
              to="/mvp"
              className={({ isActive }) =>
                `group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-gray-100 text-black' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`
              }
              title={sidebarCollapsed ? "MVP Dashboard" : undefined}
            >
              <Settings className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && "MVP Dashboard"}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  MVP Dashboard
                </div>
              )}
            </NavLink>
            <NavLink
              to="/component-demo"
              className={({ isActive }) =>
                `group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-gray-100 text-black' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`
              }
              title={sidebarCollapsed ? "Component Demo" : undefined}
            >
              <Palette className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && "Component Demo"}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Component Demo
                </div>
              )}
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
