import React, { useState, useEffect } from 'react'
import { 
  Code, 
  Key, 
  Shield, 
  Activity, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const APIManagement = () => {
  const [activeTab, setActiveTab] = useState('keys')
  const [apiKeys, setApiKeys] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [usage, setUsage] = useState({})
  const [loading, setLoading] = useState(false)
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    fetchAPIData()
  }, [])

  const fetchAPIData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockApiKeys = [
        {
          id: 1,
          name: 'Production API Key',
          key: 'sk_prod_1234567890abcdef',
          status: 'active',
          permissions: ['read', 'write'],
          createdAt: '2024-01-01',
          lastUsed: '2024-01-15',
          usage: 125000
        },
        {
          id: 2,
          name: 'Development API Key',
          key: 'sk_dev_abcdef1234567890',
          status: 'active',
          permissions: ['read'],
          createdAt: '2024-01-05',
          lastUsed: '2024-01-14',
          usage: 45000
        },
        {
          id: 3,
          name: 'Test API Key',
          key: 'sk_test_7890abcdef123456',
          status: 'inactive',
          permissions: ['read'],
          createdAt: '2024-01-10',
          lastUsed: '2024-01-12',
          usage: 15000
        }
      ]
      
      const mockEndpoints = [
        {
          path: '/api/v1/domains',
          method: 'GET',
          status: 'active',
          rateLimit: '1000/hour',
          lastUpdated: '2024-01-15'
        },
        {
          path: '/api/v1/analytics',
          method: 'GET',
          status: 'active',
          rateLimit: '500/hour',
          lastUpdated: '2024-01-15'
        },
        {
          path: '/api/v1/webhooks',
          method: 'POST',
          status: 'active',
          rateLimit: '100/hour',
          lastUpdated: '2024-01-14'
        }
      ]
      
      const mockUsage = {
        totalRequests: 185000,
        successfulRequests: 178000,
        failedRequests: 7000,
        averageResponseTime: 245,
        uptime: 99.8
      }
      
      setApiKeys(mockApiKeys)
      setEndpoints(mockEndpoints)
      setUsage(mockUsage)
    } catch (error) {
      toast.error('Failed to fetch API data')
    } finally {
      setLoading(false)
    }
  }

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newKey = {
        id: Date.now(),
        name: newKeyName,
        key: `sk_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`,
        status: 'active',
        permissions: ['read'],
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: '-',
        usage: 0
      }
      
      setApiKeys([...apiKeys, newKey])
      setNewKeyName('')
      setShowCreateKey(false)
      toast.success('API key created successfully!')
    } catch (error) {
      toast.error('Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeyStatus = async (keyId) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setApiKeys(apiKeys.map(key => 
        key.id === keyId 
          ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
          : key
      ))
      
      toast.success('API key status updated!')
    } catch (error) {
      toast.error('Failed to update API key status')
    } finally {
      setLoading(false)
    }
  }

  const deleteAPIKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) return
    
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setApiKeys(apiKeys.filter(key => key.id !== keyId))
      toast.success('API key deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete API key')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const maskKey = (key) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4)
  }

  const tabs = [
    { id: 'keys', name: 'API Keys', icon: Key },
    { id: 'endpoints', name: 'Endpoints', icon: Code },
    { id: 'usage', name: 'Usage & Analytics', icon: TrendingUp },
    { id: 'security', name: 'Security', icon: Shield }
  ]

  const renderAPIKeys = () => (
    <div className="space-y-6">
      {/* Create New Key */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          <button
            onClick={() => setShowCreateKey(!showCreateKey)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Key</span>
          </button>
        </div>
        
        {showCreateKey && (
          <div className="border-t pt-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter key name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createAPIKey}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreateKey(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your API Keys</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apiKey.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Key:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Created: {apiKey.createdAt}
                    </span>
                    <span className="text-sm text-gray-600">
                      Last used: {apiKey.lastUsed}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Usage: {apiKey.usage.toLocaleString()} requests
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleKeyStatus(apiKey.id)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded-md ${
                      apiKey.status === 'active'
                        ? 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                        : 'text-green-600 bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteAPIKey(apiKey.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEndpoints = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">API Endpoints</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      endpoint.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>Rate limit: {endpoint.rateLimit}</span>
                    <span>Updated: {endpoint.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {usage.totalRequests?.toLocaleString() || '0'}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {usage.totalRequests ? Math.round((usage.successfulRequests / usage.totalRequests) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {usage.averageResponseTime || '0'}ms
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {usage.uptime || '0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-center space-x-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className="w-2 bg-blue-600 rounded-t"
                style={{ height: `${Math.random() * 200 + 50}px` }}
              />
              <span className="text-xs text-gray-600 mt-1">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Rate Limiting</p>
              <p className="text-sm text-gray-600">Limit API requests per minute</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">IP Whitelisting</p>
              <p className="text-sm text-gray-600">Restrict API access to specific IP addresses</p>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Request Logging</p>
              <p className="text-sm text-gray-600">Log all API requests for security monitoring</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'keys':
        return renderAPIKeys()
      case 'endpoints':
        return renderEndpoints()
      case 'usage':
        return renderUsage()
      case 'security':
        return renderSecurity()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600">Manage your API keys, endpoints, and usage analytics</p>
        </div>
        <button
          onClick={fetchAPIData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default APIManagement
