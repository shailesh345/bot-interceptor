import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Settings,
  Download,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Clock,
  Target,
  Activity,
  Zap,
  Shield,
  Globe,
  Users,
  DollarSign
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar, Scatter, Bubble } from 'react-chartjs-2'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AdvancedCharts = ({
  title = 'Advanced Chart',
  data = {},
  type = 'line',
  options = {},
  height = 400,
  showControls = true,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAxis = true,
  responsive = true,
  maintainAspectRatio = false,
  className = '',
  onChartClick,
  onDataPointClick,
  onLegendClick,
  refreshData,
  exportData,
  customizeChart
}) => {
  const [chartType, setChartType] = useState(type)
  const [chartData, setChartData] = useState(data)
  const [chartOptions, setChartOptions] = useState(options)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [hiddenDatasets, setHiddenDatasets] = useState(new Set())
  
  const chartRef = useRef(null)
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    setChartData(data)
    setChartOptions(options)
  }, [data, options])

  useEffect(() => {
    if (autoRefresh && refreshData) {
      refreshTimerRef.current = setInterval(() => {
        refreshData()
      }, refreshInterval * 1000)
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, refreshData])

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
    { value: 'doughnut', label: 'Doughnut Chart', icon: PieChart, description: 'Show proportions' },
    { value: 'radar', label: 'Radar Chart', icon: Target, description: 'Multi-dimensional data' },
    { value: 'scatter', label: 'Scatter Plot', icon: Activity, description: 'Correlation analysis' },
    { value: 'bubble', label: 'Bubble Chart', icon: Globe, description: 'Three-dimensional data' }
  ]

  const defaultOptions = {
    responsive,
    maintainAspectRatio,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: { family: 'Yandex Sans Display' },
          usePointStyle: true,
          padding: 20
        },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex
          const newHidden = new Set(hiddenDatasets)
          
          if (newHidden.has(index)) {
            newHidden.delete(index)
          } else {
            newHidden.add(index)
          }
          
          setHiddenDatasets(newHidden)
          onLegendClick?.(index, !newHidden.has(index))
        }
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: 'var(--primary-bg)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-primary)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => `${context.dataset.label}: ${context.parsed.y || context.parsed.r || context.parsed.x}`
        }
      }
    },
    scales: showAxis ? {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'var(--border-secondary)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { family: 'Yandex Sans Display' }
        }
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          color: 'var(--border-secondary)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: { family: 'Yandex Sans Display' }
        }
      }
    } : {},
    elements: {
      point: {
        hoverRadius: 6,
        radius: 4
      },
      line: {
        tension: 0.4
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0]
        onDataPointClick?.(element.datasetIndex, element.index, chartData)
      }
      onChartClick?.(event, elements, chartData)
    }
  }

  const mergedOptions = { ...defaultOptions, ...chartOptions }

  const renderChart = () => {
    const filteredData = {
      ...chartData,
      datasets: chartData.datasets?.filter((_, index) => !hiddenDatasets.has(index)) || []
    }

    switch (chartType) {
      case 'line':
        return <Line ref={chartRef} data={filteredData} options={mergedOptions} />
      case 'bar':
        return <Bar ref={chartRef} data={filteredData} options={mergedOptions} />
      case 'doughnut':
        return <Doughnut ref={chartRef} data={filteredData} options={mergedOptions} />
      case 'radar':
        return <Radar ref={chartRef} data={filteredData} options={mergedOptions} />
      case 'scatter':
        return <Scatter ref={chartRef} data={filteredData} options={mergedOptions} />
      case 'bubble':
        return <Bubble ref={chartRef} data={filteredData} options={mergedOptions} />
      default:
        return <Line ref={chartRef} data={filteredData} options={mergedOptions} />
    }
  }

  const handleExport = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas
      const link = document.createElement('a')
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    exportData?.(chartData)
  }

  const handleRefresh = () => {
    if (refreshData) {
      refreshData()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleDataset = (index) => {
    const newHidden = new Set(hiddenDatasets)
    if (newHidden.has(index)) {
      newHidden.delete(index)
    } else {
      newHidden.add(index)
    }
    setHiddenDatasets(newHidden)
  }

  const getChartIcon = (type) => {
    const chartType = chartTypes.find(ct => ct.value === type)
    return chartType?.icon || LineChart
  }

  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full h-full max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--primary-bg)' }}
        >
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <getChartIcon chartType={chartType} className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {title} - Fullscreen View
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                icon={Download}
                onClick={handleExport}
                title="Export Chart"
              />
              <Button
                size="sm"
                variant="ghost"
                icon={RefreshCw}
                onClick={handleRefresh}
                title="Refresh Data"
              />
              <Button
                size="sm"
                variant="ghost"
                icon={Maximize2}
                onClick={toggleFullscreen}
                title="Exit Fullscreen"
              />
            </div>
          </div>

          {/* Fullscreen Chart */}
          <div className="p-6 h-full overflow-auto">
            <div style={{ height: 'calc(100vh - 200px)' }}>
              {renderChart()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <Card 
      header={title}
      animation="fade-in-up"
      className={className}
    >
      {/* Chart Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <div className="flex items-center space-x-3">
            {/* Chart Type Selector */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              {chartTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Dataset Toggles */}
            {chartData.datasets && (
              <div className="flex items-center space-x-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Datasets:</span>
                {chartData.datasets.map((dataset, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDataset(index)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      hiddenDatasets.has(index) 
                        ? 'opacity-50 line-through' 
                        : 'opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: dataset.backgroundColor || 'var(--accent-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {dataset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-refresh Controls */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Auto-refresh</span>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="px-2 py-1 rounded border text-xs"
                  style={{ 
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--primary-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>

            {/* Action Buttons */}
            <Button
              size="sm"
              variant="ghost"
              icon={Settings}
              onClick={() => setShowSettings(!showSettings)}
              title="Chart Settings"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              onClick={handleRefresh}
              title="Refresh Data"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={Download}
              onClick={handleExport}
              title="Export Chart"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={Maximize2}
              onClick={toggleFullscreen}
              title="Fullscreen View"
            />
          </div>
        </div>
      )}

      {/* Chart Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-lg border"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--accent-bg)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Show Legend
                </label>
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setChartOptions(prev => ({ ...prev, plugins: { ...prev.plugins, legend: { ...prev.plugins?.legend, display: e.target.checked } } }))}
                  className="rounded border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Show Tooltip
                </label>
                <input
                  type="checkbox"
                  checked={showTooltip}
                  onChange={(e) => setChartOptions(prev => ({ ...prev, plugins: { ...prev.plugins, tooltip: { ...prev.plugins?.tooltip, enabled: e.target.checked } } }))}
                  className="rounded border-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Show Grid
                </label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setChartOptions(prev => ({ 
                    ...prev, 
                    scales: { 
                      ...prev.scales, 
                      x: { ...prev.scales?.x, grid: { ...prev.scales?.x?.grid, display: e.target.checked } },
                      y: { ...prev.scales?.y, grid: { ...prev.scales?.y?.grid, display: e.target.checked } }
                    } 
                  }))}
                  className="rounded border-gray-300"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ height, position: 'relative' }}>
        {renderChart()}
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span style={{ color: 'var(--text-secondary)' }}>
              Type: {chartTypes.find(ct => ct.value === chartType)?.label}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Datasets: {chartData.datasets?.length || 0}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Points: {chartData.labels?.length || 0}
            </span>
          </div>
          
          {autoRefresh && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ color: 'var(--text-secondary)' }}>
                Auto-refresh: {refreshInterval}s
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AdvancedCharts
