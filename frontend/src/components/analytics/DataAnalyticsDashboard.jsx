import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  Target,
  Globe,
  Users,
  DollarSign,
  Shield,
  Zap,
  Brain,
  Filter,
  Download,
  Share2,
  Settings,
  RefreshCw,
  Eye,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Award,
  Lightbulb,
  Rocket,
  Sparkles
} from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'

const DataAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'traffic', 'conversion'])
  const [timeRange, setTimeRange] = useState('30d')
  const [chartConfigs, setChartConfigs] = useState({})
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedCharts, setExpandedCharts] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadAnalyticsData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for analytics data
      const [timeSeriesData, summaryData, chartData] = await Promise.all([
        generateTimeSeriesData(),
        generateSummaryData(),
        generateChartData()
      ])
      
      setAnalyticsData({
        timeSeries: timeSeriesData,
        summary: summaryData,
        charts: chartData
      })
      
      // Initialize chart configurations
      initializeChartConfigs(chartData)
      
    } catch (error) {
      // console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadAnalyticsData()
    }, 98890) // Refresh every 30 seconds
  }

  const generateTimeSeriesData = async () => {
    const now = new Date()
    const data = []
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 100000,
        traffic: Math.floor(Math.random() * 100000) + 500000,
        conversion: (Math.random() * 8 + 2).toFixed(2),
        customers: Math.floor(Math.random() * 1000) + 5000,
        orders: Math.floor(Math.random() * 5000) + 10000,
        avgOrderValue: Math.floor(Math.random() * 50) + 100,
        churnRate: (Math.random() * 5 + 1).toFixed(2),
        customerLifetimeValue: Math.floor(Math.random() * 200) + 800,
        acquisitionCost: Math.floor(Math.random() * 30) + 50,
        retentionRate: (Math.random() * 10 + 85).toFixed(1)
      })
    }
    
    return data
  }

  const generateSummaryData = async () => {
    return {
      totalRevenue: '$8.2M',
      totalTraffic: '45.2M',
      avgConversion: '4.8%',
      totalCustomers: '125K',
      totalOrders: '342K',
      avgOrderValue: '$124',
      churnRate: '2.3%',
      customerLifetimeValue: '$1,247',
      acquisitionCost: '$67',
      retentionRate: '91.2%'
    }
  }

  const generateChartData = async () => {
    const now = new Date()
    const labels = []
    const revenueData = []
    const trafficData = []
    const conversionData = []
    const customerData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      revenueData.push(Math.floor(Math.random() * 50000) + 100000)
      trafficData.push(Math.floor(Math.random() * 100000) + 500000)
      conversionData.push(Math.random() * 8 + 2)
      customerData.push(Math.floor(Math.random() * 1000) + 5000)
    }

    return {
      revenueChart: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      trafficChart: {
        labels,
        datasets: [
          {
            label: 'Traffic',
            data: trafficData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      conversionChart: {
        labels,
        datasets: [
          {
            label: 'Conversion Rate',
            data: conversionData,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      customerChart: {
        labels,
        datasets: [
          {
            label: 'New Customers',
            data: customerData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      comparisonChart: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Traffic',
            data: trafficData.map(v => v / 1000),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      distributionChart: {
        labels: ['Direct', 'Organic', 'Paid', 'Social', 'Referral'],
        datasets: [{
          data: [35, 28, 22, 10, 5],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444'
          ]
        }]
      },
      performanceChart: {
        labels: ['Response Time', 'Uptime', 'Throughput', 'Error Rate', 'Cache Hit Rate'],
        datasets: [{
          label: 'Performance Metrics',
          data: [85, 95, 88, 92, 78],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2
        }]
      }
    }
  }

  const initializeChartConfigs = (chartData) => {
    const configs = {}
    Object.keys(chartData).forEach(chartKey => {
      configs[chartKey] = {
        type: chartKey.includes('Chart') ? 'line' : 'doughnut',
        height: 400,
        showControls: true,
        showLegend: true,
        showTooltip: true,
        showGrid: true,
        showAxis: true
      }
    })
    setChartConfigs(configs)
  }

  const toggleChartExpansion = (chartKey) => {
    const newExpanded = new Set(expandedCharts)
    if (newExpanded.has(chartKey)) {
      newExpanded.delete(chartKey)
    } else {
      newExpanded.add(chartKey)
    }
    setExpandedCharts(newExpanded)
  }

  const handleChartRefresh = (chartKey) => {
    loadAnalyticsData()
  }

  const handleChartExport = (chartKey, data) => {
    // console.log(`Exporting ${chartKey}:`, data)
    // In real implementation, this would trigger export functionality
  }

  const handleChartClick = (event, elements, data) => {
    // console.log('Chart clicked:', { event, elements, data })
  }

  const handleDataPointClick = (datasetIndex, index, data) => {
    // console.log('Data point clicked:', { datasetIndex, index, data })
  }

  const handleLegendClick = (index, visible) => {
    // console.log('Legend clicked:', { index, visible })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading data analytics..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Data Analytics Dashboard
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Advanced data visualization and analytics insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 180 Days</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Auto-refresh</span>
          </div>
          
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={loadAnalyticsData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Total Revenue"
          icon={DollarSign}
          variant="success"
          metrics={[
            {
              label: 'Current Period',
              value: analyticsData?.summary.totalRevenue || '$0',
              change: 14.3,
              icon: DollarSign
            }
          ]}
          trend={14.3}
          status="growing"
          expandable={true}
          onRefresh={() => loadAnalyticsData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {analyticsData?.summary.totalRevenue || '$0'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>+14.3%</span>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Total Traffic"
          icon={Globe}
          variant="highlight"
          metrics={[
            {
              label: 'Current Period',
              value: analyticsData?.summary.totalTraffic || '0',
              change: 8.7,
              icon: Globe
            }
          ]}
          trend={8.7}
          status="growing"
          expandable={true}
          onRefresh={() => loadAnalyticsData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {analyticsData?.summary.totalTraffic || '0'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#3b82f6' }} />
              <span className="text-sm" style={{ color: '#3b82f6' }}>+8.7%</span>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Conversion Rate"
          icon={Target}
          variant="warning"
          metrics={[
            {
              label: 'Current Period',
              value: analyticsData?.summary.avgConversion || '0%',
              change: 12.5,
              icon: Target
            }
          ]}
          trend={12.5}
          status="improving"
          expandable={true}
          onRefresh={() => loadAnalyticsData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {analyticsData?.summary.avgConversion || '0%'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#f59e0b' }} />
              <span className="text-sm" style={{ color: '#f59e0b' }}>+12.5%</span>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Total Customers"
          icon={Users}
          variant="accent"
          metrics={[
            {
              label: 'Current Period',
              value: analyticsData?.summary.totalCustomers || '0',
              change: 6.2,
              icon: Users
            }
          ]}
          trend={6.2}
          status="growing"
          expandable={true}
          onRefresh={() => loadAnalyticsData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {analyticsData?.summary.totalCustomers || '0'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#8b5cf6' }} />
              <span className="text-sm" style={{ color: '#8b5cf6' }}>+6.2%</span>
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Advanced Charts Section */}
      <div className="space-y-6">
        {/* Revenue Analysis */}
        <DashboardWidget
          title="Revenue Analysis"
          icon={DollarSign}
          variant="success"
          expandable={true}
          onRefresh={() => handleChartRefresh('revenueChart')}
        >
          <AdvancedCharts
            title="Revenue Trends"
            data={analyticsData?.charts.revenueChart}
            type="line"
            height={400}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            onChartClick={handleChartClick}
            onDataPointClick={handleDataPointClick}
            onLegendClick={handleLegendClick}
            refreshData={() => handleChartRefresh('revenueChart')}
            exportData={(data) => handleChartExport('revenueChart', data)}
          />
        </DashboardWidget>

        {/* Traffic Analysis */}
        <DashboardWidget
          title="Traffic Analysis"
          icon={Globe}
          variant="highlight"
          expandable={true}
          onRefresh={() => handleChartRefresh('trafficChart')}
        >
          <AdvancedCharts
            title="Traffic Trends"
            data={analyticsData?.charts.trafficChart}
            type="line"
            height={400}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            onChartClick={handleChartClick}
            onDataPointClick={handleDataPointClick}
            onLegendClick={handleLegendClick}
            refreshData={() => handleChartRefresh('trafficChart')}
            exportData={(data) => handleChartExport('trafficChart', data)}
          />
        </DashboardWidget>

        {/* Conversion Analysis */}
        <DashboardWidget
          title="Conversion Analysis"
          icon={Target}
          variant="warning"
          expandable={true}
          onRefresh={() => handleChartRefresh('conversionChart')}
        >
          <AdvancedCharts
            title="Conversion Rate Trends"
            data={analyticsData?.charts.conversionChart}
            type="line"
            height={400}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            onChartClick={handleChartClick}
            onDataPointClick={handleDataPointClick}
            onLegendClick={handleLegendClick}
            refreshData={() => handleChartRefresh('conversionChart')}
            exportData={(data) => handleChartExport('conversionChart', data)}
          />
        </DashboardWidget>

        {/* Customer Analysis */}
        <DashboardWidget
          title="Customer Analysis"
          icon={Users}
          variant="accent"
          expandable={true}
          onRefresh={() => handleChartRefresh('customerChart')}
        >
          <AdvancedCharts
            title="New Customer Trends"
            data={analyticsData?.charts.customerChart}
            type="line"
            height={400}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            onChartClick={handleChartClick}
            onDataPointClick={handleDataPointClick}
            onLegendClick={handleLegendClick}
            refreshData={() => handleChartRefresh('customerChart')}
            exportData={(data) => handleChartExport('customerChart', data)}
          />
        </DashboardWidget>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Traffic Comparison */}
          <DashboardWidget
            title="Revenue vs Traffic Comparison"
            icon={BarChart3}
            variant="default"
            expandable={true}
            onRefresh={() => handleChartRefresh('comparisonChart')}
          >
            <AdvancedCharts
              title="Revenue vs Traffic"
              data={analyticsData?.charts.comparisonChart}
              type="line"
              height={350}
              showControls={true}
              showLegend={true}
              showTooltip={true}
              showGrid={true}
              showAxis={true}
              onChartClick={handleChartClick}
              onDataPointClick={handleDataPointClick}
              onLegendClick={handleLegendClick}
              refreshData={() => handleChartRefresh('comparisonChart')}
              exportData={(data) => handleChartExport('comparisonChart', data)}
            />
          </DashboardWidget>

          {/* Traffic Source Distribution */}
          <DashboardWidget
            title="Traffic Source Distribution"
            icon={PieChart}
            variant="default"
            expandable={true}
            onRefresh={() => handleChartRefresh('distributionChart')}
          >
            <AdvancedCharts
              title="Traffic Sources"
              data={analyticsData?.charts.distributionChart}
              type="doughnut"
              height={350}
              showControls={true}
              showLegend={true}
              showTooltip={true}
              showGrid={false}
              showAxis={false}
              onChartClick={handleChartClick}
              onDataPointClick={handleDataPointClick}
              onLegendClick={handleLegendClick}
              refreshData={() => handleChartRefresh('distributionChart')}
              exportData={(data) => handleChartExport('distributionChart', data)}
            />
          </DashboardWidget>
        </div>

        {/* Performance Metrics */}
        <DashboardWidget
          title="Performance Metrics"
          icon={Activity}
          variant="success"
          expandable={true}
          onRefresh={() => handleChartRefresh('performanceChart')}
        >
          <AdvancedCharts
            title="System Performance"
            data={analyticsData?.charts.performanceChart}
            type="radar"
            height={400}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            onChartClick={handleChartClick}
            onDataPointClick={handleDataPointClick}
            onLegendClick={handleLegendClick}
            refreshData={() => handleChartRefresh('performanceChart')}
            exportData={(data) => handleChartExport('performanceChart', data)}
          />
        </DashboardWidget>
      </div>

      {/* Analytics Summary */}
      <Card header="Analytics Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Data Points
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {analyticsData?.timeSeries?.length || 0} data points analyzed
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Metrics Tracked
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {Object.keys(analyticsData?.summary || {}).length} key metrics
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <BarChart3 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Chart Types
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {Object.keys(analyticsData?.charts || {}).length} chart types
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DataAnalyticsDashboard
