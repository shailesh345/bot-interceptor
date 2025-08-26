import React, { useState, useEffect } from 'react'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CogIcon,
  BoltIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const SecurityOperations = () => {
  const [securityMetrics, setSecurityMetrics] = useState({})
  const [threats, setThreats] = useState([])
  const [securityRules, setSecurityRules] = useState([])
  const [incidents, setIncidents] = useState([])
  const [selectedThreat, setSelectedThreat] = useState(null)
  const [showThreatModal, setShowThreatModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('24h')

  // Mock security metrics data
  const mockSecurityMetrics = {
    overview: {
      securityScore: 94,
      totalThreats: 156,
      blockedRequests: 2345,
      suspiciousIPs: 23,
      activeIncidents: 3,
      lastScan: '2024-08-24T10:00:00Z'
    },
    threatTypes: [
      { type: 'DDoS', count: 45, percentage: 29 },
      { type: 'SQL Injection', count: 32, percentage: 21 },
      { type: 'XSS', count: 28, percentage: 18 },
      { type: 'Brute Force', count: 25, percentage: 16 },
      { type: 'Bot Traffic', count: 26, percentage: 16 }
    ],
    geographicThreats: [
      { country: 'China', count: 45, percentage: 29 },
      { country: 'Russia', count: 32, percentage: 21 },
      { country: 'USA', count: 28, percentage: 18 },
      { country: 'Brazil', count: 25, percentage: 16 },
      { country: 'India', count: 26, percentage: 16 }
    ],
    timeSeriesData: [
      { time: '00:00', threats: 12, blocked: 89, score: 94 },
      { time: '04:00', threats: 8, blocked: 67, score: 95 },
      { time: '08:00', threats: 23, blocked: 156, score: 92 },
      { time: '12:00', threats: 34, blocked: 234, score: 89 },
      { time: '16:00', threats: 28, blocked: 189, score: 91 },
      { time: '20:00', threats: 19, blocked: 134, score: 93 },
      { time: '24:00', threats: 15, blocked: 98, score: 94 }
    ]
  }

  // Mock threats data
  const mockThreats = [
    {
      id: 1,
      type: 'DDoS Attack',
      severity: 'high',
      source: '192.168.1.100',
      target: 'api.example.com',
      timestamp: '2024-08-24T12:30:00Z',
      status: 'active',
      description: 'Large volume of requests from suspicious IP',
      impact: 'Service degradation',
      mitigation: 'Rate limiting applied'
    },
    {
      id: 2,
      type: 'SQL Injection Attempt',
      severity: 'medium',
      source: '203.0.113.45',
      target: 'login.example.com',
      timestamp: '2024-08-24T12:15:00Z',
      status: 'blocked',
      description: 'Malicious SQL query detected in login form',
      impact: 'Potential data breach',
      mitigation: 'Request blocked, IP blacklisted'
    },
    {
      id: 3,
      type: 'XSS Attack',
      severity: 'medium',
      source: '198.51.100.67',
      target: 'comment.example.com',
      timestamp: '2024-08-24T12:00:00Z',
      status: 'investigating',
      description: 'JavaScript payload detected in user input',
      impact: 'Session hijacking risk',
      mitigation: 'Input sanitization applied'
    },
    {
      id: 4,
      type: 'Brute Force',
      severity: 'low',
      source: '203.0.113.89',
      target: 'admin.example.com',
      timestamp: '2024-08-24T11:45:00Z',
      status: 'resolved',
      description: 'Multiple failed login attempts detected',
      impact: 'Account compromise risk',
      mitigation: 'Account temporarily locked'
    }
  ]

  // Mock security rules
  const mockSecurityRules = [
    {
      id: 1,
      name: 'Rate Limiting',
      type: 'DDoS Protection',
      status: 'active',
      priority: 'high',
      description: 'Limit requests per IP address',
      conditions: '>100 requests/minute',
      action: 'Block IP temporarily',
      lastModified: '2024-08-20T09:00:00Z'
    },
    {
      id: 2,
      name: 'SQL Injection Filter',
      type: 'Input Validation',
      status: 'active',
      priority: 'high',
      description: 'Block SQL injection patterns',
      conditions: 'Contains SQL keywords',
      action: 'Block request',
      lastModified: '2024-08-18T14:30:00Z'
    },
    {
      id: 3,
      name: 'XSS Protection',
      type: 'Input Validation',
      status: 'active',
      priority: 'medium',
      description: 'Block XSS payloads',
      conditions: 'Contains script tags',
      action: 'Sanitize input',
      lastModified: '2024-08-15T11:20:00Z'
    },
    {
      id: 4,
      name: 'Geographic Blocking',
      type: 'Access Control',
      status: 'inactive',
      priority: 'low',
      description: 'Block specific countries',
      conditions: 'IP from blocked countries',
      action: 'Block access',
      lastModified: '2024-08-10T16:45:00Z'
    }
  ]

  // Mock security incidents
  const mockIncidents = [
    {
      id: 1,
      title: 'DDoS Attack on API Endpoints',
      severity: 'high',
      status: 'resolved',
      startTime: '2024-08-24T10:00:00Z',
      endTime: '2024-08-24T11:30:00Z',
      description: 'Coordinated attack targeting multiple API endpoints',
      impact: 'Service unavailable for 1.5 hours',
      resolution: 'Traffic filtering and rate limiting applied'
    },
    {
      id: 2,
      title: 'Suspicious Login Activity',
      severity: 'medium',
      status: 'investigating',
      startTime: '2024-08-24T09:00:00Z',
      endTime: null,
      description: 'Multiple failed login attempts from new IP addresses',
      impact: 'Potential account compromise',
      resolution: 'Investigation in progress'
    },
    {
      id: 3,
      title: 'Data Breach Attempt',
      severity: 'critical',
      status: 'resolved',
      startTime: '2024-08-23T15:00:00Z',
      endTime: '2024-08-23T16:00:00Z',
      description: 'Attempted access to sensitive user data',
      impact: 'No data compromised',
      resolution: 'Attack blocked, security enhanced'
    }
  ]

  useEffect(() => {
    setSecurityMetrics(mockSecurityMetrics)
    setThreats(mockThreats)
    setSecurityRules(mockSecurityRules)
    setIncidents(mockIncidents)
  }, [])

  const handleThreatAction = async (threatId, action) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      // await securityAPI.updateThreatStatus(threatId, action)
      
      setThreats(prev => prev.map(threat => 
        threat.id === threatId ? { ...threat, status: action } : threat
      ))
      
      // Simulate API delay
      setTimeout(() => setIsLoading(false), 500)
    } catch (error) {
      // console.error('Failed to update threat status:', error) // Commented to prevent console errors
      toast.error('Failed to update threat status. Please try again.')
      setIsLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      // await securityAPI.toggleRuleStatus(ruleId)
      
      setSecurityRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' } : rule
      ))
      
      // Simulate API delay
      setTimeout(() => setIsLoading(false), 500)
    } catch (error) {
      // console.error('Failed to toggle rule status:', error) // Commented to prevent console errors
      toast.error('Failed to toggle rule status. Please try again.')
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-blue-100 text-blue-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Operations</h1>
            <p className="text-gray-600 mt-1">Monitor and manage security threats, rules, and incidents</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              New Rule
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Score</p>
              <p className="text-2xl font-semibold text-gray-900">{securityMetrics.overview?.securityScore || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Threats</p>
              <p className="text-2xl font-semibold text-gray-900">{securityMetrics.overview?.activeIncidents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LockClosedIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Blocked Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{securityMetrics.overview?.blockedRequests || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Suspicious IPs</p>
              <p className="text-2xl font-semibold text-gray-900">{securityMetrics.overview?.suspiciousIPs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={securityMetrics.threatTypes || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {securityMetrics.threatTypes?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={securityMetrics.timeSeriesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} name="Security Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Threats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Threats</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {threats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{threat.type}</div>
                      <div className="text-sm text-gray-500">{threat.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{threat.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{threat.target}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(threat.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedThreat(threat)
                          setShowThreatModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {threat.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleThreatAction(threat.id, 'blocked')}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <LockClosedIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleThreatAction(threat.id, 'investigating')}
                            disabled={isLoading}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          >
                            <CogIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Rules */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Rules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(rule.lastModified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        disabled={isLoading}
                        className={`${rule.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
                      >
                        {rule.status === 'active' ? <XMarkIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Incidents */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Incidents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {incidents.map((incident) => (
            <div key={incident.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Started: {formatDateTime(incident.startTime)}
                      {incident.endTime && (
                        <>
                          <span className="mx-2">•</span>
                          Ended: {formatDateTime(incident.endTime)}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Impact:</strong> {incident.impact}
                    </div>
                    {incident.resolution && (
                      <div className="text-xs text-gray-600">
                        <strong>Resolution:</strong> {incident.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Detail Modal */}
      {showThreatModal && selectedThreat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Threat Details</h3>
                <button
                  onClick={() => setShowThreatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900">{selectedThreat.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedThreat.severity)}`}>
                    {selectedThreat.severity}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source IP</label>
                  <p className="text-sm text-gray-900">{selectedThreat.source}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target</label>
                  <p className="text-sm text-gray-900">{selectedThreat.target}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedThreat.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Impact</label>
                  <p className="text-sm text-gray-900">{selectedThreat.impact}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mitigation</label>
                  <p className="text-sm text-gray-900">{selectedThreat.mitigation}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedThreat.timestamp)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowThreatModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityOperations
