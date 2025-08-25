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
  Stop,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  FileText,
  BookOpen,
  Clipboard,
  CheckSquare,
  XSquare,
  AlertCircle as AlertCircleIcon
} from 'lucide-react'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import DashboardWidget from '../ui/DashboardWidget'
import AdvancedCharts from '../charts/AdvancedCharts'
import AdvancedDataTable from '../ui/AdvancedDataTable'


const ComplianceManagementSystem = () => {
  const [complianceData, setComplianceData] = useState(null)
  const [frameworks, setFrameworks] = useState([])
  const [audits, setAudits] = useState([])
  const [violations, setViolations] = useState([])
  const [performance, setPerformance] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedFramework, setSelectedFramework] = useState(null)
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [complianceLevel, setComplianceLevel] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [expandedWidgets, setExpandedWidgets] = useState(new Set())
  
  const updateIntervalRef = useRef(null)

  useEffect(() => {
    loadComplianceData()
    if (autoRefresh) {
      startAutoRefresh()
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [complianceLevel])

  const loadComplianceData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for compliance data
      const [frameworksData, auditsData, violationsData, performanceData] = await Promise.all([
        generateFrameworksData(),
        generateAuditsData(),
        generateViolationsData(),
        generatePerformanceData()
      ])
      
      setFrameworks(frameworksData)
      setAudits(auditsData)
      setViolations(violationsData)
      setPerformance(performanceData)
      
      setComplianceData({
        frameworks: frameworksData,
        audits: auditsData,
        violations: violationsData,
        performance: performanceData
      })
      
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutoRefresh = () => {
    updateIntervalRef.current = setInterval(() => {
      loadComplianceData()
    }, 60000) // Refresh every minute
  }

  // Mock data generators
  const generateFrameworksData = async () => {
    return [
      {
        id: 'gdpr',
        name: 'GDPR (General Data Protection Regulation)',
        version: '2018',
        status: 'compliant',
        score: 96.8,
        lastAudit: '2024-01-15',
        nextAudit: '2024-07-15',
        controls: 45,
        passed: 43,
        failed: 2,
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        description: 'European data protection and privacy regulation',
        requirements: ['Data Protection', 'Privacy Rights', 'Consent Management', 'Data Breach Notification'],
        riskLevel: 'low',
        owner: 'Legal Team',
        certification: 'Certified',
        expiryDate: '2025-01-15'
      },
      {
        id: 'soc2',
        name: 'SOC 2 Type II',
        version: '2017',
        status: 'compliant',
        score: 92.4,
        lastAudit: '2024-02-01',
        nextAudit: '2024-08-01',
        controls: 67,
        passed: 62,
        failed: 5,
        critical: 0,
        high: 2,
        medium: 2,
        low: 1,
        description: 'Service Organization Control 2 certification for security, availability, and confidentiality',
        requirements: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
        riskLevel: 'low',
        owner: 'Security Team',
        certification: 'Certified',
        expiryDate: '2025-02-01'
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        version: '2013',
        status: 'compliant',
        score: 89.7,
        lastAudit: '2024-01-30',
        nextAudit: '2024-07-30',
        controls: 114,
        passed: 102,
        failed: 12,
        critical: 0,
        high: 3,
        medium: 6,
        low: 3,
        description: 'Information security management system standard',
        requirements: ['Information Security', 'Risk Management', 'Asset Management', 'Access Control'],
        riskLevel: 'medium',
        owner: 'IT Security',
        certification: 'Certified',
        expiryDate: '2025-01-30'
      },
      {
        id: 'pci',
        name: 'PCI DSS',
        version: '4.0',
        status: 'compliant',
        score: 98.1,
        lastAudit: '2024-02-10',
        nextAudit: '2024-08-10',
        controls: 78,
        passed: 76,
        failed: 2,
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        description: 'Payment Card Industry Data Security Standard',
        requirements: ['Cardholder Data Protection', 'Vulnerability Management', 'Access Control', 'Monitoring'],
        riskLevel: 'low',
        owner: 'Finance Team',
        certification: 'Certified',
        expiryDate: '2025-02-10'
      },
      {
        id: 'hipaa',
        name: 'HIPAA',
        version: '1996',
        status: 'compliant',
        score: 91.3,
        lastAudit: '2024-01-20',
        nextAudit: '2024-07-20',
        controls: 52,
        passed: 47,
        failed: 5,
        critical: 0,
        high: 2,
        medium: 2,
        low: 1,
        description: 'Health Insurance Portability and Accountability Act',
        requirements: ['Privacy Rule', 'Security Rule', 'Breach Notification', 'Enforcement'],
        riskLevel: 'medium',
        owner: 'Healthcare Team',
        certification: 'Certified',
        expiryDate: '2025-01-20'
      }
    ]
  }

  const generateAuditsData = async () => {
    return [
      {
        id: 'audit-001',
        framework: 'GDPR',
        type: 'internal',
        status: 'completed',
        startDate: '2024-01-10',
        endDate: '2024-01-15',
        auditor: 'Internal Audit Team',
        score: 96.8,
        findings: 2,
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        recommendations: 3,
        implemented: 2,
        pending: 1,
        report: 'gdpr-audit-2024-01.pdf',
        nextAudit: '2024-07-15'
      },
      {
        id: 'audit-002',
        framework: 'SOC 2',
        type: 'external',
        status: 'in_progress',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        auditor: 'Deloitte & Touche',
        score: 92.4,
        findings: 5,
        critical: 0,
        high: 2,
        medium: 2,
        low: 1,
        recommendations: 8,
        implemented: 5,
        pending: 3,
        report: 'soc2-audit-2024-02.pdf',
        nextAudit: '2024-08-01'
      },
      {
        id: 'audit-003',
        framework: 'ISO 27001',
        type: 'external',
        status: 'completed',
        startDate: '2024-01-25',
        endDate: '2024-01-30',
        auditor: 'BSI Group',
        score: 89.7,
        findings: 12,
        critical: 0,
        high: 3,
        medium: 6,
        low: 3,
        recommendations: 15,
        implemented: 10,
        pending: 5,
        report: 'iso27001-audit-2024-01.pdf',
        nextAudit: '2024-07-30'
      }
    ]
  }

  const generateViolationsData = async () => {
    return [
      {
        id: 'viol-001',
        framework: 'GDPR',
        type: 'data_breach',
        severity: 'high',
        status: 'resolved',
        description: 'Unauthorized access to customer personal data',
        date: '2024-01-12',
        affectedUsers: 150,
        dataExposed: 'Email addresses, names',
        notificationSent: true,
        notificationDate: '2024-01-13',
        resolution: 'Access revoked, additional security measures implemented',
        fine: 0,
        complianceImpact: 'medium',
        remediation: 'Completed'
      },
      {
        id: 'viol-002',
        framework: 'SOC 2',
        type: 'access_control',
        severity: 'medium',
        status: 'investigating',
        description: 'Insufficient access controls for admin accounts',
        date: '2024-02-05',
        affectedUsers: 0,
        dataExposed: 'None',
        notificationSent: false,
        notificationDate: null,
        resolution: 'Under investigation',
        fine: 0,
        complianceImpact: 'low',
        remediation: 'In Progress'
      },
      {
        id: 'viol-003',
        framework: 'ISO 27001',
        type: 'security_incident',
        severity: 'low',
        status: 'resolved',
        description: 'Minor security configuration drift detected',
        date: '2024-01-28',
        affectedUsers: 0,
        dataExposed: 'None',
        notificationSent: false,
        notificationDate: null,
        resolution: 'Configuration restored to baseline',
        fine: 0,
        complianceImpact: 'low',
        remediation: 'Completed'
      }
    ]
  }

  const generatePerformanceData = async () => {
    const now = new Date()
    const labels = []
    const complianceScoreData = []
    const auditFindingsData = []
    const violationsData = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
      
      complianceScoreData.push(85 + Math.random() * 15)
      auditFindingsData.push(Math.floor(Math.random() * 20) + 5)
      violationsData.push(Math.floor(Math.random() * 5) + 1)
    }

    return {
      complianceScoreChart: {
        labels,
        datasets: [
          {
            label: 'Overall Compliance Score',
            data: complianceScoreData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      auditFindingsChart: {
        labels,
        datasets: [
          {
            label: 'Audit Findings',
            data: auditFindingsData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      frameworkComparison: {
        labels: ['GDPR', 'SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'],
        datasets: [{
          label: 'Compliance Score',
          data: [96.8, 92.4, 89.7, 98.1, 91.3],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      },
      complianceMetrics: {
        labels: ['Data Protection', 'Access Control', 'Security Monitoring', 'Incident Response', 'Risk Management'],
        datasets: [{
          label: 'Compliance Performance',
          data: [94.2, 91.8, 96.5, 88.9, 93.1],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2
        }]
      }
    }
  }

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'compliant': return '#10b981'
      case 'non_compliant': return '#ef4444'
      case 'at_risk': return '#f59e0b'
      case 'pending': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getAuditStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'in_progress': return '#f59e0b'
      case 'scheduled': return '#3b82f6'
      case 'overdue': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getViolationSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const handleFrameworkAction = (frameworkId, action) => {
    console.log(`Framework ${action}:`, frameworkId)
    // In real implementation, this would trigger the appropriate action
  }

  const handleAuditAction = (auditId, action) => {
    console.log(`Audit ${action}:`, auditId)
    // In real implementation, this would trigger the appropriate action
  }

  const frameworkColumns = [
    { key: 'name', label: 'Framework', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'score', label: 'Score', type: 'percentage', sortable: true },
    { key: 'controls', label: 'Controls', type: 'number', sortable: true },
    { key: 'failed', label: 'Failed', type: 'number', sortable: true },
    { key: 'riskLevel', label: 'Risk Level', type: 'badge', sortable: true },
    { key: 'nextAudit', label: 'Next Audit', type: 'date', sortable: true },
    { key: 'certification', label: 'Certification', type: 'badge', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const auditColumns = [
    { key: 'framework', label: 'Framework', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'auditor', label: 'Auditor', type: 'text', sortable: true },
    { key: 'score', label: 'Score', type: 'percentage', sortable: true },
    { key: 'findings', label: 'Findings', type: 'number', sortable: true },
    { key: 'recommendations', label: 'Recommendations', type: 'number', sortable: true },
    { key: 'nextAudit', label: 'Next Audit', type: 'date', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  const violationColumns = [
    { key: 'framework', label: 'Framework', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'severity', label: 'Severity', type: 'status', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'affectedUsers', label: 'Affected Users', type: 'number', sortable: true },
    { key: 'complianceImpact', label: 'Impact', type: 'badge', sortable: true },
    { key: 'remediation', label: 'Remediation', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading compliance data..." />
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
            Compliance Management System
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive compliance monitoring, audit trails, and regulatory reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={complianceLevel}
            onChange={(e) => setComplianceLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Frameworks</option>
            <option value="compliant">Compliant Only</option>
            <option value="at_risk">At Risk</option>
            <option value="non_compliant">Non-Compliant</option>
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
            onClick={loadComplianceData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Overall Compliance"
          icon={ShieldCheck}
          variant="success"
          metrics={[
            {
              label: 'Score',
              value: `${(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length).toFixed(1)}%`,
              change: 2.1,
              icon: ShieldCheck
            }
          ]}
          trend={2.1}
          status="improving"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length).toFixed(1)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              average compliance score
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Active Frameworks"
          icon={FileText}
          variant="highlight"
          metrics={[
            {
              label: 'Compliant',
              value: frameworks.filter(f => f.status === 'compliant').length.toString(),
              change: 0,
              icon: FileText
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {frameworks.filter(f => f.status === 'compliant').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              of {frameworks.length} frameworks compliant
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Open Violations"
          icon={AlertTriangle}
          variant="warning"
          metrics={[
            {
              label: 'Critical',
              value: violations.filter(v => v.severity === 'critical').length.toString(),
              change: -15.2,
              icon: AlertTriangle
            }
          ]}
          trend={-15.2}
          status="improving"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {violations.filter(v => v.status !== 'resolved').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              open violations
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Upcoming Audits"
          icon={Calendar}
          variant="accent"
          metrics={[
            {
              label: 'Next 30 Days',
              value: frameworks.filter(f => {
                const nextAudit = new Date(f.nextAudit)
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                return nextAudit <= thirtyDaysFromNow
              }).length.toString(),
              change: 0,
              icon: Calendar
            }
          ]}
          status="stable"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {frameworks.filter(f => {
                const nextAudit = new Date(f.nextAudit)
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                return nextAudit <= thirtyDaysFromNow
              }).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              audits in next 30 days
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Compliance Frameworks */}
      <DashboardWidget
        title="Compliance Frameworks"
        icon={Shield}
        variant="default"
        expandable={true}
        onRefresh={() => loadComplianceData()}
      >
        <AdvancedDataTable
          data={frameworks}
          columns={frameworkColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(framework) => setSelectedFramework(framework)}
          className="mt-4"
          emptyMessage="No compliance frameworks available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (framework) => setSelectedFramework(framework),
              variant: 'ghost'
            },
            {
              label: 'Download Report',
              icon: Download,
              onClick: (framework) => handleFrameworkAction(framework.id, 'download'),
              variant: 'ghost'
            },
            {
              label: 'Schedule Audit',
              icon: Calendar,
              onClick: (framework) => handleFrameworkAction(framework.id, 'audit'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* Compliance Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Score Trends */}
        <DashboardWidget
          title="Compliance Score Trends"
          icon={TrendingUp}
          variant="success"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <AdvancedCharts
            title="Compliance Score Over Time"
            data={performance.complianceScoreChart}
            type="line"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadComplianceData()}
          />
        </DashboardWidget>
        
        {/* Framework Comparison */}
        <DashboardWidget
          title="Framework Comparison"
          icon={BarChart3}
          variant="highlight"
          expandable={true}
          onRefresh={() => loadComplianceData()}
        >
          <AdvancedCharts
            title="Compliance Scores by Framework"
            data={performance.frameworkComparison}
            type="bar"
            height={350}
            showControls={true}
            showLegend={true}
            showTooltip={true}
            showGrid={true}
            showAxis={true}
            refreshData={() => loadComplianceData()}
          />
        </DashboardWidget>
      </div>

      {/* Audit Management */}
      <DashboardWidget
        title="Audit Management"
        icon={Clipboard}
        variant="warning"
        expandable={true}
        onRefresh={() => loadComplianceData()}
      >
        <AdvancedDataTable
          data={audits}
          columns={auditColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          onRowClick={(audit) => setSelectedAudit(audit)}
          className="mt-4"
          emptyMessage="No audits available"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (audit) => setSelectedAudit(audit),
              variant: 'ghost'
            },
            {
              label: 'Download Report',
              icon: Download,
              onClick: (audit) => handleAuditAction(audit.id, 'download'),
              variant: 'ghost'
            },
            {
              label: 'Update Status',
              icon: Edit,
              onClick: (audit) => handleAuditAction(audit.id, 'update'),
              variant: 'ghost'
            }
          ]}
        />
      </DashboardWidget>

      {/* Violations Management */}
      <DashboardWidget
        title="Compliance Violations"
        icon={AlertTriangle}
        variant="danger"
        expandable={true}
        onRefresh={() => loadComplianceData()}
      >
        <AdvancedDataTable
          data={violations}
          columns={violationColumns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          selectable={false}
          pagination={true}
          pageSize={5}
          className="mt-4"
          emptyMessage="No violations reported"
          actions={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: (violation) => handleFrameworkAction(violation.id, 'view'),
              variant: 'ghost'
            },
            {
              label: 'Update Status',
              icon: Edit,
              onClick: (violation) => handleFrameworkAction(violation.id, 'update'),
              variant: 'ghost'
            },
            {
              label: 'Escalate',
              icon: AlertTriangle,
              onClick: (violation) => handleFrameworkAction(violation.id, 'escalate'),
              variant: 'warning'
            }
          ]}
        />
      </DashboardWidget>

      {/* Compliance Metrics */}
      <DashboardWidget
        title="Compliance Performance Metrics"
        icon={Target}
        variant="accent"
        expandable={true}
        onRefresh={() => loadComplianceData()}
      >
        <AdvancedCharts
          title="Performance by Category"
          data={performance.complianceMetrics}
          type="radar"
          height={400}
          showControls={true}
          showLegend={true}
          showTooltip={true}
          showGrid={true}
          showAxis={true}
          refreshData={() => loadComplianceData()}
        />
      </DashboardWidget>

      {/* Compliance Summary */}
      <Card header="Compliance Summary" animation="fade-in-up" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <ShieldCheck className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Overall Compliance
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length).toFixed(1)}% with {frameworks.length} frameworks
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Clipboard className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Recent Audits
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {audits.filter(a => a.status === 'completed').length} completed audits
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
            <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Open Violations
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {violations.filter(v => v.status !== 'resolved').length} violations being addressed
            </p>
          </div>
        </div>
      </Card>

      {/* Framework Details Modal */}
      <AnimatePresence>
        {selectedFramework && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedFramework(null)}
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
                    <Shield className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedFramework.name}
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFramework(null)}
                >
                  Close
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Framework Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Version:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Risk Level:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Owner:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.owner}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Compliance Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Score:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Controls:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.controls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Failed:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Certification:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{selectedFramework.certification}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Requirements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFramework.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={() => handleFrameworkAction(selectedFramework.id, 'download')}>
                    Download Report
                  </Button>
                  <Button variant="primary" onClick={() => handleFrameworkAction(selectedFramework.id, 'audit')}>
                    Schedule Audit
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

export default ComplianceManagementSystem
