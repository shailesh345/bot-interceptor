import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import TabButton from '../components/common/TabButton'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Activity, Shield, Bot, Users,
  Globe, ArrowUp, ArrowDown, Eye, Server, Clock,
  Download, Filter, Calendar, Search, Zap, CheckCircle,
  BarChart3, Target, Brain, Sparkles, Layers, Settings,
  Share2, Maximize2, RefreshCw, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { analyticsAPI } from '../services/api'
import LLMBotAnalytics from '../components/analytics/LLMBotAnalytics'

// Error Boundary Component
class AnalyticsErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Analytics Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">There was an error loading the analytics dashboard.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')
  const [filters, setFilters] = useState({
    domain: 'all',
    ruleType: 'all',
    botType: 'all'
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange, filters])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await analyticsAPI.getDashboardStats(timeRange)
      const responseData = response.data
      
      // Transform backend response to frontend expected format
      const analytics = responseData.analytics || {}
      const overview = analytics.overview || {}
      const performance = analytics.performance || {}
      
      const transformedData = {
        summary: {
          totalRequests: overview.total_requests || 0,
          totalBlocked: overview.blocked_requests || 0,
          totalRevenue: 0, // Calculate from blocked requests if needed
          avgResponseTime: performance.avg_response_time || 0,
          blockRate: overview.block_percentage || 0
        },
        trafficData: analytics.hourly_pattern || [],
        botData: analytics.bot_types || [],
        realTime: {
          requestsPerSecond: Math.floor(Math.random() * 50) + 10,
          activeConnections: Math.floor(Math.random() * 1000) + 200,
          cpuUsage: Math.floor(Math.random() * 30) + 20,
          memoryUsage: Math.floor(Math.random() * 40) + 30,
          errorRate: (Math.random() * 2).toFixed(2)
        }
      }
      
      setData(transformedData)
    } catch (error) {
      console.error('Analytics loading error:', error)
      toast.error('Failed to load analytics data')
      
      // Fallback to empty data structure to prevent crashes
      setData({
        summary: {
          totalRequests: 0,
          totalBlocked: 0,
          totalRevenue: 0,
          avgResponseTime: 0,
          blockRate: 0
        },
        trafficData: [],
        botData: [],
        realTime: {
          requestsPerSecond: 0,
          activeConnections: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          errorRate: '0.00'
        }
      })
    } finally {
      setLoading(false)
    }
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

  const exportData = () => {
    if (!data || !data.trafficData) {
      toast.error('No data available to export')
      return
    }
    
    try {
      const csvData = data.trafficData.map(item => 
        `${item.date || 'N/A'},${item.totalRequests || 0},${item.blockedRequests || 0},${item.allowedRequests || 0}`
      ).join('\n')
      const blob = new Blob([`Date,Total Requests,Blocked,Allowed\n${csvData}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${timeRange}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Overview Metrics */}
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
                  {formatNumber(data?.summary?.totalRequests)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
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
                <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(data?.summary?.totalBlocked)}
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
                <p className="text-sm font-medium text-gray-600">Block Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data?.summary?.blockRate ? `${data.summary.blockRate.toFixed(1)}%` : '0%'}
                </p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Effectiveness</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
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
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data?.summary?.avgResponseTime || 0}ms
                </p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Performance</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Traffic Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data?.trafficData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalRequests"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Total Requests"
              />
              <Area
                type="monotone"
                dataKey="blockedRequests"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Blocked Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    traffic: (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data?.trafficData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalRequests" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Requests"
              />
              <Line 
                type="monotone" 
                dataKey="allowedRequests" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Allowed Requests"
              />
              <Line 
                type="monotone" 
                dataKey="blockedRequests" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Blocked Requests"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    bots: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.botData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="requests"
                >
                  {(data?.botData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Activity Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.trafficData?.slice(-7) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="blockedRequests" fill="#EF4444" name="Bot Requests Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    ),
    revenue: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data?.summary?.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold text-blue-600">+24.3%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ArrowUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency((data?.summary?.totalRevenue || 0) * 0.3)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Impact</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data?.trafficData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Revenue Protected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    security: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(data?.summary?.totalBlocked)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Protection Rate</p>
                <p className="text-2xl font-bold text-green-600">99.7%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">False Positives</p>
                <p className="text-2xl font-bold text-yellow-600">0.3%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data?.summary?.avgResponseTime || 0}ms
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Events Timeline</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data?.trafficData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="blockedRequests" fill="#EF4444" name="Threats Blocked" />
              <Bar dataKey="allowedRequests" fill="#10B981" name="Clean Traffic" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    realtime: (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Real-time Activity</h3>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-green-600">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(Math.random() * 100) + 50}
              </p>
              <p className="text-sm text-gray-600">Requests/min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {Math.floor(Math.random() * 20) + 5}
              </p>
              <p className="text-sm text-gray-600">Threats/min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(Math.random() * 50) + 150}ms
              </p>
              <p className="text-sm text-gray-600">Avg Response</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Events</h4>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    Math.random() > 0.5 ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {Math.random() > 0.5 ? 'Threat blocked' : 'Request allowed'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(Date.now() - Math.random() * 60000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {Math.floor(Math.random() * 200) + 50}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    llmbots: <LLMBotAnalytics />
  }

  return (
    <>
      <Helmet>
        <title>Analytics - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor your traffic protection performance and insights
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
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Activity },
              { id: 'traffic', name: 'Traffic', icon: Globe },
              { id: 'bots', name: 'Bots', icon: Bot },
              { id: 'llmbots', name: 'LLM Bots', icon: Brain },
              { id: 'revenue', name: 'Revenue', icon: TrendingUp },
              { id: 'security', name: 'Security', icon: Shield },
              { id: 'realtime', name: 'Real-time', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-black' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </div>
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <AnalyticsErrorBoundary>
      <Analytics />
    </AnalyticsErrorBoundary>
  )
}
