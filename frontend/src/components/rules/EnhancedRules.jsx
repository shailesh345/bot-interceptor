import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Play,
  Pause,
  Shield,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const EnhancedRules = () => {
  const [rules, setRules] = useState([])
  const [filteredRules, setFilteredRules] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockRules = [
      {
        id: 1,
        name: 'Rate Limiting - API',
        type: 'rate_limiting',
        status: 'active',
        domain: 'api.example.com',
        priority: 'high',
        conditions: ['requests_per_minute > 100'],
        actions: ['block', 'log'],
        created: '2024-01-15',
        lastModified: '2024-01-20',
        hits: 1247,
        description: 'Prevents API abuse by limiting requests per minute'
      },
      {
        id: 2,
        name: 'Bot Detection - User Agent',
        type: 'bot_detection',
        status: 'active',
        domain: 'example.com',
        priority: 'medium',
        conditions: ['user_agent contains "bot"', 'user_agent contains "crawler"'],
        actions: ['challenge', 'log'],
        created: '2024-01-10',
        lastModified: '2024-01-18',
        hits: 892,
        description: 'Detects and challenges bot requests based on user agent'
      },
      {
        id: 3,
        name: 'Geographic Blocking',
        type: 'geographic',
        status: 'paused',
        domain: 'example.com',
        priority: 'low',
        conditions: ['country = "RU"', 'country = "CN"'],
        actions: ['block'],
        created: '2024-01-05',
        lastModified: '2024-01-12',
        hits: 156,
        description: 'Blocks traffic from specific geographic regions'
      }
    ]
    setRules(mockRules)
    setFilteredRules(mockRules)
  }, [])

  // Filter and search rules
  useEffect(() => {
    let filtered = rules

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(rule => rule.status === selectedFilter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRules(filtered)
  }, [rules, searchTerm, selectedFilter])

  const handleCreateRule = () => {
    setShowCreateModal(true)
  }

  const handleEditRule = (rule) => {
    setSelectedRule(rule)
    setShowCreateModal(true)
  }

  const handleDeleteRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(rule => rule.id !== ruleId))
    }
  }

  const handleToggleStatus = (ruleId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rate_limiting': return Clock
      case 'bot_detection': return AlertTriangle
      case 'geographic': return Globe
      default: return Shield
    }
  }

  const RuleCard = ({ rule }) => {
    const [expanded, setExpanded] = useState(false)
    const TypeIcon = getTypeIcon(rule.type)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TypeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black">{rule.name}</h3>
              <p className="text-sm text-gray-600">{rule.domain}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
              {rule.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
              {rule.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{rule.description}</p>

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
          <span>Hits: {rule.hits.toLocaleString()}</span>
          <span>Created: {rule.created}</span>
          <span>Modified: {rule.lastModified}</span>
        </div>

        {/* Expandable Details */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Conditions</h4>
                  <div className="space-y-1">
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.actions.map((action, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleStatus(rule.id)}
              className={`p-2 rounded-lg transition-colors ${
                rule.status === 'active' 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={rule.status === 'active' ? 'Pause Rule' : 'Activate Rule'}
            >
              {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => handleEditRule(rule)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Rule"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDeleteRule(rule.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Rule"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Security Rules</h1>
          <p className="text-gray-600 mt-2">
            Create and manage security rules to protect your domains
          </p>
        </div>
        
        <button
          onClick={handleCreateRule}
          className="mt-4 sm:mt-0 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first security rule'
              }
            </p>
            {!searchTerm && selectedFilter === 'all' && (
              <button
                onClick={handleCreateRule}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Your First Rule
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  {selectedRule ? 'Edit Rule' : 'Create New Rule'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form content would go here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter rule name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this rule does"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      placeholder="example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  {selectedRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedRules
