import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  BarChart3, 
  Shield, 
  Globe, 
  Settings, 
  CreditCard, 
  Users, 
  Building,
  TrendingUp,
  Play,
  Activity,
  Monitor,
  Database,
  Heart,
  Lock
} from 'lucide-react'
import { MVP_CONFIG } from '../../config/mvp'

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth)

  // MVP Core Navigation - Essential features only
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, mvpKey: 'dashboard' },
    { name: 'Domains', href: '/domains', icon: Globe, mvpKey: 'domains' },
    { name: 'Rules', href: '/rules', icon: Shield, mvpKey: 'rules' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, mvpKey: 'analytics' },
    { name: 'Billing', href: '/billing', icon: CreditCard, mvpKey: 'billing' },
    { name: 'Profile', href: '/profile', icon: Users, mvpKey: 'profile' },
    { name: 'Settings', href: '/settings', icon: Settings, mvpKey: 'settings' },
  ].filter(item => MVP_CONFIG.CORE_FEATURES[item.mvpKey]?.enabled)

  // MVP Admin Navigation - Essential admin features only
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, mvpKey: 'admin_dashboard' },
    { name: 'Admin Overview', href: '/admin/dashboard', icon: Activity, mvpKey: 'admin_overview' },
    { name: 'User Management', href: '/admin/user-management', icon: Users, mvpKey: 'user_management' },
    { name: 'System Monitoring', href: '/admin/system-monitoring', icon: Monitor, mvpKey: 'system_monitoring' },
    { name: 'Security Operations', href: '/admin/security-operations', icon: Shield, mvpKey: 'security_operations' },
    { name: 'System Health', href: '/admin/system-health', icon: Heart, mvpKey: 'system_health' },
    { name: 'Users', href: '/admin/users', icon: Users, mvpKey: 'users' },
    { name: 'Client Management', href: '/admin/client-management', icon: Users, mvpKey: 'client_management' },
  ].filter(item => MVP_CONFIG.ADMIN_FEATURES[item.mvpKey]?.enabled)

  // Advanced features for post-MVP
  const advancedFeatures = [
    { name: 'API Demo', href: '/demo', icon: Play, mvpKey: 'api_demo' },
    { name: 'Tenants', href: '/admin/tenants', icon: Building, mvpKey: 'tenants' },
    { name: 'Advanced Billing', href: '/admin/advanced-billing', icon: CreditCard, mvpKey: 'advanced_billing' },
    { name: 'Revenue Intelligence', href: '/admin/revenue-intelligence', icon: TrendingUp, mvpKey: 'revenue_intelligence' },
    { name: 'Usage Analytics', href: '/admin/usage-analytics', icon: BarChart3, mvpKey: 'usage_analytics' },
    { name: 'BI Dashboard', href: '/admin/bi-dashboard', icon: BarChart3, mvpKey: 'bi_dashboard' },
    { name: 'Feature Flags', href: '/admin/feature-flags', icon: Shield, mvpKey: 'feature_flags' },
    { name: 'White-Label', href: '/admin/white-label', icon: Settings, mvpKey: 'white_label' },
    { name: 'System Performance', href: '/admin/system-performance', icon: BarChart3, mvpKey: 'system_performance' },
    { name: 'Security Operations', href: '/admin/security-operations', icon: Shield, mvpKey: 'security_operations' },
    { name: 'Client 360 View', href: '/admin/client-360', icon: Users, mvpKey: 'client_360' },
  ]

  // Check if advanced features should be shown
  const showAdvancedFeatures = MVP_CONFIG.FEATURE_FLAGS.showAdvancedFeatures || user?.preferences?.showAdvancedFeatures

  return (
    <div className="sidebar min-h-screen h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Traffic Interceptor</h1>
      </div>
      
      <nav className="sidebar-nav flex-1">
        {/* MVP Core Features */}
        <div className="mb-2">
          <div className="px-2 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          <div className="mb-2">
            <div className="border-t border-gray-200 my-4" />
            <div className="px-2 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          <div className="mb-2">
            <div className="border-t border-gray-200 my-4" />
            <div className="px-2 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Advanced Features
              </h3>
              <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
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
          <div className="border-t border-gray-200 mt-4 pt-4">
            <button
              onClick={() => {
                // This would typically update user preferences
                console.log('Toggle advanced features')
              }}
              className="w-full px-2 py-2 text-xs text-gray-500 hover:text-gray-700 text-left"
            >
              {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
            </button>
          </div>
        )}

        {/* MVP Dashboard Link (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t border-gray-200 mt-4 pt-4">
            <NavLink
              to="/mvp"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              MVP Dashboard
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
