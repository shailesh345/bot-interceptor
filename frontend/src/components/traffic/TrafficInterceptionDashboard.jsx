import React, { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { trafficAPI, createTrafficData, processTrafficData, formatProcessingTime, formatBotType, formatActionTaken } from '../../services/trafficAPI'
import toast from 'react-hot-toast'

const TrafficInterceptionDashboard = () => {
  const [isIntercepting, setIsIntercepting] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [realTimeMetrics, setRealTimeMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('example.com')

  // Mock traffic data for demonstration
  const mockTrafficData = [
    {
      timestamp: new Date(),
      domain: 'example.com',
      path: '/api/data',
      method: 'GET',
      client_ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      is_bot: true,
      bot_type: 'search_engine',
      response_status: 200,
      processing_time: 45,
      action_taken: 'allow',
      geo_location: { country: 'US', city: 'Mountain View' }
    },
    {
      timestamp: new Date(Date.now() - 5000),
      domain: 'example.com',
      path: '/products',
      method: 'GET',
      client_ip: '203.0.113.45',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      is_bot: false,
      bot_type: null,
      response_status: 200,
      processing_time: 23,
      action_taken: 'allow',
      geo_location: { country: 'CA', city: 'Toronto' }
    }
  ]

  useEffect(() => {
    // Initialize with mock data
    setTrafficData(mockTrafficData)
    fetchRealTimeMetrics()
    
    // Set up real-time updates
    const interval = setInterval(fetchRealTimeMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await trafficAPI.getRealTimeMetrics()
      setRealTimeMetrics(response.data)
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error)
      // Use mock data if API fails
      setRealTimeMetrics({
        total_requests: 156,
        bot_requests: 89,
        human_requests: 67,
        blocked_requests: 12,
        average_response_time: 34.5
      })
    }
  }

  const startInterception = () => {
    setIsIntercepting(true)
    toast.success('Traffic interception started')
    
    // Simulate real-time traffic
    const interval = setInterval(() => {
      const newTraffic = generateMockTraffic()
      setTrafficData(prev => [newTraffic, ...prev.slice(0, 49)]) // Keep last 50 entries
    }, 2000)
    
    // Store interval for cleanup
    window.trafficInterval = interval
  }

  const stopInterception = () => {
    setIsIntercepting(false)
    toast.success('Traffic interception stopped')
    
    if (window.trafficInterval) {
      clearInterval(window.trafficInterval)
      window.trafficInterval = null
    }
  }

  const generateMockTraffic = () => {
    const domains = ['example.com', 'api.example.com', 'admin.example.com']
    const paths = ['/api/data', '/products', '/users', '/analytics', '/settings']
    const methods = ['GET', 'POST', 'PUT', 'DELETE']
    const userAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (compatible; Bingbot/2.0)',
      'Mozilla/5.0 (compatible; AhrefsBot/7.0)'
    ]
    
    const isBot = Math.random() > 0.6
    const botTypes = ['search_engine', 'scraper', 'malicious', 'legitimate']
    
    return {
      timestamp: new Date(),
      domain: domains[Math.floor(Math.random() * domains.length)],
      path: paths[Math.floor(Math.random() * paths.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      client_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
      is_bot: isBot,
      bot_type: isBot ? botTypes[Math.floor(Math.random() * botTypes.length)] : null,
      response_status: Math.random() > 0.1 ? 200 : 403,
      processing_time: Math.floor(Math.random() * 100) + 10,
      action_taken: Math.random() > 0.8 ? 'block' : 'allow',
      geo_location: { 
        country: ['US', 'CA', 'UK', 'DE', 'FR'][Math.floor(Math.random() * 5)],
        city: 'Unknown'
      }
    }
  }

  const testTrafficInterception = async () => {
    setIsLoading(true)
    try {
      const testData = createTrafficData({
        method: 'GET',
        url: 'https://example.com/api/test',
        headers: { 'User-Agent': 'Test-Bot/1.0' },
        client_ip: '192.168.1.100',
        user_agent: 'Test-Bot/1.0'
      })
      
      const response = await trafficAPI.interceptTraffic(testData)
      const result = response.data.interception_result
      
      toast.success(`Traffic intercepted successfully! Bot detected: ${result.bot_detected}`)
      
      // Add to traffic data
      const newTraffic = {
        timestamp: new Date(),
        domain: 'example.com',
        path: '/api/test',
        method: 'GET',
        client_ip: '192.168.1.100',
        user_agent: 'Test-Bot/1.0',
        is_bot: result.bot_detected,
        bot_type: result.bot_type,
        response_status: result.response_status,
        processing_time: result.processing_time * 1000, // Convert to ms
        action_taken: result.action_taken,
        geo_location: result.geo_location
      }
      
      setTrafficData(prev => [newTraffic, ...prev])
      
    } catch (error) {
      toast.error('Failed to test traffic interception')
      console.error('Traffic interception test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'allow': return 'text-green-600'
      case 'block': return 'text-red-600'
      case 'challenge': return 'text-yellow-600'
      case 'rate_limit': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traffic Interception Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and control real-time traffic with AI-powered bot detection</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={testTrafficInterception}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
              ) : (
                <EyeIcon className="-ml-1 mr-2 h-4 w-4" />
              )}
              Test Interception
            </button>
            {!isIntercepting ? (
              <button
                onClick={startInterception}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlayIcon className="-ml-1 mr-2 h-4 w-4" />
                Start Interception
              </button>
            ) : (
              <button
                onClick={stopInterception}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <StopIcon className="-ml-1 mr-2 h-4 w-4" />
                Stop Interception
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{realTimeMetrics.total_requests || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{realTimeMetrics.bot_requests || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{realTimeMetrics.human_requests || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Blocked</p>
              <p className="text-2xl font-semibold text-gray-900">{realTimeMetrics.blocked_requests || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Response</p>
              <p className="text-2xl font-semibold text-gray-900">{realTimeMetrics.average_response_time?.toFixed(1) || 0}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Real-time Traffic</h3>
          <p className="text-sm text-gray-500">Live monitoring of intercepted traffic</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trafficData.map((traffic, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {traffic.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {traffic.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traffic.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {traffic.client_ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {traffic.is_bot ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {formatBotType(traffic.bot_type)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Human
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(traffic.response_status)}`}>
                      {traffic.response_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatProcessingTime(traffic.processing_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getActionColor(traffic.action_taken)}`}>
                      {formatActionTaken(traffic.action_taken)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TrafficInterceptionDashboard
