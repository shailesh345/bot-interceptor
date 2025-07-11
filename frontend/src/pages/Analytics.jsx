import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../store/slices/analyticsSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, Scatter, ScatterChart
} from 'recharts'
import { 
  BarChart3, TrendingUp, Bot, Shield, DollarSign, 
  Calendar, Filter, Download, RefreshCw, Clock,
  Globe, Zap, Activity, Target
} from 'lucide-react'
import { generateAdvancedAnalyticsData } from '../services/enhancedMockAPI'

const Analytics = () => {
  const dispatch = useDispatch()
  const { metrics, loading, error } = useSelector((state) => state.analytics)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    dispatch(fetchAnalytics())
    setAnalyticsData(generateAdvancedAnalyticsData())
  }, [dispatch])

  if (loading && !analyticsData) {
    return <LoadingSpinner size="lg" />
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600">{error}</div>
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'traffic', name: 'Traffic Analysis', icon: TrendingUp },
    { id: 'bots', name: 'Bot Intelligence', icon: Bot },
    { id: 'revenue', name: 'Revenue Analytics', icon: DollarSign },
    { id: 'geography', name: 'Geographic Data', icon: Globe },
    { id: 'realtime', name: 'Real-time', icon: Activity }
  ]

  return (
    <>
      <Helmet>
        <title>Analytics - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive traffic insights and bot intelligence
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
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && analyticsData && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.traffic.overview.totalRequests.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+12.5% vs last period</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Bot className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bot Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.traffic.overview.botRequests.toLocaleString()}
                    </p>
                    <p className="text-sm text-orange-600">
                      {((analyticsData.traffic.overview.botRequests / analyticsData.traffic.overview.totalRequests) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData.traffic.overview.blockedRequests.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-600">
                      {((analyticsData.traffic.overview.blockedRequests / analyticsData.traffic.overview.totalRequests) * 100).toFixed(1)}% blocked
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analyticsData.traffic.overview.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+8.3% vs last period</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Trends */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analyticsData.traffic.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      stroke="#3B82F6"
                      name="Total Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Trend Line"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bot Categories and Revenue Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Categories</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.bots.categories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {analyticsData.bots.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Sources</h3>
                <div className="space-y-4">
                  {analyticsData.revenue.bySource.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${source.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{source.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Analysis Tab */}
        {selectedTab === 'traffic' && analyticsData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Traffic Pattern</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.traffic.hourly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#3B82F6" name="Total Requests" />
                    <Bar dataKey="bots" fill="#8B5CF6" name="Bot Requests" />
                    <Bar dataKey="blocked" fill="#EF4444" name="Blocked Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
              <div className="space-y-4">
                {analyticsData.traffic.geographic.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {country.requests.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bot Intelligence Tab */}
        {selectedTab === 'bots' && analyticsData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Bot Sources</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bot Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blocked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.bots.topBots.map((bot, index) => (
                      <tr key={bot.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Bot className="h-5 w-5 text-purple-600 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{bot.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bot.requests.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bot.blocked.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${bot.revenue?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            bot.blocked > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {bot.blocked > 0 ? 'Blocked' : 'Allowed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Category Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.bots.categories} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Tab */}
        {selectedTab === 'realtime' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Requests</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requests/sec</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bots</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blocked/min</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Traffic Feed</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {new Date(Date.now() - i * 2000).toLocaleTimeString()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {i % 3 === 0 ? 'Blocked' : i % 3 === 1 ? 'Allowed' : 'Bot Detected'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        192.168.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Analytics
