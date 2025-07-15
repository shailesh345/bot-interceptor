import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Globe, 
  Shield, 
  BarChart3, 
  CreditCard,
  Settings,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Activity,
  Target,
  Zap,
  X,
  List,
  Server,
  Database,
  Code,
  Layers
} from 'lucide-react'
import { MVP_CONFIG } from '../../config/mvp'
import MVPTaskBoard from './MVPTaskBoard'

const MVPDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [activePhase, setActivePhase] = useState('phase2')
  const [showTaskBoard, setShowTaskBoard] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    systemHealth: 100,
    apiResponseTime: 0,
    errorRate: 0,
    deploymentStatus: 'healthy',
    buildStatus: 'success'
  })

  // Mock real-time updates for development
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        systemHealth: Math.floor(Math.random() * 10) + 90,
        apiResponseTime: Math.floor(Math.random() * 50) + 100,
        errorRate: Math.random() * 2,
        deploymentStatus: 'healthy',
        buildStatus: 'success'
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Updated Phase 2 and Phase 3 progress tracking with current implementation status
  const phases = [
    {
      id: 'phase1',
      name: 'Phase 1: Foundation',
      description: 'Authentication, database, and core infrastructure',
      status: 'completed',
      progress: 100,
      startDate: '2025-01-01',
      endDate: '2025-01-14',
      features: [
        { name: 'User Authentication System', status: 'completed', priority: 'high' },
        { name: 'Basic Dashboard UI', status: 'completed', priority: 'high' },
        { name: 'Database Schema & Models', status: 'completed', priority: 'high' },
        { name: 'Core API Endpoints', status: 'completed', priority: 'high' },
        { name: 'Redux Store Setup', status: 'completed', priority: 'medium' },
        { name: 'Basic Navigation', status: 'completed', priority: 'medium' }
      ]
    },
    {
      id: 'phase2',
      name: 'Phase 2: Domain & Rules',
      description: 'Core domain management and traffic processing engine',
      status: 'in_progress',
      progress: 90,
      startDate: '2025-01-15',
      endDate: '2025-01-28',
      features: [
        { name: 'Domain Management CRUD', status: 'completed', priority: 'high' },
        { name: 'Domain Verification System', status: 'completed', priority: 'high' },
        { name: 'Traffic Processing Engine', status: 'completed', priority: 'high' },
        { name: 'Rules Engine Implementation', status: 'completed', priority: 'high' },
        { name: 'Bot Detection System', status: 'completed', priority: 'high' },
        { name: 'Real-time Traffic Logging', status: 'in_progress', priority: 'high' },
        { name: 'Rule Testing & Validation', status: 'completed', priority: 'medium' },
        { name: 'DNS Record Validation', status: 'completed', priority: 'medium' }
      ]
    },
    {
      id: 'phase3',
      name: 'Phase 3: Analytics & Billing',
      description: 'Real-time analytics dashboard and billing integration',
      status: 'in_progress',
      progress: 80,
      startDate: '2025-01-29',
      endDate: '2025-02-11',
      features: [
        { name: 'Real-time Analytics API', status: 'completed', priority: 'high' },
        { name: 'Billing System Integration', status: 'completed', priority: 'high' },
        { name: 'Usage Tracking & Limits', status: 'completed', priority: 'high' },
        { name: 'Subscription Management', status: 'completed', priority: 'high' },
        { name: 'Invoice Generation', status: 'in_progress', priority: 'medium' },
        { name: 'Analytics Dashboard UI', status: 'completed', priority: 'high' },
        { name: 'Export Functionality', status: 'in_progress', priority: 'medium' },
        { name: 'Payment Processing', status: 'completed', priority: 'high' }
      ]
    },
    {
      id: 'phase4',
      name: 'Phase 4: Admin & Launch',
      description: 'Admin functionality and MVP launch preparation',
      status: 'pending',
      progress: 30,
      startDate: '2025-02-12',
      endDate: '2025-02-25',
      features: [
        { name: 'Admin Dashboard', status: 'in_progress', priority: 'high' },
        { name: 'User Management System', status: 'pending', priority: 'high' },
        { name: 'System Monitoring', status: 'pending', priority: 'high' },
        { name: 'Performance Optimization', status: 'pending', priority: 'medium' },
        { name: 'Security Hardening', status: 'pending', priority: 'high' },
        { name: 'Launch Preparation', status: 'pending', priority: 'high' },
        { name: 'Documentation & Help', status: 'pending', priority: 'medium' }
      ]
    }
  ]

  const getCurrentPhase = () => {
    return phases.find(phase => phase.id === activePhase) || phases[1]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call to refresh data
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const mvpMetrics = {
    totalFeatures: phases.reduce((acc, phase) => acc + phase.features.length, 0),
    completedFeatures: phases.reduce((acc, phase) => 
      acc + phase.features.filter(f => f.status === 'completed').length, 0
    ),
    inProgressFeatures: phases.reduce((acc, phase) => 
      acc + phase.features.filter(f => f.status === 'in_progress').length, 0
    ),
    pendingFeatures: phases.reduce((acc, phase) => 
      acc + phase.features.filter(f => f.status === 'pending').length, 0
    ),
  }

  const overallProgress = Math.round((mvpMetrics.completedFeatures / mvpMetrics.totalFeatures) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MVP Development Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track progress towards MVP launch - Phase 2 & 3 Implementation Complete
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTaskBoard(!showTaskBoard)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Target className="w-4 h-4 mr-2" />
            Task Board
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Phase 2 & 3 Backend Implementation Complete!</h3>
            <p className="text-sm text-green-700 mt-1">
              Domain management, rules engine, traffic processing, analytics, and billing systems are now fully implemented.
            </p>
          </div>
        </div>
      </div>

      {/* MVP Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{mvpMetrics.completedFeatures}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            of {mvpMetrics.totalFeatures} features
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{mvpMetrics.inProgressFeatures}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Active development
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeStats.systemHealth}%</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">
            All systems operational
          </p>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Development Phases</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePhase === phase.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {phase.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phase Details */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    {getCurrentPhase().name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getCurrentPhase().status)}`}>
                    {getStatusIcon(getCurrentPhase().status)}
                    <span className="ml-1">{getCurrentPhase().status.replace('_', ' ')}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getCurrentPhase().description}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{getCurrentPhase().progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCurrentPhase().progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium">{getCurrentPhase().startDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <p className="font-medium">{getCurrentPhase().endDate}</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Features</h5>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getCurrentPhase().features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(feature.status)}
                      <span className="ml-2 text-sm text-gray-900">{feature.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                        {feature.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Backend APIs</h3>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Traffic Processing Engine</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Domain Verification System</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Analytics & Billing APIs</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Rules Engine</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Domain Models</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Traffic Logs</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Analytics Schema</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>Billing Records</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Code className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              In Progress
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>MVP Dashboard</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span>API Integration</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              <span>Domain Management UI</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              <span>Analytics Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Development Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeStats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Zap className="w-6 h-6 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Response</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeStats.apiResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeStats.errorRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Achievements</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Traffic Processing Engine Complete</p>
                <p className="text-xs text-gray-500">Real-time traffic analysis, bot detection, and geographic IP analysis implemented</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Domain Verification System</p>
                <p className="text-xs text-gray-500">DNS record validation and domain ownership verification ready</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Billing Integration</p>
                <p className="text-xs text-gray-500">Stripe payment processing and subscription management implemented</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics APIs</p>
                <p className="text-xs text-gray-500">Real-time analytics endpoints and dashboard data ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Feature Flags</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(MVP_CONFIG.FEATURE_FLAGS).map(([flag, enabled]) => (
              <div key={flag} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {flag.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="flex items-center">
                  {enabled ? (
                    <Play className="w-4 h-4 text-green-600" />
                  ) : (
                    <Pause className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MVP Launch Readiness */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">MVP Launch Readiness</h3>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {overallProgress}% Ready
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Core Systems</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend Infrastructure</span>
                <span className="text-sm font-medium text-green-600">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Integration</span>
                <span className="text-sm font-medium text-green-600">90%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Schema</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">User Features</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Domain Management</span>
                <span className="text-sm font-medium text-green-600">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analytics Dashboard</span>
                <span className="text-sm font-medium text-yellow-600">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Billing System</span>
                <span className="text-sm font-medium text-green-600">80%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Board Modal */}
      {showTaskBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">MVP Task Board</h3>
              <button
                onClick={() => setShowTaskBoard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
              <MVPTaskBoard phases={phases} onClose={() => setShowTaskBoard(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MVPDashboard