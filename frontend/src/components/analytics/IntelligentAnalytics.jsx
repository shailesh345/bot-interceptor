import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Shield,
  Bot,
  Globe,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { VirtualizedList } from '../common/PerformanceOptimizer'


const IntelligentAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [insights, setInsights] = useState([])
  const [predictions, setPredictions] = useState({})
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [showInsights, setShowInsights] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const updateIntervalRef = useRef(null)
  const chartRefs = useRef({})

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
  }, [selectedTimeframe])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for analytics data
      const [analytics, insightsData, predictionsData, recommendationsData] = await Promise.all([
        generateAnalyticsData(),
        generateInsights(),
        generatePredictions(),
        generateRecommendations()
      ])
      
      setAnalyticsData(analytics)
      setInsights(insightsData)
      setPredictions(predictionsData)
      setRecommendations(recommendationsData)
      
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      // Simulate real-time updates
      updateInsights()
    }, 30000) // Update every 30 seconds
  }

  const updateInsights = () => {
    setInsights(prev => {
      const newInsights = [...prev]
      // Simulate new insights being generated
      if (Math.random() > 0.7) {
        newInsights.unshift({
          id: Date.now(),
          type: 'trend',
          severity: 'info',
          title: 'New traffic pattern detected',
          description: 'Unusual traffic spike detected in Asia-Pacific region',
          confidence: Math.floor(Math.random() * 30) + 70,
          timestamp: new Date().toISOString(),
          actionable: true
        })
      }
      return newInsights.slice(0, 10) // Keep only latest 10
    })
  }

  // Mock data generators
  const generateAnalyticsData = async () => {
    const now = new Date()
    const data = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 50000) + 100000,
        bots: Math.floor(Math.random() * 5000) + 5000,
        threats: Math.floor(Math.random() * 1000) + 500,
        responseTime: Math.floor(Math.random() * 50) + 30,
        conversionRate: (Math.random() * 5 + 2).toFixed(2),
        revenue: Math.floor(Math.random() * 10000) + 5000
      })
    }
    
    return {
      timeSeries: data,
      summary: {
        totalRequests: data.reduce((acc, d) => acc + d.requests, 0),
        totalBots: data.reduce((acc, d) => acc + d.bots, 0),
        totalThreats: data.reduce((acc, d) => acc + d.threats, 0),
        avgResponseTime: (data.reduce((acc, d) => acc + d.responseTime, 0) / data.length).toFixed(1),
        avgConversionRate: (data.reduce((acc, d) => acc + parseFloat(d.conversionRate), 0) / data.length).toFixed(2),
        totalRevenue: data.reduce((acc, d) => acc + d.revenue, 0)
      }
    }
  }

  const generateInsights = async () => {
    return [
      {
        id: 1,
        type: 'trend',
        severity: 'high',
        title: 'Traffic pattern anomaly detected',
        description: 'Unusual 40% increase in traffic from Eastern Europe region',
        confidence: 95,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'traffic'
      },
      {
        id: 2,
        type: 'threat',
        severity: 'critical',
        title: 'New bot attack vector identified',
        description: 'Sophisticated bot behavior mimicking human patterns',
        confidence: 88,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'critical',
        category: 'security'
      },
      {
        id: 3,
        type: 'opportunity',
        severity: 'medium',
        title: 'Performance optimization opportunity',
        description: 'Response time can be improved by 25% with CDN optimization',
        confidence: 82,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'medium',
        category: 'performance'
      },
      {
        id: 4,
        type: 'trend',
        severity: 'low',
        title: 'Seasonal traffic increase',
        description: 'Expected 15% traffic increase due to upcoming holiday season',
        confidence: 78,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        actionable: false,
        impact: 'low',
        category: 'traffic'
      }
    ]
  }

  const generatePredictions = async () => {
    return {
      traffic: {
        next24h: '+12%',
        next7d: '+8%',
        next30d: '+15%',
        confidence: 85
      },
      threats: {
        next24h: '+5%',
        next7d: '+12%',
        next30d: '+8%',
        confidence: 72
      },
      revenue: {
        next24h: '+8%',
        next7d: '+15%',
        next30d: '+22%',
        confidence: 78
      },
      performance: {
        responseTime: '-15%',
        uptime: '99.99%',
        confidence: 91
      }
    }
  }

  const generateRecommendations = async () => {
    return [
      {
        id: 1,
        type: 'security',
        priority: 'high',
        title: 'Implement advanced bot detection',
        description: 'Current bot detection rate is 85%. Advanced ML models can improve this to 95%.',
        impact: 'High - Reduce false positives by 40%',
        effort: 'Medium - 2-3 weeks implementation',
        roi: 'High - 300% return on investment',
        category: 'security'
      },
      {
        id: 2,
        type: 'performance',
        priority: 'medium',
        title: 'Optimize CDN configuration',
        description: 'Response time can be reduced by 25% with better CDN routing.',
        impact: 'Medium - Improve user experience',
        effort: 'Low - 1 week configuration',
        roi: 'Medium - 150% return on investment',
        category: 'performance'
      },
      {
        id: 3,
        type: 'revenue',
        priority: 'high',
        title: 'Implement dynamic pricing',
        description: 'AI-powered pricing optimization can increase revenue by 18%.',
        impact: 'High - Direct revenue increase',
        effort: 'High - 4-6 weeks development',
        roi: 'Very High - 500% return on investment',
        category: 'revenue'
      }
    ]
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

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5" />
      case 'threat': return <AlertTriangle className="h-5 w-5" />
      case 'opportunity': return <Lightbulb className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  // Chart configurations
  const trafficChartData = {
    labels: analyticsData?.timeSeries.map(d => d.date) || [],
    datasets: [
      {
        label: 'Total Requests',
        data: analyticsData?.timeSeries.map(d => d.requests) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Bot Traffic',
        data: analyticsData?.timeSeries.map(d => d.bots) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const performanceChartData = {
    labels: ['Response Time', 'Uptime', 'Throughput', 'Error Rate', 'Cache Hit Rate'],
    datasets: [{
      label: 'Current Performance',
      data: [75, 95, 88, 92, 85],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 2
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
          font: { family: 'Yandex Sans Display' }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading intelligent analytics..." />
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
            Intelligent Analytics
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI-powered insights and predictive analytics for your traffic data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button
            variant={showInsights ? 'primary' : 'secondary'}
            icon={Brain}
            onClick={() => setShowInsights(!showInsights)}
          >
            {showInsights ? 'Hide' : 'Show'} Insights
          </Button>
        </div>
      </motion.div>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <Card header="AI-Generated Insights" animation="fade-in-up" delay={0.1}>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
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
                          <div style={{ color: getSeverityColor(insight.severity) }}>
                            {getInsightIcon(insight.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {insight.title}
                            </h4>
                            <Badge variant={insight.severity === 'critical' ? 'danger' : insight.severity === 'high' ? 'warning' : 'info'}>
                              {insight.severity}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {insight.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>Impact: {insight.impact}</span>
                            <span>Category: {insight.category}</span>
                            <span>{new Date(insight.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="primary">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card header="Total Requests" animation="fade-in-up" delay={0.2}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {analyticsData?.summary.totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>+12.5%</span>
            </div>
          </div>
        </Card>
        
        <Card header="Threat Detection" animation="fade-in-up" delay={0.3}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>
              {analyticsData?.summary.totalThreats.toLocaleString()}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Shield className="h-4 w-4 mr-1" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>95.2% blocked</span>
            </div>
          </div>
        </Card>
        
        <Card header="Avg Response Time" animation="fade-in-up" delay={0.4}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
              {analyticsData?.summary.avgResponseTime}ms
            </div>
            <div className="flex items-center justify-center mt-2">
              <Zap className="h-4 w-4 mr-1" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>-8.3%</span>
            </div>
          </div>
        </Card>
        
        <Card header="Conversion Rate" animation="fade-in-up" delay={0.5}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>
              {analyticsData?.summary.avgConversionRate}%
            </div>
            <div className="flex items-center justify-center mt-2">
              <Target className="h-4 w-4 mr-1" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>+2.1%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <Card header="Traffic Trends Analysis" animation="fade-in-up" delay={0.6}>
          <div className="h-80">
            <Line data={trafficChartData} options={chartOptions} ref={(ref) => chartRefs.current.traffic = ref} />
          </div>
        </Card>
        
        {/* Performance Radar */}
        <Card header="Performance Metrics" animation="fade-in-up" delay={0.7}>
          <div className="h-80">
            <Radar data={performanceChartData} options={chartOptions} ref={(ref) => chartRefs.current.performance = ref} />
          </div>
        </Card>
      </div>

      {/* Predictions & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Predictions */}
        <Card header="AI Predictions" animation="fade-in-up" delay={0.8}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Traffic (24h)</h4>
                <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  {predictions.traffic?.next24h}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {predictions.traffic?.confidence}% confidence
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Revenue (7d)</h4>
                <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                  {predictions.revenue?.next7d}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {predictions.revenue?.confidence}% confidence
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Performance Forecast</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Response Time:</span>
                  <span style={{ color: '#10b981' }}>{predictions.performance?.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Uptime:</span>
                  <span style={{ color: '#10b981' }}>{predictions.performance?.uptime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* AI Recommendations */}
        <Card header="AI Recommendations" animation="fade-in-up" delay={0.9}>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 rounded-lg border transition-all duration-200 hover:shadow-sm"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--primary-bg)'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {rec.title}
                  </h4>
                  <Badge 
                    variant="outline" 
                    size="sm"
                    style={{ borderColor: getPriorityColor(rec.priority) }}
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {rec.description}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Impact:</span>
                    <p style={{ color: 'var(--text-secondary)' }}>{rec.impact}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Effort:</span>
                    <p style={{ color: 'var(--text-secondary)' }}>{rec.effort}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ROI:</span>
                    <p style={{ color: 'var(--text-secondary)' }}>{rec.roi}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Card header="Advanced Analytics" animation="fade-in-up" delay={1.0}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Brain className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              AI Accuracy
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              94.2% prediction accuracy
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Threat Detection
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              99.1% threat identification
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Performance Gain
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              23% improvement in 30 days
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default IntelligentAnalytics
