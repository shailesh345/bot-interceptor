import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Users, Server, Activity, AlertTriangle, TrendingUp, 
  Database, Shield, Clock, DollarSign, Globe, 
  BarChart3, PieChart, Zap, Settings 
} from 'lucide-react'

const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 12847,
    activeTenants: 256,
    totalRequests: '24.7M',
    uptime: '99.94%',
    revenue: '$142,350',
    activeRules: 3426,
    blockedThreats: 1247,
    bandwidth: '2.8TB'
  })

  const [realtimeMetrics, setRealtimeMetrics] = useState({
    requestsPerSecond: 1847,
    activeConnections: 5632,
    cpuUsage: 67,
    memoryUsage: 72,
    diskUsage: 45,
    networkIO: '1.2GB/s'
  })

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage on server cluster-3', time: '2 minutes ago', severity: 'medium' },
    { id: 2, type: 'error', message: 'Failed login attempts spike detected', time: '5 minutes ago', severity: 'high' },
    { id: 3, type: 'info', message: 'New tenant onboarded: Acme Corp', time: '15 minutes ago', severity: 'low' },
    { id: 4, type: 'warning', message: 'Database connection pool reaching limit', time: '23 minutes ago', severity: 'medium' }
  ])

  const [topTenants, setTopTenants] = useState([
    { name: 'Enterprise Corp', requests: '2.1M', revenue: '$15,240', status: 'active' },
    { name: 'TechStart Inc', requests: '1.8M', revenue: '$12,850', status: 'active' },
    { name: 'Global Solutions', requests: '1.5M', revenue: '$11,200', status: 'active' },
    { name: 'Digital Dynamics', requests: '1.2M', revenue: '$8,950', status: 'active' },
    { name: 'Cloud Systems', requests: '980K', revenue: '$7,340', status: 'active' }
  ])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              System administration and platform management overview
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{systemStats.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.3%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* Active Tenants */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Tenants</dt>
                  <dd className="text-lg font-medium text-gray-900">{systemStats.activeTenants}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8.1%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* Total Requests */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{systemStats.totalRequests}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+23.5%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{systemStats.revenue}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+15.7%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Real-time System Metrics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Requests per Second */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{realtimeMetrics.requestsPerSecond.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Requests/Second</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Active Connections */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{realtimeMetrics.activeConnections.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Active Connections</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              {/* CPU Usage */}
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{realtimeMetrics.cpuUsage}%</div>
                <div className="text-sm text-gray-500">CPU Usage</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${realtimeMetrics.cpuUsage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500">{alert.time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tenants */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Tenants by Usage</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {topTenants.map((tenant, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.requests} requests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{tenant.revenue}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {tenant.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Health Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-900">System Uptime</div>
                <div className="text-2xl font-bold text-green-600">{systemStats.uptime}</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-blue-900">Active Rules</div>
                <div className="text-2xl font-bold text-blue-600">{systemStats.activeRules.toLocaleString()}</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-red-900">Blocked Threats</div>
                <div className="text-2xl font-bold text-red-600">{systemStats.blockedThreats.toLocaleString()}</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-purple-900">Bandwidth Used</div>
                <div className="text-2xl font-bold text-purple-600">{systemStats.bandwidth}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
