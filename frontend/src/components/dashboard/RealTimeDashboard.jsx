import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Globe, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Server,
  Database,
  Wifi,
  Zap,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const RealTimeDashboard = () => {
  const [isLive, setIsLive] = useState(true)
  const [metrics, setMetrics] = useState({
    requestsPerSecond: 0,
    activeConnections: 0,
    blockedRequests: 0,
    botTraffic: 0,
    humanTraffic: 0,
    systemLoad: 0,
    memoryUsage: 0,
    diskUsage: 0
  })
  const [recentEvents, setRecentEvents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        updateMetrics()
        updateRecentEvents()
        checkAlerts()
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isLive])

  const updateMetrics = () => {
    setMetrics({
      requestsPerSecond: Math.floor(Math.random() * 1000) + 100,
      activeConnections: Math.floor(Math.random() * 500) + 50,
      blockedRequests: Math.floor(Math.random() * 50) + 5,
      botTraffic: Math.floor(Math.random() * 30) + 10,
      humanTraffic: Math.floor(Math.random() * 70) + 20,
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100
    })
  }

  const updateRecentEvents = () => {
    const eventTypes = ['request', 'block', 'alert', 'login', 'error']
    const newEvent = {
      id: Date.now(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      message: `New ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} event`,
      timestamp: new Date().toISOString(),
      severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
    }

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)])
  }

  const checkAlerts = () => {
    if (Math.random() > 0.95) {
      const alertTypes = ['High CPU Usage', 'Memory Warning', 'Disk Space Low', 'Security Threat', 'Network Issue']
      const newAlert = {
        id: Date.now(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        message: `System alert: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]}`,
        timestamp: new Date().toISOString(),
        severity: Math.random() > 0.7 ? 'critical' : 'warning'
      }

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
    }
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const mockTimeSeriesData = [
    { time: '00:00', requests: 150, blocked: 12, bots: 25 },
    { time: '00:05', requests: 180, blocked: 15, bots: 30 },
    { time: '00:10', requests: 220, blocked: 18, bots: 35 },
    { time: '00:15', requests: 190, blocked: 14, bots: 28 },
    { time: '00:20', requests: 250, blocked: 22, bots: 40 },
    { time: '00:25', requests: 280, blocked: 25, bots: 45 },
    { time: '00:30', requests: 320, blocked: 30, bots: 50 },
    { time: '00:35', requests: 290, blocked: 26, bots: 42 },
    { time: '00:40', requests: 260, blocked: 23, bots: 38 },
    { time: '00:45', requests: 240, blocked: 20, bots: 35 },
    { time: '00:50', requests: 200, blocked: 16, bots: 30 },
    { time: '00:55', requests: 180, blocked: 14, bots: 25 }
  ]

  const trafficDistribution = [
    { name: 'Human Traffic', value: metrics.humanTraffic, color: '#10B981' },
    { name: 'Bot Traffic', value: metrics.botTraffic, color: '#F59E0B' },
    { name: 'Blocked', value: metrics.blockedRequests, color: '#EF4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Dashboard</h1>
          <p className="text-gray-600">Live monitoring of traffic and system metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              isLive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Requests/sec</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.requestsPerSecond}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Connections</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.activeConnections}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Blocked Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.blockedRequests}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Server className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">System Load</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.systemLoad.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="bots" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trafficDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trafficDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Resources */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Resources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>CPU Usage</span>
                <span>{metrics.systemLoad.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.systemLoad > 80 ? 'bg-red-500' : metrics.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${metrics.systemLoad}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Memory Usage</span>
                <span>{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.memoryUsage > 80 ? 'bg-red-500' : metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Disk Usage</span>
                <span>{metrics.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.diskUsage > 80 ? 'bg-red-500' : metrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${metrics.diskUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  event.severity === 'high' ? 'bg-red-500' : 
                  event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-md ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start">
                    {getSeverityIcon(alert.severity)}
                    <div className="ml-2">
                      <p className="text-sm font-medium">{alert.type}</p>
                      <p className="text-xs mt-1">{alert.message}</p>
                      <p className="text-xs mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeDashboard
