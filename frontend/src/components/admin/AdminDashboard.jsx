import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  // Mock admin dashboard data
  const mockData = {
    platformMetrics: {
      totalUsers: 1247,
      activeUsers: 892,
      totalDomains: 567,
      activeDomains: 423,
      totalRevenue: 45678,
      monthlyGrowth: 12.5
    },
    systemHealth: {
      uptime: 99.97,
      responseTime: 45,
      errorRate: 0.03,
      activeConnections: 1234
    },
    securityMetrics: {
      totalThreats: 156,
      blockedRequests: 2345,
      suspiciousIPs: 23,
      securityScore: 94
    },
    trafficOverview: [
      { time: '00:00', requests: 1234, bots: 567, humans: 667 },
      { time: '04:00', requests: 987, bots: 456, humans: 531 },
      { time: '08:00', requests: 2345, bots: 1234, humans: 1111 },
      { time: '12:00', requests: 3456, bots: 1789, humans: 1667 },
      { time: '16:00', requests: 2987, bots: 1456, humans: 1531 },
      { time: '20:00', requests: 1876, bots: 987, humans: 889 },
      { time: '24:00', requests: 1456, bots: 678, humans: 778 }
    ],
    userDistribution: [
      { plan: 'Free', users: 234, percentage: 19 },
      { plan: 'Starter', users: 456, percentage: 37 },
      { plan: 'Professional', users: 345, percentage: 28 },
      { plan: 'Enterprise', users: 212, percentage: 16 }
    ],
    revenueTrends: [
      { month: 'Jan', revenue: 12500, growth: 0 },
      { month: 'Feb', revenue: 13800, growth: 10.4 },
      { month: 'Mar', revenue: 15200, growth: 10.1 },
      { month: 'Apr', revenue: 16800, growth: 10.5 },
      { month: 'May', revenue: 18500, growth: 10.1 },
      { month: 'Jun', revenue: 20300, growth: 9.7 }
    ]
  }

  useEffect(() => {
    setDashboardData(mockData)
    fetchAdminData()
  }, [timeRange])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from the admin API
      // const response = await adminAPI.getDashboardData(timeRange)
      // setDashboardData(response.data)
      
      // For now, simulate API delay
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setIsLoading(false)
    }
  }

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUptimeColor = (uptime) => {
    if (uptime >= 99.9) return 'text-green-600'
    if (uptime >= 99.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform overview and system health monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <CogIcon className="-ml-1 mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(dashboardData.platformMetrics?.totalUsers || 0)}
              </p>
              <p className="text-sm text-green-600">
                +{dashboardData.platformMetrics?.monthlyGrowth || 0}% this month
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Domains</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(dashboardData.platformMetrics?.activeDomains || 0)}
              </p>
              <p className="text-sm text-gray-500">
                of {formatNumber(dashboardData.platformMetrics?.totalDomains || 0)} total
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardData.platformMetrics?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-green-600">
                +{dashboardData.platformMetrics?.monthlyGrowth || 0}% growth
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Score</p>
              <p className={`text-2xl font-semibold ${getSecurityScoreColor(dashboardData.securityMetrics?.securityScore || 0)}`}>
                {dashboardData.securityMetrics?.securityScore || 0}/100
              </p>
              <p className="text-sm text-gray-500">
                {dashboardData.securityMetrics?.totalThreats || 0} threats blocked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Uptime</span>
              <span className={`text-lg font-semibold ${getUptimeColor(dashboardData.systemHealth?.uptime || 0)}`}>
                {dashboardData.systemHealth?.uptime || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Response Time</span>
              <span className="text-lg font-semibold text-gray-900">
                {dashboardData.systemHealth?.responseTime || 0}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Error Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {dashboardData.systemHealth?.errorRate || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Active Connections</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(dashboardData.systemHealth?.activeConnections || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Threats</span>
              <span className="text-lg font-semibold text-red-600">
                {dashboardData.securityMetrics?.totalThreats || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Blocked Requests</span>
              <span className="text-lg font-semibold text-green-600">
                {formatNumber(dashboardData.securityMetrics?.blockedRequests || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Suspicious IPs</span>
              <span className="text-lg font-semibold text-yellow-600">
                {dashboardData.securityMetrics?.suspiciousIPs || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Security Score</span>
              <span className={`text-lg font-semibold ${getSecurityScoreColor(dashboardData.securityMetrics?.securityScore || 0)}`}>
                {dashboardData.securityMetrics?.securityScore || 0}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.trafficOverview}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="requests" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="bots" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              <Area type="monotone" dataKey="humans" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ plan, percentage }) => `${plan} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {dashboardData.userDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.revenueTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span>Manage Users</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
            <span>Security Settings</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <CogIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span>System Config</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
