import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { Speed, Memory, Storage, Storage as Database } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

const PerformanceMonitoring = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [metrics, setMetrics] = useState({
    cpu: {
      usage: 0,
      cores: 8,
      temperature: 0,
      load: 0
    },
    memory: {
      total: 16,
      used: 0,
      available: 0,
      swap: 0
    },
    disk: {
      total: 1000,
      used: 0,
      available: 0,
      iops: 0
    },
    network: {
      incoming: 0,
      outgoing: 0,
      connections: 0,
      errors: 0
    }
  })
  const [alerts, setAlerts] = useState([])
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics()
      checkAlerts()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const updateMetrics = () => {
    setMetrics({
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 40 + Math.random() * 40,
        load: Math.random() * 10
      },
      memory: {
        total: 16,
        used: 8 + Math.random() * 6,
        available: 16 - (8 + Math.random() * 6),
        swap: Math.random() * 2
      },
      disk: {
        total: 1000,
        used: 400 + Math.random() * 200,
        available: 1000 - (400 + Math.random() * 200),
        iops: Math.random() * 1000
      },
      network: {
        incoming: Math.random() * 100,
        outgoing: Math.random() * 50,
        connections: 100 + Math.random() * 200,
        errors: Math.random() * 10
      }
    })
  }

  const checkAlerts = () => {
    if (Math.random() > 0.95) {
      const alertTypes = [
        'High CPU usage detected',
        'Memory usage above threshold',
        'Disk space running low',
        'Network performance degraded'
      ]
      
      const newAlert = {
        id: Date.now(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: Math.random() > 0.7 ? 'warning' : 'info',
        timestamp: new Date().toISOString()
      }

      setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
    }
  }

  const getStatusColor = (value, threshold) => {
    if (value >= threshold * 0.9) return 'error'
    if (value >= threshold * 0.7) return 'warning'
    return 'success'
  }

  const mockTimeSeriesData = [
    { time: '00:00', cpu: 45, memory: 65, disk: 55, network: 30 },
    { time: '00:05', cpu: 52, memory: 68, disk: 58, network: 35 },
    { time: '00:10', cpu: 48, memory: 62, disk: 52, network: 28 },
    { time: '00:15', cpu: 61, memory: 75, disk: 65, network: 42 },
    { time: '00:20', cpu: 78, memory: 82, disk: 78, network: 55 },
    { time: '00:25', cpu: 85, memory: 88, disk: 85, network: 68 },
    { time: '00:30', cpu: 72, memory: 78, disk: 72, network: 48 },
    { time: '00:35', cpu: 65, memory: 70, disk: 65, network: 38 },
    { time: '00:40', cpu: 58, memory: 65, disk: 58, network: 32 },
    { time: '00:45', cpu: 52, memory: 60, disk: 52, network: 28 },
    { time: '00:50', cpu: 48, memory: 58, disk: 48, network: 25 },
    { time: '00:55', cpu: 45, memory: 55, disk: 45, network: 22 }
  ]

  const performanceMetrics = [
    {
      name: 'Response Time',
      current: '45ms',
      target: '<50ms',
      status: 'success',
      trend: '↘ 12%'
    },
    {
      name: 'Throughput',
      current: '2.4k req/s',
      target: '>2k req/s',
      status: 'success',
      trend: '↗ 8%'
    },
    {
      name: 'Error Rate',
      current: '0.2%',
      target: '<1%',
      status: 'success',
      trend: '↘ 15%'
    },
    {
      name: 'Uptime',
      current: '99.98%',
      target: '>99.9%',
      status: 'success',
      trend: '↗ 0.02%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600">Real-time system performance metrics and alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    CPU Usage
                  </Typography>
                  <Typography variant="h4" component="div">
                    {metrics.cpu.usage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.cpu.cores} cores • {metrics.cpu.temperature.toFixed(1)}°C
                  </Typography>
                </div>
                <Speed className="h-12 w-12 text-blue-500" />
              </div>
              <LinearProgress
                variant="determinate"
                value={metrics.cpu.usage}
                color={getStatusColor(metrics.cpu.usage, 100)}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Memory Usage
                  </Typography>
                  <Typography variant="h4" component="div">
                    {((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.memory.used.toFixed(1)}GB / {metrics.memory.total}GB
                  </Typography>
                </div>
                <Memory className="h-12 w-12 text-green-500" />
              </div>
              <LinearProgress
                variant="determinate"
                value={(metrics.memory.used / metrics.memory.total) * 100}
                color={getStatusColor((metrics.memory.used / metrics.memory.total) * 100, 100)}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Disk Usage
                  </Typography>
                  <Typography variant="h4" component="div">
                    {((metrics.disk.used / metrics.disk.total) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.disk.used.toFixed(0)}GB / {metrics.disk.total}GB
                  </Typography>
                </div>
                <Storage className="h-12 w-12 text-orange-500" />
              </div>
              <LinearProgress
                variant="determinate"
                value={(metrics.disk.used / metrics.disk.total) * 100}
                color={getStatusColor((metrics.disk.used / metrics.disk.total) * 100, 100)}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Network I/O
                  </Typography>
                  <Typography variant="h4" component="div">
                    {metrics.network.incoming.toFixed(1)} MB/s
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.network.connections.toFixed(0)} connections
                  </Typography>
                </div>
                <Database className="h-12 w-12 text-purple-500" />
              </div>
              <LinearProgress
                variant="determinate"
                value={(metrics.network.incoming / 100) * 100}
                color={getStatusColor((metrics.network.incoming / 100) * 100, 100)}
                className="mt-3"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="disk" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="body2" color="textSecondary">
                        {metric.name}
                      </Typography>
                      <Chip
                        label={metric.status}
                        size="small"
                        color={metric.status === 'success' ? 'success' : 'warning'}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Typography variant="h6">
                        {metric.current}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {metric.target}
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-right">
                      {metric.trend}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and System Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Alerts
              </Typography>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <Alert severity="success">
                    All systems operating normally
                  </Alert>
                ) : (
                  alerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={alert.severity}
                      className="mb-2"
                    >
                      {alert.type}
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Component</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Check</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Web Server</TableCell>
                      <TableCell>
                        <Chip label="Healthy" size="small" color="success" />
                      </TableCell>
                      <TableCell>2s ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Database</TableCell>
                      <TableCell>
                        <Chip label="Healthy" size="small" color="success" />
                      </TableCell>
                      <TableCell>2s ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cache</TableCell>
                      <TableCell>
                        <Chip label="Healthy" size="small" color="success" />
                      </TableCell>
                      <TableCell>2s ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Queue</TableCell>
                      <TableCell>
                        <Chip label="Healthy" size="small" color="success" />
                      </TableCell>
                      <TableCell>2s ago</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default PerformanceMonitoring
