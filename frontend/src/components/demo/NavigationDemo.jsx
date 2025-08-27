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
  Globe 
} from 'lucide-react'
import NavigationButton from '../common/NavigationButton'

const NavigationDemo = () => {
  const [activeItem, setActiveItem] = useState('dashboard')

  const demoItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'monitoring', label: 'Monitoring', icon: Heart },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enhanced Navigation Demo
        </h3>
        <p className="text-sm text-gray-600">
          Interactive navigation with black background, white text/icons, and ripple effects
        </p>
      </div>
      
      <nav className="space-y-2">
        {demoItems.map((item) => (
          <NavigationButton
            key={item.id}
            isActive={activeItem === item.id}
            icon={item.icon}
            onClick={() => setActiveItem(item.id)}
            className="w-full justify-start"
          >
            {item.label}
          </NavigationButton>
        ))}
      </nav>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Black background for selected items</li>
          <li>• White text and icons when active</li>
          <li>• White circle indicator with pulse animation</li>
          <li>• Smooth ripple effects on hover</li>
          <li>• Gradient backgrounds and shimmer effects</li>
          <li>• Smooth transitions and micro-interactions</li>
        </ul>
      </div>
    </div>
  )
}

export default NavigationDemo
