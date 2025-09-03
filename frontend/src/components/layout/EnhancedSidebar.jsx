import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Shield, 
  Globe, 
  Activity,
  Bot,
  Settings,
  ShieldCheck,
  Network,
  LineChart,
  Heart,
  Zap,
  Brain,
  Wallet,
  UserCheck,
  Building2,
  Code,
  Workflow,
  Link,
  Database,
  Server,
  Target,
  Sparkles,
  PieChart,
  TrendingUp,
  Layout,
  Palette,
  X,
  User
} from 'lucide-react'

const EnhancedSidebar = ({ isOpen, onClose, currentPage }) => {
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'

  // Core navigation items - simplified and organized
  const coreNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, color: 'text-blue-600' },
    { name: 'Domains', href: '/domains', icon: Globe, color: 'text-green-600' },
    { name: 'Rules', href: '/rules', icon: ShieldCheck, color: 'text-purple-600' },
    { name: 'Traffic', href: '/traffic-interception', icon: Network, color: 'text-orange-600' },
    { name: 'Analytics', href: '/analytics', icon: LineChart, color: 'text-indigo-600' },
    { name: 'Monitoring', href: '/monitoring', icon: Activity, color: 'text-red-600' },
  ]

  // Security & Protection
  const securityNavigation = [
    { name: 'ML Models', href: '/ml-management', icon: Bot, color: 'text-emerald-600' },
    { name: 'Content Protection', href: '/content-protection', icon: Shield, color: 'text-rose-600' },
    { name: 'Security', href: '/security', icon: ShieldCheck, color: 'text-cyan-600' },
  ]

  // Performance & Advanced
  const advancedNavigation = [
    { name: 'Performance', href: '/performance', icon: Zap, color: 'text-yellow-600' },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain, color: 'text-violet-600' },
    { name: 'Workflows', href: '/workflow-automation', icon: Workflow, color: 'text-pink-600' },
  ]

  // Business & Admin
  const businessNavigation = [
    { name: 'Billing', href: '/billing', icon: Wallet, color: 'text-teal-600' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
    { name: 'Profile', href: '/profile', icon: UserCheck, color: 'text-slate-600' },
  ]

  // Admin navigation
  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: Building2, color: 'text-amber-600' },
    { name: 'Users', href: '/admin/users', icon: UserCheck, color: 'text-lime-600' },
    { name: 'System', href: '/admin/system-health', icon: Server, color: 'text-stone-600' },
  ]

  const NavigationSection = ({ title, items, className = "" }) => (
    <div className={`${className} mb-6`}>
      {title && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = currentPage === item.href.split('/')[1]
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`
              }
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${item.color}`} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-black" />
              <span className="ml-2 text-xl font-bold text-black">Interceptor</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:text-black hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <NavigationSection items={coreNavigation} />
            <NavigationSection title="Security" items={securityNavigation} />
            <NavigationSection title="Advanced" items={advancedNavigation} />
            <NavigationSection title="Business" items={businessNavigation} />
            {isAdmin && <NavigationSection title="Administration" items={adminNavigation} />}
          </div>
        </div>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <Shield className="h-8 w-8 text-black" />
            <span className="ml-2 text-xl font-bold text-black">Interceptor</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <NavigationSection items={coreNavigation} />
            <NavigationSection title="Security" items={securityNavigation} />
            <NavigationSection title="Advanced" items={advancedNavigation} />
            <NavigationSection title="Business" items={businessNavigation} />
            {isAdmin && <NavigationSection title="Administration" items={adminNavigation} />}
          </div>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EnhancedSidebar
