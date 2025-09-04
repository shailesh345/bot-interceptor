import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Activity, 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Download,
  Eye,
  BarChart3,
  Zap,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react'

const LiveTrafficStream = ({ domains = [] }) => {
  const { user } = useAuth()
  const token = useSelector((state) => state.auth?.token)
  const authState = useSelector((state) => state.auth)
  const [isConnected, setIsConnected] = useState(false)
  
  // Debug authentication state
  console.log('🔍 LiveTrafficStream - Auth State:', authState)
  console.log('🔍 LiveTrafficStream - Token:', token)
  console.log('🔍 LiveTrafficStream - User:', user)
  const [isStreaming, setIsStreaming] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [stats, setStats] = useState({})
  const [errors, setErrors] = useState([])
  const [filters, setFilters] = useState({ method: 'all', status: 'all', bot: 'all', country: 'all' })
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxEntries, setMaxEntries] = useState(100)
  const [performanceMetrics, setPerformanceMetrics] = useState({ 
    avgResponseTime: 0, 
    totalRequests: 0, 
    errorRate: 0,
    requestsPerMinute: 0,
    uniqueVisitors: new Set()
  })
  const [viewMode, setViewMode] = useState('table')
  
  // Use the domains prop as selectedDomains
  const selectedDomains = domains
  
  // Debug: Log what we're receiving
  console.log('🔍 LiveTrafficStream - Received domains prop:', domains)
  console.log('🔍 LiveTrafficStream - Domains type:', typeof domains)
  console.log('🔍 LiveTrafficStream - Domains is array:', Array.isArray(domains))
  console.log('🔍 LiveTrafficStream - Domains length:', domains.length)
  if (domains.length > 0) {
    console.log('🔍 LiveTrafficStream - First domain:', domains[0])
    console.log('🔍 LiveTrafficStream - First domain type:', typeof domains[0])
  }
  
  const socketRef = useRef(null)
  const trafficBufferRef = useRef([])
  
  // Domains are now passed directly as props, no need for useEffect
  
  useEffect(() => {
    if (isStreaming && selectedDomains.length > 0) {
      connectToStream()
    } else {
      disconnectFromStream()
    }
    
    return () => {
      disconnectFromStream()
    }
  }, [isStreaming, selectedDomains])

  // Enhanced performance metrics calculation - moved up to avoid initialization error
  const calculatePerformanceMetrics = useCallback(() => {
    if (trafficData.length === 0) return

    const totalRequests = trafficData.length
    const errorRequests = trafficData.filter(t => t.status_code >= 400).length
    const errorRate = (errorRequests / totalRequests) * 100
    
    const responseTimes = trafficData.filter(t => t.response_time).map(t => t.response_time)
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0

    const uniqueIps = new Set(trafficData.map(t => t.ip))
    
    // Calculate requests per minute (last 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60000)
    const recentRequests = trafficData.filter(t => new Date(t.timestamp) > oneMinuteAgo)
    const requestsPerMinute = recentRequests.length

    setPerformanceMetrics({
      avgResponseTime: Math.round(avgResponseTime * 1000) / 1000,
      totalRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      requestsPerMinute,
      uniqueVisitors: uniqueIps
    })
  }, [trafficData])

  // Calculate performance metrics when traffic data changes
  useEffect(() => {
    calculatePerformanceMetrics()
  }, [calculatePerformanceMetrics])

  // Auto-scroll to bottom when new traffic arrives
  useEffect(() => {
    if (autoScroll && trafficData.length > 0) {
      const trafficContainer = document.getElementById('traffic-container')
      if (trafficContainer) {
        trafficContainer.scrollTop = trafficContainer.scrollHeight
      }
    }
  }, [trafficData, autoScroll])
  
  const connectToStream = () => {
    try {
      // Check if we have domains to monitor
      if (selectedDomains.length === 0) {
        setErrors(prev => [...prev, { 
          message: 'No domains selected for monitoring. Please select domains first.', 
          timestamp: new Date() 
        }])
        return
      }

      // Disconnect existing connection first to prevent duplicates
      if (socketRef.current) {
        console.log('🔍 LiveTrafficStream - Disconnecting existing connection to prevent duplicates')
        socketRef.current.disconnect()
        socketRef.current = null
      }

      // Initialize socket connection with version compatibility
      socketRef.current = io('http://localhost:8960', {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: false,
        timeout: 20000,
        forceNew: true
      })
      
      socketRef.current.on('connect', () => {
        setIsConnected(true)
        console.log('🔍 LiveTrafficStream - Connected to traffic stream')
        console.log('🔍 LiveTrafficStream - Socket ID:', socketRef.current.id)
        
        // Add general event listener to see all events
        socketRef.current.onAny((eventName, ...args) => {
          console.log('🔍 LiveTrafficStream - WebSocket event received:', eventName, args)
        })
        
        // Subscribe to domains
        console.log('🔍 LiveTrafficStream - Selected domains:', selectedDomains)
        console.log('🔍 LiveTrafficStream - Selected domains length:', selectedDomains.length)
        
        if (selectedDomains.length === 0) {
          console.log('🔍 LiveTrafficStream - No domains selected!')
          setErrors(prev => [...prev, { 
            message: 'No domains selected for monitoring. Please select domains first.', 
            timestamp: new Date() 
          }])
          return
        }
        
        const domainIds = selectedDomains.map((domain, index) => {
          console.log(`🔍 LiveTrafficStream - Domain ${index}:`, domain)
          console.log(`🔍 LiveTrafficStream - Domain ${index} keys:`, Object.keys(domain))
          console.log(`🔍 LiveTrafficStream - Domain ${index} id:`, domain.id)
          
          // The domain should have an 'id' field based on the structure we saw
          const domainId = domain.id
          console.log(`🔍 LiveTrafficStream - Extracted ID for domain ${index}:`, domainId)
          
          return domainId
        }).filter(id => id !== null && id !== undefined && id !== '')
        
        console.log('🔍 LiveTrafficStream - Final extracted domain IDs:', domainIds)
        
        if (domainIds.length === 0) {
          setErrors(prev => [...prev, { 
            message: 'No valid domain IDs found. Please check domain selection.', 
            timestamp: new Date() 
          }])
          return
        }
        
        const subscriptionData = {
          auth_token: user?.access_token,
          domain_ids: domainIds
        }
        
        console.log('🔍 LiveTrafficStream - Emitting subscribe_domains with data:', subscriptionData)
        console.log('🔍 LiveTrafficStream - Auth token available:', !!user?.access_token)
        console.log('🔍 LiveTrafficStream - Domain IDs being sent:', domainIds)
        
        socketRef.current.emit('subscribe_domains', subscriptionData)
      })
      
      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from traffic stream')
      })
      
      socketRef.current.on('connect_error', (error) => {
        console.log('🔍 LiveTrafficStream - Connection error:', error)
        console.log('🔍 LiveTrafficStream - Error details:', error.message, error.description)
        setIsConnected(false)
        setErrors(prev => [...prev, { 
          message: `WebSocket connection failed: ${error.message}`, 
          timestamp: new Date() 
        }])
      })
      
      socketRef.current.on('subscribed', (data) => {
        console.log('🔍 LiveTrafficStream - WebSocket subscribed response:', data)
        console.log('🔍 LiveTrafficStream - Subscribed to domains:', data.domain_ids)
      })
      
      socketRef.current.on('traffic_update', (data) => {
        console.log('🔍 LiveTrafficStream - Received traffic_update:', data)
        console.log('🔍 LiveTrafficStream - Traffic data:', data.traffic)
        console.log('🔍 LiveTrafficStream - Domain ID:', data.domain_id)
        handleTrafficUpdate(data)
      })
      
      socketRef.current.on('traffic_history', (data) => {
        console.log('🔍 LiveTrafficStream - Received traffic_history:', data)
        handleTrafficHistory(data)
      })
      
      socketRef.current.on('current_stats', (data) => {
        console.log('🔍 LiveTrafficStream - Received current_stats:', data)
        setStats(data.data)
      })
      
      socketRef.current.on('error', (error) => {
        console.log('🔍 LiveTrafficStream - WebSocket error:', error)
        setErrors(prev => [...prev, { message: error.message, timestamp: new Date() }])
      })
      
    } catch (error) {
      console.error('Error connecting to stream:', error)
      setErrors(prev => [...prev, { message: 'Failed to connect to traffic stream', timestamp: new Date() }])
    }
  }
  
  const disconnectFromStream = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }
  
  const handleTrafficUpdate = (data) => {
    console.log('🔍 LiveTrafficStream - Received traffic update:', data)
    
    try {
      // Backend sends: { domain_id: '7', traffic: {...} }
      // We need to extract the traffic data
      const trafficData = data.traffic || data.data || data
      
      if (!trafficData || typeof trafficData !== 'object') {
        console.warn('🔍 LiveTrafficStream - Invalid traffic data:', data)
        return
      }
      
      // Create unique ID to prevent duplicate processing
      const uniqueId = `${trafficData.timestamp || Date.now()}_${trafficData.ip || 'unknown'}_${trafficData.path || 'unknown'}_${Math.random()}`
      
      const newTraffic = {
        ...trafficData,
        timestamp: new Date(trafficData.timestamp || data.timestamp || new Date()),
        id: uniqueId,
        // Ensure domain_name is available for stats with robust fallback
        domain_name: trafficData.domain_name || selectedDomains[0]?.domain_name || 'unknown'
      }
      
      console.log('🔍 LiveTrafficStream - Processed traffic for domain:', newTraffic.domain_name)
    
      // Check if this traffic item already exists to prevent duplicates
      const existsInBuffer = trafficBufferRef.current.some(item => 
        item.timestamp.getTime() === newTraffic.timestamp.getTime() && 
        item.ip === newTraffic.ip && 
        item.path === newTraffic.path
      )
      
      if (existsInBuffer) {
        console.log('🔍 LiveTrafficStream - Duplicate traffic detected, skipping:', newTraffic)
        return
      }
      
      // Add to buffer
      trafficBufferRef.current = [...trafficBufferRef.current, newTraffic].slice(-100)
      
      console.log('🔍 LiveTrafficStream - Traffic buffer length:', trafficBufferRef.current.length)
      
      // Update state
      setTrafficData(prev => [...prev.slice(-99), newTraffic])
      
      // Update stats
      updateStats(newTraffic)
    } catch (error) {
      console.error('🔍 LiveTrafficStream - Error processing traffic update:', error)
      setErrors(prev => [...prev, { 
        message: `Error processing traffic data: ${error.message}`, 
        timestamp: new Date() 
      }])
    }
  }
  
  const handleTrafficHistory = (data) => {
    console.log('🔍 LiveTrafficStream - handleTrafficHistory called with:', data)
    
    // Handle different data structures that might be sent
    let historyData = []
    
    if (data && Array.isArray(data.data)) {
      historyData = data.data
    } else if (data && Array.isArray(data.traffic)) {
      historyData = data.traffic
    } else if (Array.isArray(data)) {
      historyData = data
    } else {
      console.warn('🔍 LiveTrafficStream - No valid history data found:', data)
      return
    }
    
    const history = historyData.map((item, index) => ({
      ...item,
      timestamp: new Date(item.timestamp || new Date()),
      id: `${Date.now()}_${index}_${Math.random()}`
    }))
    
    console.log('🔍 LiveTrafficStream - Processed traffic history:', history)
    console.log('🔍 LiveTrafficStream - History length:', history.length)
    
    setTrafficData(history)
    trafficBufferRef.current = history
  }
  
  const updateStats = (traffic) => {
    console.log('🔍 LiveTrafficStream - updateStats called with traffic:', traffic)
    
    setStats(prev => {
      // Use domain_name from the traffic data with robust fallback
      let domain = traffic.domain_name || traffic.domain_id || selectedDomains[0]?.domain_name || 'unknown'
      
      // Handle cases where domain_name might be undefined string or invalid
      if (domain === 'undefined' || domain === undefined || domain === null || domain === '' || typeof domain !== 'string') {
        domain = selectedDomains[0]?.domain_name || 'unknown'
      }
      
      console.log('🔍 LiveTrafficStream - Using domain key:', domain)
      
      if (!prev[domain]) {
        prev[domain] = { total: 0, success: 0, errors: 0, bots: 0 }
      }
      
      prev[domain].total += 1
      
      if (traffic.status_code < 400) {
        prev[domain].success += 1
      } else {
        prev[domain].errors += 1
      }
      
      if (traffic.is_bot || (traffic.user_agent && isBot(traffic.user_agent))) {
        prev[domain].bots += 1
      }
      
      console.log('🔍 LiveTrafficStream - Updated stats:', { ...prev })
      return { ...prev }
    })
  }
  
  const isBot = (userAgent) => {
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'spiderbot',
      'googlebot', 'bingbot', 'facebookexternalhit', 'twitterbot'
    ]
    
    return botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )
  }
  
  const toggleStreaming = () => {
    if (!isStreaming && selectedDomains.length === 0) {
      setErrors(prev => [...prev, { 
        message: 'Please select domains to monitor first. Go to the "Select Domains" tab.', 
        timestamp: new Date() 
      }])
      return
    }
    setIsStreaming(!isStreaming)
  }


  
  const clearTraffic = () => {
    setTrafficData([])
    trafficBufferRef.current = []
    setPerformanceMetrics({
      avgResponseTime: 0,
      totalRequests: 0,
      errorRate: 0,
      requestsPerMinute: 0,
      uniqueVisitors: new Set()
    })
  }

  // Enhanced filtering function
  const filteredTrafficData = useMemo(() => {
    let filtered = trafficData.filter(traffic => {
      const methodMatch = filters.method === 'all' || traffic.method === filters.method
      const statusMatch = filters.status === 'all' || 
        (filters.status === 'success' && traffic.status_code < 400) ||
        (filters.status === 'error' && traffic.status_code >= 400)
      const botMatch = filters.bot === 'all' || 
        (filters.bot === 'bot' && traffic.is_bot) ||
        (filters.bot === 'human' && !traffic.is_bot)
      const countryMatch = filters.country === 'all' || traffic.country === filters.country
      
      return methodMatch && statusMatch && botMatch && countryMatch
    })

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered.slice(0, maxEntries)
  }, [trafficData, filters, sortBy, sortOrder, maxEntries])

  // Export traffic data
  const exportTrafficData = () => {
    const csvContent = [
      ['Timestamp', 'IP', 'Method', 'Path', 'Status', 'Response Time', 'User Agent', 'Country', 'City', 'Is Bot'].join(','),
      ...filteredTrafficData.map(traffic => [
        traffic.timestamp,
        traffic.ip,
        traffic.method,
        traffic.path,
        traffic.status_code,
        traffic.response_time,
        `"${traffic.user_agent}"`,
        traffic.country,
        traffic.city,
        traffic.is_bot
      ].join(','))
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `traffic-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Traffic data exported successfully!')
  }
  
  const getStatusIcon = (statusCode) => {
    if (statusCode < 400) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (statusCode < 500) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }
  
  const getStatusColor = (statusCode) => {
    if (statusCode < 400) return 'bg-green-100 text-green-800'
    if (statusCode < 500) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Live Traffic Stream</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          
          <Button
            onClick={toggleStreaming}
            variant={isStreaming ? 'destructive' : 'default'}
            size="sm"
          >
            {isStreaming ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={clearTraffic}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          <Button
            onClick={() => window.open(`/tracking-integration?domain=${selectedDomains[0]?.domain_name}`, '_blank')}
            variant="outline"
            size="sm"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            disabled={selectedDomains.length === 0}
          >
            <Globe className="h-4 w-4 mr-2" />
            Get Tracking Code
          </Button>
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalRequests}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.uniqueVisitors.size}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success (2xx-3xx)</option>
                <option value="error">Error (4xx-5xx)</option>
              </select>
            </div>

            {/* Bot Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Type</label>
              <select
                value={filters.bot}
                onChange={(e) => setFilters(prev => ({ ...prev, bot: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Traffic</option>
                <option value="human">Human Only</option>
                <option value="bot">Bot Only</option>
              </select>
            </div>

            {/* Max Entries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Entries</label>
              <select
                value={maxEntries}
                onChange={(e) => setMaxEntries(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
                <option value={200}>200 entries</option>
                <option value={500}>500 entries</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={exportTrafficData}
                variant="outline"
                size="sm"
                disabled={filteredTrafficData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoScroll" className="text-sm text-gray-700">Auto-scroll</label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
              >
                Table
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
              >
                Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Domain Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Monitored Domains</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedDomains.map(domain => (
              <Badge key={domain.id || domain.domain_name} variant="outline">
                {domain.domain_name}
              </Badge>
            ))}
            {selectedDomains.length === 0 && (
              <p className="text-gray-500">No domains selected for monitoring</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([domain, domainStats]) => (
          <Card key={domain}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{domain}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-semibold">{domainStats.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success:</span>
                  <span className="font-semibold text-green-600">{domainStats.success || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Errors:</span>
                  <span className="font-semibold text-red-600">{domainStats.errors || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bots:</span>
                  <span className="font-semibold text-blue-600">{domainStats.bots || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors[errors.length - 1]?.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Live Traffic Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Live Traffic Feed</span>
            <Badge variant="secondary">
              {trafficData.length} requests
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trafficData.length === 0 ? (
            <div className="text-center py-8">
              {isStreaming ? (
                <div className="space-y-4">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
                  <p className="text-gray-500 font-medium">Waiting for traffic...</p>
                  <div className="max-w-md mx-auto text-sm text-gray-600 space-y-2">
                    <p>To see traffic, make sure:</p>
                    <ul className="text-left list-disc pl-6 space-y-1">
                      <li>You have selected verified domains in the "Select Domains" tab</li>
                      <li>The JavaScript tracking script is installed on your website</li>
                      <li>Or DNS is configured to route traffic through Boot Interceptor</li>
                      <li>Your website is receiving actual visitor traffic</li>
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('/docs/tracking-setup', '_blank')}
                      className="mt-4"
                    >
                      View Setup Guide
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Wifi className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-500 font-medium">Start streaming to see live traffic</p>
                  <p className="text-sm text-gray-600">Click the play button above to begin monitoring</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trafficData.slice().reverse().map((traffic) => (
                <div
                  key={traffic.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(traffic.status_code)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono">
                          {traffic.method}
                        </Badge>
                        <span className="font-medium">{traffic.path}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {traffic.ip} • {traffic.domain}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(traffic.status_code)}>
                      {traffic.status_code}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {traffic.processing_time_ms?.toFixed(0)}ms
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(traffic.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveTrafficStream
