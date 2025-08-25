import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  Zap,
  Shield,
  Globe,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  Share2,
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
  Sparkles,
  Cpu,
  Database,
  Network,
  Bot,
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  RotateCcw,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const PredictiveAnalyticsEngine = () => {
  const [predictiveData, setPredictiveData] = useState(null)
  const [forecasts, setForecasts] = useState([])
  const [trends, setTrends] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedForecast, setSelectedForecast] = useState(null)
  const [predictionHorizon, setPredictionHorizon] = useState('30d')
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadPredictiveData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [predictionHorizon, confidenceLevel])

  const loadPredictiveData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for predictive analytics data
      const [forecastsData, trendsData, anomaliesData, analyticsData] = await Promise.all([
        generateForecastsData(),
        generateTrendsData(),
        generateAnomaliesData(),
        generateAnalyticsData()
      ])
      
      setForecasts(forecastsData)
      setTrends(trendsData)
      setAnomalies(anomaliesData)
      
      setPredictiveData({
        forecasts: forecastsData,
        trends: trendsData,
        anomalies: anomaliesData,
        analytics: analyticsData
      })
      
    } catch (error) {
      console.error('Failed to load predictive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadPredictiveData()
    }, 120000) // Refresh every 2 minutes
  }

  // Mock data generators
  const generateForecastsData = async () => {
    const now = new Date()
    const forecasts = []
    
    // Revenue Forecast
    const revenueForecast = {
      id: 'rev-001',
      metric: 'Revenue',
      currentValue: '$2.4M',
      forecastedValue: '$2.8M',
      change: '+16.7%',
      confidence: 94.2,
      horizon: '30 days',
      algorithm: 'LSTM Neural Network',
      factors: ['Seasonal trends', 'Market growth', 'Customer acquisition'],
      riskFactors: ['Economic uncertainty', 'Competition'],
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'high_confidence',
      impact: 'critical'
    }
    
    // Traffic Forecast
    const trafficForecast = {
      id: 'traffic-001',
      metric: 'Website Traffic',
      currentValue: '45.2M',
      forecastedValue: '52.1M',
      change: '+15.3%',
      confidence: 91.8,
      horizon: '30 days',
      algorithm: 'Prophet Time Series',
      factors: ['SEO improvements', 'Marketing campaigns', 'Viral content'],
      riskFactors: ['Algorithm changes', 'Seasonal fluctuations'],
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'high_confidence',
      impact: 'high'
    }
    
    // Customer Forecast
    const customerForecast = {
      id: 'cust-001',
      metric: 'New Customers',
      currentValue: '12,847',
      forecastedValue: '14,892',
      change: '+15.9%',
      confidence: 88.5,
      horizon: '30 days',
      algorithm: 'Random Forest',
      factors: ['Conversion optimization', 'Referral programs', 'Brand awareness'],
      riskFactors: ['Market saturation', 'Customer churn'],
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'medium_confidence',
      impact: 'high'
    }
    
    // Conversion Forecast
    const conversionForecast = {
      id: 'conv-001',
      metric: 'Conversion Rate',
      currentValue: '4.2%',
      forecastedValue: '4.8%',
      change: '+14.3%',
      confidence: 92.1,
      horizon: '30 days',
      algorithm: 'Gradient Boosting',
      factors: ['UX improvements', 'A/B testing', 'Personalization'],
      riskFactors: ['User behavior changes', 'Technical issues'],
      lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'high_confidence',
      impact: 'medium'
    }
    
    return [revenueForecast, trafficForecast, customerForecast, conversionForecast]
  }

  const generateTrendsData = async () => {
    const now = new Date()
    const trends = []
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const baseRevenue = 100000 + Math.sin(i * 0.1) * 20000
      const seasonalFactor = 1 + 0.3 * Math.sin(i * 0.017) // Seasonal variation
      const trendFactor = 1 + i * 0.001 // Upward trend
      
      trends.push({
        id: `trend-${i}`,
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(baseRevenue * seasonalFactor * trendFactor),
        traffic: Math.floor((500000 + Math.sin(i * 0.05) * 100000) * trendFactor),
        conversion: (3 + Math.sin(i * 0.1) * 1.5 + i * 0.01).toFixed(2),
        customers: Math.floor((5000 + Math.sin(i * 0.08) * 1000) * trendFactor),
        seasonality: seasonalFactor,
        trend: trendFactor,
        confidence: (85 + Math.random() * 10).toFixed(1)
      })
    }
    
    return trends
  }

  const generateAnomaliesData = async () => {
    return [
      {
        id: 'anom-001',
        type: 'spike',
        metric: 'Traffic',
        severity: 'high',
        description: 'Unusual traffic spike detected - 3x normal volume',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        confidence: 96.8,
        impact: 'high',
        category: 'traffic',
        recommendation: 'Investigate traffic source and monitor for bot activity',
        status: 'investigating'
      },
      {
        id: 'anom-002',
        type: 'drop',
        metric: 'Conversion Rate',
        severity: 'medium',
        description: 'Conversion rate dropped by 25% from normal levels',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        confidence: 89.2,
        impact: 'medium',
        category: 'conversion',
        recommendation: 'Check for technical issues and review recent changes',
        status: 'resolved'
      },
      {
        id: 'anom-003',
        type: 'trend_shift',
        metric: 'Revenue',
        severity: 'critical',
        description: 'Revenue trend shifted from positive to negative growth',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        confidence: 94.5,
        impact: 'critical',
        category: 'revenue',
        recommendation: 'Immediate action required - review pricing and market conditions',
        status: 'active'
      }
    ]
  }

  const generateAnalyticsData = async () => {
    const now = new Date()
    const labels = []
    const actualData = []
    const predictedData = []
    const confidenceData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      const baseValue = 100000 + Math.sin(i * 0.1) * 20000
      actualData.push(Math.floor(baseValue))
      predictedData.push(Math.floor(baseValue * (1 + 0.1 * Math.sin(i * 0.2))))
      confidenceData.push(85 + Math.random() * 10)
    }

    return {
      forecastChart: {
        labels,
        datasets: [
          {
            label: 'Actual Values',
            data: actualData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: 'Predicted Values',
            data: predictedData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: false,
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      },
      confidenceChart: {
        labels,
        datasets: [{
          label: 'Prediction Confidence',
          data: confidenceData,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      trendAnalysis: {
        labels: ['Revenue', 'Traffic', 'Conversion', 'Customers'],
        datasets: [{
          label: 'Trend Strength',
          data: [85, 78, 92, 81],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)',
            'rgb(245, 158, 11)'
          ],
          borderWidth: 2
        }]
      }
    }
  }

  const getForecastStatusColor = (status) => {
    switch (status) {
      case 'high_confidence': return '#10b981'
      case 'medium_confidence': return '#f59e0b'
      case 'low_confidence': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getAnomalyTypeIcon = (type) => {
    switch (type) {
      case 'spike': return <TrendingUp className="h-5 w-5" />
      case 'drop': return <TrendingDown className="h-5 w-5" />
      case 'trend_shift': return <Target className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const handleForecastAction = (forecastId, action) => {
    console.log(`Forecast ${action}:`, forecastId)
    // In real implementation, this would trigger the appropriate action
  }

  const handleAnomalyAction = (anomalyId, action) => {
    console.log(`Anomaly ${action}:`, anomalyId)
    // In real implementation, this would trigger the appropriate action
  }

  const forecastColumns = [
    { key: 'metric', label: 'Metric', type: 'text', sortable: true },
    { key: 'currentValue', label: 'Current Value', type: 'text', sortable: true },
    { key: 'forecastedValue', label: 'Forecasted Value', type: 'text', sortable: true },
    { key: 'change', label: 'Change', type: 'badge', sortable: true },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'horizon', label: 'Horizon', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'impact', label: 'Impact', type: 'badge', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const anomalyColumns = [
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'metric', label: 'Metric', type: 'text', sortable: true },
    { key: 'severity', label: 'Severity', type: 'status', sortable: true },
    { key: 'description', label: 'Description', type: 'text', sortable: false },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'impact', label: 'Impact', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading predictive analytics..." />
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
            Predictive Analytics Engine
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI-powered forecasting, trend analysis, and anomaly detection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={predictionHorizon}
            onChange={(e) => setPredictionHorizon(e.target.value)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="180d">180 Days</option>
          </select>
          
          <select
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value={90}>90% Confidence</option>
            <option value={95}>95% Confidence</option>
            <option value={99}>99% Confidence</option>
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
            onClick={loadPredictiveData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Predictive Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Active Forecasts"
          icon={Target}
          variant="success"
          metrics={[
            {
              label: 'Total',
              value: forecasts.length.toString(),
              change: 0,
              icon: Target
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {forecasts.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active forecasts
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="High Confidence"
          icon={TrendingUp}
          variant="highlight"
          metrics={[
            {
              label: 'Forecasts',
              value: forecasts.filter(f => f.confidence >= 90).length.toString(),
              change: 12.5,
              icon: TrendingUp
            }
          ]}
          trend={12.5}
          status="growing"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {forecasts.filter(f => f.confidence >= 90).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              high confidence forecasts
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Anomalies Detected"
          icon={AlertTriangle}
          variant="warning"
          metrics={[
            {
              label: 'Active',
              value: anomalies.filter(a => a.status === 'active').length.toString(),
              change: -15.2,
              icon: AlertTriangle
            }
          ]}
          trend={-15.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {anomalies.filter(a => a.status === 'active').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active anomalies
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Trend Strength"
          icon={BarChart3}
          variant="accent"
          metrics={[
            {
              label: 'Average',
              value: `${(trends.reduce((acc, t) => acc + parseFloat(t.confidence), 0) / trends.length).toFixed(1)}%`,
              change: 3.2,
              icon: BarChart3
            }
          ]}
          trend={3.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {(trends.reduce((acc, t) => acc + parseFloat(t.confidence), 0) / trends.length).toFixed(1)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              average trend strength
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Forecasts Management */}
      <DashboardWidget
        title="AI-Powered Forecasts"
        icon={Brain}
        variant="default"
        expandable={true}
        onRefresh={() => loadPredictiveData()}
      >
        <AdvancedDataTable
          data={forecasts}
          columns={forecastColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(forecast) => setSelectedForecast(forecast)}
          className="mt-4"
          emptyMessage="No forecasts available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (forecast) => setSelectedForecast(forecast),
              variant: 'ghost'
            },
            {
              label: 'Update',
              icon: Edit,
              onClick: (forecast) => handleForecastAction(forecast.id, 'update'),
              variant: 'ghost'
            },
            {
              label: 'Export',
              icon: Download,
              onClick: (forecast) => handleForecastAction(forecast.id, 'export'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* Anomaly Detection */}
      <DashboardWidget
        title="Anomaly Detection & Alerts"
        icon={AlertTriangle}
        variant="warning"
        expandable={true}
        onRefresh={() => loadPredictiveData()}
      >
        <div className="space-y-4">
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <div style={{ color: getSeverityColor(anomaly.severity) }}>
                      {getAnomalyTypeIcon(anomaly.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {anomaly.metric} Anomaly
                      </h4>
                      <Badge variant={anomaly.severity === 'critical' ? 'danger' : anomaly.severity === 'high' ? 'warning' : 'info'}>
                        {anomaly.severity}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {anomaly.confidence}% confidence
                      </Badge>
                      <Badge variant={anomaly.status === 'active' ? 'warning' : 'success'} size="sm">
                        {anomaly.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {anomaly.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>Impact: {anomaly.impact}</span>
                      <span>Category: {anomaly.category}</span>
                      <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'var(--accent-bg)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Recommendation:
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {anomaly.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="primary">
                    Investigate
                  </Button>
                  <Button size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </DashboardWidget>

      {/* Predictive Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast vs Actual */}
        <DashboardWidget
          title="Forecast vs Actual Comparison"
          icon={LineChart}
          variant="success"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <AdvancedCharts
            title="Forecast Accuracy"
            data={predictiveData?.analytics.forecastChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadPredictiveData()}
          />
        </DashboardWidget>
        
        {/* Prediction Confidence */}
        <DashboardWidget
          title="Prediction Confidence Trends"
          icon={Target}
          variant="highlight"
          expandable={true}
          onRefresh={() => loadPredictiveData()}
        >
          <AdvancedCharts
            title="Confidence Levels"
            data={predictiveData?.analytics.confidenceChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadPredictiveData()}
          />
        </DashboardWidget>
      </div>

      {/* Trend Analysis */}
      <DashboardWidget
        title="Trend Analysis & Strength"
        icon={BarChart3}
        variant="accent"
        expandable={true}
        onRefresh={() => loadPredictiveData()}
      >
        <AdvancedCharts
          title="Trend Strength by Metric"
          data={predictiveData?.analytics.trendAnalysis}
          type="bar"
          height={400}
          showControls={true}
          showLegend={true}
          showTooltip={true}
          showGrid={true}
          showAxis={true}
          refreshData={() => loadPredictiveData()}
        />
      </DashboardWidget>

      {/* Predictive Analytics Summary */}
      <Card header="Predictive Analytics Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Forecasts Generated
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {forecasts.length} active forecasts with {confidenceLevel}% confidence
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Anomalies Detected
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {anomalies.length} anomalies with {anomalies.filter(a => a.status === 'active').length} active
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Trend Analysis
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {trends.length} data points analyzed for pattern recognition
            </p>
          </div>
        </div>
      </Card>

      {/* Forecast Details Modal */}
      <AnimatePresence>
        {selectedForecast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedForecast(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--primary-bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <Target className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedForecast.metric} Forecast
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedForecast(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Forecast Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Current Value:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.currentValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Forecasted Value:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.forecastedValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Change:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.change}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Technical Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Algorithm:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.algorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Horizon:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedForecast.horizon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{new Date(selectedForecast.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Key Factors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedForecast.factors.map((factor, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleForecastAction(selectedForecast.id, 'update')}>
                    Update Forecast
                  </Button>
                  <Button variant="primary" onClick={() => handleForecastAction(selectedForecast.id, 'export')}>
                    Export Data
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PredictiveAnalyticsEngine
