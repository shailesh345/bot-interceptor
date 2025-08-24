import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { 
  Activity, TrendingUp, Shield, Bot, Users, DollarSign,
  Globe, RefreshCw, ArrowUp, Eye, Server, CheckCircle,
  Clock, Settings, Bell, X
} from 'lucide-react'
import { mockAPI } from '../services/comprehensiveMockAPI'
import RealTimeDashboard from '../components/dashboard/RealTimeDashboard'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('24h')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const [analytics, domains, rules] = await Promise.all([
        mockAPI.getAnalytics(days),
        mockAPI.getDomains(),
        mockAPI.getRules()
      ])
      setDashboardData({ ...analytics, domains, rules })
    } catch (error) {
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    toast.success('Dashboard refreshed!')
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96" data-testid="dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96" data-testid="dashboard-error">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <>
      <Helmet>
        <title>Dashboard - Traffic Interceptor</title>
      </Helmet>
      
      <main role="main" className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your traffic protection
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Real-Time
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(dashboardData?.summary?.totalRequests)}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatNumber(dashboardData?.summary?.totalBlocked)}
                    </p>
                    <div className="flex items-center mt-2">
                      <Shield className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Protected</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bot Traffic</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatNumber(dashboardData?.summary?.botTraffic)}
                    </p>
                    <div className="flex items-center mt-2">
                      <Bot className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">Detected</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Bot className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboardData?.summary?.revenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Chart */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
                <div data-testid="traffic-chart" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData?.trafficData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="bots" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bot Distribution Chart */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Distribution</h3>
                <div data-testid="bot-distribution-chart" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData?.botDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(dashboardData?.botDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white p-6 rounded-lg shadow border" data-testid="revenue-analytics">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData?.revenue?.monthly || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(dashboardData?.revenue?.projected || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Projected Annual</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData?.revenue?.growth || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                </div>
              </div>
            </div>

            {/* Real-time Indicator */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between" data-testid="realtime-indicator">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Real-time Monitoring Active</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Live</span>
              </div>
            </div>

            {/* Quick Actions and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/domains')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Add New Domain</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-400 transform rotate-45" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/rules')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Create Protection Rule</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-400 transform rotate-45" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/analytics')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">View Analytics</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-400 transform rotate-45" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Configure Settings</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-400 transform rotate-45" />
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">API Status</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Protection Active</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">99.9% Uptime</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Response Time</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      {dashboardData?.summary?.avgResponseTime || 0}ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Active Rules</span>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">
                      {dashboardData?.rules?.filter(r => r.status === 'active').length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Domains */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Domains</h3>
                  <button
                    onClick={() => navigate('/domains')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {(dashboardData?.domains || []).slice(0, 4).map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{domain.domain}</p>
                          <p className="text-xs text-gray-500">
                            {domain.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        domain.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {domain.verificationStatus === 'verified' ? 'Active' : 'Setup'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Rules */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Rules</h3>
                  <button
                    onClick={() => navigate('/rules')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {(dashboardData?.rules || []).slice(0, 4).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                          <p className="text-xs text-gray-500">{rule.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'realtime' && (
          <RealTimeDashboard />
        )}
      </main>
    </>
  )
}

export default Dashboard
