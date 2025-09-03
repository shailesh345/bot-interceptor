import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { createRule, updateRule } from '../../store/slices/rulesSlice'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save,
  Shield, Bot, Activity, Clock, AlertTriangle,
  Globe, Code, Settings, X, ArrowRight
} from 'lucide-react'

const VisualRuleBuilder = ({ existingRule = null, onSave, onCancel }) => {
  const dispatch = useDispatch()
  const { domains } = useSelector((state) => state.domains)
  const [loading, setLoading] = useState(false)
  const [ruleData, setRuleData] = useState({
    name: '',
    description: '',
    rule_type: 'bot_detection',
    conditions: [{ field: 'user_agent', operator: 'contains', value: '', connector: 'AND' }],
    actions: [{ type: 'block_request', value: true }],
    priority: 1,
    is_active: true,
    domains: []
  })
  const [activeTab, setActiveTab] = useState('conditions')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize form with existing rule data if provided
  useEffect(() => {
    if (existingRule) {
      setRuleData({
        name: existingRule.name || '',
        description: existingRule.description || '',
        rule_type: existingRule.rule_type || 'bot_detection',
        conditions: existingRule.conditions?.length > 0 
          ? existingRule.conditions 
          : [{ field: 'user_agent', operator: 'contains', value: '', connector: 'AND' }],
        actions: existingRule.actions?.length > 0 
          ? existingRule.actions 
          : [{ type: 'block_request', value: true }],
        priority: existingRule.priority || 1,
        is_active: existingRule.is_active !== undefined ? existingRule.is_active : true,
        domains: existingRule.domains || []
      })
    }
  }, [existingRule])

  // Field options for rule conditions
  const conditionFields = [
    { value: 'user_agent', label: 'User Agent', description: 'The browser or client making the request' },
    { value: 'ip', label: 'IP Address', description: 'The client IP address' },
    { value: 'ip_range', label: 'IP Range', description: 'A range of IP addresses (CIDR notation)' },
    { value: 'path', label: 'Request Path', description: 'The URL path requested' },
    { value: 'method', label: 'HTTP Method', description: 'GET, POST, PUT, etc.' },
    { value: 'country', label: 'Country', description: 'The country of origin based on IP' },
    { value: 'requests_per_minute', label: 'Requests per Minute', description: 'Rate of requests from a single IP' },
    { value: 'is_bot', label: 'Is Bot', description: 'Whether the request is from a bot' },
    { value: 'bot_type', label: 'Bot Type', description: 'The type of bot detected' }
  ]

  // Operator options for conditions
  const operators = [
    { value: 'equals', label: 'Equals', description: 'Exact match' },
    { value: 'contains', label: 'Contains', description: 'Partial match' },
    { value: 'starts_with', label: 'Starts With', description: 'Begins with text' },
    { value: 'ends_with', label: 'Ends With', description: 'Ends with text' },
    { value: 'greater_than', label: 'Greater Than', description: 'Numeric comparison' },
    { value: 'less_than', label: 'Less Than', description: 'Numeric comparison' },
    { value: 'in', label: 'In List', description: 'Matches any in comma-separated list' },
    { value: 'regex', label: 'Regex', description: 'Regular expression match' }
  ]

  // Action types for rule actions
  const actionTypes = [
    { value: 'block_request', label: 'Block Request', description: 'Prevent the request from reaching your server' },
    { value: 'allow_request', label: 'Allow Request', description: 'Explicitly allow the request' },
    { value: 'rate_limit', label: 'Rate Limit', description: 'Apply rate limiting to the request' },
    { value: 'redirect', label: 'Redirect', description: 'Redirect the request to another URL' },
    { value: 'challenge', label: 'Challenge', description: 'Present a CAPTCHA or other challenge' },
    { value: 'log_only', label: 'Log Only', description: 'Just log the request without taking action' }
  ]

  // Rule type options
  const ruleTypes = [
    { value: 'bot_detection', label: 'Bot Detection', icon: Bot, description: 'Identify and manage bot traffic' },
    { value: 'rate_limiting', label: 'Rate Limiting', icon: Clock, description: 'Prevent excessive requests' },
    { value: 'content_protection', label: 'Content Protection', icon: Shield, description: 'Protect specific content' },
    { value: 'custom', label: 'Custom Rule', icon: Code, description: 'Create a custom rule' }
  ]

  // Add a condition
  const addCondition = () => {
    setRuleData({
      ...ruleData,
      conditions: [
        ...ruleData.conditions,
        { field: 'user_agent', operator: 'contains', value: '', connector: 'AND' }
      ]
    })
  }

  // Remove a condition
  const removeCondition = (index) => {
    const updatedConditions = [...ruleData.conditions]
    updatedConditions.splice(index, 1)
    setRuleData({
      ...ruleData,
      conditions: updatedConditions
    })
  }

  // Update a condition
  const updateCondition = (index, field, value) => {
    const updatedConditions = [...ruleData.conditions]
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    }
    setRuleData({
      ...ruleData,
      conditions: updatedConditions
    })
  }

  // Add an action
  const addAction = () => {
    setRuleData({
      ...ruleData,
      actions: [
        ...ruleData.actions,
        { type: 'block_request', value: true }
      ]
    })
  }

  // Remove an action
  const removeAction = (index) => {
    const updatedActions = [...ruleData.actions]
    updatedActions.splice(index, 1)
    setRuleData({
      ...ruleData,
      actions: updatedActions
    })
  }

  // Update an action
  const updateAction = (index, field, value) => {
    const updatedActions = [...ruleData.actions]
    updatedActions[index] = {
      ...updatedActions[index],
      [field]: value
    }
    setRuleData({
      ...ruleData,
      actions: updatedActions
    })
  }

  // Toggle domain selection
  const toggleDomain = (domainId) => {
    const updatedDomains = [...ruleData.domains]
    const index = updatedDomains.indexOf(domainId)
    
    if (index === -1) {
      updatedDomains.push(domainId)
    } else {
      updatedDomains.splice(index, 1)
    }
    
    setRuleData({
      ...ruleData,
      domains: updatedDomains
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!ruleData.name) {
      toast.error('Rule name is required')
      return
    }
    
    if (ruleData.conditions.length === 0) {
      toast.error('At least one condition is required')
      return
    }
    
    if (ruleData.actions.length === 0) {
      toast.error('At least one action is required')
      return
    }
    
    if (ruleData.domains.length === 0) {
      toast.error('At least one domain must be selected')
      return
    }
    
    setLoading(true)
    try {
      // Create or update rule
      const actionCreator = existingRule ? updateRule : createRule
      const resultAction = await dispatch(actionCreator({
        ...ruleData,
        id: existingRule?.id
      }))
      
      const rule = resultAction.payload
      
      toast.success(`Rule ${existingRule ? 'updated' : 'created'} successfully`)
      onSave && onSave(rule)
    } catch (error) {
      console.error('Error saving rule:', error)
      toast.error(`Failed to ${existingRule ? 'update' : 'create'} rule`)
    } finally {
      setLoading(false)
    }
  }

  // Render condition fields
  const renderConditionFields = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Conditions</h3>
        <button
          type="button"
          className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 flex items-center text-sm"
          onClick={addCondition}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Condition
        </button>
      </div>
      
      <div className="space-y-4">
        {ruleData.conditions.map((condition, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-gray-700">
                Condition {index + 1}
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-red-500"
                onClick={() => removeCondition(index)}
                disabled={ruleData.conditions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                >
                  {conditionFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {conditionFields.find(f => f.value === condition.field)?.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {operators.find(o => o.value === condition.operator)?.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  placeholder={condition.field === 'is_bot' ? 'true/false' : 'Enter value...'}
                />
                {condition.field === 'is_bot' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter "true" or "false"
                  </p>
                )}
                {condition.field === 'ip_range' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Example: 192.168.1.0/24
                  </p>
                )}
              </div>
            </div>
            
            {index < ruleData.conditions.length - 1 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connector
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                      checked={condition.connector === 'AND'}
                      onChange={() => updateCondition(index, 'connector', 'AND')}
                    />
                    <span className="ml-2 text-sm text-gray-700">AND</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                      checked={condition.connector === 'OR'}
                      onChange={() => updateCondition(index, 'connector', 'OR')}
                    />
                    <span className="ml-2 text-sm text-gray-700">OR</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Render action fields
  const renderActionFields = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Actions</h3>
        <button
          type="button"
          className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 flex items-center text-sm"
          onClick={addAction}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Action
        </button>
      </div>
      
      <div className="space-y-4">
        {ruleData.actions.map((action, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-gray-700">
                Action {index + 1}
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-red-500"
                onClick={() => removeAction(index)}
                disabled={ruleData.actions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  value={action.type}
                  onChange={(e) => updateAction(index, 'type', e.target.value)}
                >
                  {actionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {actionTypes.find(t => t.value === action.type)?.description}
                </p>
              </div>
              
              {action.type === 'redirect' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Redirect URL
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    value={action.value || ''}
                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              )}
              
              {action.type === 'rate_limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requests per Minute
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    value={action.value || 60}
                    onChange={(e) => updateAction(index, 'value', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render domain selection
  const renderDomainSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Apply to Domains</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Select which domains this rule should apply to:
          </p>
        </div>
        
        {domains && domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {domains.map((domain) => (
              <label key={domain.id} className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={ruleData.domains.includes(domain.id)}
                  onChange={() => toggleDomain(domain.id)}
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {domain.domain_name}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No domains available</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingRule ? 'Edit Rule' : 'Create New Rule'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="space-y-4 mb-8">
            <div>
              <label htmlFor="rule_name" className="block text-sm font-medium text-gray-700">
                Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="rule_name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={ruleData.name}
                onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="rule_description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="rule_description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={ruleData.description}
                onChange={(e) => setRuleData({ ...ruleData, description: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {ruleTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      ruleData.rule_type === type.value
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRuleData({ ...ruleData, rule_type: type.value })}
                  >
                    <div className="flex items-center mb-2">
                      <type.icon className="h-5 w-5 mr-2 text-gray-700" />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'conditions'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('conditions')}
              >
                Conditions
              </button>
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'actions'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('actions')}
              >
                Actions
              </button>
              <button
                type="button"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'domains'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('domains')}
              >
                Domains
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'conditions' && renderConditionFields()}
                {activeTab === 'actions' && renderActionFields()}
                {activeTab === 'domains' && renderDomainSelection()}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Advanced Settings */}
          <div className="mb-8">
            <button
              type="button"
              className="flex items-center text-sm text-gray-700 hover:text-black"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-1" />
              )}
              Advanced Settings
            </button>
            
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div>
                  <label htmlFor="rule_priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="range"
                      id="rule_priority"
                      min="1"
                      max="10"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={ruleData.priority}
                      onChange={(e) => setRuleData({ ...ruleData, priority: parseInt(e.target.value) })}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {ruleData.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Higher priority rules are evaluated first (1-10)
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rule_active"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    checked={ruleData.is_active}
                    onChange={(e) => setRuleData({ ...ruleData, is_active: e.target.checked })}
                  />
                  <label htmlFor="rule_active" className="ml-2 block text-sm text-gray-700">
                    Rule is active
                  </label>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {existingRule ? 'Update Rule' : 'Create Rule'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VisualRuleBuilder
