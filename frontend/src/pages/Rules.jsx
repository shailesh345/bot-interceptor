import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { safeFilter, safeLength } from '../utils/safeArray'
import toast from 'react-hot-toast'
import { 
  fetchRules, 
  createRule, 
  updateRule, 
  deleteRule, 
  testRule 
} from '../store/slices/rulesSlice'
import { mockAPI } from '../services/comprehensiveMockAPI'
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, Play, Pause, 
  Shield, Bot, Globe, Clock, AlertTriangle, CheckCircle,
  Eye, Settings, Code, Zap, Target, Activity, X, TestTube
} from 'lucide-react'

// Rule Form Modal Component
const RuleFormModal = ({ isOpen, onClose, rule = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || 'bot_detection',
    priority: rule?.priority || 1,
    status: rule?.status || 'active',
    conditions: rule?.conditions || [{ field: 'user_agent', operator: 'contains', value: '', connector: null }],
    actions: rule?.actions || [{ type: 'block_request', value: true }],
    domains: rule?.domains || []
  })

  const conditionFields = [
    { value: 'user_agent', label: 'User Agent' },
    { value: 'ip', label: 'IP Address' },
    { value: 'ip_range', label: 'IP Range' },
    { value: 'path', label: 'Request Path' },
    { value: 'method', label: 'HTTP Method' },
    { value: 'country', label: 'Country' },
    { value: 'requests_per_minute', label: 'Requests per Minute' }
  ]

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'in', label: 'In Range' },
    { value: 'not_in', label: 'Not In Range' }
  ]

  const actionTypes = [
    { value: 'block_request', label: 'Block Request' },
    { value: 'allow_request', label: 'Allow Request' },
    { value: 'charge_premium', label: 'Charge Premium' },
    { value: 'rate_limit', label: 'Rate Limit' },
    { value: 'log_event', label: 'Log Event' },
    { value: 'return_status', label: 'Return Status Code' }
  ]

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: 'user_agent', operator: 'contains', value: '', connector: 'AND' }]
    })
  }

  const removeCondition = (index) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index)
    setFormData({ ...formData, conditions: newConditions })
  }

  const updateCondition = (index, field, value) => {
    const newConditions = [...formData.conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setFormData({ ...formData, conditions: newConditions })
  }

  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'log_event', value: '' }]
    })
  }

  const removeAction = (index) => {
    const newActions = formData.actions.filter((_, i) => i !== index)
    setFormData({ ...formData, actions: newActions })
  }

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setFormData({ ...formData, actions: newActions })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate rule name
    if (!formData.name.trim()) {
      toast.error('Rule name is required')
      return
    }
    
    // Validate description
    if (!formData.description.trim()) {
      toast.error('Rule description is required')
      return
    }
    
    // Validate conditions
    if (formData.conditions.length === 0) {
      toast.error('At least one condition is required')
      return
    }
    
    // Validate each condition has all required fields
    for (let i = 0; i < formData.conditions.length; i++) {
      const condition = formData.conditions[i]
      if (!condition.field || !condition.operator || !condition.value.trim()) {
        toast.error(`Condition ${i + 1} is incomplete. Please fill all fields.`)
        return
      }
    }
    
    // Validate actions
    if (formData.actions.length === 0) {
      toast.error('At least one action is required')
      return
    }
    
    // Validate each action has all required fields
    for (let i = 0; i < formData.actions.length; i++) {
      const action = formData.actions[i]
      if (!action.type || (!action.value && action.type !== 'block_request')) {
        toast.error(`Action ${i + 1} is incomplete. Please fill all fields.`)
        return
      }
    }
    
    // Validate priority range
    if (formData.priority < 1 || formData.priority > 100) {
      toast.error('Priority must be between 1 and 100')
      return
    }
    
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {rule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter rule name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bot_detection">Bot Detection</option>
                <option value="rate_limiting">Rate Limiting</option>
                <option value="whitelist">Whitelist</option>
                <option value="blacklist">Blacklist</option>
                <option value="geo_blocking">Geo Blocking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe what this rule does"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Conditions</h3>
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Add Condition
              </button>
            </div>

            <div className="space-y-3">
              {formData.conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  {index > 0 && (
                    <select
                      value={condition.connector || 'AND'}
                      onChange={(e) => updateCondition(index, 'connector', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}

                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {conditionFields.map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>

                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="flex-2 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Value"
                  />

                  {formData.conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Actions</h3>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Add Action
              </button>
            </div>

            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, 'type', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={action.value}
                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                    className="flex-2 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Value"
                  />

                  {formData.actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const Rules = () => {
  const dispatch = useDispatch()
  const { rules, loading, error } = useSelector((state) => state.rules)
  
  // Local state
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRules, setSelectedRules] = useState([])
  const [showTestModal, setShowTestModal] = useState(false)
  const [testingRule, setTestingRule] = useState(null)

  useEffect(() => {
    dispatch(fetchRules())
  }, [dispatch])

  // Filter rules based on search and filters
  const filteredRules = safeFilter(rules, rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || rule.type === filterType
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateRule = (formData) => {
    dispatch(createRule(formData))
      .unwrap()
      .then(() => {
        toast.success('Rule created successfully!')
        setShowFormModal(false)
      })
      .catch((error) => {
        toast.error(error || 'Failed to create rule')
      })
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    setShowFormModal(true)
  }

  const handleUpdateRule = (formData) => {
    if (!editingRule) return
    
    dispatch(updateRule({ id: editingRule.id, data: formData }))
      .unwrap()
      .then(() => {
        toast.success('Rule updated successfully!')
        setShowFormModal(false)
        setEditingRule(null)
      })
      .catch((error) => {
        toast.error(error || 'Failed to update rule')
      })
  }

  const handleDeleteRule = (rule) => {
    if (window.confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      dispatch(deleteRule(rule.id))
        .unwrap()
        .then(() => {
          toast.success('Rule deleted successfully!')
        })
        .catch((error) => {
          toast.error(error || 'Failed to delete rule')
        })
    }
  }

  const handleToggleRuleStatus = (rule) => {
    const newStatus = rule.status === 'active' ? 'paused' : 'active'
    dispatch(updateRule({ 
      id: rule.id, 
      data: { ...rule, status: newStatus } 
    }))
      .unwrap()
      .then(() => {
        toast.success(`Rule ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`)
      })
      .catch((error) => {
        toast.error(error || 'Failed to update rule status')
      })
  }

  const handleTestRule = (rule) => {
    setTestingRule(rule)
    setShowTestModal(true)
  }

  const handleDuplicateRule = (rule) => {
    const duplicatedRule = {
      ...rule,
      name: `${rule.name} (Copy)`,
      id: undefined
    }
    handleCreateRule(duplicatedRule)
  }

  const handleBulkAction = (action) => {
    if (selectedRules.length === 0) {
      toast.error('Please select rules first')
      return
    }

    const confirmMessage = action === 'delete' 
      ? `Delete ${selectedRules.length} selected rules?`
      : `${action === 'activate' ? 'Activate' : 'Pause'} ${selectedRules.length} selected rules?`

    if (window.confirm(confirmMessage)) {
      selectedRules.forEach(ruleId => {
        if (action === 'delete') {
          dispatch(deleteRule(ruleId))
        } else {
          const rule = rules.find(r => r.id === ruleId)
          if (rule) {
            const newStatus = action === 'activate' ? 'active' : 'paused'
            dispatch(updateRule({ id: ruleId, data: { ...rule, status: newStatus } }))
          }
        }
      })
      setSelectedRules([])
      toast.success(`Bulk ${action} completed!`)
    }
  }

  const getRuleIcon = (type) => {
    switch (type) {
      case 'bot_detection': return Bot
      case 'rate_limiting': return Clock
      case 'whitelist': return CheckCircle
      case 'blacklist': return Shield
      case 'geo_blocking': return Globe
      default: return Target
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      bot_detection: { color: 'bg-red-100 text-red-800', label: 'Bot Detection' },
      rate_limiting: { color: 'bg-yellow-100 text-yellow-800', label: 'Rate Limiting' },
      whitelist: { color: 'bg-green-100 text-green-800', label: 'Whitelist' },
      blacklist: { color: 'bg-red-100 text-red-800', label: 'Blacklist' },
      geo_blocking: { color: 'bg-blue-100 text-blue-800', label: 'Geo Blocking' }
    }
    const config = typeConfig[type] || typeConfig.bot_detection
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <>
      <Helmet>
        <title>Bot Rules - Traffic Interceptor</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bot Detection Rules</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage rules to control bot traffic on your domains.
            </p>
          </div>
          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeLength(safeFilter(rules, r => r.status === 'active'))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rules.reduce((sum, rule) => sum + (rule.hits || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${rules.reduce((sum, rule) => sum + (rule.revenue || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search rules..."
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="bot_detection">Bot Detection</option>
              <option value="rate_limiting">Rate Limiting</option>
              <option value="whitelist">Whitelist</option>
              <option value="blacklist">Blacklist</option>
              <option value="geo_blocking">Geo Blocking</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedRules.length > 0 && (
            <div className="mt-4 flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
              <span className="text-sm text-blue-800">
                {selectedRules.length} rule(s) selected
              </span>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedRules([])}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Rules Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredRules.map((rule) => {
                const IconComponent = getRuleIcon(rule.type)
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Rule Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRules.includes(rule.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRules([...selectedRules, rule.id])
                            } else {
                              setSelectedRules(safeFilter(selectedRules, id => id !== rule.id))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTestRule(rule)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Test Rule"
                        >
                          <TestTube className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateRule(rule)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rule Badges */}
                    <div className="flex items-center space-x-2 mb-4">
                      {getStatusBadge(rule.status)}
                      {getTypeBadge(rule.type)}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Priority: {rule.priority}
                      </span>
                    </div>

                    {/* Rule Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Hits</div>
                        <div className="font-semibold">{(rule.hits || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Revenue</div>
                        <div className="font-semibold text-green-600">${(rule.revenue || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Last Triggered</div>
                        <div className="font-semibold text-xs">
                          {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    {/* Rule Conditions Preview */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Conditions</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        {rule.conditions?.slice(0, 2).map((condition, index) => (
                          <div key={index} className="flex items-center space-x-1 text-xs">
                            {index > 0 && <span className="text-gray-400">{condition.connector}</span>}
                            <span className="font-medium">{condition.field}</span>
                            <span className="text-gray-500">{condition.operator}</span>
                            <span className="font-mono bg-white px-1 rounded">{condition.value}</span>
                          </div>
                        ))}
                        {rule.conditions?.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{rule.conditions.length - 2} more condition(s)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rule Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleRuleStatus(rule)}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                          rule.status === 'active'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {rule.status === 'active' ? (
                          <>
                            <Pause className="h-3 w-3 inline mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 inline mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleTestRule(rule)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
                      >
                        <TestTube className="h-3 w-3 inline mr-1" />
                        Test
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRules.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first bot detection rule.'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowFormModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RuleFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingRule(null)
        }}
        rule={editingRule}
        onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
      />
    </>
  )
}

export default Rules
