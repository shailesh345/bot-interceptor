import React, { useState, useEffect, useRef } from 'react'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Eye,
  EyeOff,
  Download,
  Share2,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Calendar,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Globe,
  Users,
  Shield,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
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
  Filler,
  RadialLinearScale
} from 'chart.js'
import { Line, Bar, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2'

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
  Filler,
  RadialLinearScale
)

const AdvancedDataVisualization = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [realTimeMode, setRealTimeMode] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [chartData, setChartData] = useState({})
  const [filters, setFilters] = useState({})
  const [fullscreenChart, setFullscreenChart] = useState(null)
  const chartRefs = useRef({})

  // Mock data for different chart types
  const mockData = {
    trafficFlow: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      datasets: [
        {
          label: 'Legitimate Traffic',
          data: [1200, 800, 1500, 2200, 2800, 3200, 1800],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Bot Traffic',
          data: [300, 200, 500, 800, 1200, 1500, 600],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    securityEvents: {
      labels: ['DDoS', 'SQL Injection', 'XSS', 'Brute Force', 'API Abuse', 'Scraping'],
      datasets: [{
        data: [45, 23, 67, 34, 89, 56],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    performanceMetrics: {
      labels: ['Response Time', 'Throughput', 'Error Rate', 'CPU Usage', 'Memory Usage', 'Network I/O'],
      datasets: [{
        label: 'Current',
        data: [85, 92, 78, 65, 88, 95],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }, {
        label: 'Target',
        data: [90, 95, 85, 70, 90, 98],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }]
    },
    geographicDistribution: {
      labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
      datasets: [{
        data: [35, 28, 22, 8, 4, 3],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    realTimeMetrics: {
      labels: Array.from({length: 20}, (_, i) => i),
      datasets: [{
        label: 'Requests/sec',
        data: Array.from({length: 20}, () => Math.random() * 100 + 50),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }
  }

  useEffect(() => {
    loadChartData()
    if (realTimeMode) {
      const interval = setInterval(updateRealTimeData, 2000)
      return () => clearInterval(interval)
    }
  }, [realTimeMode, selectedTimeRange])

  const loadChartData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setChartData(mockData)
    } catch (error) {
      toast.error('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const updateRealTimeData = () => {
    setChartData(prev => ({
      ...prev,
      realTimeMetrics: {
        ...prev.realTimeMetrics,
        datasets: [{
          ...prev.realTimeMetrics.datasets[0],
          data: Array.from({length: 20}, () => Math.random() * 100 + 50)
        }]
      }
    }))
  }

  const exportChart = (chartType) => {
    const canvas = chartRefs.current[chartType]?.canvas
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${chartType}-chart.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success(`${chartType} chart exported successfully!`)
    }
  }

  const shareChart = (chartType) => {
    navigator.clipboard.writeText(`${window.location.origin}/charts/${chartType}`)
    toast.success('Chart link copied to clipboard!')
  }

  const toggleFullscreen = (chartType) => {
    setFullscreenChart(fullscreenChart === chartType ? null : chartType)
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  }

  const renderChart = (chartType, data, options = chartOptions) => {
    const ChartComponent = {
      line: Line,
      bar: Bar,
      doughnut: Doughnut,
      radar: Radar,
      scatter: Scatter,
      bubble: Bubble
    }[chartType]

    if (!ChartComponent) return null

    return (
      <div className="relative h-80">
        <ChartComponent
          ref={(ref) => chartRefs.current[chartType] = ref}
          data={data}
          options={options}
        />
      </div>
    )
  }

  const renderFullscreenChart = () => {
    if (!fullscreenChart) return null

    const chartData = mockData[fullscreenChart]
    if (!chartData) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-11/12 h-5/6 max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {fullscreenChart.replace(/([A-Z])/g, ' $1').trim()} Chart
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportChart(fullscreenChart)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => shareChart(fullscreenChart)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFullscreen(fullscreenChart)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-full">
            {renderChart('line', chartData)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Data Visualization</h1>
          <p className="text-gray-600">Interactive charts, real-time data, and comprehensive analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
              realTimeMode 
                ? 'text-white bg-green-600 hover:bg-green-700' 
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {realTimeMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{realTimeMode ? 'Live' : 'Static'}</span>
          </button>
          <button
            onClick={loadChartData}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={realTimeMode ? 'success' : 'info'} size="sm">
              {realTimeMode ? 'Live Data' : 'Historical Data'}
            </Badge>
            <Badge variant="info" size="sm">
              {selectedTimeRange}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('traffic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'traffic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Traffic Analysis
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security Metrics
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Flow Chart */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Traffic Flow</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('line', chartData.trafficFlow)}
                  </div>

                  {/* Security Events Chart */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('securityEvents')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('securityEvents')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('doughnut', chartData.securityEvents)}
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('radar', chartData.performanceMetrics, radarOptions)}
                  </div>

                  {/* Geographic Distribution */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('geographicDistribution')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('geographicDistribution')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('doughnut', chartData.geographicDistribution)}
                  </div>
                </div>
              )}

              {/* Traffic Analysis Tab */}
              {activeTab === 'traffic' && (
                <div className="space-y-6">
                  {/* Real-time Traffic Metrics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Real-time Traffic Metrics</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success" size="sm">Live</Badge>
                        <button
                          onClick={() => exportChart('realTimeMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('realTimeMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('line', chartData.realTimeMetrics)}
                  </div>

                  {/* Traffic Flow Bar Chart */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Traffic Flow (Bar Chart)</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('bar', chartData.trafficFlow)}
                  </div>
                </div>
              )}

              {/* Security Metrics Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Security Events Distribution */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Security Events Distribution</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('securityEvents')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('securityEvents')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('doughnut', chartData.securityEvents)}
                  </div>

                  {/* Security Performance Radar */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Security Performance</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('radar', chartData.performanceMetrics, radarOptions)}
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Metrics Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Metrics Overview</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('performanceMetrics')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('radar', chartData.performanceMetrics, radarOptions)}
                  </div>

                  {/* Performance Trends */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => exportChart('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFullscreen('trafficFlow')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {renderChart('line', chartData.trafficFlow)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Chart Modal */}
      {renderFullscreenChart()}
    </div>
  )
}

export default AdvancedDataVisualization
