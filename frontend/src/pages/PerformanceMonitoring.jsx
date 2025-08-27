import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Zap, Cpu, HardDrive, Wifi, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PerformanceMonitoring = () => {
  const { user } = useSelector((state) => state.auth)
  const [performanceData, setPerformanceData] = useState({})
  const [loading, setLoading] = useState(false)

  const mockPerformanceData = {
    systemHealth: {
      cpu: 45,
      memory: 62,
      disk: 78,
      network: 23
    },
    responseTimes: {
      average: 245,
      p95: 890,
      p99: 1200
    },
    throughput: {
      requests: 15420,
      errors: 23,
      successRate: 99.85
    },
    alerts: [
      {
        id: 1,
        type: 'High CPU Usage',
        severity: 'warning',
        message: 'CPU usage exceeded 80% threshold',
        timestamp: '2024-01-15 14:30:00',
        status: 'acknowledged'
      },
      {
        id: 2,
        type: 'Memory Warning',
        severity: 'info',
        message: 'Memory usage approaching limit',
        timestamp: '2024-01-15 14:25:00',
        status: 'resolved'
      }
    ]
  }

  useEffect(() => {
    setPerformanceData(mockPerformanceData)
  }, [])

  const getHealthColor = (value) => {
    if (value < 50) return 'success'
    if (value < 80) return 'warning'
    return 'danger'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'danger'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'acknowledged': return 'warning'
      case 'active': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <>
      <Helmet>
        <title>Performance Monitoring - BI</title>
        <meta name="description" content="Real-time performance monitoring and system health dashboard." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Performance Monitoring</h1>
            <p className="text-gray-600">Real-time system performance and health monitoring</p>
          </div>
          <Button
            variant="primary"
            icon={TrendingUp}
            onClick={() => {
              // TODO: Implement performance optimization
            }}
          >
            Optimize Performance
          </Button>
        </div>

        {/* System Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-black">
                    {performanceData.systemHealth?.cpu || 0}%
                  </p>
                  <Badge variant={getHealthColor(performanceData.systemHealth?.cpu || 0)}>
                    {performanceData.systemHealth?.cpu < 50 ? 'Good' :
                     performanceData.systemHealth?.cpu < 80 ? 'Moderate' : 'High'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth?.cpu < 50 ? 'bg-green-500' :
                      performanceData.systemHealth?.cpu < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth?.cpu || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-black">
                    {performanceData.systemHealth?.memory || 0}%
                  </p>
                  <Badge variant={getHealthColor(performanceData.systemHealth?.memory || 0)}>
                    {performanceData.systemHealth?.memory < 50 ? 'Good' :
                     performanceData.systemHealth?.memory < 80 ? 'Moderate' : 'High'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth?.memory < 50 ? 'bg-green-500' :
                      performanceData.systemHealth?.memory < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth?.memory || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-500">Disk Usage</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-black">
                    {performanceData.systemHealth?.disk || 0}%
                  </p>
                  <Badge variant={getHealthColor(performanceData.systemHealth?.disk || 0)}>
                    {performanceData.systemHealth?.disk < 50 ? 'Good' :
                     performanceData.systemHealth?.disk < 80 ? 'Moderate' : 'High'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth?.disk < 50 ? 'bg-green-500' :
                      performanceData.systemHealth?.disk < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth?.disk || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Wifi className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-500">Network I/O</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-black">
                    {performanceData.systemHealth?.network || 0}%
                  </p>
                  <Badge variant={getHealthColor(performanceData.systemHealth?.network || 0)}>
                    {performanceData.systemHealth?.network < 50 ? 'Good' :
                     performanceData.systemHealth?.network < 80 ? 'Moderate' : 'High'}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      performanceData.systemHealth?.network < 50 ? 'bg-green-500' :
                      performanceData.systemHealth?.network < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${performanceData.systemHealth?.network || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Response Time</h3>
              <p className="text-3xl font-bold text-black mb-1">
                {performanceData.responseTimes?.average || 0}ms
              </p>
              <p className="text-sm text-gray-600">
                P95: {performanceData.responseTimes?.p95 || 0}ms | P99: {performanceData.responseTimes?.p99 || 0}ms
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Throughput</h3>
              <p className="text-3xl font-bold text-black mb-1">
                {performanceData.throughput?.requests?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">requests/min</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-black mb-1">
                {performanceData.throughput?.successRate || 0}%
              </p>
              <p className="text-sm text-gray-600">
                {performanceData.throughput?.errors || 0} errors
              </p>
            </div>
          </Card>
        </div>

        {/* Performance Alerts */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Performance Alerts</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {performanceData.alerts?.map((alert) => (
              <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className={`w-5 h-5 mr-3 ${
                      alert.severity === 'error' ? 'text-red-500' :
                      alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <h4 className="text-sm font-medium text-black">{alert.type}</h4>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                      {alert.severity}
                    </Badge>
                    <Badge variant={getStatusColor(alert.status)} className="capitalize">
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )) || []}
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              View All Alerts
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Performance Report</h3>
              <p className="text-gray-600 text-sm mb-4">Generate detailed performance report</p>
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Resource Optimization</h3>
              <p className="text-gray-600 text-sm mb-4">Optimize system resources</p>
              <Button variant="outline" className="w-full">
                Optimize
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Alert Configuration</h3>
              <p className="text-gray-600 text-sm mb-4">Configure performance alerts</p>
              <Button variant="outline" className="w-full">
                Configure
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <HardDrive className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">System Logs</h3>
              <p className="text-gray-600 text-sm mb-4">View system performance logs</p>
              <Button variant="outline" className="w-full">
                View Logs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default PerformanceMonitoring
