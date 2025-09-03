import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Users,
  Database,
  FileText,
  Zap,
  Cpu,
  Brain,
  Bot,
  Globe,
  Lock,
  Eye,
  AlertTriangle,
  TrendingUp,
  PieChart,
  Target,
  Smartphone,
  Tablet,
  Laptop,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toggleSidebar } from '../../store/slices/uiSlice'

const Sidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { sidebarCollapsed } = useSelector((state) => state.ui)
  const { user } = useSelector((state) => state.auth)

  const toggleSidebarHandler = () => {
    dispatch(toggleSidebar())
  }

  // Simplified navigation items
  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: Home,
      description: 'Overview and metrics',
      category: 'main'
    },
    {
      title: 'Domains',
      path: '/domains',
      icon: Globe,
      description: 'Domain management',
      category: 'main'
    },
    {
      title: 'Rules',
      path: '/rules',
      icon: Shield,
      description: 'Security rules',
      category: 'main'
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      description: 'Data insights',
      category: 'main'
    },
    {
      title: 'Monitoring',
      path: '/monitoring',
      icon: Activity,
      description: 'Real-time monitoring',
      category: 'main'
    },
    {
      title: 'Traffic Interception',
      path: '/traffic-interception',
      icon: Eye,
      description: 'Traffic analysis',
      category: 'security'
    },
    {
      title: 'Bot Detection',
      path: '/bot-detection',
      icon: Bot,
      description: 'Bot identification',
      category: 'security'
    },
    {
      title: 'Content Protection',
      path: '/content-protection',
      icon: Lock,
      description: 'Content security',
      category: 'security'
    },
    {
      title: 'Performance',
      path: '/performance',
      icon: Zap,
      description: 'System performance',
      category: 'advanced'
    },
    {
      title: 'ML Models',
      path: '/ml-models',
      icon: Brain,
      description: 'AI models',
      category: 'advanced'
    },
    {
      title: 'Edge Computing',
      path: '/edge-computing',
      icon: Cpu,
      description: 'Edge processing',
      category: 'advanced'
    },
    {
      title: 'Business Intelligence',
      path: '/business-intelligence',
      icon: TrendingUp,
      description: 'Business insights',
      category: 'business'
    },
    {
      title: 'Billing',
      path: '/billing',
      icon: CreditCard,
      description: 'Payment management',
      category: 'business'
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'System settings',
      category: 'admin'
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      description: 'User profile',
      category: 'admin'
    }
  ]

  // Admin-only items
  const adminItems = [
    {
      title: 'Admin Dashboard',
      path: '/admin',
      icon: Database,
      description: 'Admin panel',
      category: 'admin'
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: Users,
      description: 'User administration',
      category: 'admin'
    },
    {
      title: 'System Health',
      path: '/admin/system-health',
      icon: Activity,
      description: 'System monitoring',
      category: 'admin'
    }
  ]

  // Combine regular and admin items
  const allItems = user?.role === 'admin' ? [...navigationItems, ...adminItems] : navigationItems

  // Group items by category
  const groupedItems = allItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  const categoryLabels = {
    main: 'Main',
    security: 'Security',
    advanced: 'Advanced',
    business: 'Business',
    admin: 'Admin'
  }

  const NavigationItem = ({ item, isActive }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => `
        relative flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer h-12
        ${isActive 
          ? 'bg-black text-white shadow-md' 
          : 'text-gray-600 hover:text-black hover:bg-gray-100'
        }
        ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}
      `}
      onClick={toggleSidebarHandler}
    >
      {/* White Circle Ripple for Active State */}
      {isActive && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-sm animate-pulse"></div>
      )}
      
      <item.icon 
        size={sidebarCollapsed ? 18 : 16} 
        className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-current'}`}
      />
      {!sidebarCollapsed && (
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-current'}`}>{item.title}</div>
          <div className={`text-xs opacity-80 ${isActive ? 'text-white' : 'text-gray-600'}`}>{item.description}</div>
        </div>
      )}
    </NavLink>
  )

  return (
    <aside className={`
      fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg
      transition-all duration-300 ease-in-out z-40 flex-shrink-0
      ${sidebarCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header - Reduced Height */}
      <div className="p-2 border-b border-gray-200">
        <div className={`
          flex items-center transition-all duration-300
          ${sidebarCollapsed ? 'justify-center' : 'space-x-2'}
        `}>
          <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500 leading-none">Bot Interceptor</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-2 space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category]}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <NavigationItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer with Chevron Toggle Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={toggleSidebarHandler}
          className={`
            w-full p-2 rounded-lg transition-all duration-200 h-10
            text-gray-600 hover:text-black hover:bg-gray-100
            flex items-center justify-center
          `}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} className="text-gray-600" />
          ) : (
            <ChevronLeft size={18} className="text-gray-600" />
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
