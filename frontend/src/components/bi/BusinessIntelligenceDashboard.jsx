import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Shield,
  Globe,
  Clock,
  Calendar,
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
  Sparkles,
  Brain
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const BusinessIntelligenceDashboard = () => {
  const [biData, setBiData] = useState(null)
  const [insights, setInsights] = useState([])
  const [predictions, setPredictions] = useState({})
  const [kpis, setKpis] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'traffic', 'conversion'])
  const [showInsights, setShowInsights] = useState(true)
  const [expandedWidget, setExpandedWidget] = useState(null)
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadBIData()
    startAutoRefresh()
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [selectedTimeframe])

  const loadBIData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for BI data
      const [biDataRes, insightsRes, predictionsRes, kpisRes] = await Promise.all([
        generateBIData(),
        generateInsights(),
        generatePredictions(),
        generateKPIs()
      ])
      
      setBiData(biDataRes)
      setInsights(insightsRes)
      setPredictions(predictionsRes)
      setKpis(kpisRes)
      
    } catch (error) {
      // console.error('Failed to load BI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      // Simulate real-time updates
      updateInsights()
    }, 60000) // Update every minute
  }

  const updateInsights = () => {
    setInsights(prev => {
      const newInsights = [...prev]
      // Simulate new insights being generated
      if (Math.random() > 0.8) {
        newInsights.unshift({
          id: Date.now(),
          type: 'opportunity',
          severity: 'high',
          title: 'New market opportunity detected',
          description: 'Emerging trend in Asia-Pacific region shows 25% growth potential',
          confidence: Math.floor(Math.random() * 20) + 80,
          timestamp: new Date().toISOString(),
          actionable: true,
          impact: 'high',
          category: 'market',
          roi: '300%'
        })
      }
      return newInsights.slice(0, 15) // Keep only latest 15
    })
  }

  // Mock data generators
  const generateBIData = async () => {
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
    
    return {
      timeSeries: data,
      summary: {
        totalRevenue: data.reduce((acc, d) => acc + d.revenue, 0),
        totalTraffic: data.reduce((acc, d) => acc + d.traffic, 0),
        avgConversion: (data.reduce((acc, d) => acc + parseFloat(d.conversion), 0) / data.length).toFixed(2),
        totalCustomers: data.reduce((acc, d) => acc + d.customers, 0),
        totalOrders: data.reduce((acc, d) => acc + d.orders, 0),
        avgOrderValue: (data.reduce((acc, d) => acc + d.avgOrderValue, 0) / data.length).toFixed(2),
        avgChurnRate: (data.reduce((acc, d) => acc + parseFloat(d.churnRate), 0) / data.length).toFixed(2),
        avgCustomerLifetimeValue: (data.reduce((acc, d) => acc + d.customerLifetimeValue, 0) / data.length).toFixed(2),
        avgAcquisitionCost: (data.reduce((acc, d) => acc + d.acquisitionCost, 0) / data.length).toFixed(2),
        avgRetentionRate: (data.reduce((acc, d) => acc + parseFloat(d.retentionRate), 0) / data.length).toFixed(1)
      }
    }
  }

  const generateInsights = async () => {
    return [
      {
        id: 1,
        type: 'opportunity',
        severity: 'critical',
        title: 'High-value customer segment identified',
        description: 'Premium users show 3x higher lifetime value and 40% lower churn rate',
        confidence: 95,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'critical',
        category: 'customer',
        roi: '400%'
      },
      {
        id: 2,
        type: 'trend',
        severity: 'high',
        title: 'Seasonal traffic pattern detected',
        description: 'Weekend traffic shows 35% higher conversion rates than weekdays',
        confidence: 88,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'traffic',
        roi: '250%'
      },
      {
        id: 3,
        type: 'optimization',
        severity: 'medium',
        title: 'Pricing optimization opportunity',
        description: 'Dynamic pricing could increase revenue by 18% with minimal customer impact',
        confidence: 82,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'medium',
        category: 'revenue',
        roi: '180%'
      },
      {
        id: 4,
        type: 'risk',
        severity: 'high',
        title: 'Customer churn risk increasing',
        description: 'Recent customers show 15% higher churn risk in first 30 days',
        confidence: 78,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'retention',
        roi: '200%'
      }
    ]
  }

  const generatePredictions = async () => {
    return {
      revenue: {
        next30d: '+18%',
        next90d: '+32%',
        next180d: '+45%',
        confidence: 87
      },
      traffic: {
        next30d: '+12%',
        next90d: '+25%',
        next180d: '+38%',
        confidence: 82
      },
      customers: {
        next30d: '+8%',
        next90d: '+22%',
        next180d: '+35%',
        confidence: 79
      },
      market: {
        growth: '+15%',
        competition: 'medium',
        opportunity: 'high',
        confidence: 75
      }
    }
  }

  const generateKPIs = async () => {
    return {
      revenue: {
        current: '$2.4M',
        previous: '$2.1M',
        change: '+14.3%',
        trend: 'up',
        target: '$2.8M',
        progress: 85
      },
      customers: {
        current: '12,847',
        previous: '11,923',
        change: '+7.7%',
        trend: 'up',
        target: '15,000',
        progress: 86
      },
      conversion: {
        current: '4.2%',
        previous: '3.8%',
        change: '+10.5%',
        trend: 'up',
        target: '5.0%',
        progress: 84
      },
      retention: {
        current: '91.2%',
        previous: '89.8%',
        change: '+1.6%',
        trend: 'up',
        target: '92.0%',
        progress: 80
      }
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-5 w-5" />
      case 'trend': return <TrendingUp className="h-5 w-5" />
      case 'optimization': return <Target className="h-5 w-5" />
      case 'risk': return <AlertTriangle className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
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

  // Chart configurations
  const revenueChartData = {
    labels: biData?.timeSeries.map(d => d.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: biData?.timeSeries.map(d => d.revenue) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Traffic',
        data: biData?.timeSeries.map(d => d.traffic / 1000) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }

  const conversionChartData = {
    labels: biData?.timeSeries.map(d => d.date) || [],
    datasets: [{
      label: 'Conversion Rate',
      data: biData?.timeSeries.map(d => d.conversion) || [],
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const customerMetricsData = {
    labels: ['New Customers', 'Returning', 'Churned', 'Retained'],
    datasets: [{
      data: [
        kpis.customers?.current || 0,
        Math.floor((kpis.customers?.current || 0) * 0.7),
        Math.floor((kpis.customers?.current || 0) * 0.1),
        Math.floor((kpis.customers?.current || 0) * 0.9)
      ],
      backgroundColor: [
        '#10b981',
        '#3b82f6',
        '#ef4444',
        '#8b5cf6'
      ]
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: { family: 'Inter' }
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
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: 'var(--text-secondary)' },
        grid: { drawOnChartArea: false }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading business intelligence..." />
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
            Business Intelligence Dashboard
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Strategic insights and predictive analytics for business growth
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
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="180d">Last 180 Days</option>
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

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Revenue"
          icon={DollarSign}
          variant="success"
          metrics={[
            {
              label: 'Current',
              value: kpis.revenue?.current || '$0',
              change: 14.3,
              icon: DollarSign
            }
          ]}
          trend={14.3}
          status="growing"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {kpis.revenue?.current || '$0'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>
                {kpis.revenue?.change || '+0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${kpis.revenue?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Target: {kpis.revenue?.target || '$0'}
            </p>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Customers"
          icon={Users}
          variant="highlight"
          metrics={[
            {
              label: 'Total',
              value: kpis.customers?.current || '0',
              change: 7.7,
              icon: Users
            }
          ]}
          trend={7.7}
          status="growing"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {kpis.customers?.current || '0'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#3b82f6' }} />
              <span className="text-sm" style={{ color: '#3b82f6' }}>
                {kpis.customers?.change || '+0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${kpis.customers?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Target: {kpis.customers?.target || '0'}
            </p>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Conversion Rate"
          icon={Target}
          variant="warning"
          metrics={[
            {
              label: 'Current',
              value: kpis.conversion?.current || '0%',
              change: 10.5,
              icon: Target
            }
          ]}
          trend={10.5}
          status="improving"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {kpis.conversion?.current || '0%'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#f59e0b' }} />
              <span className="text-sm" style={{ color: '#f59e0b' }}>
                {kpis.conversion?.change || '+0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${kpis.conversion?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Target: {kpis.conversion?.target || '0%'}
            </p>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Retention Rate"
          icon={Shield}
          variant="success"
          metrics={[
            {
              label: 'Current',
              value: kpis.retention?.current || '0%',
              change: 1.6,
              icon: Shield
            }
          ]}
          trend={1.6}
          status="stable"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {kpis.retention?.current || '0%'}
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>
                {kpis.retention?.change || '+0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${kpis.retention?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Target: {kpis.retention?.target || '0%'}
            </p>
          </div>
        </DashboardWidget>
      </div>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <Card header="AI-Generated Business Insights" animation="fade-in-up" delay={0.1}>
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
                            <Badge variant="success" size="sm">
                              ROI: {insight.roi}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Traffic Trends */}
        <DashboardWidget
          title="Revenue & Traffic Trends"
          icon={TrendingUp}
          variant="highlight"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </DashboardWidget>
        
        {/* Conversion Rate Analysis */}
        <DashboardWidget
          title="Conversion Rate Analysis"
          icon={Target}
          variant="warning"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="h-80">
            <Line data={conversionChartData} options={chartOptions} />
          </div>
        </DashboardWidget>
      </div>

      {/* Customer Metrics */}
      <DashboardWidget
        title="Customer Metrics Overview"
        icon={Users}
        variant="accent"
        expandable={true}
        onRefresh={() => loadBIData()}
      >
        <div className="h-80">
          <Doughnut data={customerMetricsData} options={chartOptions} />
        </div>
      </DashboardWidget>

      {/* Predictive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Predictions */}
        <DashboardWidget
          title="Market Predictions"
          icon={Brain}
          variant="success"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Revenue (30d)</h4>
                <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                  {predictions.revenue?.next30d}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {predictions.revenue?.confidence}% confidence
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Customers (90d)</h4>
                <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                  {predictions.customers?.next90d}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {predictions.customers?.confidence}% confidence
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Market Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Growth Rate:</span>
                  <span style={{ color: '#10b981' }}>{predictions.market?.growth}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Competition:</span>
                  <span style={{ color: '#f59e0b' }}>{predictions.market?.competition}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Opportunity:</span>
                  <span style={{ color: '#10b981' }}>{predictions.market?.opportunity}</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardWidget>
        
        {/* Business Intelligence Summary */}
        <DashboardWidget
          title="Business Intelligence Summary"
          icon={BarChart3}
          variant="default"
          expandable={true}
          onRefresh={() => loadBIData()}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Total Revenue</h4>
                <div className="text-xl font-bold" style={{ color: '#10b981' }}>
                  {biData?.summary.totalRevenue.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Avg Conversion</h4>
                <div className="text-xl font-bold" style={{ color: '#8b5cf6' }}>
                  {biData?.summary.avgConversion}%
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Key Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Avg Order Value:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>${biData?.summary.avgOrderValue}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Customer LTV:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>${biData?.summary.avgCustomerLifetimeValue}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Acquisition Cost:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>${biData?.summary.avgAcquisitionCost}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Retention Rate:</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{biData?.summary.avgRetentionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  )
}

export default BusinessIntelligenceDashboard
