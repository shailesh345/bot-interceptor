import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Shield, 
  Zap, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const AnalyticsDashboard = ({ domainId, timeRange = 24 }) => {
  const [analytics, setAnalytics] = useState(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const token = useSelector((state) => state.auth?.token)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://127.0.0.1:9889/api/v1/analytics/traffic/summary?${domainId ? `domain_id=${domainId}&` : ''}hours=${selectedTimeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRealtimeMetrics = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:9889/api/v1/analytics/traffic/realtime?${domainId ? `domain_id=${domainId}&` : ''}minutes=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRealtimeMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching realtime metrics:', error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAnalytics()
      fetchRealtimeMetrics()
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchRealtimeMetrics, 30000)
      return () => clearInterval(interval)
    }
  }, [token, domainId, selectedTimeRange])

  const exportAnalytics = () => {
    if (!analytics) return

    const csvData = [
      ['Metric', 'Value'],
      ['Total Requests', analytics.overview.total_requests],
      ['Unique Visitors', analytics.overview.unique_visitors],
      ['Bot Requests', analytics.overview.bot_requests],
      ['Human Requests', analytics.overview.human_requests],
      ['Error Rate (%)', analytics.overview.error_rate],
      ['Avg Response Time (ms)', analytics.performance.avg_response_time],
      ['Top Country', analytics.geographic.top_countries[0]?.country || 'N/A'],
      ['Top Path', analytics.top_paths[0]?.path || 'N/A']
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Analytics data exported successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Last 1 Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last 7 Days</option>
            <option value={720}>Last 30 Days</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Real-time Metrics (Last 5 minutes)</span>
              <Badge className={`${
                realtimeMetrics.health_score >= 90 ? 'bg-green-100 text-green-800' :
                realtimeMetrics.health_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Health: {realtimeMetrics.health_score}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{realtimeMetrics.requests_per_minute}</p>
                <p className="text-sm text-gray-600">Requests/min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{realtimeMetrics.unique_visitors}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{realtimeMetrics.avg_response_time}ms</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {realtimeMetrics.status_breakdown['2xx'] + realtimeMetrics.status_breakdown['3xx']}
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_requests.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.unique_visitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.error_rate}%</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${analytics.overview.error_rate > 5 ? 'text-red-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bot Traffic</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.bot_percentage.toFixed(1)}%</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-lg font-semibold">Response Time</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{analytics.performance.avg_response_time}ms</p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-lg font-semibold">Success Rate</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {((analytics.overview.success_requests / analytics.overview.total_requests) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">2xx & 3xx responses</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Monitor className="h-6 w-6 text-purple-500 mr-2" />
                <span className="text-lg font-semibold">Uptime</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">99.9%</p>
              <p className="text-sm text-gray-600">Estimated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Top Countries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.geographic.top_countries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{country.requests} requests</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(country.requests / analytics.geographic.top_countries[0].requests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Top Pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_paths.slice(0, 5).map((path, index) => (
                <div key={path.path} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="font-mono text-sm truncate max-w-xs">{path.path}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{path.requests}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(path.requests / analytics.top_paths[0].requests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HTTP Methods & User Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>HTTP Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.methods.map((method) => (
                <div key={method.method} className="flex items-center justify-between">
                  <Badge className={`${
                    method.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    method.method === 'POST' ? 'bg-green-100 text-green-800' :
                    method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    method.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {method.method}
                  </Badge>
                  <span className="text-sm text-gray-600">{method.requests} requests</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.user_agents.slice(0, 5).map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span className="font-medium">{browser.browser}</span>
                  <span className="text-sm text-gray-600">{browser.requests} requests</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analytics.hourly_breakdown.map((hour, index) => (
              <div key={hour.hour} className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t w-8 min-h-1"
                  style={{ 
                    height: `${Math.max(4, (hour.total / Math.max(...analytics.hourly_breakdown.map(h => h.total))) * 200)}px` 
                  }}
                  title={`${hour.total} requests at ${new Date(hour.hour).toLocaleTimeString()}`}
                ></div>
                <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                  {new Date(hour.hour).toLocaleTimeString([], { hour: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
