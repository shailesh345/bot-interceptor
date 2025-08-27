import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, Shield, AlertTriangle, CheckCircle, Clock,
  BarChart3, Globe, Eye, Zap, Target, RefreshCw,
  TrendingUp, TrendingDown, Users, Bot, Server
} from 'lucide-react'

const RealTimeMonitoring = ({ domain }) => {
  const [realTimeData, setRealTimeData] = useState({
    currentRequests: 0,
    requestsPerMinute: 0,
    activeUsers: 0,
    botRequests: 0,
    blockedRequests: 0,
    responseTime: 0,
    uptime: 99.9
  })
  
  const [trafficHistory, setTrafficHistory] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentRequests: Math.floor(Math.random() * 100) + 50,
        requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 50) + 20,
        botRequests: Math.floor(Math.random() * 20) + 5,
        blockedRequests: Math.floor(Math.random() * 15) + 3,
        responseTime: (Math.random() * 200 + 50).toFixed(2),
        uptime: 99.9 - (Math.random() * 0.1)
      }))
      
      setLastUpdate(new Date())
      
      // Add new traffic data point
      const newDataPoint = {
        time: new Date(),
        requests: Math.floor(Math.random() * 100) + 50,
        bots: Math.floor(Math.random() * 20) + 5
      }
      
      setTrafficHistory(prev => {
        const updated = [...prev, newDataPoint]
        return updated.slice(-30) // Keep last 30 data points
      })
      
      // Add recent events
      const events = [
        'Bot request blocked from IP 192.168.1.100',
        'Rate limit exceeded for IP 10.0.0.50',
        'New user session started',
        'API request processed successfully',
        'Suspicious activity detected'
      ]
      
      const randomEvent = events[Math.floor(Math.random() * events.length)]
      const newEvent = {
        id: Date.now(),
        message: randomEvent,
        timestamp: new Date(),
        type: randomEvent.includes('blocked') || randomEvent.includes('exceeded') ? 'warning' : 'info'
      }
      
      setRecentEvents(prev => {
        const updated = [newEvent, ...prev]
        return updated.slice(0, 10) // Keep last 10 events
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value, threshold) => {
    if (value > threshold * 0.8) return 'text-red-600'
    if (value > threshold * 0.6) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Real-Time Monitoring
              </h1>
              <p className="text-gray-600">
                Live traffic monitoring for {domain?.name || 'your domain'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Real-Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Requests</p>
                <p className={`text-2xl font-bold ${getStatusColor(realTimeData.currentRequests, 100)}`}>
                  {realTimeData.currentRequests}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last minute</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeData.activeUsers}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last minute</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bot Requests</p>
                <p className={`text-2xl font-bold ${getStatusColor(realTimeData.botRequests, 20)}`}>
                  {realTimeData.botRequests}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">-15%</span>
              <span className="text-gray-500 ml-1">from last minute</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                <p className={`text-2xl font-bold ${getStatusColor(realTimeData.blockedRequests, 15)}`}>
                  {realTimeData.blockedRequests}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">-22%</span>
              <span className="text-gray-500 ml-1">from last minute</span>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">{realTimeData.responseTime}ms</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((realTimeData.responseTime / 300) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">{realTimeData.uptime.toFixed(2)}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${realTimeData.uptime}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests/Min</span>
                  <span className="font-medium">{realTimeData.requestsPerMinute}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((realTimeData.requestsPerMinute / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
            <div className="h-48 flex items-end justify-between space-x-1">
              {trafficHistory.slice(-20).map((point, index) => (
                <div
                  key={index}
                  className="flex-1 bg-blue-100 rounded-t"
                  style={{ 
                    height: `${(point.requests / 100) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Last 20 data points
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Traffic Analysis</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">1H</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">24H</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">7D</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">30D</button>
            </div>
          </div>
          
          <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Interactive traffic chart will be displayed here</p>
              <p className="text-sm">Real-time data visualization</p>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Web Server</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Database</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Bot Detection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Rate Limiting</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RealTimeMonitoring
