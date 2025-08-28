import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Eye,
  Lock,
  Key,
  Users,
  Globe,
  Server,
  Database,
  Network,
  Zap,
  Brain,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  Share2,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Info,
  Star,
  Award,
  Lightbulb,
  Rocket,
  Sparkles,
  Cpu,
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
  ShieldCheck,
  ShieldAlert,
  ShieldOff
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const EnterpriseSecurityDashboard = () => {
  const [securityData, setSecurityData] = useState(null)
  const [threats, setThreats] = useState([])
  const [incidents, setIncidents] = useState([])
  const [compliance, setCompliance] = useState({})
  const [performance, setPerformance] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedThreat, setSelectedThreat] = useState(null)
  const [securityLevel, setSecurityLevel] = useState('high')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadSecurityData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [securityLevel])

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for security data
      const [threatsData, incidentsData, complianceData, performanceData] = await Promise.all([
        generateThreatsData(),
        generateIncidentsData(),
        generateComplianceData(),
        generatePerformanceData()
      ])
      
      setThreats(threatsData)
      setIncidents(incidentsData)
      setCompliance(complianceData)
      setPerformance(performanceData)
      
      setSecurityData({
        threats: threatsData,
        incidents: incidentsData,
        compliance: complianceData,
        performance: performanceData
      })
      
    } catch (error) {
      // console.error('Failed to load security data:', error) // Commented to prevent console errors
      toast.error('Failed to load security data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadSecurityData()
    }, 98890) // Refresh every 30 seconds
  }

  // Mock data generators
  const generateThreatsData = async () => {
    return [
      {
        id: 'threat-001',
        type: 'ddos_attack',
        severity: 'critical',
        source: '192.168.1.100',
        target: 'api.example.com',
        description: 'Large-scale DDoS attack detected with 50,000 requests/second',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'active',
        confidence: 98.5,
        impact: 'high',
        mitigation: 'Rate limiting and traffic filtering applied',
        blocked: true,
        requests: 50000,
        duration: '15m',
        location: 'Unknown'
      },
      {
        id: 'threat-002',
        type: 'brute_force',
        severity: 'high',
        source: '203.0.113.45',
        target: 'admin.example.com',
        description: 'Brute force attack on admin panel detected',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'resolved',
        confidence: 94.2,
        impact: 'medium',
        mitigation: 'IP blocked and account locked',
        blocked: true,
        attempts: 1500,
        duration: '45m',
        location: 'Asia'
      },
      {
        id: 'threat-003',
        type: 'sql_injection',
        severity: 'high',
        source: '198.51.100.78',
        target: 'search.example.com',
        description: 'SQL injection attempt detected in search form',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'resolved',
        confidence: 96.8,
        impact: 'high',
        mitigation: 'Request blocked and logged',
        blocked: true,
        attempts: 1,
        duration: '1m',
        location: 'Europe'
      },
      {
        id: 'threat-004',
        type: 'bot_traffic',
        severity: 'medium',
        source: 'Multiple IPs',
        target: 'www.example.com',
        description: 'Bot traffic spike detected with suspicious patterns',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'monitoring',
        confidence: 87.3,
        impact: 'low',
        mitigation: 'Bot detection rules updated',
        blocked: false,
        requests: 25000,
        duration: '2h',
        location: 'Global'
      }
    ]
  }

  const generateIncidentsData = async () => {
    return [
      {
        id: 'inc-001',
        title: 'Data Breach Attempt',
        type: 'data_breach',
        severity: 'critical',
        status: 'investigating',
        description: 'Unauthorized access attempt to customer database',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Security Team',
        priority: 'immediate',
        affectedUsers: 0,
        dataExposed: 'None',
        resolution: 'Access blocked, investigation ongoing',
        compliance: ['GDPR', 'SOC2'],
        sla: '4h',
        timeToResolution: '2h'
      },
      {
        id: 'inc-002',
        title: 'Service Outage',
        type: 'availability',
        severity: 'high',
        status: 'resolved',
        description: 'API service unavailable due to high load',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'DevOps Team',
        priority: 'high',
        affectedUsers: 15000,
        dataExposed: 'None',
        resolution: 'Load balancer configuration updated',
        compliance: ['SLA'],
        sla: '1h',
        timeToResolution: '45m'
      },
      {
        id: 'inc-003',
        title: 'Configuration Drift',
        type: 'compliance',
        severity: 'medium',
        status: 'resolved',
        description: 'Security configuration drift detected in production',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Security Team',
        priority: 'medium',
        affectedUsers: 0,
        dataExposed: 'None',
        resolution: 'Configuration restored to baseline',
        compliance: ['SOC2', 'ISO27001'],
        sla: '24h',
        timeToResolution: '3h'
      }
    ]
  }

  const generateComplianceData = async () => {
    return {
      overall: 94.2,
      frameworks: {
        gdpr: { score: 96.8, status: 'compliant', lastAudit: '2024-01-15' },
        soc2: { score: 92.4, status: 'compliant', lastAudit: '2024-02-01' },
        iso27001: { score: 89.7, status: 'compliant', lastAudit: '2024-01-30' },
        pci: { score: 98.1, status: 'compliant', lastAudit: '2024-02-10' },
        hipaa: { score: 91.3, status: 'compliant', lastAudit: '2024-01-20' }
      },
      controls: {
        access_control: 95.2,
        data_protection: 93.8,
        network_security: 96.1,
        incident_response: 89.4,
        business_continuity: 92.7
      },
      risks: [
        { category: 'High', count: 2, trend: 'decreasing' },
        { category: 'Medium', count: 8, trend: 'stable' },
        { category: 'Low', count: 15, trend: 'decreasing' }
      ]
    }
  }

  const generatePerformanceData = async () => {
    const now = new Date()
    const labels = []
    const threatData = []
    const blockedData = []
    const responseTimeData = []
    
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000)
      labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      
      threatData.push(Math.floor(Math.random() * 50) + 10)
      blockedData.push(Math.floor(Math.random() * 40) + 5)
      responseTimeData.push(Math.random() * 100 + 50)
    }

    return {
      threatChart: {
        labels,
        datasets: [
          {
            label: 'Threats Detected',
            data: threatData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Threats Blocked',
            data: blockedData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      responseTimeChart: {
        labels,
        datasets: [
          {
            label: 'Response Time (ms)',
            data: responseTimeData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      threatTypes: {
        labels: ['DDoS', 'Brute Force', 'SQL Injection', 'XSS', 'Bot Traffic'],
        datasets: [{
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            '#ef4444',
            '#f59e0b',
            '#3b82f6',
            '#8b5cf6',
            '#6b7280'
          ]
        }]
      },
      securityMetrics: {
        labels: ['Detection Rate', 'Block Rate', 'False Positives', 'Response Time', 'Uptime'],
        datasets: [{
          label: 'Security Performance',
          data: [98.5, 96.2, 1.8, 85, 99.97],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2
        }]
      }
    }
  }

  const getThreatSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getThreatTypeIcon = (type) => {
    switch (type) {
      case 'ddos_attack': return <Network className="h-5 w-5" />
      case 'brute_force': return <Key className="h-5 w-5" />
      case 'sql_injection': return <Database className="h-5 w-5" />
      case 'bot_traffic': return <Bot className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'investigating': return '#f59e0b'
      case 'resolved': return '#10b981'
      case 'escalated': return '#ef4444'
      case 'monitoring': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'compliant': return '#10b981'
      case 'non_compliant': return '#ef4444'
      case 'at_risk': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const handleThreatAction = (threatId, action) => {
    // console.log(`Threat ${action}:`, threatId) // Commented to prevent console logs
    // In real implementation, this would trigger the appropriate action
  }

  const handleIncidentAction = (incidentId, action) => {
    // console.log(`Incident ${action}:`, incidentId) // Commented to prevent console logs
    // In real implementation, this would trigger the appropriate action
  }

  const threatColumns = [
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'severity', label: 'Severity', type: 'status', sortable: true },
    { key: 'source', label: 'Source', type: 'text', sortable: true },
    { key: 'target', label: 'Target', type: 'text', sortable: true },
    { key: 'confidence', label: 'Confidence', type: 'percentage', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'blocked', label: 'Blocked', type: 'boolean', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const incidentColumns = [
    { key: 'title', label: 'Incident', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'severity', label: 'Severity', type: 'status', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', type: 'text', sortable: true },
    { key: 'priority', label: 'Priority', type: 'badge', sortable: true },
    { key: 'timeToResolution', label: 'Resolution Time', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading security dashboard..." />
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
            Enterprise Security Dashboard
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive security monitoring, threat detection, and compliance management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={securityLevel}
            onChange={(e) => setSecurityLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="low">Low Security</option>
            <option value="medium">Medium Security</option>
            <option value="high">High Security</option>
            <option value="critical">Critical Security</option>
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
            onClick={loadSecurityData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Active Threats"
          icon={AlertTriangle}
          variant="danger"
          metrics={[
            {
              label: 'Critical',
              value: threats.filter(t => t.severity === 'critical' && t.status === 'active').length.toString(),
              change: 0,
              icon: AlertTriangle
            }
          ]}
          status="alert"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {threats.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              active threats
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Security Score"
          icon={Shield}
          variant="success"
          metrics={[
            {
              label: 'Overall',
              value: `${compliance.overall}%`,
              change: 2.1,
              icon: Shield
            }
          ]}
          trend={2.1}
          status="improving"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {compliance.overall}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              security score
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Open Incidents"
          icon={Activity}
          variant="warning"
          metrics={[
            {
              label: 'High Priority',
              value: incidents.filter(i => i.priority === 'immediate' || i.priority === 'high').length.toString(),
              change: -15.2,
              icon: Activity
            }
          ]}
          trend={-15.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {incidents.filter(i => i.status !== 'resolved').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              open incidents
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Compliance Status"
          icon={CheckCircle}
          variant="accent"
          metrics={[
            {
              label: 'Frameworks',
              value: Object.keys(compliance.frameworks).filter(f => compliance.frameworks[f].status === 'compliant').length.toString(),
              change: 0,
              icon: CheckCircle
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {Object.keys(compliance.frameworks).filter(f => compliance.frameworks[f].status === 'compliant').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              compliant frameworks
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Threat Management */}
      <DashboardWidget
        title="Active Security Threats"
        icon={ShieldAlert}
        variant="danger"
        expandable={true}
        onRefresh={() => loadSecurityData()}
      >
        <AdvancedDataTable
          data={threats}
          columns={threatColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(threat) => setSelectedThreat(threat)}
          className="mt-4"
          emptyMessage="No active threats"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (threat) => setSelectedThreat(threat),
              variant: 'ghost'
            },
            {
              label: 'Block',
              icon: ShieldOff,
              onClick: (threat) => handleThreatAction(threat.id, 'block'),
              variant: 'danger'
            },
            {
              label: 'Investigate',
              icon: Search,
              onClick: (threat) => handleThreatAction(threat.id, 'investigate'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* Security Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Detection */}
        <DashboardWidget
          title="Threat Detection & Blocking"
          icon={Shield}
          variant="success"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <AdvancedCharts
            title="Threat Activity (24h)"
            data={performance.threatChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadSecurityData()}
          />
        </DashboardWidget>
        
        {/* Security Metrics */}
        <DashboardWidget
          title="Security Performance Metrics"
          icon={Target}
          variant="accent"
          expandable={true}
          onRefresh={() => loadSecurityData()}
        >
          <AdvancedCharts
            title="Performance Overview"
            data={performance.securityMetrics}
            type="radar"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadSecurityData()}
          />
        </DashboardWidget>
      </div>

      {/* Incident Management */}
      <DashboardWidget
        title="Security Incidents"
        icon={Activity}
        variant="warning"
        expandable={true}
        onRefresh={() => loadSecurityData()}
      >
        <AdvancedDataTable
          data={incidents}
          columns={incidentColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          className="mt-4"
          emptyMessage="No incidents reported"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (incident) => handleIncidentAction(incident.id, 'view'),
              variant: 'ghost'
            },
            {
              label: 'Update',
              icon: Edit,
              onClick: (incident) => handleIncidentAction(incident.id, 'update'),
              variant: 'ghost'
            },
            {
              label: 'Escalate',
              icon: AlertTriangle,
              onClick: (incident) => handleIncidentAction(incident.id, 'escalate'),
              variant: 'warning'
            }
          ]}
        />
      </DashboardWidget>

      {/* Compliance Overview */}
      <DashboardWidget
        title="Compliance & Risk Management"
        icon={CheckCircle}
        variant="default"
        expandable={true}
        onRefresh={() => loadSecurityData()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Compliance Frameworks
            </h3>
            <div className="space-y-3">
              {Object.entries(compliance.frameworks).map(([framework, data]) => (
                <div key={framework} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getComplianceStatusColor(data.status) }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {framework.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {data.score}%
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {data.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Security Controls
            </h3>
            <div className="space-y-3">
              {Object.entries(compliance.controls).map(([control, score]) => (
                <div key={control} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {control.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardWidget>

      {/* Security Summary */}
      <Card header="Security Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Shield className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Overall Security Score
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {compliance.overall}% with {Object.keys(compliance.frameworks).length} frameworks
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Active Threats
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {threats.filter(t => t.status === 'active').length} threats with {threats.filter(t => t.blocked).length} blocked
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Open Incidents
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {incidents.filter(i => i.status !== 'resolved').length} incidents being managed
            </p>
          </div>
        </div>
      </Card>

      {/* Threat Details Modal */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedThreat(null)}
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
                    <ShieldAlert className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Threat Details
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedThreat(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Threat Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Severity:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.severity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Source:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Target:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.target}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Threat Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Confidence:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Blocked:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.blocked ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedThreat.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Description
                  </h3>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {selectedThreat.description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Mitigation
                  </h3>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {selectedThreat.mitigation}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleThreatAction(selectedThreat.id, 'investigate')}>
                    Investigate
                  </Button>
                  <Button variant="danger" onClick={() => handleThreatAction(selectedThreat.id, 'block')}>
                    Block Threat
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

export default EnterpriseSecurityDashboard
