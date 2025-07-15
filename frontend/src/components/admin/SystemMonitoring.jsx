import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
  PieChart
} from 'lucide-react'

const SystemMonitoring = () => {
  const [systemStats, setSystemStats] = useState({
    cpu: { usage: 0, cores: 8 },
    memory: { used: 0, total: 16 },
    disk: { used: 0, total: 500 },
    network: { in: 0, out: 0 },
    uptime: '99.9%',
    responseTime: 0,
    activeConnections: 0,
    errorRate: 0
  })

  const [services, setServices] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchSystemStats()
    const interval = setInterval(fetchSystemStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStats = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      setSystemStats({
        cpu: { usage: Math.floor(Math.random() * 80) + 10, cores: 8 },
        memory: { used: Math.floor(Math.random() * 12) + 4, total: 16 },
        disk: { used: Math.floor(Math.random() * 200) + 100, total: 500 },
        network: { in: Math.floor(Math.random() * 1000) + 500, out: Math.floor(Math.random() * 800) + 300 },
        uptime: '99.9%',
        responseTime: Math.floor(Math.random() * 100) + 50,
        activeConnections: Math.floor(Math.random() * 500) + 200,
        errorRate: Math.random() * 2
      })

      setServices([
        { name: 'Web Server', status: 'healthy', uptime: '99.9%', responseTime: 45 },
        { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: 12 },
        { name: 'Cache Server', status: 'healthy', uptime: '99.9%', responseTime: 8 },
        { name: 'Load Balancer', status: 'healthy', uptime: '100%', responseTime: 15 },
        { name: 'API Gateway', status: 'warning', uptime: '98.5%', responseTime: 120 },
        { name: 'Message Queue', status: 'healthy', uptime: '99.7%', responseTime: 25 }
      ])

      setAlerts([
        { id: 1, type: 'warning', message: 'High CPU usage on server-02', time: '2 minutes ago' },
        { id: 2, type: 'info', message: 'Database backup completed successfully', time: '15 minutes ago' },
        { id: 3, type: 'error', message: 'Payment gateway timeout', time: '1 hour ago' }
      ])

      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type) => {
    switch(type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getUsageColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <button
          onClick={fetchSystemStats}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cpu className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{systemStats.cpu.usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemStats.cpu.usage)}`}
              style={{ width: `${systemStats.cpu.usage}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{systemStats.cpu.cores} cores available</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Memory</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{systemStats.memory.used}GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor((systemStats.memory.used / systemStats.memory.total) * 100)}`}
              style={{ width: `${(systemStats.memory.used / systemStats.memory.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{systemStats.memory.total}GB total</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HardDrive className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{systemStats.disk.used}GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageColor((systemStats.disk.used / systemStats.disk.total) * 100)}`}
              style={{ width: `${(systemStats.disk.used / systemStats.disk.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{systemStats.disk.total}GB total</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Network className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Network</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{systemStats.network.in}MB/s</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>In: {systemStats.network.in}MB/s</span>
            <span>Out: {systemStats.network.out}MB/s</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Uptime
            </h3>
            <span className="text-2xl font-bold text-green-600">{systemStats.uptime}</span>
          </div>
          <p className="text-sm text-gray-500">System has been running smoothly</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Response Time
            </h3>
            <span className="text-2xl font-bold text-blue-600">{systemStats.responseTime}ms</span>
          </div>
          <p className="text-sm text-gray-500">Average API response time</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Active Connections
            </h3>
            <span className="text-2xl font-bold text-purple-600">{systemStats.activeConnections}</span>
          </div>
          <p className="text-sm text-gray-500">Currently connected users</p>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Services Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-500">Uptime: {service.uptime}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{service.responseTime}ms</div>
                    <div className={`text-xs px-2 py-1 rounded ${getStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Recent Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Rate Chart */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Error Rate Monitoring
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">{systemStats.errorRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-500">Current error rate</div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">-0.3% from last hour</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemStats.errorRate * 10}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Target: &lt; 1%</p>
        </div>
      </div>
    </div>
  )
}

export default SystemMonitoring
