import React, { useState, useEffect } from 'react'
import {
  ServerIcon,
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WifiIcon,
  ServerStackIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const SystemMonitoring = () => {
  const [systemMetrics, setSystemMetrics] = useState({})
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock system metrics data
  const mockMetrics = {
    systemHealth: {
      cpu: 45.2,
      memory: 67.8,
      disk: 23.4,
      network: 12.1,
      uptime: 99.97,
      responseTime: 45
    },
    performance: {
      requestsPerSecond: 1234,
      averageResponseTime: 45,
      errorRate: 0.03,
      throughput: 567.8
    },
    infrastructure: {
      activeServers: 12,
      totalServers: 15,
      databaseConnections: 89,
      cacheHitRate: 94.2,
      loadBalancerHealth: 'healthy'
    },
    security: {
      activeThreats: 3,
      blockedRequests: 2345,
      suspiciousIPs: 12,
      securityScore: 96,
      lastScan: '2024-08-24T10:00:00Z'
    },
    network: {
      bandwidth: 78.5,
      latency: 12,
      packetLoss: 0.01,
      activeConnections: 1234
    }
  }

  // Mock time series data
  const mockTimeSeriesData = {
    cpu: [
      { time: '00:00', value: 42, threshold: 80 },
      { time: '02:00', value: 38, threshold: 80 },
      { time: '04:00', value: 35, threshold: 80 },
      { time: '06:00', value: 45, threshold: 80 },
      { time: '08:00', value: 67, threshold: 80 },
      { time: '10:00', value: 78, threshold: 80 },
      { time: '12:00', value: 82, threshold: 80 },
      { time: '14:00', value: 75, threshold: 80 },
      { time: '16:00', value: 68, threshold: 80 },
      { time: '18:00', value: 72, threshold: 80 },
      { time: '20:00', value: 65, threshold: 80 },
      { time: '22:00', value: 58, threshold: 80 }
    ],
    memory: [
      { time: '00:00', value: 65, threshold: 85 },
      { time: '02:00', value: 63, threshold: 85 },
      { time: '04:00', value: 61, threshold: 85 },
      { time: '06:00', value: 64, threshold: 85 },
      { time: '08:00', value: 68, threshold: 85 },
      { time: '10:00', value: 72, threshold: 85 },
      { time: '12:00', value: 75, threshold: 85 },
      { time: '14:00', value: 73, threshold: 85 },
      { time: '16:00', value: 70, threshold: 85 },
      { time: '18:00', value: 71, threshold: 85 },
      { time: '20:00', value: 69, threshold: 85 },
      { time: '22:00', value: 66, threshold: 85 }
    ],
    network: [
      { time: '00:00', requests: 890, errors: 2, latency: 15 },
      { time: '02:00', requests: 567, errors: 1, latency: 12 },
      { time: '04:00', requests: 432, errors: 0, latency: 10 },
      { time: '06:00', requests: 678, errors: 1, latency: 13 },
      { time: '08:00', requests: 1234, errors: 3, latency: 18 },
      { time: '10:00', requests: 1567, errors: 4, latency: 22 },
      { time: '12:00', requests: 1890, errors: 5, latency: 25 },
      { time: '14:00', requests: 1678, errors: 3, latency: 20 },
      { time: '16:00', requests: 1456, errors: 2, latency: 18 },
      { time: '18:00', requests: 1345, errors: 2, latency: 17 },
      { time: '20:00', requests: 1123, errors: 1, latency: 15 },
      { time: '22:00', requests: 987, errors: 1, latency: 13 }
    ]
  }

  // Mock alerts
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High CPU Usage',
      message: 'CPU usage has exceeded 80% for more than 5 minutes',
      timestamp: '2024-08-24T12:30:00Z',
      severity: 'medium',
      status: 'active'
    },
    {
      id: 2,
      type: 'error',
      title: 'Database Connection Pool Exhausted',
      message: 'Database connection pool has reached maximum capacity',
      timestamp: '2024-08-24T12:15:00Z',
      severity: 'high',
      status: 'resolved'
    },
    {
      id: 3,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for 2:00 AM UTC',
      timestamp: '2024-08-24T11:00:00Z',
      severity: 'low',
      status: 'scheduled'
    }
  ]

  useEffect(() => {
    setSystemMetrics(mockMetrics)
    setAlerts(mockAlerts)
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshMetrics()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const refreshMetrics = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'info': return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
      default: return <CheckCircleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const formatUptime = (uptime) => {
    const days = Math.floor(uptime / 24)
    const hours = uptime % 24
    return `${days}d ${hours}h`
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={refreshMetrics}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <BoltIcon className="-ml-1 mr-2 h-4 w-4" />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">CPU Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{systemMetrics.systemHealth?.cpu || 0}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min((systemMetrics.systemHealth?.cpu || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Memory Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{systemMetrics.systemHealth?.memory || 0}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min((systemMetrics.systemHealth?.memory || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

                 <div className="bg-white rounded-lg shadow p-6">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <ServerStackIcon className="h-8 w-8 text-purple-600" />
             </div>
             <div className="ml-4">
               <p className="text-sm font-medium text-gray-500">Disk Usage</p>
               <p className="text-2xl font-semibold text-gray-900">{systemMetrics.systemHealth?.disk || 0}%</p>
             </div>
           </div>
           <div className="mt-4">
             <div className="w-full bg-gray-200 rounded-full h-2">
               <div
                 className="bg-purple-600 h-2 rounded-full"
                 style={{ width: `${Math.min((systemMetrics.systemHealth?.disk || 0), 100)}%` }}
               ></div>
             </div>
           </div>
         </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WifiIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Network</p>
              <p className="text-2xl font-semibold text-gray-900">{systemMetrics.systemHealth?.network || 0}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min((systemMetrics.systemHealth?.network || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CPU & Memory Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTimeSeriesData.cpu}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
              <Line type="monotone" dataKey="threshold" stroke="#EF4444" strokeDasharray="5 5" name="Threshold" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Network Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockTimeSeriesData.network}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="requests" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Requests" />
              <Area type="monotone" dataKey="errors" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Errors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Infrastructure & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Infrastructure Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Servers</span>
              <span className="text-sm font-medium text-gray-900">
                {systemMetrics.infrastructure?.activeServers || 0} / {systemMetrics.infrastructure?.totalServers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connections</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.infrastructure?.databaseConnections || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Hit Rate</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.infrastructure?.cacheHitRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Load Balancer</span>
              <span className={`text-sm font-medium ${getStatusColor(systemMetrics.infrastructure?.loadBalancerHealth)}`}>
                {systemMetrics.infrastructure?.loadBalancerHealth || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.systemHealth?.uptime || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.systemHealth?.responseTime || 0}ms</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Security Score</span>
              <span className="text-sm font-medium text-green-600">{systemMetrics.security?.securityScore || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Threats</span>
              <span className="text-sm font-medium text-red-600">{systemMetrics.security?.activeThreats || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blocked Requests</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.security?.blockedRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suspicious IPs</span>
              <span className="text-sm font-medium text-yellow-600">{systemMetrics.security?.suspiciousIPs || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Security Scan</span>
              <span className="text-sm font-medium text-gray-900">
                {systemMetrics.security?.lastScan ? new Date(systemMetrics.security.lastScan).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <span className={`text-xs ${alert.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>
                      {alert.status}
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

export default SystemMonitoring
