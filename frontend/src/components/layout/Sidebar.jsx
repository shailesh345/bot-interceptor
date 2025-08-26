import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
  const { user } = useSelector((state) => state.auth)

    // MVP Core Navigation - Essential features only
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, mvpKey: 'dashboard' },
    { name: 'Domains', href: '/domains', icon: Globe, mvpKey: 'domains' },
    { name: 'Rules', href: '/rules', icon: ShieldCheck, mvpKey: 'rules' },
    { name: 'Traffic Interception', href: '/traffic-interception', icon: Network, mvpKey: 'traffic_interception' },
    { name: 'Analytics', href: '/analytics', icon: LineChart, mvpKey: 'analytics' },
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
  const showAdvancedFeatures = MVP_CONFIG.FEATURE_FLAGS.showAdvancedFeatures || user?.preferences?.showAdvancedFeatures

  return (
    <div className="sidebar min-h-screen h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-center py-6 border-b" style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--primary-bg)'
      }}>
        <h1 className="text-2xl font-bold font-yandex" style={{ color: 'var(--text-primary)' }}>
          Traffic Interceptor
        </h1>
      </div>
      
      <nav className="sidebar-nav flex-1">
        {/* MVP Core Features */}
        <div className="mb-4">
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-yandex" style={{ color: 'var(--text-muted)' }}>
              Core Features
            </h3>
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => 
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>
        
        {/* MVP Admin Features */}
        {user?.role === 'super_admin' && (
          <div className="mb-4">
            <div className="border-t my-4" style={{ borderColor: 'var(--border-primary)' }} />
            <div className="px-4 py-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider font-yandex" style={{ color: 'var(--text-muted)' }}>
              Admin Features
            </h3>
            </div>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}

        {/* Advanced Features (Post-MVP) */}
        {showAdvancedFeatures && user?.role === 'super_admin' && (
          <div className="mb-4">
            <div className="border-t my-4" style={{ borderColor: 'var(--border-primary)' }} />
            <div className="px-4 py-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider font-yandex" style={{ color: 'var(--text-muted)' }}>
              Advanced Features
            </h3>
              <p className="text-xs mt-1 font-yandex" style={{ color: 'var(--text-muted)' }}>Coming Soon</p>
            </div>
            {advancedFeatures.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-item opacity-50 ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}

        {/* MVP Toggle Button */}
        {user?.role === 'super_admin' && (
          <div className="border-t mt-4 pt-4" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => {
                // This would typically update user preferences
                // console.log('Toggle advanced features') // Commented to prevent console logs
              }}
              className="w-full px-2 py-2 text-xs text-left transition-all duration-200 interactive"
              style={{ color: 'var(--text-muted)' }}
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
            </button>
          </div>
        )}

        {/* MVP Dashboard Link (Development Only) */}
        {import.meta.env.DEV && (
          <div className="border-t mt-4 pt-4" style={{ borderColor: 'var(--border-primary)' }}>
            <NavLink
              to="/mvp"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              MVP Dashboard
            </NavLink>
            <NavLink
              to="/component-demo"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Palette className="w-5 h-5 mr-3" />
              Component Demo
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
