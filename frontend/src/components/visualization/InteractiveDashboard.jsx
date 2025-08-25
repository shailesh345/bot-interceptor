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
  WifiOff,
  Layout,
  Move,
  GripVertical,
  X
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
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'

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

const InteractiveDashboard = () => {
  const [widgets, setWidgets] = useState([])
  const [availableWidgets, setAvailableWidgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [realTimeMode, setRealTimeMode] = useState(false)
  const [selectedLayout, setSelectedLayout] = useState('grid')
  const [showWidgetSelector, setShowWidgetSelector] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState(null)
  const dashboardRef = useRef(null)

  // Mock widget data
  const mockWidgets = [
    {
      id: 1,
      type: 'metric',
      title: 'Total Requests',
      value: '2.4M',
      change: '+12.5%',
      trend: 'up',
      color: 'blue',
      size: 'small',
      position: { x: 0, y: 0 }
    },
    {
      id: 2,
      type: 'metric',
      title: 'Active Users',
      value: '45.2K',
      change: '+8.3%',
      trend: 'up',
      color: 'green',
      size: 'small',
      position: { x: 1, y: 0 }
    },
    {
      id: 3,
      type: 'metric',
      title: 'Error Rate',
      value: '0.8%',
      change: '-2.1%',
      trend: 'down',
      color: 'red',
      size: 'small',
      position: { x: 2, y: 0 }
    },
    {
      id: 4,
      type: 'metric',
      title: 'Response Time',
      value: '245ms',
      change: '-15.2%',
      trend: 'down',
      color: 'orange',
      size: 'small',
      position: { x: 3, y: 0 }
    },
    {
      id: 5,
      type: 'chart',
      title: 'Traffic Overview',
      chartType: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [{
          label: 'Requests',
          data: [1200, 800, 1500, 2200, 2800, 3200, 1800],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        }]
      },
      size: 'medium',
      position: { x: 0, y: 1 }
    },
    {
      id: 6,
      type: 'chart',
      title: 'Security Events',
      chartType: 'doughnut',
      data: {
        labels: ['DDoS', 'SQL Injection', 'XSS', 'Brute Force'],
        datasets: [{
          data: [45, 23, 67, 34],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ]
        }]
      },
      size: 'small',
      position: { x: 2, y: 1 }
    },
    {
      id: 7,
      type: 'chart',
      title: 'Performance Metrics',
      chartType: 'radar',
      data: {
        labels: ['Response Time', 'Throughput', 'Error Rate', 'CPU Usage'],
        datasets: [{
          label: 'Current',
          data: [85, 92, 78, 65],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)'
        }]
      },
      size: 'medium',
      position: { x: 0, y: 2 }
    },
    {
      id: 8,
      type: 'list',
      title: 'Recent Alerts',
      items: [
        { id: 1, type: 'warning', message: 'High CPU usage detected', time: '2 min ago' },
        { id: 2, type: 'error', message: 'Database connection failed', time: '5 min ago' },
        { id: 3, type: 'info', message: 'New user registration', time: '8 min ago' }
      ],
      size: 'small',
      position: { x: 2, y: 2 }
    }
  ]

  const mockAvailableWidgets = [
    {
      id: 'metric',
      name: 'Metric Card',
      description: 'Display key performance indicators',
      icon: Target,
      category: 'metrics'
    },
    {
      id: 'line-chart',
      name: 'Line Chart',
      description: 'Time-series data visualization',
      icon: LineChart,
      category: 'charts'
    },
    {
      id: 'bar-chart',
      name: 'Bar Chart',
      description: 'Categorical data comparison',
      icon: BarChart3,
      category: 'charts'
    },
    {
      id: 'pie-chart',
      name: 'Pie Chart',
      description: 'Proportional data representation',
      icon: PieChart,
      category: 'charts'
    },
    {
      id: 'activity-feed',
      name: 'Activity Feed',
      description: 'Real-time activity updates',
      icon: Activity,
      category: 'feeds'
    },
    {
      id: 'alert-list',
      name: 'Alert List',
      description: 'System alerts and notifications',
      icon: AlertTriangle,
      category: 'feeds'
    }
  ]

  useEffect(() => {
    loadDashboard()
    if (realTimeMode) {
      const interval = setInterval(updateRealTimeData, 5000)
      return () => clearInterval(interval)
    }
  }, [realTimeMode])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWidgets(mockWidgets)
      setAvailableWidgets(mockAvailableWidgets)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateRealTimeData = () => {
    setWidgets(prev => prev.map(widget => {
      if (widget.type === 'metric') {
        return {
          ...widget,
          value: Math.floor(Math.random() * 1000) + 'K',
          change: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 20).toFixed(1) + '%'
        }
      }
      return widget
    }))
  }

  const addWidget = (widgetType) => {
    const newWidget = {
      id: Date.now(),
      type: widgetType,
      title: `New ${widgetType} Widget`,
      size: 'small',
      position: { x: 0, y: widgets.length }
    }
    setWidgets(prev => [...prev, newWidget])
    setShowWidgetSelector(false)
    toast.success('Widget added successfully!')
  }

  const removeWidget = (widgetId) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId))
    toast.success('Widget removed successfully!')
  }

  const updateWidgetPosition = (widgetId, newPosition) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    ))
  }

  const handleDragStart = (e, widget) => {
    setDraggedWidget(widget)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetPosition) => {
    e.preventDefault()
    if (draggedWidget) {
      updateWidgetPosition(draggedWidget.id, targetPosition)
      setDraggedWidget(null)
    }
  }

  const exportDashboard = () => {
    const dashboardData = {
      widgets: widgets,
      layout: selectedLayout,
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'dashboard-config.json'
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Dashboard exported successfully!')
  }

  const renderMetricWidget = (widget) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${widget.size === 'large' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
        {editMode && (
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{widget.value}</p>
          <div className="flex items-center mt-1">
            {widget.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${widget.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {widget.change}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderChartWidget = (widget) => {
    const ChartComponent = {
      line: Line,
      bar: Bar,
      doughnut: Doughnut,
      radar: Radar
    }[widget.chartType]

    if (!ChartComponent) return null

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 10
          }
        }
      }
    }

    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${widget.size === 'large' ? 'col-span-2' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
          {editMode && (
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1 text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="h-48">
          <ChartComponent data={widget.data} options={chartOptions} />
        </div>
      </div>
    )
  }

  const renderListWidget = (widget) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${widget.size === 'large' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
        {editMode && (
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {widget.items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              {item.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />}
              {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />}
              {item.type === 'info' && <Info className="w-4 h-4 text-blue-600 mr-2" />}
              <span className="text-sm text-gray-700">{item.message}</span>
            </div>
            <span className="text-xs text-gray-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'metric':
        return renderMetricWidget(widget)
      case 'chart':
        return renderChartWidget(widget)
      case 'list':
        return renderListWidget(widget)
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interactive Dashboard</h1>
          <p className="text-gray-600">Customizable widgets and real-time data visualization</p>
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
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
              editMode 
                ? 'text-white bg-blue-600 hover:bg-blue-700' 
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>{editMode ? 'Done' : 'Edit'}</span>
          </button>
          <button
            onClick={() => setShowWidgetSelector(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Widget</span>
          </button>
          <button
            onClick={exportDashboard}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div 
        ref={dashboardRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, { x: 0, y: 0 })}
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          widgets.map((widget) => (
            <div
              key={widget.id}
              className={`${widget.size === 'large' ? 'lg:col-span-2' : ''}`}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.position)}
            >
              {editMode && (
                <div className="flex items-center justify-center mb-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              )}
              {renderWidget(widget)}
            </div>
          ))
        )}
      </div>

      {/* Widget Selector Modal */}
      {showWidgetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Widget</h3>
              <button
                onClick={() => setShowWidgetSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <widget.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{widget.name}</h4>
                      <p className="text-xs text-gray-500">{widget.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveDashboard
