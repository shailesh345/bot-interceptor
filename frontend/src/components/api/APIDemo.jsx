import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Code, 
  Copy, 
  Download, 
  Upload, 
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react'

const APIDemo = () => {
  const [activeEndpoint, setActiveEndpoint] = useState('traffic')
  const [requestData, setRequestData] = useState('')
  const [responseData, setResponseData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResponse, setShowResponse] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const endpoints = {
    traffic: {
      name: 'Traffic Processing',
      method: 'POST',
      url: '/api/v1/traffic/process',
      description: 'Process incoming traffic requests and apply bot detection rules',
      sampleData: {
        method: 'GET',
        url: 'https://example.com/api/data',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BotDetector/1.0)',
          'Accept': 'application/json'
        },
        ip_address: '192.168.1.100',
        timestamp: new Date().toISOString(),
        user_agent: 'Mozilla/5.0 (compatible; BotDetector/1.0)',
        referer: 'https://google.com'
      }
    },
    domains: {
      name: 'Domain Management',
      method: 'GET',
      url: '/api/v1/domains',
      description: 'Retrieve list of managed domains and their verification status',
      sampleData: {}
    },
    rules: {
      name: 'Rules Engine',
      method: 'POST',
      url: '/api/v1/rules/test',
      description: 'Test traffic rules against sample requests',
      sampleData: {
        rule_id: 'rule_123',
        sample_requests: [
          {
            method: 'POST',
            url: 'https://example.com/login',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BotDetector/1.0)',
              'Content-Type': 'application/json'
            },
            body: {
              username: 'test@example.com',
              password: 'password123'
            }
          }
        ]
      }
    },
    analytics: {
      name: 'Analytics Data',
      method: 'GET',
      url: '/api/v1/analytics/dashboard',
      description: 'Retrieve analytics dashboard data for specified time range',
      sampleData: {
        time_range: '7d',
        domain_id: 'domain_123',
        metrics: ['requests', 'bots', 'blocked', 'revenue']
      }
    },
    billing: {
      name: 'Billing API',
      method: 'GET',
      url: '/api/v1/billing/usage',
      description: 'Retrieve billing usage and subscription information',
      sampleData: {
        period: 'current_month',
        include_details: true
      }
    }
  }

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        executeRequest()
      }, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, activeEndpoint])

  const executeRequest = async () => {
    setIsLoading(true)
    setResponseData('')
    
    try {
      const endpoint = endpoints[activeEndpoint]
      const token = localStorage.getItem('token')
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }

      if (endpoint.method === 'POST' && requestData) {
        options.body = requestData
      }

      const response = await fetch(endpoint.url, options)
      const data = await response.json()
      
      setResponseData(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponseData(JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const loadSampleData = () => {
    const endpoint = endpoints[activeEndpoint]
    setRequestData(JSON.stringify(endpoint.sampleData, null, 2))
  }

  const clearData = () => {
    setRequestData('')
    setResponseData('')
  }

  const formatJSON = (jsonString) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }

  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Demo & Testing</h1>
          <p className="text-gray-600">Test and explore the Traffic Interceptor API endpoints</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          )}
        </div>
      </div>

      {/* Endpoint Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Endpoint</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(endpoints).map(([key, endpoint]) => (
            <button
              key={key}
              onClick={() => setActiveEndpoint(key)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeEndpoint === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {endpoint.method}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
              <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {endpoint.url}
              </code>
            </button>
          ))}
        </div>
      </div>

      {/* Request/Response Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Request</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSampleData}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Load Sample
                </button>
                <button
                  onClick={clearData}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {endpoints[activeEndpoint].method === 'POST' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={requestData}
                  onChange={(e) => setRequestData(e.target.value)}
                  placeholder="Enter JSON request data..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {requestData && (
                      <span className={`text-sm ${
                        validateJSON(requestData) ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {validateJSON(requestData) ? 'Valid JSON' : 'Invalid JSON'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(requestData)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>GET requests don't require a request body</p>
              </div>
            )}
            
            <button
              onClick={executeRequest}
              disabled={isLoading || (endpoints[activeEndpoint].method === 'POST' && !validateJSON(requestData))}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Response</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowResponse(!showResponse)}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  {showResponse ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showResponse ? 'Hide' : 'Show'}
                </button>
                {responseData && (
                  <button
                    onClick={() => copyToClipboard(responseData)}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {showResponse ? (
              responseData ? (
                <div>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm font-mono">
                    {formatJSON(responseData)}
                  </pre>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>Response received at {new Date().toLocaleTimeString()}</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([responseData], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `api-response-${activeEndpoint}-${Date.now()}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Execute a request to see the response</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <EyeOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Response hidden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
        <div className="prose max-w-none">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
            <p className="text-sm text-gray-600 mb-3">
              All API requests require a valid JWT token in the Authorization header:
            </p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              Authorization: Bearer &lt;your-jwt-token&gt;
            </code>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Rate Limiting</h4>
            <p className="text-sm text-gray-600">
              API requests are rate-limited to 1000 requests per minute per user. 
              Exceeding this limit will result in a 429 Too Many Requests response.
            </p>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Error Handling</h4>
            <p className="text-sm text-gray-600">
              All errors return a consistent JSON response format with an error code, 
              message, and optional details for debugging.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIDemo
