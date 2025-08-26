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
  LineChart as LineChartIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  Brain as BrainIcon
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const AdvancedAIInsights = () => {
  const [aiData, setAiData] = useState(null)
  const [insights, setInsights] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [automations, setAutomations] = useState([])
  const [performance, setPerformance] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState(null)
  const [showAutomations, setShowAutomations] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadAIData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])

  const loadAIData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for AI insights data
      const [insightsData, recommendationsData, automationsData, performanceData] = await Promise.all([
        generateInsightsData(),
        generateRecommendationsData(),
        generateAutomationsData(),
        generatePerformanceData()
      ])
      
      setInsights(insightsData)
      setRecommendations(recommendationsData)
      setAutomations(automationsData)
      
      setAiData({
        insights: insightsData,
        recommendations: recommendationsData,
        automations: automationsData,
        performance: performanceData
      })
      
    } catch (error) {
      // console.error('Failed to load AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadAIData()
    }, 90000) // Refresh every 1.5 minutes
  }

  // Mock data generators
  const generateInsightsData = async () => {
    return [
      {
        id: 1,
        type: 'business_optimization',
        severity: 'critical',
        title: 'Revenue Optimization Opportunity Detected',
        description: 'AI analysis shows 23% revenue increase potential through dynamic pricing optimization',
        confidence: 96.8,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'critical',
        category: 'revenue',
        recommendation: 'Implement dynamic pricing algorithm with A/B testing for 30-day trial',
        roi: '450%',
        implementation: '2-3 weeks',
        priority: 'immediate'
      },
      {
        id: 2,
        type: 'customer_behavior',
        severity: 'high',
        title: 'Customer Churn Risk Pattern Identified',
        description: 'Machine learning model detected 15 customers at high risk of churning within 7 days',
        confidence: 94.2,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'retention',
        recommendation: 'Activate retention campaign with personalized offers for at-risk customers',
        roi: '320%',
        implementation: '1 week',
        priority: 'high'
      },
      {
        id: 3,
        type: 'security_threat',
        severity: 'critical',
        title: 'Advanced Persistent Threat Detected',
        description: 'AI security system identified sophisticated bot network attempting credential stuffing',
        confidence: 98.5,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'critical',
        category: 'security',
        recommendation: 'Implement rate limiting and enhanced authentication for affected endpoints',
        roi: 'N/A - Security Critical',
        implementation: 'Immediate',
        priority: 'critical'
      },
      {
        id: 4,
        type: 'performance_optimization',
        severity: 'medium',
        title: 'System Performance Bottleneck Identified',
        description: 'AI monitoring detected database query performance degradation affecting 12% of users',
        confidence: 89.7,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'medium',
        category: 'performance',
        recommendation: 'Optimize database queries and implement connection pooling',
        roi: '180%',
        implementation: '1-2 weeks',
        priority: 'medium'
      }
    ]
  }

  const generateRecommendationsData = async () => {
    return [
      {
        id: 1,
        type: 'pricing_strategy',
        title: 'Implement Dynamic Pricing',
        description: 'AI analysis suggests dynamic pricing could increase revenue by 18-25%',
        confidence: 94.2,
        impact: 'high',
        effort: 'medium',
        timeline: '4-6 weeks',
        cost: '$15,000',
        roi: '450%',
        status: 'pending',
        priority: 'high',
        category: 'revenue'
      },
      {
        id: 2,
        type: 'marketing_optimization',
        title: 'Personalized Email Campaigns',
        description: 'ML-driven segmentation could improve email open rates by 35%',
        confidence: 91.8,
        impact: 'medium',
        effort: 'low',
        timeline: '2-3 weeks',
        cost: '$8,000',
        roi: '280%',
        status: 'in_progress',
        priority: 'medium',
        category: 'marketing'
      },
      {
        id: 3,
        type: 'security_enhancement',
        title: 'Advanced Bot Detection',
        description: 'Implement AI-powered bot detection to reduce fraudulent traffic by 40%',
        confidence: 96.5,
        impact: 'high',
        effort: 'high',
        timeline: '6-8 weeks',
        cost: '$25,000',
        roi: '320%',
        status: 'planned',
        priority: 'high',
        category: 'security'
      },
      {
        id: 4,
        type: 'customer_experience',
        title: 'Predictive Customer Support',
        description: 'AI chat support could reduce support tickets by 30% and improve satisfaction',
        confidence: 88.9,
        impact: 'medium',
        effort: 'medium',
        timeline: '3-4 weeks',
        cost: '$12,000',
        roi: '240%',
        status: 'planned',
        priority: 'medium',
        category: 'support'
      }
    ]
  }

  const generateAutomationsData = async () => {
    return [
      {
        id: 1,
        name: 'Dynamic Pricing Engine',
        type: 'revenue_optimization',
        status: 'active',
        performance: 'excellent',
        lastExecuted: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        successRate: 98.5,
        impact: 'high',
        description: 'Automatically adjusts pricing based on demand, competition, and customer behavior',
        metrics: {
          revenueIncrease: '+18.3%',
          customerSatisfaction: '+12.1%',
          marketShare: '+8.7%'
        }
      },
      {
        id: 2,
        name: 'Security Threat Response',
        type: 'security_automation',
        status: 'active',
        performance: 'excellent',
        lastExecuted: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        successRate: 99.2,
        impact: 'critical',
        description: 'Automatically blocks and responds to security threats in real-time',
        metrics: {
          threatsBlocked: '156',
          responseTime: '0.3s',
          falsePositives: '0.8%'
        }
      },
      {
        id: 3,
        name: 'Customer Retention Campaign',
        type: 'marketing_automation',
        status: 'active',
        performance: 'good',
        lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        successRate: 92.8,
        impact: 'high',
        description: 'Automatically identifies and engages at-risk customers with personalized offers',
        metrics: {
          customersRetained: '89',
          retentionRate: '+15.2%',
          campaignROI: '320%'
        }
      },
      {
        id: 4,
        name: 'Performance Monitoring',
        type: 'system_automation',
        status: 'active',
        performance: 'excellent',
        lastExecuted: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
        successRate: 99.8,
        impact: 'medium',
        description: 'Continuously monitors system performance and automatically scales resources',
        metrics: {
          uptime: '99.97%',
          responseTime: '45ms',
          resourceUtilization: '78%'
        }
      }
    ]
  }

  const generatePerformanceData = async () => {
    const now = new Date()
    const labels = []
    const accuracyData = []
    const automationData = []
    const impactData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      accuracyData.push(90 + Math.random() * 8)
      automationData.push(Math.floor(Math.random() * 50) + 25)
      impactData.push(Math.random() * 100 + 200)
    }

    return {
      accuracyChart: {
        labels,
        datasets: [
          {
            label: 'AI Insight Accuracy',
            data: accuracyData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      automationChart: {
        labels,
        datasets: [
          {
            label: 'Automations Executed',
            data: automationData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      impactChart: {
        labels,
        datasets: [
          {
            label: 'Business Impact Score',
            data: impactData,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      aiPerformance: {
        labels: ['Accuracy', 'Speed', 'Efficiency', 'Impact', 'Reliability'],
        datasets: [{
          label: 'AI System Performance',
          data: [94.2, 96.8, 91.5, 89.7, 98.3],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)',
            'rgb(245, 158, 11)',
            'rgb(16, 185, 129)'
          ],
          borderWidth: 2
        }]
      }
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'business_optimization': return <TrendingUp className="h-5 w-5" />
      case 'customer_behavior': return <Users className="h-5 w-5" />
      case 'security_threat': return <Shield className="h-5 w-5" />
      case 'performance_optimization': return <Zap className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'immediate': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getAutomationStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'paused': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'inactive': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return '#10b981'
      case 'good': return '#3b82f6'
      case 'fair': return '#f59e0b'
      case 'poor': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const handleInsightAction = (insightId, action) => {
    // console.log(`Insight ${action}:`, insightId)
    // In real implementation, this would trigger the appropriate action
  }

  const handleRecommendationAction = (recId, action) => {
    // console.log(`Recommendation ${action}:`, recId)
    // In real implementation, this would trigger the appropriate action
  }

  const handleAutomationAction = (autoId, action) => {
    // console.log(`Automation ${action}:`, autoId)
    // In real implementation, this would trigger the appropriate action
  }

  const insightColumns = [
    { key: 'title', label: 'Insight', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'severity', label: 'Severity', type: 'status', sortable: true },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'impact', label: 'Impact', type: 'badge', sortable: true },
    { key: 'priority', label: 'Priority', type: 'badge', sortable: true },
    { key: 'roi', label: 'ROI', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const recommendationColumns = [
    { key: 'title', label: 'Recommendation', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'impact', label: 'Impact', type: 'badge', sortable: true },
    { key: 'effort', label: 'Effort', type: 'badge', sortable: true },
    { key: 'timeline', label: 'Timeline', type: 'text', sortable: true },
    { key: 'roi', label: 'ROI', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading AI insights..." />
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
            Advanced AI Insights
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI-powered business intelligence, automated recommendations, and intelligent insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
            onClick={loadAIData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Active Insights"
          icon={Brain}
          variant="success"
          metrics={[
            {
              label: 'Total',
              value: insights.length.toString(),
              change: 0,
              icon: Brain
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {insights.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active AI insights
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="High Priority"
          icon={AlertTriangle}
          variant="warning"
          metrics={[
            {
              label: 'Insights',
              value: insights.filter(i => i.priority === 'immediate' || i.priority === 'high').length.toString(),
              change: 12.5,
              icon: AlertTriangle
            }
          ]}
          trend={12.5}
          status="growing"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {insights.filter(i => i.priority === 'immediate' || i.priority === 'high').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              high priority insights
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Active Automations"
          icon={Zap}
          variant="highlight"
          metrics={[
            {
              label: 'Running',
              value: automations.filter(a => a.status === 'active').length.toString(),
              change: 8.7,
              icon: Zap
            }
          ]}
          trend={8.7}
          status="growing"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {automations.filter(a => a.status === 'active').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active automations
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Average ROI"
          icon={TrendingUp}
          variant="accent"
          metrics={[
            {
              label: 'All Actions',
              value: `${Math.floor(insights.reduce((acc, i) => acc + parseFloat(i.roi.replace('%', '')), 0) / insights.length)}%`,
              change: 15.2,
              icon: TrendingUp
            }
          ]}
          trend={15.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {Math.floor(insights.reduce((acc, i) => acc + parseFloat(i.roi.replace('%', '')), 0) / insights.length)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              average ROI
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* AI-Generated Insights */}
      <DashboardWidget
        title="AI-Generated Business Insights"
        icon={Lightbulb}
        variant="default"
        expandable={true}
        onRefresh={() => loadAIData()}
      >
        <AdvancedDataTable
          data={insights}
          columns={insightColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(insight) => setSelectedInsight(insight)}
          className="mt-4"
          emptyMessage="No AI insights available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (insight) => setSelectedInsight(insight),
              variant: 'ghost'
            },
            {
              label: 'Take Action',
              icon: Play,
              onClick: (insight) => handleInsightAction(insight.id, 'execute'),
              variant: 'primary'
            },
            {
              label: 'Dismiss',
              icon: X,
              onClick: (insight) => handleInsightAction(insight.id, 'dismiss'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* AI Recommendations */}
      <DashboardWidget
        title="AI-Powered Recommendations"
        icon={Target}
        variant="success"
        expandable={true}
        onRefresh={() => loadAIData()}
      >
        <AdvancedDataTable
          data={recommendations}
          columns={recommendationColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          className="mt-4"
          emptyMessage="No recommendations available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (rec) => handleRecommendationAction(rec.id, 'view'),
              variant: 'ghost'
            },
            {
              label: 'Implement',
              icon: Play,
              onClick: (rec) => handleRecommendationAction(rec.id, 'implement'),
              variant: 'primary'
            },
            {
              label: 'Schedule',
              icon: Calendar,
              onClick: (rec) => handleRecommendationAction(rec.id, 'schedule'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* AI Automations */}
      <DashboardWidget
        title="Intelligent Automations"
        icon={Zap}
        variant="highlight"
        expandable={true}
        onRefresh={() => loadAIData()}
      >
        <div className="space-y-4">
          {automations.map((automation, index) => (
            <motion.div
              key={automation.id}
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
                    <div style={{ color: getAutomationStatusColor(automation.status) }}>
                      <Zap className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {automation.name}
                      </h4>
                      <Badge variant={automation.status === 'active' ? 'success' : automation.status === 'paused' ? 'warning' : 'danger'}>
                        {automation.status}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {automation.successRate}% success
                      </Badge>
                      <Badge variant={automation.impact === 'critical' ? 'danger' : automation.impact === 'high' ? 'warning' : 'info'}>
                        {automation.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {automation.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {Object.entries(automation.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => handleAutomationAction(automation.id, 'pause')}>
                    Pause
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAutomationAction(automation.id, 'edit')}>
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </DashboardWidget>

      {/* AI Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Accuracy Trends */}
        <DashboardWidget
          title="AI Insight Accuracy"
          icon={Target}
          variant="success"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <AdvancedCharts
            title="Accuracy Over Time"
            data={performance.accuracyChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadAIData()}
          />
        </DashboardWidget>
        
        {/* AI Performance Radar */}
        <DashboardWidget
          title="AI System Performance"
          icon={Brain}
          variant="accent"
          expandable={true}
          onRefresh={() => loadAIData()}
        >
          <AdvancedCharts
            title="Performance Metrics"
            data={performance.aiPerformance}
            type="radar"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadAIData()}
          />
        </DashboardWidget>
      </div>

      {/* AI Summary */}
      <Card header="AI Intelligence Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Brain className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              AI Insights Generated
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {insights.length} intelligent insights with {insights.filter(i => i.confidence >= 90).length} high confidence
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Recommendations
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {recommendations.length} AI-powered recommendations with actionable insights
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Zap className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Active Automations
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {automations.filter(a => a.status === 'active').length} intelligent automations running
            </p>
          </div>
        </div>
      </Card>

      {/* Insight Details Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedInsight(null)}
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
                    <Brain className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedInsight.title}
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedInsight(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Insight Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Severity:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.severity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.priority}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Business Impact
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Impact:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.impact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>ROI:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.roi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Implementation:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedInsight.implementation}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Recommendation
                  </h3>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {selectedInsight.recommendation}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleInsightAction(selectedInsight.id, 'dismiss')}>
                    Dismiss
                  </Button>
                  <Button variant="primary" onClick={() => handleInsightAction(selectedInsight.id, 'execute')}>
                    Take Action
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

export default AdvancedAIInsights
