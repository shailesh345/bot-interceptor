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
  RotateCcw
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const AdvancedMLDashboard = () => {
  const [mlData, setMlData] = useState(null)
  const [models, setModels] = useState([])
  const [predictions, setPredictions] = useState([])
  const [insights, setInsights] = useState([])
  const [performance, setPerformance] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)
  const [showModelDetails, setShowModelDetails] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadMLData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])

  const loadMLData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for ML data
      const [modelsData, predictionsData, insightsData, performanceData] = await Promise.all([
        generateModelsData(),
        generatePredictionsData(),
        generateInsightsData(),
        generatePerformanceData()
      ])
      
      setModels(modelsData)
      setPredictions(predictionsData)
      setInsights(insightsData)
      setPerformance(performanceData)
      
      setMlData({
        models: modelsData,
        predictions: predictionsData,
        insights: insightsData,
        performance: performanceData
      })
      
    } catch (error) {
      console.error('Failed to load ML data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadMLData()
    }, 60000) // Refresh every minute
  }

  // Mock data generators
  const generateModelsData = async () => {
    return [
      {
        id: 'ml-001',
        name: 'Traffic Classification Model',
        type: 'classification',
        status: 'active',
        accuracy: 94.2,
        precision: 92.8,
        recall: 93.5,
        f1Score: 93.1,
        version: '2.1.0',
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        trainingData: '1.2M samples',
        features: 156,
        algorithm: 'XGBoost',
        performance: 'excellent',
        alerts: 0,
        predictions: 15420
      },
      {
        id: 'ml-002',
        name: 'Fraud Detection Model',
        type: 'anomaly_detection',
        status: 'active',
        accuracy: 97.8,
        precision: 96.5,
        recall: 98.2,
        f1Score: 97.3,
        version: '1.8.2',
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        trainingData: '890K samples',
        features: 89,
        algorithm: 'Isolation Forest',
        performance: 'excellent',
        alerts: 2,
        predictions: 8920
      },
      {
        id: 'ml-003',
        name: 'Revenue Prediction Model',
        type: 'regression',
        status: 'training',
        accuracy: 87.3,
        precision: 85.9,
        recall: 86.7,
        f1Score: 86.3,
        version: '1.5.1',
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        trainingData: '650K samples',
        features: 234,
        algorithm: 'Random Forest',
        performance: 'good',
        alerts: 1,
        predictions: 0
      },
      {
        id: 'ml-004',
        name: 'Customer Churn Model',
        type: 'classification',
        status: 'active',
        accuracy: 91.5,
        precision: 90.2,
        recall: 91.8,
        f1Score: 91.0,
        version: '2.0.3',
        lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        trainingData: '780K samples',
        features: 123,
        algorithm: 'LightGBM',
        performance: 'good',
        alerts: 0,
        predictions: 12340
      }
    ]
  }

  const generatePredictionsData = async () => {
    const now = new Date()
    const predictions = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      predictions.push({
        id: `pred-${i}`,
        timestamp: date.toISOString(),
        model: i % 4 === 0 ? 'Traffic Classification' : i % 4 === 1 ? 'Fraud Detection' : i % 4 === 2 ? 'Revenue Prediction' : 'Customer Churn',
        input: `Sample input ${i}`,
        prediction: i % 4 === 0 ? 'Human' : i % 4 === 1 ? 'Legitimate' : i % 4 === 2 ? '$12,450' : 'Low Risk',
        confidence: (Math.random() * 20 + 80).toFixed(1),
        actual: i % 4 === 0 ? 'Human' : i % 4 === 1 ? 'Legitimate' : i % 4 === 2 ? '$12,380' : 'Low Risk',
        accuracy: (Math.random() * 15 + 85).toFixed(1),
        status: Math.random() > 0.8 ? 'incorrect' : 'correct',
        impact: Math.random() > 0.7 ? 'high' : 'medium'
      })
    }
    
    return predictions
  }

  const generateInsightsData = async () => {
    return [
      {
        id: 1,
        type: 'model_performance',
        severity: 'high',
        title: 'Traffic Classification Model Accuracy Improving',
        description: 'Model accuracy increased by 2.3% over the last 7 days, suggesting improved training data quality',
        confidence: 94,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'performance',
        recommendation: 'Consider retraining with recent data to maintain performance gains'
      },
      {
        id: 2,
        type: 'data_quality',
        severity: 'medium',
        title: 'Fraud Detection Model Data Drift Detected',
        description: 'Input data distribution has shifted by 15% from training data, may affect prediction accuracy',
        confidence: 87,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'medium',
        category: 'data',
        recommendation: 'Monitor model performance closely and consider retraining if accuracy drops below 95%'
      },
      {
        id: 3,
        type: 'business_impact',
        severity: 'critical',
        title: 'Revenue Prediction Model Shows High Confidence',
        description: 'Model predictions for Q4 revenue show 98% confidence with $2.4M forecast',
        confidence: 98,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'critical',
        category: 'business',
        recommendation: 'Use predictions for strategic planning and resource allocation'
      },
      {
        id: 4,
        type: 'anomaly_detection',
        severity: 'high',
        title: 'Unusual Traffic Pattern Detected',
        description: 'ML model identified anomalous traffic pattern with 92% confidence, potential security threat',
        confidence: 92,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        actionable: true,
        impact: 'high',
        category: 'security',
        recommendation: 'Investigate traffic source and implement additional security measures if needed'
      }
    ]
  }

  const generatePerformanceData = async () => {
    const now = new Date()
    const labels = []
    const accuracyData = []
    const predictionsData = []
    const alertsData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      accuracyData.push(Math.random() * 10 + 85)
      predictionsData.push(Math.floor(Math.random() * 1000) + 500)
      alertsData.push(Math.floor(Math.random() * 20) + 5)
    }

    return {
      accuracyChart: {
        labels,
        datasets: [
          {
            label: 'Model Accuracy',
            data: accuracyData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      predictionsChart: {
        labels,
        datasets: [
          {
            label: 'Daily Predictions',
            data: predictionsData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      alertsChart: {
        labels,
        datasets: [
          {
            label: 'Security Alerts',
            data: alertsData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      modelPerformance: {
        labels: ['Traffic Classification', 'Fraud Detection', 'Revenue Prediction', 'Customer Churn'],
        datasets: [{
          label: 'Model Performance Score',
          data: [94.2, 97.8, 87.3, 91.5],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 2
        }]
      }
    }
  }

  const getModelStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'training': return '#f59e0b'
      case 'inactive': return '#6b7280'
      case 'error': return '#ef4444'
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

  const getInsightIcon = (type) => {
    switch (type) {
      case 'model_performance': return <TrendingUp className="h-5 w-5" />
      case 'data_quality': return <Database className="h-5 w-5" />
      case 'business_impact': return <DollarSign className="h-5 w-5" />
      case 'anomaly_detection': return <AlertTriangle className="h-5 w-5" />
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

  const handleModelAction = (modelId, action) => {
    console.log(`Model ${action}:`, modelId)
    // In real implementation, this would trigger the appropriate action
  }

  const handlePredictionClick = (prediction) => {
    console.log('Prediction clicked:', prediction)
    // In real implementation, this would show detailed prediction information
  }

  const handleInsightAction = (insightId, action) => {
    console.log(`Insight ${action}:`, insightId)
    // In real implementation, this would trigger the appropriate action
  }

  const modelColumns = [
    { key: 'name', label: 'Model Name', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'accuracy', label: 'Accuracy', type: 'percentage', sortable: true },
    { key: 'algorithm', label: 'Algorithm', type: 'text', sortable: true },
    { key: 'performance', label: 'Performance', type: 'badge', sortable: true },
    { key: 'predictions', label: 'Predictions', type: 'number', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const predictionColumns = [
    { key: 'timestamp', label: 'Timestamp', type: 'datetime', sortable: true },
    { key: 'model', label: 'Model', type: 'text', sortable: true },
    { key: 'prediction', label: 'Prediction', type: 'text', sortable: true },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'accuracy', label: 'Accuracy', type: 'percentage', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'impact', label: 'Impact', type: 'badge', sortable: true }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading machine learning dashboard..." />
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
            Advanced Machine Learning Dashboard
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI-powered insights, predictive analytics, and model management
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
            onClick={loadMLData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* ML Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Active Models"
          icon={Brain}
          variant="success"
          metrics={[
            {
              label: 'Total',
              value: models.filter(m => m.status === 'active').length.toString(),
              change: 0,
              icon: Brain
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadMLData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {models.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              of {models.length} total models
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Total Predictions"
          icon={Target}
          variant="highlight"
          metrics={[
            {
              label: 'Today',
              value: predictions.length.toString(),
              change: 12.5,
              icon: Target
            }
          ]}
          trend={12.5}
          status="growing"
          expandable={true}
          onRefresh={() => loadMLData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {models.reduce((acc, m) => acc + m.predictions, 0).toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              predictions made
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Average Accuracy"
          icon={TrendingUp}
          variant="warning"
          metrics={[
            {
              label: 'All Models',
              value: `${(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length).toFixed(1)}%`,
              change: 2.1,
              icon: TrendingUp
            }
          ]}
          trend={2.1}
          status="improving"
          expandable={true}
          onRefresh={() => loadMLData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length).toFixed(1)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              overall accuracy
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Active Alerts"
          icon={AlertTriangle}
          variant="danger"
          metrics={[
            {
              label: 'Critical',
              value: models.reduce((acc, m) => acc + m.alerts, 0).toString(),
              change: -15.2,
              icon: AlertTriangle
            }
          ]}
          trend={-15.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadMLData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {models.reduce((acc, m) => acc + m.alerts, 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active alerts
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* ML Models Management */}
      <DashboardWidget
        title="Machine Learning Models"
        icon={Brain}
        variant="default"
        expandable={true}
        onRefresh={() => loadMLData()}
      >
        <AdvancedDataTable
          data={models}
          columns={modelColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(model) => setSelectedModel(model)}
          className="mt-4"
          emptyMessage="No ML models available"
          actions={[
            {
              label: 'View',
              icon: Eye,
              onClick: (model) => setSelectedModel(model),
              variant: 'ghost'
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: (model) => handleModelAction(model.id, 'edit'),
              variant: 'ghost'
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: (model) => handleModelAction(model.id, 'delete'),
              variant: 'ghost',
              className: 'text-red-600'
            }
          ]}
        />
      </DashboardWidget>

      {/* AI Insights Panel */}
      <DashboardWidget
        title="AI-Generated Insights"
        icon={Lightbulb}
        variant="accent"
        expandable={true}
        onRefresh={() => loadMLData()}
      >
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
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'var(--accent-bg)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Recommendation:
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
                {insight.actionable && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="primary">
                      Take Action
                    </Button>
                    <Button size="sm" variant="ghost">
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </DashboardWidget>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Accuracy Trends */}
        <DashboardWidget
          title="Model Accuracy Trends"
          icon={TrendingUp}
          variant="success"
          expandable={true}
          onRefresh={() => loadMLData()}
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
            refreshData={() => loadMLData()}
          />
        </DashboardWidget>

        {/* Model Performance Comparison */}
        <DashboardWidget
          title="Model Performance Comparison"
          icon={BarChart3}
          variant="highlight"
          expandable={true}
          onRefresh={() => loadMLData()}
        >
          <AdvancedCharts
            title="Performance Scores"
            data={performance.modelPerformance}
            type="bar"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadMLData()}
          />
        </DashboardWidget>
      </div>

      {/* Predictions Analysis */}
      <DashboardWidget
        title="Recent Predictions Analysis"
        icon={Target}
        variant="default"
        expandable={true}
        onRefresh={() => loadMLData()}
      >
        <AdvancedDataTable
          data={predictions}
          columns={predictionColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={10}
          onRowClick={handlePredictionClick}
          className="mt-4"
          emptyMessage="No predictions available"
        />
      </DashboardWidget>

      {/* ML Summary */}
      <Card header="Machine Learning Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Brain className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Active Models
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {models.filter(m => m.status === 'active').length} of {models.length} models
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Total Predictions
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {models.reduce((acc, m) => acc + m.predictions, 0).toLocaleString()} predictions made
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Average Accuracy
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length).toFixed(1)}% overall
            </p>
          </div>
        </div>
      </Card>

      {/* Model Details Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedModel(null)}
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
                    {selectedModel.name}
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedModel(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Model Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Algorithm:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.algorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Version:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Features:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.features}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Performance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Accuracy:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Precision:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.precision}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Recall:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.recall}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>F1 Score:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedModel.f1Score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleModelAction(selectedModel.id, 'edit')}>
                    Edit Model
                  </Button>
                  <Button variant="primary" onClick={() => handleModelAction(selectedModel.id, 'retrain')}>
                    Retrain Model
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

export default AdvancedMLDashboard
