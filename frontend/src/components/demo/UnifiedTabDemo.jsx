import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  Heart,
  Zap,
  Globe,
  Activity,
  TrendingUp,
  Building,
  Server
} from 'lucide-react'
import TabButton from '../common/TabButton'

const UnifiedTabDemo = () => {
  const [activeEnhanced, setActiveEnhanced] = useState('dashboard')
  const [activeUnderline, setActiveUnderline] = useState('overview')
  const [activeMinimal, setActiveMinimal] = useState('users')

  const demoTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'monitoring', label: 'Monitoring', icon: Heart },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'domains', label: 'Domains', icon: Globe },
  ]

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Unified Tab Button Components
        </h2>
        <p className="text-gray-600">
          Enhanced tab navigation with black backgrounds, white text/icons, and ripple effects
        </p>
      </div>

      {/* Enhanced Variant (Primary) */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Enhanced Variant (Primary Style)
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <nav className="flex space-x-2 flex-wrap">
            {demoTabs.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeEnhanced === tab.id}
                icon={tab.icon}
                onClick={() => setActiveEnhanced(tab.id)}
                size="md"
                variant="enhanced"
                className="mb-2"
              >
                {tab.label}
              </TabButton>
            ))}
          </nav>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <strong>Features:</strong> Black background, white text/icons, white circle indicator, 
          ripple effects, shimmer animation
        </div>
      </div>

      {/* Underline Variant */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Underline Variant (Alternative Style)
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <nav className="flex space-x-6 border-b border-gray-200">
            {adminTabs.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeUnderline === tab.id}
                icon={tab.icon}
                onClick={() => setActiveUnderline(tab.id)}
                size="md"
                variant="underline"
                showIndicator={false}
              >
                {tab.label}
              </TabButton>
            ))}
          </nav>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <strong>Features:</strong> Clean underline style, hover animations, minimal design
        </div>
      </div>

      {/* Minimal Variant */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Minimal Variant (Subtle Style)
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <nav className="flex space-x-2 flex-wrap">
            {settingsTabs.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeMinimal === tab.id}
                icon={tab.icon}
                onClick={() => setActiveMinimal(tab.id)}
                size="sm"
                variant="minimal"
                showIndicator={false}
                className="mb-2"
              >
                {tab.label}
              </TabButton>
            ))}
          </nav>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <strong>Features:</strong> Light gray background, subtle hover effects, compact design
        </div>
      </div>

      {/* Size Variations */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Size Variations
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Small (sm)</h4>
            <nav className="flex space-x-2">
              <TabButton isActive={true} icon={Home} size="sm" variant="enhanced">
                Small Tab
              </TabButton>
              <TabButton isActive={false} icon={Users} size="sm" variant="enhanced">
                Inactive
              </TabButton>
            </nav>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Medium (md)</h4>
            <nav className="flex space-x-2">
              <TabButton isActive={true} icon={BarChart3} size="md" variant="enhanced">
                Medium Tab
              </TabButton>
              <TabButton isActive={false} icon={Settings} size="md" variant="enhanced">
                Inactive
              </TabButton>
            </nav>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Large (lg)</h4>
            <nav className="flex space-x-2">
              <TabButton isActive={true} icon={Shield} size="lg" variant="enhanced">
                Large Tab
              </TabButton>
              <TabButton isActive={false} icon={Globe} size="lg" variant="enhanced">
                Inactive
              </TabButton>
            </nav>
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Implementation Notes
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Consistent API:</strong> All tabs use the same TabButton component with variant props</p>
          <p>• <strong>Responsive:</strong> Flex-wrap support for mobile layouts</p>
          <p>• <strong>Accessible:</strong> Proper keyboard navigation and ARIA attributes</p>
          <p>• <strong>Animated:</strong> Framer Motion for smooth transitions and micro-interactions</p>
          <p>• <strong>Customizable:</strong> Support for different sizes, variants, and custom styling</p>
        </div>
      </div>
    </div>
  )
}

export default UnifiedTabDemo
