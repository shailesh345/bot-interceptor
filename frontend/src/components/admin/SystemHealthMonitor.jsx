import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, Server, Database, Cpu, HardDrive, Wifi, 
  AlertTriangle, CheckCircle, XCircle, RefreshCw, 
  TrendingUp, TrendingDown, Clock, Zap
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Card from '../common/Card'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const SystemHealthMonitor = () => {
  const [loading, setLoading] = useState(false)
  const [systemHealth, setSystemHealth] = useState({})
  const [metrics, setMetrics] = useState({})
  const [alerts, setAlerts] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadSystemHealth()
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadSystemHealth = async () => {
    setLoading(true)
    try {
      const [healthResponse, metricsResponse, alertsResponse] = await Promise.all([
        adminAPI.getSystemHealth(),
        adminAPI.getSystemStats(),
        adminAPI.getSystemAlerts()
      ])
      
      setSystemHealth(healthResponse.data || {})
      setMetrics(metricsResponse.data || {})
      setAlerts(alertsResponse.data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load system health:', error)
      toast.error('Failed to load system health data')
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = (status) => {
    switch (status) {
      case 'healthy': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' }
      case 'warning': return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' }
      case 'error': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
      default: return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' }
    }
  }

  const getMetricTrend = (current, previous) => {
    if (!current || !previous) return { icon: Clock, color: 'text-gray-500', text: 'No data' }
    
    const change = ((current - previous) / previous) * 100
    if (change > 5) return { icon: TrendingUp, color: 'text-green-500', text: `+${change.toFixed(1)}%` }
    if (change < -5) return { icon: TrendingDown, color: 'text-red-500', text: `${change.toFixed(1)}%` }
    return { icon: Activity, color: 'text-blue-500', text: `${change.toFixed(1)}%` }
  }

  const formatMetric = (value, unit = '') => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K${unit}`
      return `${value}${unit}`
    }
    return value || 'N/A'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health Monitor</h1>
            <p className="text-gray-600">Real-time system performance and health monitoring</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={loadSystemHealth}
            icon={RefreshCw}
            variant="outline"
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            icon={Zap}
            variant={autoRefresh ? 'primary' : 'outline'}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card header="System Status Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemHealth).map(([key, status]) => {
            const { icon: Icon, color, bg } = getHealthStatus(status)
            return (
              <div key={key} className={`p-4 rounded-lg border ${bg}`}>
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${color}`} />
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <p className={`text-sm ${color}`}>
                      {status || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card header="Performance Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CPU Usage */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">CPU Usage</h3>
              </div>
              {metrics.cpu && (
                <span className="text-sm text-gray-500">
                  {getMetricTrend(metrics.cpu.current, metrics.cpu.previous).text}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{formatMetric(metrics.cpu?.current, '%')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.cpu?.current || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Memory Usage</h3>
              </div>
              {metrics.memory && (
                <span className="text-sm text-gray-500">
                  {getMetricTrend(metrics.memory.current, metrics.memory.previous).text}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{formatMetric(metrics.memory?.current, '%')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.memory?.current || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Network Usage */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Network Usage</h3>
              </div>
              {metrics.network && (
                <span className="text-sm text-gray-500">
                  {getMetricTrend(metrics.network.current, metrics.network.previous).text}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{formatMetric(metrics.network?.current, ' Mbps')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metrics.network?.current || 0) / 100, 1) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Database Health */}
      <Card header="Database Health">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Connection Pool</h3>
                <p className="text-sm text-blue-700">
                  {metrics.database?.connectionPool || 0} active connections
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Query Performance</h3>
                <p className="text-sm text-green-700">
                  {formatMetric(metrics.database?.avgQueryTime, 'ms')} avg
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-medium text-purple-900">Storage Usage</h3>
                <p className="text-sm text-purple-700">
                  {formatMetric(metrics.database?.storageUsed, 'GB')} / {formatMetric(metrics.database?.storageTotal, 'GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Alerts */}
      <Card header="System Alerts">
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium uppercase">
                    {alert.severity}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No active alerts</p>
              <p className="text-sm">All systems are running normally</p>
            </div>
          )}
        </div>
      </Card>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default SystemHealthMonitor
