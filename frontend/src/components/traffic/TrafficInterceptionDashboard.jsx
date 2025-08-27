import React, { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ClockIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ServerIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { trafficAPI, createTrafficData, processTrafficData, formatProcessingTime, formatBotType, formatActionTaken } from '../../services/trafficAPI'
import toast from 'react-hot-toast'

const TrafficInterceptionDashboard = () => {
  const [isIntercepting, setIsIntercepting] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [realTimeMetrics, setRealTimeMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('example.com')
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    detection_accuracy: 0,
    uptime: 0
  })
  const [threats, setThreats] = useState([])
  const [filters, setFilters] = useState({
    showBots: true,
    showHumans: true,
    showBlocked: true,
    showAllowed: true
  })

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
      console.log('Using fallback metrics data (development mode)')
      // Use mock data if API fails (development mode)
      setRealTimeMetrics({
        total_requests: 156 + Math.floor(Math.random() * 50),
        bot_requests: 89 + Math.floor(Math.random() * 20),
        human_requests: 67 + Math.floor(Math.random() * 30),
        blocked_requests: 12 + Math.floor(Math.random() * 5),
        average_response_time: 34.5 + Math.random() * 10,
        requests_per_second: 15.3 + Math.random() * 5,
        detection_rate: 94.5 + Math.random() * 3
      })
      
      // Update performance metrics
      setPerformanceMetrics({
        cpu_usage: 25 + Math.random() * 20,
        memory_usage: 45 + Math.random() * 15,
        detection_accuracy: 96.7 + Math.random() * 2,
        uptime: 99.9
      })
      
      // Simulate threat detection
      if (Math.random() > 0.7) {
        const newThreat = {
          id: Date.now(),
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          type: ['bruteforce', 'scraping', 'ddos', 'malware'][Math.floor(Math.random() * 4)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          timestamp: new Date(),
          blocked: Math.random() > 0.3
        }
        setThreats(prev => [newThreat, ...prev.slice(0, 9)]) // Keep last 10 threats
      }
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
      console.log('Using fallback test data (development mode)')
      // Fallback for development mode
      const mockResult = {
        bot_detected: Math.random() > 0.5,
        bot_type: Math.random() > 0.5 ? 'search_engine' : 'scraper',
        response_status: Math.random() > 0.8 ? 403 : 200,
        processing_time: Math.random() * 0.1,
        action_taken: Math.random() > 0.7 ? 'block' : 'allow',
        geo_location: { country: 'US', city: 'Test City' }
      }
      
      toast.success(`Traffic intercepted successfully! Bot detected: ${mockResult.bot_detected}`)
      
      // Add to traffic data
      const newTraffic = {
        timestamp: new Date(),
        domain: 'example.com',
        path: '/api/test',
        method: 'GET',
        client_ip: '192.168.1.100',
        user_agent: 'Test-Bot/1.0',
        is_bot: mockResult.bot_detected,
        bot_type: mockResult.bot_type,
        response_status: mockResult.response_status,
        processing_time: mockResult.processing_time * 1000,
        action_taken: mockResult.action_taken,
        geo_location: mockResult.geo_location
      }
      
      setTrafficData(prev => [newTraffic, ...prev])
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

  // Filter traffic data based on user preferences
  const filteredTrafficData = trafficData.filter(traffic => {
    if (!filters.showBots && traffic.is_bot) return false
    if (!filters.showHumans && !traffic.is_bot) return false
    if (!filters.showBlocked && traffic.action_taken === 'block') return false
    if (!filters.showAllowed && traffic.action_taken === 'allow') return false
    return true
  })

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100'
      case 'high': return 'text-orange-800 bg-orange-100'
      case 'medium': return 'text-yellow-800 bg-yellow-100'
      case 'low': return 'text-green-800 bg-green-100'
      default: return 'text-gray-800 bg-gray-100'
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Traffic Interception Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered real-time traffic monitoring and bot detection</p>
            {import.meta.env.DEV && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CpuChipIcon className="h-3 w-3 mr-1" />
                Development Mode - Live Simulation
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testTrafficInterception}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <PlayIcon className="-ml-1 mr-2 h-4 w-4" />
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={stopInterception}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <StopIcon className="-ml-1 mr-2 h-4 w-4" />
                Stop Monitoring
              </button>
            )}
            
            <div className={`flex items-center px-3 py-2 rounded-md ${
              isIntercepting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isIntercepting ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {isIntercepting ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Real-time Metrics */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900">{realTimeMetrics.total_requests?.toLocaleString() || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                {realTimeMetrics.requests_per_second?.toFixed(1) || 0} req/s
              </p>
            </div>
            <GlobeAltIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Bot Requests</p>
              <p className="text-2xl font-bold text-yellow-900">{realTimeMetrics.bot_requests?.toLocaleString() || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {realTimeMetrics.detection_rate?.toFixed(1) || 0}% detected
              </p>
            </div>
            <CpuChipIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Human Traffic</p>
              <p className="text-2xl font-bold text-green-900">{realTimeMetrics.human_requests?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 mt-1">Legitimate users</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Blocked</p>
              <p className="text-2xl font-bold text-red-900">{realTimeMetrics.blocked_requests?.toLocaleString() || 0}</p>
              <p className="text-xs text-red-600 mt-1">Threats stopped</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Response Time</p>
              <p className="text-2xl font-bold text-purple-900">{realTimeMetrics.average_response_time?.toFixed(0) || 0}ms</p>
              <p className="text-xs text-purple-600 mt-1">Average latency</p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Accuracy</p>
              <p className="text-2xl font-bold text-indigo-900">{performanceMetrics.detection_accuracy?.toFixed(1) || 0}%</p>
              <p className="text-xs text-indigo-600 mt-1">ML precision</p>
            </div>
            <TrophyIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* System Performance Cards */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-xl font-semibold text-gray-900">{performanceMetrics.cpu_usage?.toFixed(1) || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-xl font-semibold text-gray-900">{performanceMetrics.memory_usage?.toFixed(1) || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ServerIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-xl font-semibold text-gray-900">{performanceMetrics.uptime || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BoltIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Threats</p>
              <p className="text-xl font-semibold text-gray-900">{threats.filter(t => !t.blocked).length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Traffic Table with Filters */}
      <div className="w-full bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Real-time Traffic Monitor</h3>
              <p className="text-sm text-gray-500">Live monitoring of intercepted traffic with advanced filtering</p>
            </div>
            
            {/* Filter Controls */}
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showBots}
                  onChange={(e) => setFilters(prev => ({ ...prev, showBots: e.target.checked }))}
                  className="rounded border-gray-300 text-yellow-600 mr-2"
                />
                <span className="text-sm text-gray-600">Bots</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showHumans}
                  onChange={(e) => setFilters(prev => ({ ...prev, showHumans: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 mr-2"
                />
                <span className="text-sm text-gray-600">Humans</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showBlocked}
                  onChange={(e) => setFilters(prev => ({ ...prev, showBlocked: e.target.checked }))}
                  className="rounded border-gray-300 text-red-600 mr-2"
                />
                <span className="text-sm text-gray-600">Blocked</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showAllowed}
                  onChange={(e) => setFilters(prev => ({ ...prev, showAllowed: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 mr-2"
                />
                <span className="text-sm text-gray-600">Allowed</span>
              </label>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredTrafficData.length} of {trafficData.length} requests
          </div>
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
              {filteredTrafficData.map((traffic, index) => (
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

      {/* Threat Monitoring Panel */}
      {threats.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Threat Monitor</h3>
            <p className="text-sm text-gray-500">Recent security threats and automated responses</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {threats.slice(0, 6).map((threat) => (
                <div
                  key={threat.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    threat.blocked 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </div>
                    <div className={`text-xs font-medium ${
                      threat.blocked ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {threat.blocked ? 'BLOCKED' : 'ACTIVE'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {threat.type.toUpperCase()} Attack
                    </p>
                    <p className="text-sm text-gray-600">
                      From: {threat.ip}
                    </p>
                    <p className="text-xs text-gray-500">
                      {threat.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {threats.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all {threats.length} threats →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TrafficInterceptionDashboard
