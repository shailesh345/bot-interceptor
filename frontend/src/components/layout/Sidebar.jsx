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
  TrendingUp
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Domains', href: '/domains', icon: Globe },
    { name: 'Rules', href: '/rules', icon: Shield },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Profile', href: '/profile', icon: Users }, // Added Profile
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Group admin links for better UX
  const adminGroups = [
    {
      label: 'Core',
      links: [
        { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Tenants', href: '/admin/tenants', icon: Building },
        { name: 'Client Management', href: '/admin/client-management', icon: Users },
        { name: 'Communication Hub', href: '/admin/communication-hub', icon: Globe },
        { name: 'Advanced Billing', href: '/admin/advanced-billing', icon: CreditCard },
        { name: 'Revenue Intelligence', href: '/admin/revenue-intelligence', icon: TrendingUp },
        { name: 'Usage Analytics', href: '/admin/usage-analytics', icon: BarChart3 },
        { name: 'BI Dashboard', href: '/admin/bi-dashboard', icon: BarChart3 },
        { name: 'Tenant Management', href: '/admin/tenant-management', icon: Building },
        { name: 'Feature Flags', href: '/admin/feature-flags', icon: Shield },
        { name: 'White-Label', href: '/admin/white-label', icon: Settings },
      ],
    },
    {
      label: 'Platform Health',
      links: [
        { name: 'System Performance', href: '/admin/system-performance', icon: BarChart3 },
        { name: 'Security Operations', href: '/admin/security-operations', icon: Shield },
        { name: 'Compliance Center', href: '/admin/compliance-center', icon: Settings },
      ],
    },
    {
      label: 'Client Intelligence',
      links: [
        { name: 'Client 360 View', href: '/admin/client-360', icon: Users },
      ],
    },
  ]

  return (
    <div className="sidebar min-h-screen h-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Traffic Interceptor</h1>
      </div>
      
      <nav className="sidebar-nav flex-1">
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
        
        {user?.role === 'super_admin' && (
          <>
            <div className="border-t border-gray-200 my-4" />
            {adminGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="px-2 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </h3>
                </div>
                {group.links.map((item) => (
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
            ))}
          </>
        )}
      </nav>
    </div>
  )
}

export default Sidebar
