import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Server,
  Database,
  Cloud,
  Wifi,
  HardDrive,
  Cpu,
  Zap,
  Shield,
  Globe,
  Monitor,
  BarChart,
  AlertCircle,
  Info
} from 'lucide-react'

const SystemHealth = () => {
  const [healthData, setHealthData] = useState({})
  const [services, setServices] = useState([])
  const [metrics, setMetrics] = useState({})
  const [incidents, setIncidents] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      setHealthData({
        overallHealth: 'healthy',
        uptime: '99.9%',
        responseTime: 125,
        errorRate: 0.01,
        lastChecked: new Date()
      })

      setServices([
        {
          name: 'Web Application',
          status: 'healthy',
          uptime: '99.9%',
          responseTime: 85,
          lastCheck: new Date(Date.now() - 2 * 60 * 1000),
          url: 'https://api.example.com/health'
        },
        {
          name: 'Database',
          status: 'healthy',
          uptime: '99.8%',
          responseTime: 12,
          lastCheck: new Date(Date.now() - 1 * 60 * 1000),
          url: 'postgresql://db.example.com'
        },
        {
          name: 'Cache Layer',
          status: 'warning',
          uptime: '98.5%',
          responseTime: 8,
          lastCheck: new Date(Date.now() - 30 * 1000),
          url: 'redis://cache.example.com'
        },
        {
          name: 'File Storage',
          status: 'healthy',
          uptime: '100%',
          responseTime: 25,
          lastCheck: new Date(Date.now() - 45 * 1000),
          url: 's3://storage.example.com'
        },
        {
          name: 'Email Service',
          status: 'healthy',
          uptime: '99.7%',
          responseTime: 150,
          lastCheck: new Date(Date.now() - 3 * 60 * 1000),
          url: 'smtp://mail.example.com'
        },
        {
          name: 'Payment Gateway',
          status: 'degraded',
          uptime: '97.2%',
          responseTime: 450,
          lastCheck: new Date(Date.now() - 1 * 60 * 1000),
          url: 'https://payments.stripe.com'
        }
      ])

      setMetrics({
        systemLoad: {
          current: 0.65,
          average: 0.72,
          trend: 'down'
        },
        memoryUsage: {
          current: 68,
          average: 72,
          trend: 'stable'
        },
        diskUsage: {
          current: 45,
          average: 48,
          trend: 'up'
        },
        networkLatency: {
          current: 125,
          average: 135,
          trend: 'down'
        },
        activeConnections: {
          current: 1247,
          average: 1180,
          trend: 'up'
        },
        throughput: {
          current: 2.4,
          average: 2.1,
          trend: 'up'
        }
      })

      setIncidents([
        {
          id: 1,
          type: 'performance',
          severity: 'low',
          title: 'Slight increase in response time',
          description: 'Average response time increased by 15ms',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'monitoring',
          affectedServices: ['Web Application']
        },
        {
          id: 2,
          type: 'availability',
          severity: 'medium',
          title: 'Payment gateway intermittent errors',
          description: 'Occasional 5xx errors from payment provider',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'investigating',
          affectedServices: ['Payment Gateway']
        },
        {
          id: 3,
          type: 'security',
          severity: 'high',
          title: 'Unusual traffic pattern detected',
          description: 'Potential DDoS attack mitigated',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'resolved',
          affectedServices: ['Web Application', 'Database']
        }
      ])

      setIsRefreshing(false)
    }, 800)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'degraded': return 'text-orange-600 bg-orange-100'
      case 'down': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'degraded': return <AlertCircle className="w-4 h-4" />
      case 'down': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  const getOverallHealthColor = () => {
    const healthyServices = services.filter(s => s.status === 'healthy').length
    const totalServices = services.length
    const healthPercentage = (healthyServices / totalServices) * 100

    if (healthPercentage >= 90) return 'text-green-600'
    if (healthPercentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health</h1>
          <p className="text-gray-600">Monitor system performance and service availability</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {formatTimestamp(healthData.lastChecked)}
          </span>
          <button
            onClick={fetchHealthData}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Overall System Health</h2>
              <p className="text-gray-600 mt-1">System is operating normally</p>
            </div>
            <div className={`text-6xl font-bold ${getOverallHealthColor()}`}>
              {healthData.uptime}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{healthData.responseTime}ms</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{healthData.errorRate}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{services.filter(s => s.status === 'healthy').length}/{services.length}</div>
              <div className="text-sm text-gray-600">Healthy Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                <span className="ml-1">{service.status.toUpperCase()}</span>
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">{service.uptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">{service.responseTime}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Check</span>
                <span className="font-medium">{formatTimestamp(service.lastCheck)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Endpoint</span>
                <span className="font-medium text-blue-600 truncate">{service.url}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <BarChart className="w-5 h-5 mr-2" />
            Performance Metrics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(metrics).map(([key, metric]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {typeof metric.current === 'number' && metric.current < 10 
                    ? metric.current.toFixed(1) 
                    : metric.current}
                  {key.includes('Usage') ? '%' : key.includes('Time') ? 'ms' : key.includes('Load') ? '' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  Avg: {typeof metric.average === 'number' && metric.average < 10 
                    ? metric.average.toFixed(1) 
                    : metric.average}
                  {key.includes('Usage') ? '%' : key.includes('Time') ? 'ms' : key.includes('Load') ? '' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Recent Incidents
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{incident.type}</span>
                    <span className="text-sm text-gray-500">{formatTimestamp(incident.timestamp)}</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">{incident.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Affected: {incident.affectedServices.join(', ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
