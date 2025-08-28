import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
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
  RefreshCw
} from 'lucide-react'

const LiveTrafficStream = ({ domains = [] }) => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [stats, setStats] = useState({})
  const [errors, setErrors] = useState([])
  const [selectedDomains, setSelectedDomains] = useState([])
  
  const socketRef = useRef(null)
  const trafficBufferRef = useRef([])
  
  useEffect(() => {
    if (domains.length > 0 && user) {
      setSelectedDomains(domains.map(d => d.domain_name))
    }
  }, [domains, user])
  
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
  
  const connectToStream = () => {
    try {
      // Initialize socket connection
      socketRef.current = io('http://localhost:8960', {
        transports: ['websocket', 'polling']
      })
      
      socketRef.current.on('connect', () => {
        setIsConnected(true)
        console.log('Connected to traffic stream')
        
        // Subscribe to domains
        socketRef.current.emit('subscribe_domains', {
          auth_token: user?.access_token,
          domains: selectedDomains
        })
      })
      
      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from traffic stream')
      })
      
      socketRef.current.on('subscribed', (data) => {
        console.log('Subscribed to domains:', data.domains)
      })
      
      socketRef.current.on('traffic_update', (data) => {
        handleTrafficUpdate(data)
      })
      
      socketRef.current.on('traffic_history', (data) => {
        handleTrafficHistory(data)
      })
      
      socketRef.current.on('current_stats', (data) => {
        setStats(data.data)
      })
      
      socketRef.current.on('error', (error) => {
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
    const newTraffic = {
      ...data.data,
      timestamp: new Date(data.timestamp),
      id: Date.now() + Math.random()
    }
    
    // Add to buffer
    trafficBufferRef.current = [...trafficBufferRef.current, newTraffic].slice(-100)
    
    // Update state
    setTrafficData(prev => [...prev.slice(-99), newTraffic])
    
    // Update stats
    updateStats(newTraffic)
  }
  
  const handleTrafficHistory = (data) => {
    const history = data.data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
      id: Date.now() + Math.random()
    }))
    
    setTrafficData(history)
    trafficBufferRef.current = history
  }
  
  const updateStats = (traffic) => {
    setStats(prev => {
      const domain = traffic.domain
      if (!prev[domain]) {
        prev[domain] = { total: 0, success: 0, errors: 0, bots: 0 }
      }
      
      prev[domain].total += 1
      
      if (traffic.status_code < 400) {
        prev[domain].success += 1
      } else {
        prev[domain].errors += 1
      }
      
      if (traffic.user_agent && isBot(traffic.user_agent)) {
        prev[domain].bots += 1
      }
      
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
    setIsStreaming(!isStreaming)
  }
  
  const clearTraffic = () => {
    setTrafficData([])
    trafficBufferRef.current = []
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
        </div>
      </div>
      
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
              <Badge key={domain} variant="outline">
                {domain}
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
            <div className="text-center py-8 text-gray-500">
              {isStreaming ? 'Waiting for traffic...' : 'Start streaming to see live traffic'}
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
