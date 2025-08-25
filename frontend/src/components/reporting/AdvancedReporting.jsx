import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Clock,
  Mail,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
import AdvancedSearch from '../common/AdvancedSearch'

const AdvancedReporting = () => {
  const [reports, setReports] = useState([])
  const [templates, setTemplates] = useState([])
  const [scheduledReports, setScheduledReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [exportFormats, setExportFormats] = useState(['pdf', 'excel', 'csv'])
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  
  const reportFormats = [
    { value: 'pdf', label: 'PDF', icon: FileText, color: '#ef4444' },
    { value: 'excel', label: 'Excel', icon: BarChart3, color: '#10b981' },
    { value: 'csv', label: 'CSV', icon: FileText, color: '#3b82f6' },
    { value: 'json', label: 'JSON', icon: FileText, color: '#8b5cf6' }
  ]

  const reportTemplates = [
    {
      id: 1,
      name: 'Executive Summary',
      description: 'High-level overview of traffic, security, and performance metrics',
      category: 'executive',
      frequency: 'weekly',
      sections: ['overview', 'metrics', 'trends', 'recommendations'],
      lastUsed: '2024-01-15T10:30:00Z',
      usageCount: 45
    },
    {
      id: 2,
      name: 'Security Analysis',
      description: 'Detailed security threat analysis and bot detection metrics',
      category: 'security',
      frequency: 'daily',
      sections: ['threats', 'bots', 'blocked', 'anomalies'],
      lastUsed: '2024-01-15T08:15:00Z',
      usageCount: 128
    },
    {
      id: 3,
      name: 'Performance Report',
      description: 'System performance metrics and optimization recommendations',
      category: 'performance',
      frequency: 'daily',
      sections: ['response_time', 'uptime', 'throughput', 'optimization'],
      lastUsed: '2024-01-15T09:45:00Z',
      usageCount: 67
    },
    {
      id: 4,
      name: 'Revenue Analytics',
      description: 'Traffic monetization and revenue optimization insights',
      category: 'revenue',
      frequency: 'weekly',
      sections: ['traffic', 'conversion', 'revenue', 'optimization'],
      lastUsed: '2024-01-14T16:20:00Z',
      usageCount: 23
    }
  ]

  useEffect(() => {
    loadReportingData()
  }, [])

  const loadReportingData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReports(generateMockReports())
      setTemplates(reportTemplates)
      setScheduledReports(generateMockScheduledReports())
      
    } catch (error) {
      console.error('Failed to load reporting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockReports = () => {
    return [
      {
        id: 1,
        name: 'Weekly Executive Summary',
        template: 'Executive Summary',
        format: 'pdf',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:32:00Z',
        size: '2.4 MB',
        downloadUrl: '#',
        sections: ['overview', 'metrics', 'trends'],
        timeframe: '7d'
      },
      {
        id: 2,
        name: 'Security Threat Analysis',
        template: 'Security Analysis',
        format: 'excel',
        status: 'completed',
        createdAt: '2024-01-15T08:15:00Z',
        completedAt: '2024-01-15T08:17:00Z',
        size: '1.8 MB',
        downloadUrl: '#',
        sections: ['threats', 'bots', 'blocked'],
        timeframe: '24h'
      },
      {
        id: 3,
        name: 'Performance Optimization Report',
        template: 'Performance Report',
        format: 'pdf',
        status: 'processing',
        createdAt: '2024-01-15T09:45:00Z',
        completedAt: null,
        size: null,
        downloadUrl: null,
        sections: ['response_time', 'uptime'],
        timeframe: '7d'
      }
    ]
  }

  const generateMockScheduledReports = () => {
    return [
      {
        id: 1,
        name: 'Daily Security Briefing',
        template: 'Security Analysis',
        frequency: 'daily',
        recipients: ['security@company.com', 'admin@company.com'],
        nextRun: '2024-01-16T08:00:00Z',
        lastRun: '2024-01-15T08:00:00Z',
        status: 'active',
        format: 'pdf'
      },
      {
        id: 2,
        name: 'Weekly Executive Dashboard',
        template: 'Executive Summary',
        frequency: 'weekly',
        recipients: ['ceo@company.com', 'cto@company.com'],
        nextRun: '2024-01-22T09:00:00Z',
        lastRun: '2024-01-15T09:00:00Z',
        status: 'active',
        format: 'pdf'
      },
      {
        id: 3,
        name: 'Monthly Performance Review',
        template: 'Performance Report',
        frequency: 'monthly',
        recipients: ['operations@company.com'],
        nextRun: '2024-02-01T10:00:00Z',
        lastRun: '2024-01-01T10:00:00Z',
        status: 'paused',
        format: 'excel'
      }
    ]
  }

  const handleCreateReport = () => {
    setShowCreateModal(true)
  }

  const handleExportReport = (reportId, format) => {
    // Simulate export process
    console.log(`Exporting report ${reportId} in ${format} format`)
    // In real implementation, this would trigger the export API
  }

  const handleScheduleReport = (report) => {
    // Simulate scheduling
    console.log('Scheduling report:', report)
  }

  const handleShareReport = (report) => {
    // Simulate sharing
    console.log('Sharing report:', report)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'warning'
      case 'failed': return 'danger'
      case 'active': return 'success'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'paused': return <Clock className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'daily': return '#ef4444'
      case 'weekly': return '#f59e0b'
      case 'monthly': return '#3b82f6'
      case 'quarterly': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeframeLabel = (timeframe) => {
    switch (timeframe) {
      case '24h': return 'Last 24 Hours'
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      default: return timeframe
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading reporting dashboard..." />
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
            Advanced Reporting
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Generate, schedule, and export comprehensive reports and analytics
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
          <Button onClick={handleCreateReport} icon={Plus} variant="primary">
            Create Report
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card header="Total Reports" animation="fade-in-up" delay={0.1}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {reports.length}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Generated this month
            </p>
          </div>
        </Card>
        
        <Card header="Active Templates" animation="fade-in-up" delay={0.2}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#10b981' }}>
              {templates.length}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Available templates
            </p>
          </div>
        </Card>
        
        <Card header="Scheduled Reports" animation="fade-in-up" delay={0.3}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
              {scheduledReports.filter(r => r.status === 'active').length}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Currently active
            </p>
          </div>
        </Card>
        
        <Card header="Export Formats" animation="fade-in-up" delay={0.4}>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>
              {exportFormats.length}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Supported formats
            </p>
          </div>
        </Card>
      </div>

      {/* Report Templates */}
      <Card header="Report Templates" animation="fade-in-up" delay={0.5}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)'
              }}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedReport(template)}
            >
              <div className="text-center">
                <div className="p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
                  <FileText className="h-8 w-8" style={{ color: 'var(--text-primary)' }} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {template.name}
                </h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{template.frequency}</span>
                  <span>{template.usageCount} uses</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Recent Reports */}
      <Card header="Recent Reports" animation="fade-in-up" delay={0.6}>
        <div className="space-y-3">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-sm"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)'
              }}
              whileHover={{ y: -1 }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                  <FileText className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {report.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" size="sm">
                      {report.template}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {report.format.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(report.status)} size="sm">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span>{report.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Created: {formatDate(report.createdAt)} | Timeframe: {getTimeframeLabel(report.timeframe)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {report.status === 'completed' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Download}
                      onClick={() => handleExportReport(report.id, report.format)}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Share2}
                      onClick={() => handleShareReport(report)}
                    >
                      Share
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Eye}
                  onClick={() => setSelectedReport(report)}
                >
                  View
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card header="Scheduled Reports" animation="fade-in-up" delay={0.7}>
        <div className="space-y-3">
          {scheduledReports.map((scheduled) => (
            <motion.div
              key={scheduled.id}
              className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-sm"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)'
              }}
              whileHover={{ y: -1 }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                  <Calendar className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {scheduled.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" size="sm">
                      {scheduled.template}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      style={{ borderColor: getFrequencyColor(scheduled.frequency) }}
                    >
                      {scheduled.frequency}
                    </Badge>
                    <Badge variant={getStatusColor(scheduled.status)} size="sm">
                      {scheduled.status}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Next run: {formatDate(scheduled.nextRun)} | Recipients: {scheduled.recipients.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Edit}
                  onClick={() => setSelectedReport(scheduled)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Mail}
                  onClick={() => handleScheduleReport(scheduled)}
                >
                  Test
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <Card header="Export Options" animation="fade-in-up" delay={0.8}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportFormats.map((format) => (
            <motion.div
              key={format.value}
              className="p-4 rounded-lg border text-center transition-all duration-200 hover:shadow-md cursor-pointer"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)'
              }}
              whileHover={{ y: -2 }}
              onClick={() => setExportFormats(prev => 
                prev.includes(format.value) 
                  ? prev.filter(f => f !== format.value)
                  : [...prev, format.value]
              )}
            >
              <div 
                className="p-3 rounded-full mx-auto mb-3 w-16 h-16 flex items-center justify-center"
                style={{ 
                  backgroundColor: exportFormats.includes(format.value) 
                    ? format.color + '20' 
                    : 'var(--accent-bg)'
                }}
              >
                <format.icon 
                  className="h-8 w-8" 
                  style={{ 
                    color: exportFormats.includes(format.value) 
                      ? format.color 
                      : 'var(--text-primary)'
                  }} 
                />
              </div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {format.label}
              </h4>
              <div className="mt-2">
                {exportFormats.includes(format.value) ? (
                  <CheckCircle className="h-5 w-5 mx-auto" style={{ color: format.color }} />
                ) : (
                  <div className="h-5 w-5 mx-auto rounded-full border-2" style={{ borderColor: 'var(--border-primary)' }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Advanced Search */}
      <Card header="Search & Filter Reports" animation="fade-in-up" delay={0.9}>
        <AdvancedSearch
          onSearch={(query, filters, sort) => {
            setSearchQuery(query)
            setActiveFilters(filters)
            console.log('Search:', { query, filters, sort })
          }}
          filters={[
            {
              key: 'template',
              label: 'Template',
              type: 'select',
              options: templates.map(t => ({ value: t.id, label: t.name }))
            },
            {
              key: 'format',
              label: 'Format',
              type: 'select',
              options: reportFormats.map(f => ({ value: f.value, label: f.label }))
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'completed', label: 'Completed' },
                { value: 'processing', label: 'Processing' },
                { value: 'failed', label: 'Failed' }
              ]
            },
            {
              key: 'timeframe',
              label: 'Timeframe',
              type: 'select',
              options: [
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' }
              ]
            }
          ]}
          sortOptions={[
            { value: 'created_at', label: 'Created Date' },
            { value: 'name', label: 'Name' },
            { value: 'template', label: 'Template' },
            { value: 'status', label: 'Status' }
          ]}
          showSaveFilters={true}
          searchPlaceholder="Search reports by name, template, or content..."
        />
      </Card>
    </div>
  )
}

export default AdvancedReporting
