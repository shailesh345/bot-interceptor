import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Target, 
  Play, 
  Pause, 
  Save, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Activity,
  BarChart3,
  Brain,
  Shield,
  Users,
  FileText,
  TrendingUp,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const AutomationRulesEngine = () => {
  const [rules, setRules] = useState([])
  const [templates, setTemplates] = useState([])
  const [aiAutomations, setAiAutomations] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('rules')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const mockRules = [
    {
      id: 1,
      name: 'High Traffic Alert',
      description: 'Automatically alert team when traffic exceeds threshold',
      status: 'active',
      priority: 'high',
      category: 'monitoring',
      triggerCount: 12,
      successRate: 98.5,
      lastTriggered: '2024-08-25 14:30'
    },
    {
      id: 2,
      name: 'Security Incident Response',
      description: 'Automated response to security incidents',
      status: 'active',
      priority: 'critical',
      category: 'security',
      triggerCount: 8,
      successRate: 100.0,
      lastTriggered: '2024-08-25 14:25'
    },
    {
      id: 3,
      name: 'Performance Degradation',
      description: 'Monitor and respond to performance issues',
      status: 'active',
      priority: 'medium',
      category: 'performance',
      triggerCount: 5,
      successRate: 95.2,
      lastTriggered: '2024-08-25 14:20'
    }
  ]

  const mockTemplates = [
    {
      id: 1,
      name: 'Security Incident Response',
      description: 'Standard response template for security incidents',
      category: 'security',
      usage: 15,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Traffic Monitoring',
      description: 'Monitor traffic patterns and alert on anomalies',
      category: 'monitoring',
      usage: 23,
      rating: 4.6
    }
  ]

  const mockAiAutomations = [
    {
      id: 1,
      name: 'Smart Traffic Optimization',
      description: 'AI-powered traffic optimization based on patterns',
      status: 'active',
      type: 'predictive',
      accuracy: 94.2,
      optimizations: 156,
      savings: '23%'
    },
    {
      id: 2,
      name: 'Anomaly Detection',
      description: 'Machine learning-based anomaly detection',
      status: 'active',
      type: 'detection',
      accuracy: 97.8,
      optimizations: 89,
      savings: '15%'
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRules(mockRules)
      setTemplates(mockTemplates)
      setAiAutomations(mockAiAutomations)
    } catch (error) {
      toast.error('Failed to load automation data')
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
          : rule
      )
    )
    toast.success('Rule status updated!')
  }

  const deleteRule = async (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
    toast.success('Rule deleted successfully!')
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      monitoring: Activity,
      security: Shield,
      performance: BarChart3,
      user_management: Users
    }
    return icons[category] || Activity
  }

  const filteredRules = rules.filter(rule => {
    if (filterStatus === 'all') return true
    return rule.status === filterStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Rules Engine</h1>
          <p className="text-gray-600">AI-powered automation rules and process templates</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Available</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Automations</p>
              <p className="text-2xl font-bold text-gray-900">{aiAutomations.length}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="warning" size="sm">Learning</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {rules.length > 0 
                  ? Math.round(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Average</Badge>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Rules</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {filteredRules.length} rules
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Automations ({aiAutomations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Rules Tab */}
              {activeTab === 'rules' && (
                <div className="space-y-4">
                  {filteredRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {React.createElement(getCategoryIcon(rule.category), { 
                              className: "w-6 h-6 text-gray-600" 
                            })}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                            <p className="text-sm text-gray-500">{rule.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant={rule.status === 'active' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {rule.status}
                              </Badge>
                              <Badge 
                                variant="info" 
                                size="sm"
                                className={getPriorityColor(rule.priority)}
                              >
                                {rule.priority}
                              </Badge>
                              <Badge variant="info" size="sm">
                                {rule.triggerCount} triggers
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{rule.successRate}% success</p>
                            <p className="text-xs text-gray-500">
                              Last: {rule.lastTriggered}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleRuleStatus(rule.id)}
                              className={`p-2 rounded ${
                                rule.status === 'active' 
                                  ? 'text-green-600 hover:bg-green-100' 
                                  : 'text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteRule(rule.id)}
                              className="p-2 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                          <Badge variant="info" size="sm">{template.category}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {template.usage} uses • ⭐ {template.rating}
                        </div>
                        <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Automations Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  {aiAutomations.map((automation) => (
                    <div key={automation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{automation.name}</h3>
                            <p className="text-sm text-gray-500">{automation.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="success" size="sm">{automation.status}</Badge>
                              <Badge variant="info" size="sm">{automation.type}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{automation.accuracy}% accuracy</p>
                          <p className="text-xs text-gray-500">
                            {automation.optimizations} optimizations • {automation.savings} savings
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AutomationRulesEngine
