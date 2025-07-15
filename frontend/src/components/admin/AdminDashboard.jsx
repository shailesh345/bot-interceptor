import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  Building, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Server,
  Database,
  Shield,
  BarChart3,
  Globe,
  CreditCard
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDomains: 0,
    monthlyRevenue: 0,
    trafficProcessed: 0,
    systemHealth: 100,
    activeRules: 0,
    blockedRequests: 0,
    allowedRequests: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [systemAlerts, setSystemAlerts] = useState([])

  useEffect(() => {
    // Simulate fetching admin stats
    const mockStats = {
      totalUsers: 1247,
      activeDomains: 3892,
      monthlyRevenue: 45678,
      trafficProcessed: 2847392,
      systemHealth: 99.2,
      activeRules: 15847,
      blockedRequests: 382947,
      allowedRequests: 2464445
    }

    const mockActivities = [
      { id: 1, type: 'user_registered', message: 'New user registered: john@example.com', timestamp: '2 minutes ago' },
      { id: 2, type: 'domain_added', message: 'Domain added: example.com', timestamp: '5 minutes ago' },
      { id: 3, type: 'payment_processed', message: 'Payment processed: $29.99', timestamp: '12 minutes ago' },
      { id: 4, type: 'rule_created', message: 'New rule created for bot detection', timestamp: '18 minutes ago' },
      { id: 5, type: 'system_alert', message: 'High traffic detected on server-03', timestamp: '25 minutes ago' }
    ]

    const mockAlerts = [
      { id: 1, type: 'warning', message: 'Server load above 80% on us-east-1', timestamp: '5 minutes ago' },
      { id: 2, type: 'info', message: 'Scheduled maintenance in 2 hours', timestamp: '1 hour ago' },
      { id: 3, type: 'error', message: 'Payment gateway timeout resolved', timestamp: '2 hours ago' }
    ]

    setStats(mockStats)
    setRecentActivities(mockActivities)
    setSystemAlerts(mockAlerts)
  }, [])

  const getActivityIcon = (type) => {
    switch(type) {
      case 'user_registered': return <Users className="w-4 h-4 text-blue-600" />
      case 'domain_added': return <Globe className="w-4 h-4 text-green-600" />
      case 'payment_processed': return <CreditCard className="w-4 h-4 text-purple-600" />
      case 'rule_created': return <Shield className="w-4 h-4 text-orange-600" />
      case 'system_alert': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type) => {
    switch(type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Domains</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDomains.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Traffic Processed</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.trafficProcessed / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              System Health
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Overall Health</span>
                <span className="text-lg font-bold text-green-600">{stats.systemHealth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.systemHealth}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stats.activeRules.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Active Rules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">99.9%</div>
                  <div className="text-xs text-gray-500">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Traffic Overview
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Blocked Requests</span>
                <span className="text-lg font-bold text-red-600">{stats.blockedRequests.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Allowed Requests</span>
                <span className="text-lg font-bold text-green-600">{stats.allowedRequests.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.blockedRequests / (stats.blockedRequests + stats.allowedRequests)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {((stats.blockedRequests / (stats.blockedRequests + stats.allowedRequests)) * 100).toFixed(1)}% blocked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              System Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
