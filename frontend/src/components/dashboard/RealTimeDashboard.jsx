import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Bot,
  Users,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import websocketService from '../../services/websocketService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const RealTimeDashboard = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState({})
  const [activeUsers, setActiveUsers] = useState(0)
  const [showLiveData, setShowLiveData] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [isLoading, setIsLoading] = useState(false)
  
  const updateIntervalRef = useRef(null)
  const chartRefs = useRef({})

  useEffect(() => {
    initializeWebSocket()
    loadInitialData()
    
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      cleanup()
    }
  }, [])

  const initializeWebSocket = async () => {
    try {
      await websocketService.connect()
      setIsConnected(true)
      
      // Subscribe to real-time updates
      websocketService.on('traffic_update', handleTrafficUpdate)
      websocketService.on('security_alert', handleSecurityAlert)
      websocketService.on('performance_update', handlePerformanceUpdate)
      websocketService.on('user_activity', handleUserActivity)
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      setIsConnected(false)
    }
  }

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls for initial data
      const mockData = await Promise.all([
        generateTrafficData(),
        generateSecurityAlerts(),
        generatePerformanceMetrics(),
        generateUserData()
      ])
      
      setTrafficData(mockData[0])
      setSecurityAlerts(mockData[1])
      setPerformanceMetrics(mockData[2])
      setActiveUsers(mockData[3])
      
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrafficUpdate = (data) => {
    setTrafficData(prev => {
      const newData = [...prev, data]
      // Keep only last 50 data points
      return newData.slice(-50)
    })
  }

  const handleSecurityAlert = (data) => {
    setSecurityAlerts(prev => [data, ...prev.slice(0, 9)])
  }

  const handlePerformanceUpdate = (data) => {
    setPerformanceMetrics(data)
  }

  const handleUserActivity = (data) => {
    setActiveUsers(data.activeUsers)
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      if (showLiveData) {
        // Simulate real-time updates
        const newTrafficPoint = {
          timestamp: new Date().toISOString(),
          requests: Math.floor(Math.random() * 1000) + 500,
          bots: Math.floor(Math.random() * 100) + 10,
          threats: Math.floor(Math.random() * 50) + 5
        }
        handleTrafficUpdate(newTrafficPoint)
      }
    }, 5000) // Update every 5 seconds
  }

  const stopAutoRefresh = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }

  const cleanup = () => {
    stopAutoRefresh()
    websocketService.disconnect()
  }

  const toggleLiveData = () => {
    setShowLiveData(!showLiveData)
    if (!showLiveData && autoRefresh) {
      startAutoRefresh()
    } else if (showLiveData) {
      stopAutoRefresh()
    }
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    if (!autoRefresh) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  // Mock data generators
  const generateTrafficData = async () => {
    const data = []
    const now = new Date()
    for (let i = 59; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000)
      data.push({
        timestamp: time.toISOString(),
        requests: Math.floor(Math.random() * 1000) + 500,
        bots: Math.floor(Math.random() * 100) + 10,
        threats: Math.floor(Math.random() * 50) + 5
      })
    }
    return data
  }

  const generateSecurityAlerts = async () => {
    return [
      { id: 1, type: 'threat', severity: 'high', message: 'DDoS attack detected', time: '2 minutes ago' },
      { id: 2, type: 'bot', severity: 'medium', message: 'Bot traffic spike', time: '5 minutes ago' },
      { id: 3, type: 'security', severity: 'low', message: 'Suspicious IP blocked', time: '8 minutes ago' }
    ]
  }

  const generatePerformanceMetrics = async () => {
    return {
      responseTime: Math.floor(Math.random() * 100) + 50,
      uptime: 99.99,
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30
    }
  }

  const generateUserData = async () => {
    return Math.floor(Math.random() * 1000) + 500
  }

  // Chart configurations
  const trafficChartData = {
    labels: trafficData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Total Requests',
        data: trafficData.map(d => d.requests),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Bot Traffic',
        data: trafficData.map(d => d.bots),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const threatsChartData = {
    labels: ['DDoS', 'Bot Traffic', 'SQL Injection', 'XSS', 'Brute Force'],
    datasets: [{
      data: [25, 30, 15, 20, 10],
      backgroundColor: [
        '#ef4444',
        '#f59e0b',
        '#3b82f6',
        '#8b5cf6',
        '#10b981'
      ]
    }]
  }

  const performanceChartData = {
    labels: ['Response Time', 'CPU Usage', 'Memory Usage', 'Network'],
    datasets: [{
      label: 'Current Usage',
      data: [
        performanceMetrics.responseTime || 0,
        performanceMetrics.cpuUsage || 0,
        performanceMetrics.memoryUsage || 0,
        45
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: {
            family: 'Yandex Sans Display'
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--primary-bg)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-primary)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'var(--border-secondary)' }
      },
      y: {
        ticks: { color: 'var(--text-secondary)' },
        grid: { color: 'var(--border-secondary)' }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card header="Real-Time Controls" animation="fade-in-up" delay={0.1}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <Badge variant={isConnected ? 'success' : 'danger'}>
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant={showLiveData ? 'primary' : 'secondary'}
              icon={showLiveData ? Eye : EyeOff}
              onClick={toggleLiveData}
            >
              {showLiveData ? 'Live Data' : 'Paused'}
            </Button>
            
            <Button
              size="sm"
              variant={autoRefresh ? 'primary' : 'secondary'}
              icon={Activity}
              onClick={toggleAutoRefresh}
            >
              Auto Refresh
            </Button>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card header="Active Users" animation="fade-in-up" delay={0.2}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {activeUsers.toLocaleString()}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Users className="h-4 w-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Currently online
              </span>
            </div>
          </div>
        </Card>
        
        <Card header="Response Time" animation="fade-in-up" delay={0.3}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#10b981' }}>
              {performanceMetrics.responseTime || 0}ms
            </div>
            <div className="flex items-center justify-center mt-2">
              <Zap className="h-4 w-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Average
              </span>
            </div>
          </div>
        </Card>
        
        <Card header="Uptime" animation="fade-in-up" delay={0.4}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
              {performanceMetrics.uptime || 99.99}%
            </div>
            <div className="flex items-center justify-center mt-2">
              <CheckCircle className="h-4 w-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                System health
              </span>
            </div>
          </div>
        </Card>
        
        <Card header="Threats Blocked" animation="fade-in-up" delay={0.5}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>
              {trafficData.reduce((acc, d) => acc + d.threats, 0).toLocaleString()}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Shield className="h-4 w-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                This session
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card header="Real-Time Traffic" animation="fade-in-up" delay={0.6}>
          <div className="h-80">
            <Line data={trafficChartData} options={chartOptions} ref={(ref) => chartRefs.current.traffic = ref} />
          </div>
        </Card>
        
        {/* Threats Distribution */}
        <Card header="Threat Distribution" animation="fade-in-up" delay={0.7}>
          <div className="h-80">
            <Doughnut data={threatsChartData} options={chartOptions} ref={(ref) => chartRefs.current.threats = ref} />
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card header="System Performance" animation="fade-in-up" delay={0.8}>
        <div className="h-80">
          <Bar data={performanceChartData} options={chartOptions} ref={(ref) => chartRefs.current.performance = ref} />
        </div>
      </Card>

      {/* Live Security Alerts */}
      <Card header="Live Security Alerts" animation="fade-in-up" delay={0.9}>
        <div className="space-y-3">
          <AnimatePresence>
            {securityAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--primary-bg)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    {alert.type === 'threat' && <AlertTriangle className="h-4 w-4" style={{ color: '#ef4444' }} />}
                    {alert.type === 'bot' && <Bot className="h-4 w-4" style={{ color: '#f59e0b' }} />}
                    {alert.type === 'security' && <Shield className="h-4 w-4" style={{ color: '#3b82f6' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {alert.message}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {alert.time}
                    </p>
                  </div>
                </div>
                <Badge variant={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}>
                  {alert.severity}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {securityAlerts.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <p>No security alerts at the moment</p>
              <p className="text-sm">All systems are operating normally</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default RealTimeDashboard
