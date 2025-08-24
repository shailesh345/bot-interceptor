import React, { useState } from 'react'
import { 
  EyeIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import TrafficInterceptionDashboard from '../components/traffic/TrafficInterceptionDashboard'
import ContentProtectionConfig from '../components/traffic/ContentProtectionConfig'
import TrafficAnalyticsDashboard from '../components/analytics/TrafficAnalyticsDashboard'

const TrafficInterception = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    {
      id: 'dashboard',
      name: 'Live Dashboard',
      icon: EyeIcon,
      description: 'Real-time traffic monitoring and interception'
    },
    {
      id: 'protection',
      name: 'Content Protection',
      icon: ShieldCheckIcon,
      description: 'Configure protection rules and settings'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      description: 'Comprehensive traffic analysis and insights'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: CogIcon,
      description: 'Advanced configuration and preferences'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TrafficInterceptionDashboard />
      case 'protection':
        return <ContentProtectionConfig />
      case 'analytics':
        return <TrafficAnalyticsDashboard />
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900">Traffic Interception Settings</h1>
            <p className="text-gray-600 mt-1">Advanced configuration options for the traffic interception system</p>
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
                <p className="text-gray-600">Configure system-wide settings for traffic interception, bot detection, and content protection.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Tuning</h3>
                <p className="text-gray-600">Optimize performance settings for high-traffic environments and real-time processing.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Settings</h3>
                <p className="text-gray-600">Configure integrations with external services, APIs, and monitoring tools.</p>
              </div>
            </div>
          </div>
        )
      default:
        return <TrafficInterceptionDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Interception</h1>
              <p className="mt-1 text-sm text-gray-500">
                Advanced bot detection, content protection, and traffic analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default TrafficInterception
