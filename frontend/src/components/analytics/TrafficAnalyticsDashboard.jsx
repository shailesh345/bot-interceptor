import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { trafficAPI } from '../../services/trafficAPI'

const TrafficAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h')
  const [analyticsData, setAnalyticsData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Mock analytics data
  const mockData = {
    trafficOverTime: [
      { time: '00:00', requests: 45, bots: 23, humans: 22 },
      { time: '04:00', requests: 32, bots: 18, humans: 14 },
      { time: '08:00', requests: 89, bots: 45, humans: 44 },
      { time: '12:00', requests: 156, bots: 78, humans: 78 },
      { time: '16:00', requests: 134, bots: 67, humans: 67 },
      { time: '20:00', requests: 98, bots: 49, humans: 49 },
      { time: '24:00', requests: 67, bots: 34, humans: 33 }
    ],
    botTypes: [
      { name: 'Search Engine', value: 45, color: '#3B82F6' },
      { name: 'Scraper', value: 25, color: '#EF4444' },
      { name: 'Malicious', value: 15, color: '#DC2626' },
      { name: 'Legitimate', value: 10, color: '#10B981' },
      { name: 'Unknown', value: 5, color: '#6B7280' }
    ],
    topDomains: [
      { domain: 'example.com', requests: 234, bots: 156, humans: 78 },
      { domain: 'api.example.com', requests: 189, bots: 134, humans: 55 },
      { domain: 'admin.example.com', requests: 67, bots: 23, humans: 44 },
      { domain: 'blog.example.com', requests: 45, bots: 12, humans: 33 },
      { domain: 'shop.example.com', requests: 34, bots: 8, humans: 26 }
    ],
    geographicData: [
      { country: 'United States', requests: 456, percentage: 45 },
      { country: 'Canada', requests: 234, percentage: 23 },
      { country: 'United Kingdom', requests: 123, percentage: 12 },
      { country: 'Germany', requests: 89, percentage: 9 },
      { country: 'France', requests: 67, percentage: 7 },
      { country: 'Other', requests: 45, percentage: 4 }
    ],
    responseTimes: [
      { time: '00:00', avg: 23, p95: 45, p99: 67 },
      { time: '04:00', avg: 18, p95: 38, p99: 56 },
      { time: '08:00', avg: 34, p95: 67, p99: 89 },
      { time: '12:00', avg: 45, p95: 89, p99: 123 },
      { time: '16:00', avg: 38, p95: 76, p99: 98 },
      { time: '20:00', avg: 29, p95: 58, p99: 78 },
      { time: '24:00', avg: 25, p95: 49, p99: 67 }
    ],
    securityMetrics: {
      totalThreats: 23,
      blockedRequests: 156,
      suspiciousIPs: 12,
      rateLimitHits: 89,
      honeypotTriggers: 34
    }
  }

  useEffect(() => {
    setAnalyticsData(mockData)
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Fetch real analytics data from backend
      const response = await trafficAPI.getRealTimeMetrics()
      // Process and merge with mock data
      setAnalyticsData(prev => ({ ...prev, ...response.data }))
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      // Keep mock data if API fails
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getThreatLevel = (threats) => {
    if (threats < 10) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' }
    if (threats < 25) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traffic Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into traffic patterns, bot behavior, and security metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <ClockIcon className="-ml-1 mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData.trafficOverTime?.reduce((sum, item) => sum + item.requests, 0) || 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bot Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData.trafficOverTime?.reduce((sum, item) => sum + item.bots, 0) || 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Human Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analyticsData.trafficOverTime?.reduce((sum, item) => sum + item.humans, 0) || 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.responseTimes?.[0]?.avg || 0}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.trafficOverTime}>
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

        {/* Bot Types Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.botTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.botTypes?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Domains */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Domains by Traffic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topDomains}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#3B82F6" />
              <Bar dataKey="bots" fill="#EF4444" />
              <Bar dataKey="humans" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Times */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.responseTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="p95" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="p99" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.geographicData?.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">{country.country}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatNumber(country.requests)}</p>
                <p className="text-xs text-gray-500">{country.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getThreatLevel(analyticsData.securityMetrics?.totalThreats || 0).bg} mb-3`}>
              <ExclamationTriangleIcon className={`h-8 w-8 ${getThreatLevel(analyticsData.securityMetrics?.totalThreats || 0).color}`} />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Threats</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData.securityMetrics?.totalThreats || 0}</p>
            <p className={`text-xs font-medium ${getThreatLevel(analyticsData.securityMetrics?.totalThreats || 0).color}`}>
              {getThreatLevel(analyticsData.securityMetrics?.totalThreats || 0).level}
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
              <ShieldCheckIcon className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Blocked Requests</p>
            <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.securityMetrics?.blockedRequests || 0)}</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Suspicious IPs</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData.securityMetrics?.suspiciousIPs || 0}</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-3">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Rate Limit Hits</p>
            <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.securityMetrics?.rateLimitHits || 0)}</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Honeypot Triggers</p>
            <p className="text-2xl font-semibold text-gray-900">{analyticsData.securityMetrics?.honeypotTriggers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrafficAnalyticsDashboard
