import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, Globe, Shield, Bot, AlertTriangle, 
  Clock, Filter, Download, RefreshCw, Map,
  ChevronDown, ChevronUp, X, Play, Pause,
  BarChart2, PieChart, TrendingUp, Zap, Copy
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPane, Pie, 
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import enhancedWebSocketService from '../../services/enhancedWebSocketService'
import toast from 'react-hot-toast'

const TrafficMonitoringDashboard = ({ domainId, height = 'h-[600px]' }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [botData, setBotData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [geoData, setGeoData] = useState({})
  const [stats, setStats] = useState({
    totalRequests: 0,
    requestsPerMinute: 0,
    botPercentage: 0,
    avgResponseTime: 0,
    errorRate: 0
  })
  const [filters, setFilters] = useState({
    timeRange: '1h',
    trafficType: 'all',
    statusCodes: 'all',
    botTraffic: 'include'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const trafficDataRef = useRef([])
  const statsIntervalRef = useRef(null)

  // Connect to WebSocket on component mount
  useEffect(() => {
    if (!domainId) return
    
    const connectToTrafficStream = async () => {
      try {
        // Ensure WebSocket is connected
        if (!enhancedWebSocketService.isConnected) {
          await enhancedWebSocketService.connect(localStorage.getItem('token'))
        }
        
        // Subscribe to domain traffic
        enhancedWebSocketService.subscribeToDomain(domainId, handleTrafficUpdate)
        setIsConnected(true)
        
        // Set up connection status handler
        const removeListener = enhancedWebSocketService.onConnectionStatusChange((status) => {
          setIsConnected(status === 'connected')
          if (status === 'connected') {
            toast.success('Traffic monitoring connected')
          } else if (status === 'disconnected') {
            toast.error('Traffic monitoring disconnected')
          }
        })
        
        return () => {
          removeListener()
        }
      } catch (error) {
        console.error('Failed to connect to traffic stream:', error)
        setIsConnected(false)
        toast.error('Failed to connect to traffic monitoring')
      }
    }
    
    connectToTrafficStream()
    
    // Start stats calculation interval
    statsIntervalRef.current = setInterval(calculateStats, 5000)
    
    return () => {
      // Clean up on unmount
      if (enhancedWebSocketService.isConnected) {
        enhancedWebSocketService.unsubscribeFromDomain(domainId)
      }
      clearInterval(statsIntervalRef.current)
    }
  }, [domainId])

  // Handle traffic update from WebSocket
  const handleTrafficUpdate = (data) => {
    if (isPaused) return
    
    // Add timestamp if not present
    const timestamp = data.timestamp || new Date().toISOString()
    const trafficItem = { ...data, timestamp }
    
    // Update traffic data
    trafficDataRef.current = [...trafficDataRef.current, trafficItem].slice(-100)
    setTrafficData([...trafficDataRef.current])
    
    // Update bot data
    if (data.is_bot) {
      setBotData(prev => {
        const botType = data.bot_type || 'unknown'
        const existingIndex = prev.findIndex(item => item.name === botType)
        
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            value: updated[existingIndex].value + 1
          }
          return updated
        } else {
          return [...prev, { name: botType, value: 1 }]
        }
      })
    }
    
    // Update status code data
    setStatusData(prev => {
      const statusCode = data.status_code ? Math.floor(data.status_code / 100) * 100 : 0
      const statusName = getStatusName(statusCode)
      const existingIndex = prev.findIndex(item => item.name === statusName)
      
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          value: updated[existingIndex].value + 1
        }
        return updated
      } else {
        return [...prev, { name: statusName, value: 1, statusCode }]
      }
    })
    
    // Update geo data
    if (data.country) {
      setGeoData(prev => {
        const country = data.country
        return {
          ...prev,
          [country]: (prev[country] || 0) + 1
        }
      })
    }
  }

  // Calculate statistics from traffic data
  const calculateStats = () => {
    const data = trafficDataRef.current
    if (data.length === 0) return
    
    // Calculate total requests
    const totalRequests = data.length
    
    // Calculate requests per minute
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const requestsLastMinute = data.filter(item => {
      const timestamp = new Date(item.timestamp)
      return timestamp >= oneMinuteAgo
    }).length
    
    // Calculate bot percentage
    const botRequests = data.filter(item => item.is_bot).length
    const botPercentage = totalRequests > 0 ? (botRequests / totalRequests) * 100 : 0
    
    // Calculate average response time
    const totalResponseTime = data.reduce((sum, item) => sum + (item.response_time || 0), 0)
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0
    
    // Calculate error rate
    const errorRequests = data.filter(item => {
      const statusCode = item.status_code || 0
      return statusCode >= 400
    }).length
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
    
    setStats({
      totalRequests,
      requestsPerMinute,
      botPercentage,
      avgResponseTime,
      errorRate
    })
  }

  // Get status name from status code
  const getStatusName = (statusCode) => {
    switch (statusCode) {
      case 200: return 'Success'
      case 300: return 'Redirect'
      case 400: return 'Client Error'
      case 500: return 'Server Error'
      default: return 'Unknown'
    }
  }

  // Get status color from status code
  const getStatusColor = (statusCode) => {
    switch (statusCode) {
      case 200: return '#10b981' // green
      case 300: return '#3b82f6' // blue
      case 400: return '#f59e0b' // yellow
      case 500: return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  // Get bot color from bot type
  const getBotColor = (botType) => {
    switch (botType) {
      case 'search_engine': return '#3b82f6' // blue
      case 'social_media': return '#8b5cf6' // purple
      case 'scraper': return '#f59e0b' // yellow
      case 'malicious': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // Filter traffic data based on current filters
  const filteredTrafficData = trafficData.filter(item => {
    // Filter by time range
    if (filters.timeRange !== 'all') {
      const timestamp = new Date(item.timestamp)
      const now = new Date()
      let cutoff
      
      switch (filters.timeRange) {
        case '5m':
          cutoff = new Date(now.getTime() - 5 * 60000)
          break
        case '15m':
          cutoff = new Date(now.getTime() - 15 * 60000)
          break
        case '1h':
          cutoff = new Date(now.getTime() - 60 * 60000)
          break
        case '24h':
          cutoff = new Date(now.getTime() - 24 * 60 * 60000)
          break
        default:
          cutoff = new Date(0)
      }
      
      if (timestamp < cutoff) return false
    }
    
    // Filter by traffic type
    if (filters.trafficType === 'bot' && !item.is_bot) return false
    if (filters.trafficType === 'human' && item.is_bot) return false
    
    // Filter by status codes
    if (filters.statusCodes !== 'all') {
      const statusCode = item.status_code || 0
      const statusGroup = Math.floor(statusCode / 100) * 100
      if (parseInt(filters.statusCodes) !== statusGroup) return false
    }
    
    return true
  })

  // Render the overview tab
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Stats Cards */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Traffic Overview</h3>
          <Activity className="h-5 w-5 text-gray-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Req/Minute</p>
            <p className="text-2xl font-bold">{stats.requestsPerMinute.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Bot Traffic</p>
            <p className="text-2xl font-bold">{stats.botPercentage.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      {/* Traffic Timeline */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 md:col-span-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Traffic Timeline</h3>
          <TrendingUp className="h-5 w-5 text-gray-500" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredTrafficData.map((item, index) => ({
                time: formatTime(item.timestamp),
                value: 1,
                is_bot: item.is_bot,
                status: Math.floor((item.status_code || 0) / 100) * 100
              }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Bot Distribution */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Bot Distribution</h3>
          <Bot className="h-5 w-5 text-gray-500" />
        </div>
        <div className="h-64 flex items-center justify-center">
          {botData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={botData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {botData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBotColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No bot data available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Code Distribution */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Status Codes</h3>
          <BarChart2 className="h-5 w-5 text-gray-500" />
        </div>
        <div className="h-64">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.statusCode)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No status data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Geographic Distribution */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
          <Map className="h-5 w-5 text-gray-500" />
        </div>
        <div className="h-64 overflow-auto">
          {Object.keys(geoData).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(geoData)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <div key={country} className="flex items-center">
                    <div className="w-32 truncate">{country}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black"
                          style={{ width: `${(count / Math.max(...Object.values(geoData))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right">{count}</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No geographic data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Render the traffic log tab
  const renderTrafficLogTab = () => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bot
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrafficData.length > 0 ? (
              filteredTrafficData.slice().reverse().map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(item.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.ip || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {item.path || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.method || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (item.status_code || 0) >= 400 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status_code || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.is_bot ? (
                      <span className="flex items-center">
                        <Bot className="h-4 w-4 mr-1 text-yellow-500" />
                        {item.bot_type || 'Yes'}
                      </span>
                    ) : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.country || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No traffic data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${height} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-900 mr-3">Traffic Monitoring</h2>
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-600 hover:text-black rounded-md hover:bg-gray-100"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          
          <button
            className="p-2 text-gray-600 hover:text-black rounded-md hover:bg-gray-100"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <Filter className="h-5 w-5" />
          </button>
          
          <button
            className="p-2 text-gray-600 hover:text-black rounded-md hover:bg-gray-100"
            onClick={() => {
              setTrafficData([])
              setBotData([])
              setStatusData([])
              setGeoData({})
              trafficDataRef.current = []
              toast.success('Traffic data cleared')
            }}
            title="Clear Data"
          >
            <X className="h-5 w-5" />
          </button>
          
          <button
            className="p-2 text-gray-600 hover:text-black rounded-md hover:bg-gray-100"
            onClick={() => {
              if (!enhancedWebSocketService.isConnected) {
                enhancedWebSocketService.connect(localStorage.getItem('token'))
                  .then(() => {
                    enhancedWebSocketService.subscribeToDomain(domainId, handleTrafficUpdate)
                    setIsConnected(true)
                    toast.success('Reconnected to traffic stream')
                  })
                  .catch(error => {
                    console.error('Failed to reconnect:', error)
                    toast.error('Failed to reconnect')
                  })
              } else {
                toast.success('Already connected')
              }
            }}
            title="Reconnect"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4 overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Type</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={filters.trafficType}
                onChange={(e) => handleFilterChange('trafficType', e.target.value)}
              >
                <option value="all">All Traffic</option>
                <option value="bot">Bot Traffic Only</option>
                <option value="human">Human Traffic Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Codes</label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={filters.statusCodes}
                onChange={(e) => handleFilterChange('statusCodes', e.target.value)}
              >
                <option value="all">All Status Codes</option>
                <option value="200">2xx (Success)</option>
                <option value="300">3xx (Redirect)</option>
                <option value="400">4xx (Client Error)</option>
                <option value="500">5xx (Server Error)</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'overview'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'traffic'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('traffic')}
        >
          Traffic Log
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' ? renderOverviewTab() : renderTrafficLogTab()}
      </div>
      
      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {filteredTrafficData.length} requests
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

export default TrafficMonitoringDashboard
