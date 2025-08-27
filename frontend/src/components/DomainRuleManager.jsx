import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Shield, Settings, Plus, Edit, Trash2, Eye, 
  Activity, BarChart3, AlertTriangle, CheckCircle, Clock,
  Zap, Target, Filter, RefreshCw, ExternalLink, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

const DomainRuleManager = () => {
  const [domains, setDomains] = useState([])
  const [rules, setRules] = useState([])
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showMonitoringModal, setShowMonitoringModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    ruleType: 'all',
    search: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    setDomains([
      {
        id: '1',
        name: 'shaileshdwivedi.in',
        status: 'active',
        isVerified: true,
        sslEnabled: true,
        trafficEnabled: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastActivity: '2024-12-01T14:20:00Z',
        totalRequests: 125643,
        botRequests: 15420,
        blockedRequests: 12340,
        revenue: 6282.15
      }
    ])

    setRules([
      {
        id: '1',
        name: 'AI Training Bot Blocking',
        description: 'Block AI training bots like GPTBot, ClaudeBot, etc.',
        type: 'bot_detection',
        status: 'active',
        priority: 1,
        conditions: [
          { field: 'user_agent', operator: 'contains', value: 'GPTBot' },
          { field: 'user_agent', operator: 'contains', value: 'ClaudeBot' }
        ],
        actions: [
          { type: 'block_request', value: true },
          { type: 'log_event', value: 'ai_bot_blocked' }
        ],
        domains: ['shaileshdwivedi.in'],
        hits: 125643,
        revenue: 6282.15,
        lastTriggered: '2024-12-01T14:20:00Z'
      },
      {
        id: '2',
        name: 'Web Scraping Bot Detection',
        description: 'Detect and block web scraping bots',
        type: 'bot_detection',
        status: 'active',
        priority: 2,
        conditions: [
          { field: 'user_agent', operator: 'contains', value: 'scraper' },
          { field: 'user_agent', operator: 'contains', value: 'crawler' }
        ],
        actions: [
          { type: 'block_request', value: true },
          { type: 'challenge', value: 'captcha' }
        ],
        domains: ['shaileshdwivedi.in'],
        hits: 98765,
        revenue: 4938.25,
        lastTriggered: '2024-12-01T13:45:00Z'
      }
    ])
  }, [])

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain)
    setShowMonitoringModal(true)
  }

  const handleRuleAttach = (rule, domain) => {
    // In real implementation, this would call the API
    toast.success(`Rule "${rule.name}" attached to ${domain.name}`)
  }

  const handleRuleDetach = (rule, domain) => {
    // In real implementation, this would call the API
    toast.success(`Rule "${rule.name}" detached from ${domain.name}`)
  }

  const getDomainStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRuleStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'draft': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Domain & Rule Management
          </h1>
          <p className="text-gray-600">
            Manage your domains, attach bot detection rules, and monitor website traffic
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Domains</p>
                <p className="text-2xl font-bold text-gray-900">{domains.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rules.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {domains.reduce((sum, d) => sum + d.totalRequests, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${domains.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Domains Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Domains</h2>
              <button
                onClick={() => setShowDomainModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traffic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bot Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {domain.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {domain.isVerified ? 'Verified' : 'Pending Verification'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDomainStatusColor(domain.status)}`}>
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.totalRequests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.botRequests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${domain.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDomainSelect(domain)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Monitor Domain"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowRuleModal(true)}
                          className="text-green-600 hover:text-green-900"
                          title="Attach Rules"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDomainModal(true)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Domain"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Bot Detection Rules</h2>
              <button
                onClick={() => setShowRuleModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attached Domains
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rule.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rule.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rule.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRuleStatusColor(rule.status)}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {rule.domains.map((domain, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.hits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowRuleModal(true)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Rule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowMonitoringModal(true)}
                          className="text-green-600 hover:text-green-900"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Domain Modal */}
      <AnimatePresence>
        {showDomainModal && (
          <DomainModal
            isOpen={showDomainModal}
            onClose={() => setShowDomainModal(false)}
            domain={selectedDomain}
          />
        )}
      </AnimatePresence>

      {/* Rule Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <RuleModal
            isOpen={showRuleModal}
            onClose={() => setShowRuleModal(false)}
            rule={null}
            domains={domains}
          />
        )}
      </AnimatePresence>

      {/* Monitoring Modal */}
      <AnimatePresence>
        {showMonitoringModal && selectedDomain && (
          <MonitoringModal
            isOpen={showMonitoringModal}
            onClose={() => setShowMonitoringModal(false)}
            domain={selectedDomain}
            rules={rules}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Domain Modal Component
const DomainModal = ({ isOpen, onClose, domain }) => {
  const [formData, setFormData] = useState({
    name: domain?.name || '',
    sslEnabled: domain?.sslEnabled || true,
    cdnEnabled: domain?.cdnEnabled || false,
    trafficEnabled: domain?.trafficEnabled || true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle domain creation/update
    toast.success(domain ? 'Domain updated successfully!' : 'Domain created successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {domain ? 'Edit Domain' : 'Add New Domain'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="example.com"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sslEnabled}
              onChange={(e) => setFormData({ ...formData, sslEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 text-sm text-gray-700">Enable SSL</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.cdnEnabled}
              onChange={(e) => setFormData({ ...formData, cdnEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 text-sm text-gray-700">Enable CDN</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.trafficEnabled}
              onChange={(e) => setFormData({ ...formData, trafficEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 text-sm text-gray-700">Enable Traffic Monitoring</label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {domain ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Rule Modal Component
const RuleModal = ({ isOpen, onClose, rule, domains }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || 'bot_detection',
    priority: rule?.priority || 1,
    status: rule?.status || 'active',
    conditions: rule?.conditions || [],
    actions: rule?.actions || [],
    attachedDomains: rule?.domains || []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle rule creation/update
    toast.success(rule ? 'Rule updated successfully!' : 'Rule created successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {rule ? 'Edit Rule' : 'Create New Rule'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="bot_detection">Bot Detection</option>
                <option value="rate_limit">Rate Limiting</option>
                <option value="geo_blocking">Geographic Blocking</option>
                <option value="content_protection">Content Protection</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Attach to Domains</label>
            <div className="mt-2 space-y-2">
              {domains.map((domain) => (
                <label key={domain.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.attachedDomains.includes(domain.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          attachedDomains: [...formData.attachedDomains, domain.name]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          attachedDomains: formData.attachedDomains.filter(d => d !== domain.name)
                        })
                      }
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{domain.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {rule ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Monitoring Modal Component
const MonitoringModal = ({ isOpen, onClose, domain, rules }) => {
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedRule, setSelectedRule] = useState('all')

  const filteredRules = selectedRule === 'all' 
    ? rules 
    : rules.filter(r => r.id === selectedRule)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            Monitoring: {domain.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Filter</label>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Rules</option>
              {rules.map(rule => (
                <option key={rule.id} value={rule.id}>{rule.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-900">{domain.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Bot Requests</p>
                <p className="text-2xl font-bold text-red-900">{domain.botRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Blocked Requests</p>
                <p className="text-2xl font-bold text-yellow-900">{domain.blockedRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Revenue</p>
                <p className="text-2xl font-bold text-green-900">${domain.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Performance */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Rule Performance</h4>
          <div className="space-y-4">
            {filteredRules.map(rule => (
              <div key={rule.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{rule.name}</h5>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{rule.hits.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">hits</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Priority: {rule.priority} | Status: {rule.status}
                  </span>
                  <span className="text-gray-600">
                    Last triggered: {new Date(rule.lastTriggered).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Chart Placeholder */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h4>
          <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Traffic chart will be displayed here</p>
              <p className="text-sm">Real-time monitoring data</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DomainRuleManager
