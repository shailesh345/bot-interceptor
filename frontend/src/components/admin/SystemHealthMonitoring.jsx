import React, { useState, useEffect } from 'react'
import { 
  Heart, 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Memory, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Download,
  BarChart3,
  Monitor,
  Zap
} from 'lucide-react'

const SystemHealthMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'healthy',
    uptime: '99.98%',
    responseTime: 0,
    throughput: 0,
    errorRate: 0
  })

  const [systemComponents, setSystemComponents] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState([])
  const [healthChecks, setHealthChecks] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 98890) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      const responseTime = Math.floor(Math.random() * 100) + 50
      const throughput = Math.floor(Math.random() * 5000) + 1000
      const errorRate = Math.random() * 2
      
      setHealthStatus({
        overall: errorRate > 1 ? 'degraded' : 'healthy',
        uptime: '99.98%',
        responseTime,
        throughput,
        errorRate
      })

      setSystemComponents([
        {
          name: 'API Gateway',
          status: 'healthy',
          uptime: '99.99%',
          responseTime: 45,
          lastCheck: '30 seconds ago',
          details: 'All endpoints responding normally'
        },
        {
          name: 'Database',
          status: 'healthy',
          uptime: '99.95%',
          responseTime: 12,
          lastCheck: '30 seconds ago',
          details: 'Query performance optimal'
        },
        {
          name: 'Cache Server',
          status: 'healthy',
          uptime: '100%',
          responseTime: 8,
          lastCheck: '30 seconds ago',
          details: 'Cache hit ratio: 85%'
        },
        {
          name: 'Load Balancer',
          status: 'healthy',
          uptime: '100%',
          responseTime: 15,
          lastCheck: '30 seconds ago',
          details: 'Traffic distributed evenly'
        },
        {
          name: 'Message Queue',
          status: 'warning',
          uptime: '99.85%',
          responseTime: 120,
          lastCheck: '30 seconds ago',
          details: 'Queue depth increasing'
        },
        {
          name: 'File Storage',
          status: 'healthy',
          uptime: '99.92%',
          responseTime: 35,
          lastCheck: '30 seconds ago',
          details: 'Storage capacity: 65% used'
        }
      ])

      setPerformanceMetrics([
        {
          metric: 'CPU Usage',
          value: Math.floor(Math.random() * 40) + 30,
          unit: '%',
          trend: 'stable',
          threshold: 80,
          status: 'healthy'
        },
        {
          metric: 'Memory Usage',
          value: Math.floor(Math.random() * 30) + 45,
          unit: '%',
          trend: 'up',
          threshold: 85,
          status: 'healthy'
        },
        {
          metric: 'Disk Usage',
          value: Math.floor(Math.random() * 20) + 50,
          unit: '%',
          trend: 'stable',
          threshold: 90,
          status: 'healthy'
        },
        {
          metric: 'Network I/O',
          value: Math.floor(Math.random() * 500) + 200,
          unit: 'MB/s',
          trend: 'down',
          threshold: 1000,
          status: 'healthy'
        }
      ])

      setHealthChecks([
        {
          check: 'Database Connection',
          status: 'passed',
          lastRun: '1 minute ago',
          duration: '45ms',
          result: 'Connection established successfully'
        },
        {
          check: 'API Endpoints',
          status: 'passed',
          lastRun: '2 minutes ago',
          duration: '120ms',
          result: 'All endpoints responding with 200 OK'
        },
        {
          check: 'SSL Certificate',
          status: 'passed',
          lastRun: '5 minutes ago',
          duration: '200ms',
          result: 'Certificate valid until 2025-12-31'
        },
        {
          check: 'Backup Status',
          status: 'passed',
          lastRun: '1 hour ago',
          duration: '2.5s',
          result: 'Last backup completed successfully'
        },
        {
          check: 'Security Scan',
          status: 'warning',
          lastRun: '6 hours ago',
          duration: '15s',
          result: 'Minor security recommendations available'
        }
      ])

      setIsRefreshing(false)
    }, 1000)
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'healthy': 
      case 'passed': 
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': 
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'critical': 
      case 'failed': 
        return <XCircle className="w-4 h-4 text-red-600" />
      default: 
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': 
      case 'passed': 
        return 'bg-green-100 text-green-800'
      case 'warning': 
        return 'bg-yellow-100 text-yellow-800'
      case 'critical': 
      case 'failed': 
        return 'bg-red-100 text-red-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getOverallStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Heart className={`w-6 h-6 ${getOverallStatusColor(healthStatus.overall)}`} />
            <span className={`text-lg font-semibold ${getOverallStatusColor(healthStatus.overall)}`}>
              {healthStatus.overall.toUpperCase()}
            </span>
          </div>
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

      {/* Overall Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">{healthStatus.uptime}</span>
          </div>
          <p className="text-sm text-gray-500">System availability</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">{healthStatus.responseTime}ms</span>
          </div>
          <p className="text-sm text-gray-500">Average response time</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Throughput</h3>
            </div>
            <span className="text-2xl font-bold text-purple-600">{healthStatus.throughput}</span>
          </div>
          <p className="text-sm text-gray-500">Requests per second</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Error Rate</h3>
            </div>
            <span className="text-2xl font-bold text-red-600">{healthStatus.errorRate.toFixed(2)}%</span>
          </div>
          <p className="text-sm text-gray-500">Error percentage</p>
        </div>
      </div>

      {/* System Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              System Components
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemComponents.map((component, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(component.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{component.name}</div>
                      <div className="text-xs text-gray-500">{component.details}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{component.responseTime}ms</div>
                    <div className="text-xs text-gray-500">{component.lastCheck}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Threshold: {metric.threshold}{metric.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Health Checks
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {healthChecks.map((check, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {check.check}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(check.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {check.lastRun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {check.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {check.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthMonitoring
