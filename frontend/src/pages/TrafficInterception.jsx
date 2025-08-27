import React, { useState, useEffect } from 'react'
import { 
  EyeIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  CogIcon,
  DocumentArrowDownIcon,
  ComputerDesktopIcon,
  BellIcon,
  FireIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import TrafficInterceptionDashboard from '../components/traffic/TrafficInterceptionDashboard'
import ContentProtectionConfig from '../components/traffic/ContentProtectionConfig'
import TrafficAnalyticsDashboard from '../components/analytics/TrafficAnalyticsDashboard'
import TrafficMonitoringCenter from '../components/traffic/TrafficMonitoringCenter'
import AdvancedAnalyticsDashboard from '../components/analytics/AdvancedAnalyticsDashboard'
import DataExportPanel from '../components/analytics/DataExportPanel'
import TrafficInterceptionSettings from '../components/traffic/TrafficInterceptionSettings'

const TrafficInterception = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [systemStats, setSystemStats] = useState({
    status: 'active',
    totalRequests: 0,
    botDetections: 0,
    blockedRequests: 0,
    uptime: '99.9%',
    lastUpdate: new Date()
  })
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    // Fetch initial system stats
    fetchSystemStats()
    
    // Set up real-time updates
    const interval = setInterval(fetchSystemStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStats = async () => {
    try {
      // In development mode, use mock data
      if (import.meta.env.DEV) {
        setSystemStats({
          status: 'active',
          totalRequests: 15420 + Math.floor(Math.random() * 1000),
          botDetections: 3456 + Math.floor(Math.random() * 200),
          blockedRequests: 234 + Math.floor(Math.random() * 50),
          uptime: '99.9%',
          lastUpdate: new Date()
        })
        
        // Simulate alerts
        if (Math.random() > 0.8) {
          const newAlert = {
            id: Date.now(),
            type: Math.random() > 0.5 ? 'warning' : 'info',
            message: Math.random() > 0.5 ? 'High bot activity detected' : 'System performance optimal',
            timestamp: new Date()
          }
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]) // Keep last 5 alerts
        }
      }
    } catch (error) {
      console.log('Error fetching system stats:', error)
    }
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Live Dashboard',
      icon: EyeIcon,
      description: 'Real-time traffic monitoring and interception',
      color: 'blue'
    },
    {
      id: 'monitoring',
      name: 'Monitoring Center',
      icon: ComputerDesktopIcon,
      description: 'Advanced monitoring with alerting and analytics',
      color: 'green'
    },
    {
      id: 'protection',
      name: 'Content Protection',
      icon: ShieldCheckIcon,
      description: 'Configure protection rules and security policies',
      color: 'red'
    },
    {
      id: 'analytics',
      name: 'Traffic Analytics',
      icon: ChartBarIcon,
      description: 'Comprehensive traffic analysis and insights',
      color: 'purple'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      icon: FireIcon,
      description: 'Deep insights, ML predictions, and performance metrics',
      color: 'orange'
    },
    {
      id: 'export',
      name: 'Data Export',
      icon: DocumentArrowDownIcon,
      description: 'Export analytics data in various formats',
      color: 'indigo'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: CogIcon,
      description: 'Advanced configuration and system preferences',
      color: 'gray'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TrafficInterceptionDashboard />
      case 'monitoring':
        return <TrafficMonitoringCenter />
      case 'protection':
        return <ContentProtectionConfig />
      case 'analytics':
        return <TrafficAnalyticsDashboard />
      case 'advanced-analytics':
        return <AdvancedAnalyticsDashboard />
      case 'export':
        return <DataExportPanel />
      case 'settings':
        return <TrafficInterceptionSettings />
      default:
        return <TrafficInterceptionDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900">Traffic Interception</h1>
                <p className="mt-1 text-sm text-gray-500">
                  AI-powered bot detection, content protection, and advanced traffic analysis
                </p>
                {import.meta.env.DEV && (
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🔧 Development Mode
                  </div>
                )}
              </div>
              
              {/* System Status Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-blue-600">Total Requests</p>
                      <p className="text-sm font-bold text-blue-900">{systemStats.totalRequests.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-yellow-600">Bot Detections</p>
                      <p className="text-sm font-bold text-yellow-900">{systemStats.botDetections.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-red-600">Blocked</p>
                      <p className="text-sm font-bold text-red-900">{systemStats.blockedRequests.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      systemStats.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-xs font-medium text-green-600">Status</p>
                      <p className="text-sm font-bold text-green-900 capitalize">{systemStats.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Alerts */}
            {alerts.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <BellIcon className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    {alerts[0].message}
                  </span>
                  <span className="ml-2 text-xs text-yellow-600">
                    ({alerts.length} alert{alerts.length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  title={tab.description}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="hidden sm:block truncate">{tab.name}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-100 transition-transform duration-200"></div>
                  )}
                  
                  {/* Hover tooltip for mobile */}
                  <div className="sm:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {tab.name}
                  </div>
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
