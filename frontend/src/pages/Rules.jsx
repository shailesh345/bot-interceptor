import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRules, createRule } from '../store/slices/rulesSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, Play, Pause, 
  Shield, Bot, Globe, Clock, AlertTriangle, CheckCircle,
  Eye, Settings, Code, Zap, Target, Activity
} from 'lucide-react'

const Rules = () => {
  const dispatch = useDispatch()
  const { rules, loading, error } = useSelector((state) => state.rules)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    type: 'bot_detection',
    action: 'block',
    priority: 'medium',
    conditions: [{ field: 'user_agent', operator: 'contains', value: '' }]
  })
  const [editRuleId, setEditRuleId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedRules, setSelectedRules] = useState([])

  // Mock rules data for enhanced display
  const mockRules = [
    {
      id: '1',
      name: 'Block Malicious Bots',
      description: 'Blocks known malicious bot patterns',
      type: 'bot_detection',
      action: 'block',
      priority: 'high',
      status: 'active',
      hits: 1247,
      lastTriggered: '2 minutes ago',
      created: '2024-01-15',
      conditions: [
        { field: 'user_agent', operator: 'contains', value: 'bot' }
      ]
    },
    {
      id: '2',
      name: 'Rate Limit API',
      description: 'Limits requests to 100 per minute',
      type: 'rate_limiting',
      action: 'throttle',
      priority: 'medium',
      status: 'active',
      hits: 89,
      lastTriggered: '15 minutes ago',
      created: '2024-01-10',
      conditions: [
        { field: 'path', operator: 'starts_with', value: '/api/' }
      ]
    },
    {
      id: '3',
      name: 'Allow Search Engines',
      description: 'Allows legitimate search engine crawlers',
      type: 'whitelist',
      action: 'allow',
      priority: 'high',
      status: 'active',
      hits: 342,
      lastTriggered: '5 minutes ago',
      created: '2024-01-05',
      conditions: [
        { field: 'user_agent', operator: 'contains', value: 'Googlebot' }
      ]
    },
    {
      id: '4',
      name: 'Block Suspicious IPs',
      description: 'Blocks IPs from known malicious ranges',
      type: 'ip_filtering',
      action: 'block',
      priority: 'high',
      status: 'paused',
      hits: 23,
      lastTriggered: '1 hour ago',
      created: '2024-01-20',
      conditions: [
        { field: 'ip', operator: 'in_range', value: '192.168.1.0/24' }
      ]
    }
  ]

  const getRuleIcon = (type) => {
    switch (type) {
      case 'bot_detection': return Bot
      case 'rate_limiting': return Clock
      case 'whitelist': return CheckCircle
      case 'ip_filtering': return Shield
      case 'geo_blocking': return Globe
      default: return Target
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'block': return 'text-red-600 bg-red-100'
      case 'allow': return 'text-green-600 bg-green-100'
      case 'throttle': return 'text-yellow-600 bg-yellow-100'
      case 'monitor': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <>
      <Helmet>
        <title>Traffic Rules - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traffic Rules</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage bot detection, rate limiting, and traffic control rules
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </button>
          </div>
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
                <p className="text-2xl font-bold text-gray-900">{mockRules.length}</p>
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
                  {mockRules.filter(r => r.status === 'active').length}
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
                  {mockRules.reduce((sum, rule) => sum + rule.hits, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRules.filter(r => r.action === 'block').reduce((sum, rule) => sum + rule.hits, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Rules Table with mock data */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
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
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRules.map((rule) => {
                  const Icon = getRuleIcon(rule.type)
                  return (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {rule.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(rule.action)}`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rule.priority)}`}>
                          {rule.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          rule.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.status === 'active' ? (
                            <><Play className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><Pause className="h-3 w-3 mr-1" /> Paused</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.hits.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Rules
