import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Settings,
  Clock,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Brain,
  Target,
  Activity,
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
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const WorkflowAutomationEngine = () => {
  const [workflows, setWorkflows] = useState([])
  const [executions, setExecutions] = useState([])
  const [schedules, setSchedules] = useState([])
  const [performance, setPerformance] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadWorkflowData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])

  const loadWorkflowData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for workflow data
      const [workflowsData, executionsData, schedulesData, performanceData] = await Promise.all([
        generateWorkflowsData(),
        generateExecutionsData(),
        generateSchedulesData(),
        generatePerformanceData()
      ])
      
      setWorkflows(workflowsData)
      setExecutions(executionsData)
      setSchedules(schedulesData)
      setPerformance(performanceData)
      
    } catch (error) {
      // console.error('Failed to load workflow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadWorkflowData()
    }, 60000) // Refresh every minute
  }

  // Mock data generators
  const generateWorkflowsData = async () => {
    return [
      {
        id: 'wf-001',
        name: 'Data Processing Pipeline',
        description: 'Automated data processing and transformation workflow',
        type: 'data_processing',
        status: 'active',
        priority: 'high',
        complexity: 'advanced',
        lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        successRate: 98.5,
        avgExecutionTime: '45s',
        triggers: ['schedule', 'event', 'manual'],
        steps: 12,
        dependencies: ['database', 'api', 'file_system'],
        owner: 'Data Team',
        version: '2.1.0'
      },
      {
        id: 'wf-002',
        name: 'Security Monitoring',
        description: 'Continuous security threat monitoring and response',
        type: 'security',
        status: 'active',
        priority: 'critical',
        complexity: 'expert',
        lastExecuted: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        successRate: 99.8,
        avgExecutionTime: '12s',
        triggers: ['real_time', 'schedule'],
        steps: 8,
        dependencies: ['security_api', 'threat_intel', 'notification_system'],
        owner: 'Security Team',
        version: '1.8.2'
      },
      {
        id: 'wf-003',
        name: 'Customer Onboarding',
        description: 'Automated customer account setup and verification',
        type: 'business_process',
        status: 'active',
        priority: 'medium',
        complexity: 'intermediate',
        lastExecuted: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        successRate: 95.2,
        avgExecutionTime: '3m 45s',
        triggers: ['webhook', 'manual'],
        steps: 15,
        dependencies: ['crm', 'email_service', 'payment_gateway'],
        owner: 'Customer Success',
        version: '1.5.1'
      },
      {
        id: 'wf-004',
        name: 'Report Generation',
        description: 'Automated business report generation and distribution',
        type: 'reporting',
        status: 'paused',
        priority: 'low',
        complexity: 'basic',
        lastExecuted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        successRate: 92.8,
        avgExecutionTime: '8m 30s',
        triggers: ['schedule'],
        steps: 6,
        dependencies: ['analytics_db', 'email_service', 'file_storage'],
        owner: 'Analytics Team',
        version: '1.2.0'
      }
    ]
  }

  const generateExecutionsData = async () => {
    const now = new Date()
    const executions = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const workflowId = `wf-${(i % 4) + 1}`
      const status = Math.random() > 0.9 ? 'failed' : Math.random() > 0.8 ? 'partial' : 'completed'
      
      executions.push({
        id: `exec-${i}`,
        workflowId,
        workflowName: workflows.find(w => w.id === workflowId)?.name || 'Unknown',
        startTime: date.toISOString(),
        endTime: new Date(date.getTime() + Math.random() * 300000).toISOString(),
        status,
        duration: Math.floor(Math.random() * 300) + 30,
        stepsCompleted: Math.floor(Math.random() * 15) + 1,
        totalSteps: 15,
        errorMessage: status === 'failed' ? 'Database connection timeout' : null,
        triggeredBy: Math.random() > 0.7 ? 'manual' : 'schedule',
        resources: {
          cpu: Math.random() * 50 + 20,
          memory: Math.random() * 30 + 40,
          disk: Math.random() * 20 + 10
        }
      })
    }
    
    return executions
  }

  const generateSchedulesData = async () => {
    return [
      {
        id: 'sch-001',
        workflowId: 'wf-001',
        workflowName: 'Data Processing Pipeline',
        cronExpression: '0 */4 * * *',
        description: 'Every 4 hours',
        timezone: 'UTC',
        status: 'active',
        nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        enabled: true,
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: '5m'
      },
      {
        id: 'sch-002',
        workflowId: 'wf-002',
        workflowName: 'Security Monitoring',
        cronExpression: '*/5 * * * *',
        description: 'Every 5 minutes',
        timezone: 'UTC',
        status: 'active',
        nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        enabled: true,
        retryOnFailure: true,
        maxRetries: 5,
        retryDelay: '1m'
      },
      {
        id: 'sch-003',
        workflowId: 'wf-003',
        workflowName: 'Customer Onboarding',
        cronExpression: '0 */2 * * *',
        description: 'Every 2 hours',
        timezone: 'UTC',
        status: 'active',
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        enabled: true,
        retryOnFailure: true,
        maxRetries: 2,
        retryDelay: '15m'
      },
      {
        id: 'sch-004',
        workflowId: 'wf-004',
        workflowName: 'Report Generation',
        cronExpression: '0 9 * * 1',
        description: 'Every Monday at 9 AM',
        timezone: 'UTC',
        status: 'paused',
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        enabled: false,
        retryOnFailure: false,
        maxRetries: 0,
        retryDelay: '0m'
      }
    ]
  }

  const generatePerformanceData = async () => {
    const now = new Date()
    const labels = []
    const successRateData = []
    const executionTimeData = []
    const activeWorkflowsData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      successRateData.push(90 + Math.random() * 8)
      executionTimeData.push(Math.floor(Math.random() * 300) + 100)
      activeWorkflowsData.push(Math.floor(Math.random() * 3) + 2)
    }

    return {
      successRateChart: {
        labels,
        datasets: [
          {
            label: 'Success Rate',
            data: successRateData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      executionTimeChart: {
        labels,
        datasets: [
          {
            label: 'Average Execution Time (s)',
            data: executionTimeData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      workflowStatus: {
        labels: ['Active', 'Paused', 'Failed', 'Completed'],
        datasets: [{
          data: [
            workflows.filter(w => w.status === 'active').length,
            workflows.filter(w => w.status === 'paused').length,
            workflows.filter(w => w.status === 'failed').length,
            workflows.filter(w => w.status === 'completed').length
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#3b82f6'
          ]
        }]
      }
    }
  }

  const getWorkflowStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'paused': return '#f59e0b'
      case 'failed': return '#ef4444'
      case 'completed': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'expert': return '#ef4444'
      case 'advanced': return '#f59e0b'
      case 'intermediate': return '#3b82f6'
      case 'basic': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getExecutionStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'partial': return '#f59e0b'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const handleWorkflowAction = (workflowId, action) => {
    // console.log(`Workflow ${action}:`, workflowId)
    // In real implementation, this would trigger the appropriate action
  }

  const handleScheduleAction = (scheduleId, action) => {
    // console.log(`Schedule ${action}:`, scheduleId)
    // In real implementation, this would trigger the appropriate action
  }

  const workflowColumns = [
    { key: 'name', label: 'Workflow Name', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'priority', label: 'Priority', type: 'badge', sortable: true },
    { key: 'successRate', label: 'Success Rate', type: 'percentage', sortable: true },
    { key: 'avgExecutionTime', label: 'Avg Time', type: 'text', sortable: true },
    { key: 'steps', label: 'Steps', type: 'number', sortable: true },
    { key: 'owner', label: 'Owner', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const executionColumns = [
    { key: 'workflowName', label: 'Workflow', type: 'text', sortable: true },
    { key: 'startTime', label: 'Start Time', type: 'datetime', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'duration', label: 'Duration (s)', type: 'number', sortable: true },
    { key: 'stepsCompleted', label: 'Progress', type: 'progress', sortable: true },
    { key: 'triggeredBy', label: 'Trigger', type: 'badge', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading workflow automation..." />
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
            Workflow Automation Engine
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Advanced workflow automation, scheduled tasks, and intelligent process management
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
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Workflow
          </Button>
          
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={loadWorkflowData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Active Workflows"
          icon={Workflow}
          variant="success"
          metrics={[
            {
              label: 'Total',
              value: workflows.filter(w => w.status === 'active').length.toString(),
              change: 0,
              icon: Workflow
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              of {workflows.length} total workflows
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Success Rate"
          icon={CheckCircle}
          variant="highlight"
          metrics={[
            {
              label: 'Average',
              value: `${(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length).toFixed(1)}%`,
              change: 2.1,
              icon: CheckCircle
            }
          ]}
          trend={2.1}
          status="improving"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length).toFixed(1)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              overall success rate
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Scheduled Tasks"
          icon={Clock}
          variant="warning"
          metrics={[
            {
              label: 'Active',
              value: schedules.filter(s => s.enabled).length.toString(),
              change: 8.7,
              icon: Clock
            }
          ]}
          trend={8.7}
          status="growing"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {schedules.filter(s => s.enabled).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              scheduled tasks
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Total Executions"
          icon={Activity}
          variant="accent"
          metrics={[
            {
              label: 'Today',
              value: executions.filter(e => new Date(e.startTime).toDateString() === new Date().toDateString()).length.toString(),
              change: 15.2,
              icon: Activity
            }
          ]}
          trend={15.2}
          status="growing"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {executions.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              total executions
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Workflows Management */}
      <DashboardWidget
        title="Workflow Management"
        icon={Workflow}
        variant="default"
        expandable={true}
        onRefresh={() => loadWorkflowData()}
      >
        <AdvancedDataTable
          data={workflows}
          columns={workflowColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(workflow) => setSelectedWorkflow(workflow)}
          className="mt-4"
          emptyMessage="No workflows available"
          actions={[
            {
              label: 'View',
              icon: Eye,
              onClick: (workflow) => setSelectedWorkflow(workflow),
              variant: 'ghost'
            },
            {
              label: 'Edit',
              icon: Edit,
              onClick: (workflow) => handleWorkflowAction(workflow.id, 'edit'),
              variant: 'ghost'
            },
            {
              label: 'Pause',
              icon: Pause,
              onClick: (workflow) => handleWorkflowAction(workflow.id, 'pause'),
              variant: 'ghost'
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: (workflow) => handleWorkflowAction(workflow.id, 'delete'),
              variant: 'ghost',
              className: 'text-red-600'
            }
          ]}
        />
      </DashboardWidget>

      {/* Workflow Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Trends */}
        <DashboardWidget
          title="Success Rate Trends"
          icon={CheckCircle}
          variant="success"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <AdvancedCharts
            title="Success Rate Over Time"
            data={performance.successRateChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadWorkflowData()}
          />
        </DashboardWidget>
        
        {/* Execution Time Analysis */}
        <DashboardWidget
          title="Execution Time Analysis"
          icon={Clock}
          variant="highlight"
          expandable={true}
          onRefresh={() => loadWorkflowData()}
        >
          <AdvancedCharts
            title="Average Execution Time"
            data={performance.executionTimeChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadWorkflowData()}
          />
        </DashboardWidget>
      </div>

      {/* Workflow Status Distribution */}
      <DashboardWidget
        title="Workflow Status Distribution"
        icon={PieChart}
        variant="accent"
        expandable={true}
        onRefresh={() => loadWorkflowData()}
      >
        <AdvancedCharts
          title="Workflow Status Overview"
          data={performance.workflowStatus}
          type="doughnut"
          height={400}
          showControls={true}
          showLegend={true}
          showTooltip={true}
          showGrid={false}
          showAxis={false}
          refreshData={() => loadWorkflowData()}
        />
      </DashboardWidget>

      {/* Recent Executions */}
      <DashboardWidget
        title="Recent Workflow Executions"
        icon={Activity}
        variant="default"
        expandable={true}
        onRefresh={() => loadWorkflowData()}
      >
        <AdvancedDataTable
          data={executions.slice(0, 10)}
          columns={executionColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={false}
          className="mt-4"
          emptyMessage="No executions available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (execution) => {
                // console.log('Execution details:', execution) // Commented for production
              },
              variant: 'ghost'
            },
            {
              label: 'Download Logs',
              icon: Download,
              onClick: (execution) => {
                // console.log('Download logs:', execution.id) // Commented for production
              },
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* Workflow Summary */}
      <Card header="Workflow Automation Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Workflow className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Total Workflows
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {workflows.length} workflows with {workflows.filter(w => w.status === 'active').length} active
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Scheduled Tasks
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {schedules.filter(s => s.enabled).length} active schedules
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Executions Today
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {executions.filter(e => new Date(e.startTime).toDateString() === new Date().toDateString()).length} executions
            </p>
          </div>
        </div>
      </Card>

      {/* Workflow Details Modal */}
      <AnimatePresence>
        {selectedWorkflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedWorkflow(null)}
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
                    <Workflow className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedWorkflow.name}
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedWorkflow(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Workflow Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Priority:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Complexity:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.complexity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Performance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Success Rate:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Avg Execution Time:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.avgExecutionTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Steps:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.steps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Version:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedWorkflow.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Triggers & Dependencies
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Triggers</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Dependencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorkflow.dependencies.map((dep, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleWorkflowAction(selectedWorkflow.id, 'edit')}>
                    Edit Workflow
                  </Button>
                  <Button variant="primary" onClick={() => handleWorkflowAction(selectedWorkflow.id, 'execute')}>
                    Execute Now
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

export default WorkflowAutomationEngine
