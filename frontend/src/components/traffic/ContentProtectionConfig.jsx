import React, { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon, 
  CogIcon, 
  PlusIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { trafficAPI, createProtectionData } from '../../services/trafficAPI'
import toast from 'react-hot-toast'

const ContentProtectionConfig = () => {
  const [protectionRules, setProtectionRules] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    domain: '',
    path_pattern: '',
    protection_level: 'standard',
    action: 'modify',
    enabled: true
  })

  // Mock protection rules
  const mockRules = [
    {
      id: 1,
      name: 'API Protection',
      domain: 'example.com',
      path_pattern: '/api/*',
      protection_level: 'high',
      action: 'modify',
      enabled: true,
      description: 'Protect API endpoints from scraping'
    },
    {
      id: 2,
      name: 'Product Pages',
      domain: 'example.com',
      path_pattern: '/products/*',
      protection_level: 'medium',
      action: 'challenge',
      enabled: true,
      description: 'Add CAPTCHA for product pages'
    },
    {
      id: 3,
      name: 'Admin Area',
      domain: 'admin.example.com',
      path_pattern: '/admin/*',
      protection_level: 'maximum',
      action: 'block',
      enabled: true,
      description: 'Block all bot access to admin'
    }
  ]

  useEffect(() => {
    setProtectionRules(mockRules)
  }, [])

  const handleInputChange = (field, value) => {
    setNewRule(prev => ({ ...prev, [field]: value }))
  }

  const addProtectionRule = () => {
    if (!newRule.name || !newRule.domain || !newRule.path_pattern) {
      toast.error('Please fill in all required fields')
      return
    }

    const rule = {
      id: Date.now(),
      ...newRule,
      description: newRule.description || `Protection rule for ${newRule.path_pattern}`
    }

    setProtectionRules(prev => [...prev, rule])
    setNewRule({
      name: '',
      domain: '',
      path_pattern: '',
      protection_level: 'standard',
      action: 'modify',
      enabled: true
    })
    toast.success('Protection rule added successfully')
  }

  const deleteRule = (id) => {
    setProtectionRules(prev => prev.filter(rule => rule.id !== id))
    toast.success('Protection rule deleted')
  }

  const toggleRule = (id) => {
    setProtectionRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const testProtection = async (rule) => {
    setIsLoading(true)
    try {
      const testData = createProtectionData({
        url: `https://${rule.domain}${rule.path_pattern.replace('*', '/test')}`,
        content: '<html><body>Test content</body></html>',
        domain: rule.domain,
        path: rule.path_pattern.replace('*', '/test'),
        user_agent: 'Test-Bot/1.0',
        client_ip: '192.168.1.100',
        protection_level: rule.protection_level
      })

      const response = await trafficAPI.protectContent(testData)
      toast.success(`Protection test successful! Action: ${response.data.action_taken}`)
    } catch (error) {
      toast.error('Protection test failed')
      // console.error('Protection test error:', error) // Commented to prevent console errors
      toast.error('Protection test failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getProtectionLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'maximum': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'allow': return 'bg-green-100 text-green-800'
      case 'block': return 'bg-red-100 text-red-800'
      case 'modify': return 'bg-blue-100 text-blue-800'
      case 'challenge': return 'bg-yellow-100 text-yellow-800'
      case 'rate_limit': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Protection Configuration</h1>
            <p className="text-gray-600 mt-1">Configure advanced content protection rules and settings</p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <CogIcon className="-ml-1 mr-2 h-4 w-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      {/* Add New Rule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Protection Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., API Protection"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input
              type="text"
              value={newRule.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Path Pattern</label>
            <input
              type="text"
              value={newRule.path_pattern}
              onChange={(e) => handleInputChange('path_pattern', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/api/*"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Protection Level</label>
            <select
              value={newRule.protection_level}
              onChange={(e) => handleInputChange('protection_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="standard">Standard</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={newRule.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="allow">Allow</option>
              <option value="block">Block</option>
              <option value="modify">Modify Content</option>
              <option value="challenge">Challenge (CAPTCHA)</option>
              <option value="rate_limit">Rate Limit</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={addProtectionRule}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Protection Rules List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Protection Rules</h3>
          <p className="text-sm text-gray-500">Manage your content protection configuration</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path Pattern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {protectionRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.enabled ? (
                        <EyeIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <EyeSlashIcon className="h-3 w-3 mr-1" />
                      )}
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.path_pattern}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProtectionLevelColor(rule.protection_level)}`}>
                      {rule.protection_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(rule.action)}`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => testProtection(rule)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Protection Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Honeypot Configuration</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Enable honeypot traps</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Dynamic honeypot generation</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Honeypot analytics</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Behavioral Analysis</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Mouse movement tracking</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Keyboard pattern analysis</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Session behavior profiling</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentProtectionConfig
