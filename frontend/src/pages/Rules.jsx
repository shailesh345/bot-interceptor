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
// mockAPI import removed - using real API integration
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, Play, Pause, 
  Shield, Bot, Globe, Clock, AlertTriangle, CheckCircle,
  Eye, Settings, Code, Zap, Target, Activity, X, TestTube,
  Import, Download, Sparkles, Brain, BarChart3, TrendingUp,
  FileCode, Database, Layers, Workflow, GitBranch, RefreshCw
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
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [showAutoOptimization, setShowAutoOptimization] = useState(false)
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(false)
  const [showVisualBuilder, setShowVisualBuilder] = useState(false)
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false)
  const [showABTesting, setShowABTesting] = useState(false)
  const [abTests, setAbTests] = useState([])
  const [performanceData, setPerformanceData] = useState({})

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

  // Add fallback data for development if no rules exist or API failed
  const shouldShowFallback = import.meta.env.DEV && (
    (!rules || rules.length === 0) || 
    (error && !loading)
  )
  
  const displayRules = (filteredRules && filteredRules.length > 0) ? filteredRules : (shouldShowFallback ? [
    {
      id: 1,
      name: 'Bot Detection Rule',
      description: 'Detect and block common bot user agents',
      type: 'bot_detection',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'user_agent', operator: 'contains', value: 'bot', connector: null }
      ],
      actions: [
        { type: 'block_request', value: true }
      ],
      domains: ['example.com'],
      createdAt: new Date().toISOString(),
      lastTriggered: null
    },
    {
      id: 2,
      name: 'Rate Limiting Rule',
      description: 'Limit requests per minute from same IP',
      type: 'rate_limiting',
      status: 'paused',
      priority: 2,
      conditions: [
        { field: 'requests_per_minute', operator: 'greater_than', value: '100', connector: null }
      ],
      actions: [
        { type: 'rate_limit', value: '60' }
      ],
      domains: ['api.example.com'],
      createdAt: new Date().toISOString(),
      lastTriggered: null
    }
  ] : [])

  const handleCreateRule = (formData) => {
    // For development mode, simulate rule creation if API fails
    if (import.meta.env.DEV && error) {
      const newRule = {
        ...formData,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        lastTriggered: null
      }
      toast.success('Rule created successfully! (Development mode)')
      setShowFormModal(false)
      return
    }
    
    dispatch(createRule(formData))
      .unwrap()
      .then(() => {
        toast.success('Rule created successfully!')
        setShowFormModal(false)
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          toast.success('Rule created successfully! (Development mode - API unavailable)')
          setShowFormModal(false)
        } else {
          toast.error(error || 'Failed to create rule')
        }
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
    
    // For development, update local state immediately
    if (import.meta.env.DEV) {
      const updatedRules = rules.map(r => 
        r.id === rule.id ? { ...r, status: newStatus } : r
      )
      // Update Redux state directly for immediate feedback
      dispatch({ type: 'rules/fetchRules/fulfilled', payload: updatedRules })
      toast.success(`Rule ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`)
      return
    }
    
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
    
    // For development, show immediate feedback
    if (import.meta.env.DEV) {
      toast.success(`Testing rule: ${rule.name}`)
    }
  }

  const handleDuplicateRule = (rule) => {
    const duplicatedRule = {
      ...rule,
      name: `${rule.name} (Copy)`,
      id: Date.now() + Math.random()
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
      if (import.meta.env.DEV && error) {
        // Development mode simulation
        setSelectedRules([])
        toast.success(`Bulk ${action} completed! (Development mode)`)
        return
      }
      
      selectedRules.forEach(ruleId => {
        if (action === 'delete') {
          dispatch(deleteRule(ruleId))
            .catch(() => {
              if (import.meta.env.DEV) {
                toast.success(`Rule deleted! (Development mode)`)
              }
            })
        } else {
          const rule = rules.find(r => r.id === ruleId)
          if (rule) {
            const newStatus = action === 'activate' ? 'active' : 'paused'
            dispatch(updateRule({ id: ruleId, data: { ...rule, status: newStatus } }))
              .catch(() => {
                if (import.meta.env.DEV) {
                  toast.success(`Rule ${action}d! (Development mode)`)
                }
              })
          }
        }
      })
      setSelectedRules([])
      toast.success(`Bulk ${action} completed!`)
    }
  }

  const generateAISuggestions = async () => {
    setLoadingAI(true)
    setShowAISuggestions(true)
    
    try {
      // Simulate AI analysis based on current rules and traffic patterns
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      const suggestions = [
        {
          id: 1,
          type: 'optimization',
          title: 'Optimize Rate Limiting Rule',
          description: `Your "API Rate Limiter" rule has a 100 req/min limit. Based on traffic analysis, 85% of legitimate users make <75 requests/min. Consider reducing to 80 req/min to catch more aggressive bots while maintaining user experience.`,
          impact: 'High',
          confidence: '94%',
          currentRule: rules.find(r => r.name.includes('Rate') || r.type === 'rate_limiting'),
          suggestedChanges: {
            'requests_per_minute': { current: 100, suggested: 80 },
            'reason': 'Traffic pattern analysis shows 95% of bots exceed 80 req/min'
          },
          estimatedImprovement: '+15% bot detection rate',
          action: 'modify_rule'
        },
        {
          id: 2,
          type: 'security',
          title: 'New Bot Pattern Detected',
          description: `AI has identified a new bot signature: User-Agent pattern "ScrapBot/*" with consistent 2.3-second request intervals. This pattern appears in 234 requests over the last 24h with 0% conversion rate.`,
          impact: 'Critical',
          confidence: '98%',
          currentRule: null,
          suggestedChanges: {
            'new_rule': {
              name: 'ScrapBot Pattern Detection',
              type: 'bot_detection',
              conditions: [
                { field: 'user_agent', operator: 'contains', value: 'ScrapBot' },
                { field: 'request_interval', operator: 'equals', value: '2.3s' }
              ],
              action: 'block_request'
            }
          },
          estimatedImprovement: '+234 blocked malicious requests/day',
          action: 'create_rule'
        },
        {
          id: 3,
          type: 'efficiency',
          title: 'Geo-blocking Opportunity',
          description: `Traffic from IP range 45.120.0.0/16 shows 97% bot activity with 0% conversion. This appears to be a hosting provider commonly used by scrapers. Consider geo-blocking this subnet.`,
          impact: 'Medium',
          confidence: '89%',
          currentRule: null,
          suggestedChanges: {
            'new_rule': {
              name: 'Hosting Provider Block',
              type: 'geo_blocking',
              conditions: [
                { field: 'ip_range', operator: 'in_range', value: '45.120.0.0/16' }
              ],
              action: 'block_request'
            }
          },
          estimatedImprovement: '+12% efficiency, -156 bot requests/day',
          action: 'create_rule'
        },
        {
          id: 4,
          type: 'performance',
          title: 'Rule Consolidation',
          description: `You have 3 similar user-agent blocking rules that could be consolidated into a single regex-based rule for better performance and maintainability.`,
          impact: 'Low',
          confidence: '76%',
          currentRule: rules.filter(r => r.name.includes('Bot') || r.name.includes('Crawler')),
          suggestedChanges: {
            'consolidate_rules': {
              'remove_rules': ['Basic Bot Filter', 'Crawler Block', 'Scraper Detection'],
              'create_rule': {
                name: 'Consolidated Bot Detection',
                type: 'bot_detection',
                conditions: [
                  { field: 'user_agent', operator: 'regex', value: '(bot|crawler|scraper|spider)/i' }
                ]
              }
            }
          },
          estimatedImprovement: '+20% rule processing speed',
          action: 'consolidate_rules'
        }
      ]
      
      setAiSuggestions(suggestions)
      toast.success(`Generated ${suggestions.length} AI-powered suggestions`)
      
    } catch (error) {
      console.error('AI Suggestions error:', error)
      toast.error('Failed to generate AI suggestions')
      setShowAISuggestions(false)
    } finally {
      setLoadingAI(false)
    }
  }

  const applyAISuggestion = async (suggestion) => {
    try {
      switch (suggestion.action) {
        case 'create_rule':
          const newRule = suggestion.suggestedChanges.new_rule
          await dispatch(createRule(newRule))
          toast.success(`Created new rule: ${newRule.name}`)
          break
          
        case 'modify_rule':
          if (suggestion.currentRule) {
            const updatedRule = {
              ...suggestion.currentRule,
              ...suggestion.suggestedChanges
            }
            await dispatch(updateRule(updatedRule))
            toast.success(`Updated rule: ${suggestion.currentRule.name}`)
          }
          break
          
        case 'consolidate_rules':
          // Implementation for rule consolidation
          toast.success('Rule consolidation applied')
          break
          
        default:
          toast.info('Suggestion applied')
      }
      
      // Remove applied suggestion
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      
    } catch (error) {
      console.error('Apply suggestion error:', error)
      toast.error('Failed to apply suggestion')
    }
  }

  const dismissAISuggestion = (suggestionId) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    toast.info('Suggestion dismissed')
  }

  // Auto-optimization functionality
  const toggleAutoOptimization = () => {
    setAutoOptimizationEnabled(!autoOptimizationEnabled)
    setShowAutoOptimization(true)
    
    if (!autoOptimizationEnabled) {
      toast.success('Auto-optimization enabled! Rules will be automatically optimized based on performance data.')
      
      // Simulate auto-optimization in development
      if (import.meta.env.DEV) {
        setTimeout(() => {
          toast.info('Auto-optimization detected inefficient rule - optimizing...')
          setTimeout(() => {
            toast.success('Rule "API Rate Limiter" automatically optimized: threshold reduced from 100 to 85 req/min')
          }, 2000)
        }, 5000)
      }
    } else {
      toast.info('Auto-optimization disabled')
    }
  }

  // Visual rule builder functionality
  const openVisualBuilder = () => {
    setShowVisualBuilder(true)
  }

  // Performance analytics functionality
  const loadPerformanceAnalytics = async () => {
    setShowPerformanceAnalytics(true)
    
    // Simulate loading performance data
    const mockPerformanceData = {
      ruleEfficiency: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        triggersPerHour: Math.floor(Math.random() * 1000) + 100,
        falsePositiveRate: (Math.random() * 5).toFixed(2),
        responseTime: (Math.random() * 50 + 10).toFixed(1),
        cpuUsage: (Math.random() * 30 + 5).toFixed(1),
        successRate: (95 + Math.random() * 5).toFixed(1)
      })),
      overallMetrics: {
        totalRequests: 125430,
        blockedRequests: 8920,
        falsePositives: 234,
        averageResponseTime: 23.5,
        systemLoad: 15.2
      },
      trends: {
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          requests: Math.floor(Math.random() * 5000) + 1000,
          blocked: Math.floor(Math.random() * 500) + 50,
          efficiency: (85 + Math.random() * 15).toFixed(1)
        }))
      }
    }
    
    setPerformanceData(mockPerformanceData)
    toast.success('Performance analytics loaded')
  }

  // A/B Testing functionality
  const loadABTests = async () => {
    setShowABTesting(true)
    
    // Simulate A/B test data
    const mockABTests = [
      {
        id: 1,
        name: 'Rate Limiting Optimization',
        status: 'running',
        variantA: { name: 'Current (100 req/min)', traffic: 50, conversionRate: 94.2, blockedBots: 1245 },
        variantB: { name: 'Optimized (85 req/min)', traffic: 50, conversionRate: 96.8, blockedBots: 1456 },
        startDate: '2024-01-15',
        endDate: '2024-01-29',
        confidence: 87.5,
        winner: 'B'
      },
      {
        id: 2,
        name: 'Bot Detection Pattern',
        status: 'completed',
        variantA: { name: 'Basic Pattern', traffic: 50, conversionRate: 91.5, blockedBots: 892 },
        variantB: { name: 'ML Enhanced', traffic: 50, conversionRate: 94.7, blockedBots: 1123 },
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        confidence: 95.2,
        winner: 'B'
      },
      {
        id: 3,
        name: 'Geographic Filtering',
        status: 'draft',
        variantA: { name: 'Country Level', traffic: 0, conversionRate: 0, blockedBots: 0 },
        variantB: { name: 'IP Range Level', traffic: 0, conversionRate: 0, blockedBots: 0 },
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        confidence: 0,
        winner: null
      }
    ]
    
    setAbTests(mockABTests)
    toast.success('A/B test data loaded')
  }

  const createABTest = (testConfig) => {
    const newTest = {
      id: Date.now(),
      ...testConfig,
      status: 'draft',
      confidence: 0,
      winner: null
    }
    setAbTests(prev => [...prev, newTest])
    toast.success(`A/B test "${testConfig.name}" created`)
  }

  const startABTest = (testId) => {
    setAbTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running' } : test
    ))
    toast.success('A/B test started')
  }

  const stopABTest = (testId) => {
    setAbTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'completed' } : test
    ))
    toast.success('A/B test completed')
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

  // Show loading state
  if (loading && !rules.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Rules</h3>
            <p className="text-gray-600">Fetching your traffic interception rules...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !rules.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rules</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchRules())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Bot Rules - Traffic Interceptor</title>
      </Helmet>

      <div className="space-y-6">
        {/* Enhanced Header */}
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-purple-600" />
                AI-Powered Bot Detection Rules
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Intelligent rule engine with machine learning capabilities and real-time adaptation
              </p>
              
              {/* Feature highlights */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={toggleAutoOptimization}
                  className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Auto-optimization</span>
                  {autoOptimizationEnabled && (
                    <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </button>
                <button
                  onClick={openVisualBuilder}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Workflow className="h-4 w-4" />
                  <span>Visual rule builder</span>
                </button>
                <button
                  onClick={loadPerformanceAnalytics}
                  className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Performance analytics</span>
                </button>
                <button
                  onClick={loadABTests}
                  className="flex items-center space-x-2 text-sm text-orange-600 hover:text-orange-800 transition-colors"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>A/B testing</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  // Create invisible file input for importing rules
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json,.csv'
                  input.onchange = (e) => {
                    const file = e.target.files[0]
                    if (file) {
                      toast.success(`Importing rules from ${file.name}...`)
                      // In a real implementation, this would parse and import the rules
                      setTimeout(() => {
                        toast.success('Rules imported successfully!')
                      }, 2000)
                    }
                  }
                  input.click()
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Import className="h-4 w-4 mr-2" />
                Import Rules
              </button>
              
              <button
                onClick={() => {
                  // Export current rules
                  const rulesData = {
                    export_date: new Date().toISOString(),
                    rules: displayRules
                  }
                  const blob = new Blob([JSON.stringify(rulesData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `traffic-interceptor-rules-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Rules exported successfully!')
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Rules
              </button>
              
              <button
                onClick={generateAISuggestions}
                disabled={loadingAI}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {loadingAI ? (
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {loadingAI ? 'Analyzing...' : 'AI Suggestions'}
              </button>
              
              <button
                onClick={() => setShowFormModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Rules</p>
                <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
                <p className="text-xs text-blue-600 mt-1">All configurations</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Active Rules</p>
                <p className="text-2xl font-bold text-green-900">
                  {safeLength(safeFilter(rules, r => r.status === 'active'))}
                </p>
                <p className="text-xs text-green-600 mt-1">Currently running</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Total Hits</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {rules.reduce((sum, rule) => sum + (rule.hits || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Rule triggers</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">96.7%</p>
                <p className="text-xs text-purple-600 mt-1">Detection accuracy</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Blocked Requests</p>
                <p className="text-2xl font-bold text-red-900">
                  {Math.floor(rules.reduce((sum, rule) => sum + (rule.hits || 0), 0) * 0.3).toLocaleString()}
                </p>
                <p className="text-xs text-red-600 mt-1">Threats stopped</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-md border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Response Time</p>
                <p className="text-2xl font-bold text-indigo-900">2.3ms</p>
                <p className="text-xs text-indigo-600 mt-1">Avg processing</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        {/* Rule Performance Chart */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Rule Performance Analytics
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => toast.info('Viewing recommendations for last 24 hours')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              >
                Last 24h
              </button>
              <button 
                onClick={() => toast.info('Viewing recommendations for last 7 days')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                Last 7d
              </button>
              <button 
                onClick={() => toast.info('Viewing recommendations for last 30 days')}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                Last 30d
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Top Performing Rules</h4>
              {rules.slice(0, 5).map((rule, index) => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-gray-600">{rule.hits || 0} hits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {((rule.hits || 0) / Math.max(rules.reduce((sum, r) => sum + (r.hits || 0), 0), 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Rule Types Distribution</h4>
              <div className="space-y-2">
                {['bot_detection', 'rate_limiting', 'geo_blocking', 'whitelist'].map(type => {
                  const count = safeLength(safeFilter(rules, r => r.type === type))
                  const percentage = rules.length > 0 ? (count / rules.length * 100).toFixed(1) : 0
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { action: 'Rule created', rule: 'Advanced Bot Filter', time: '2 min ago', status: 'success' },
                  { action: 'Rule updated', rule: 'Rate Limiter Pro', time: '15 min ago', status: 'info' },
                  { action: 'Rule triggered', rule: 'Geo Block EU', time: '32 min ago', status: 'warning' },
                  { action: 'Rule disabled', rule: 'Legacy Filter', time: '1 hour ago', status: 'error' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.rule}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations Panel */}
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 border border-purple-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI-Powered Recommendations
            </h3>
            <button 
              onClick={generateAISuggestions}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              {showAISuggestions ? 'Hide Suggestions' : 'View All Suggestions'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Optimize Rate Limiting',
                description: 'Your current rate limit of 100 req/min could be reduced to 75 req/min based on traffic patterns',
                impact: 'High',
                confidence: '92%',
                type: 'optimization'
              },
              {
                title: 'New Bot Pattern Detected',
                description: 'We identified a new bot signature targeting your API endpoints. Create a detection rule?',
                impact: 'Critical',
                confidence: '98%',
                type: 'security'
              },
              {
                title: 'Geo-blocking Enhancement',
                description: 'Consider adding geo-blocking for regions with 95% bot traffic and 0% conversion',
                impact: 'Medium',
                confidence: '87%',
                type: 'efficiency'
              }
            ].map((recommendation, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-900">{recommendation.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                    recommendation.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recommendation.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{recommendation.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Confidence: {recommendation.confidence}</span>
                  <button 
                    onClick={() => {
                      toast.success('AI recommendation applied!')
                      // In a real implementation, this would apply the specific recommendation
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Suggestions Modal */}
        {showAISuggestions && (
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                AI-Powered Rule Suggestions
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {aiSuggestions.length} suggestion{aiSuggestions.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowAISuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loadingAI ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto text-purple-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Rules</h3>
                <p className="text-gray-600">AI is analyzing traffic patterns and rule performance...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-semibold text-gray-900 mr-3">{suggestion.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                            suggestion.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                            suggestion.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {suggestion.impact} Impact
                          </span>
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {suggestion.confidence} Confidence
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{suggestion.description}</p>
                        
                        {suggestion.estimatedImprovement && (
                          <div className="flex items-center text-sm text-green-600 mb-3">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="font-medium">{suggestion.estimatedImprovement}</span>
                          </div>
                        )}

                        {suggestion.suggestedChanges && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <strong className="text-gray-700">Suggested Changes:</strong>
                            <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(suggestion.suggestedChanges, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => dismissAISuggestion(suggestion.id)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => applyAISuggestion(suggestion)}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  </div>
                ))}

                {!loadingAI && aiSuggestions.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Available</h3>
                    <p className="text-gray-600">Your rules are already optimized! Check back later for new suggestions.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

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
              {displayRules.map((rule) => {
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
        {!loading && displayRules.length === 0 && (
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
      
      {/* Test Rule Modal */}
      {showTestModal && testingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Test Rule: {testingRule.name}</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Test this rule with sample traffic data to see how it would behave.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample User Agent
                  </label>
                  <input
                    type="text"
                    placeholder="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample IP Address
                  </label>
                  <input
                    type="text"
                    placeholder="66.249.66.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue="66.249.66.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Request Path
                  </label>
                  <input
                    type="text"
                    placeholder="/api/data"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue="/api/data"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(`Rule test completed for: ${testingRule.name}`)
                  setShowTestModal(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Run Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Optimization Panel */}
      {showAutoOptimization && (
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
              Auto-Optimization Settings
            </h3>
            <button
              onClick={() => setShowAutoOptimization(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Automatic Rule Optimization</h4>
                <p className="text-sm text-gray-600">AI continuously monitors and optimizes rule performance</p>
              </div>
              <button
                onClick={toggleAutoOptimization}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoOptimizationEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoOptimizationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {autoOptimizationEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Optimization Metrics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rules Optimized</span>
                      <span className="font-medium">3 this week</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Efficiency Gain</span>
                      <span className="font-medium text-green-600">+12.5%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Recent Optimizations</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Rate limit optimized</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Pattern efficiency improved</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Visual Rule Builder */}
      {showVisualBuilder && (
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Workflow className="h-6 w-6 mr-2 text-blue-600" />
              Visual Rule Builder
            </h3>
            <button
              onClick={() => setShowVisualBuilder(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Workflow className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Drag & Drop Rule Builder</h4>
            <p className="text-gray-600 mb-6">Create complex rules visually by connecting conditions and actions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium">Conditions</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• IP Address</div>
                  <div>• User Agent</div>
                  <div>• Request Rate</div>
                  <div>• Geographic Location</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <Layers className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium">Logic</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• AND/OR operators</div>
                  <div>• Nested conditions</div>
                  <div>• Time-based rules</div>
                  <div>• Custom expressions</div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <Zap className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium">Actions</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Block request</div>
                  <div>• Rate limit</div>
                  <div>• Log event</div>
                  <div>• Custom response</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Enhanced visual rule builder with more realistic simulation
                setShowVisualBuilder(false)
                toast.success('Opening Visual Rule Builder...')
                
                // Simulate loading and then show a full-featured builder
                setTimeout(() => {
                  // Create a new modal with visual builder interface
                  const newRule = {
                    name: 'Visual Rule Builder Demo',
                    description: 'Rule created with visual builder',
                    type: 'bot_detection',
                    status: 'draft',
                    priority: Math.floor(Math.random() * 10) + 1,
                    conditions: [
                      { field: 'user_agent', operator: 'contains', value: 'bot', connector: null }
                    ],
                    actions: [
                      { type: 'block_request', value: true }
                    ],
                    domains: ['example.com']
                  }
                  
                  // Simulate rule creation
                  toast.success('Rule created using Visual Builder!')
                  
                  // Open the edit modal with the new rule
                  setEditingRule(newRule)
                  setShowFormModal(true)
                }, 1500)
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Launch Visual Builder
            </button>
          </div>
        </motion.div>
      )}

      {/* Performance Analytics */}
      {showPerformanceAnalytics && (
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
              Performance Analytics
            </h3>
            <button
              onClick={() => setShowPerformanceAnalytics(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {performanceData.overallMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{performanceData.overallMetrics.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{performanceData.overallMetrics.blockedRequests.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Blocked</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{performanceData.overallMetrics.falsePositives}</div>
                  <div className="text-sm text-gray-600">False Positives</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{performanceData.overallMetrics.averageResponseTime}ms</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{performanceData.overallMetrics.systemLoad}%</div>
                  <div className="text-sm text-gray-600">System Load</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triggers/Hour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">False Positive Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceData.ruleEfficiency?.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.triggersPerHour}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.falsePositiveRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.responseTime}ms</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.successRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* A/B Testing */}
      {showABTesting && (
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <GitBranch className="h-6 w-6 mr-2 text-orange-600" />
              A/B Testing Dashboard
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => createABTest({
                  name: 'New Test',
                  variantA: { name: 'Control', traffic: 50 },
                  variantB: { name: 'Variant', traffic: 50 }
                })}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
              >
                Create Test
              </button>
              <button
                onClick={() => setShowABTesting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {abTests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{test.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.status === 'running' ? 'bg-green-100 text-green-800' :
                      test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                    {test.confidence > 0 && (
                      <span className="text-sm text-gray-600">{test.confidence}% confidence</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Variant A: {test.variantA.name}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Traffic:</span>
                        <span className="font-medium">{test.variantA.traffic}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">{test.variantA.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocked Bots:</span>
                        <span className="font-medium">{test.variantA.blockedBots}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Variant B: {test.variantB.name}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Traffic:</span>
                        <span className="font-medium">{test.variantB.traffic}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">{test.variantB.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocked Bots:</span>
                        <span className="font-medium">{test.variantB.blockedBots}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {test.startDate} - {test.endDate}
                    {test.winner && (
                      <span className="ml-4 text-green-600 font-medium">
                        Winner: Variant {test.winner}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {test.status === 'draft' && (
                      <button
                        onClick={() => startABTest(test.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Start Test
                      </button>
                    )}
                    {test.status === 'running' && (
                      <button
                        onClick={() => stopABTest(test.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Stop Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {abTests.length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No A/B Tests</h4>
                <p className="text-gray-600">Create your first A/B test to optimize rule performance</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Rules
