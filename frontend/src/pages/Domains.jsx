import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDomains, createDomain } from '../store/slices/domainsSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  Plus, Search, Globe, Shield, TrendingUp, Activity, 
  Edit, Trash2, Settings, ExternalLink, Copy, CheckCircle,
  AlertTriangle, Clock, Zap, Target, BarChart3
} from 'lucide-react'

const Domains = () => {
  const dispatch = useDispatch()
  const { domains, loading, error } = useSelector((state) => state.domains)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ 
    domain_name: '', 
    ssl_enabled: true,
    cdn_enabled: false,
    protection_level: 'medium'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [editDomainId, setEditDomainId] = useState(null)

  // Mock domains data for enhanced display
  const mockDomains = [
    {
      id: '1',
      domain_name: 'example.com',
      status: 'active',
      ssl_enabled: true,
      cdn_enabled: true,
      protection_level: 'high',
      requests_today: 15420,
      blocked_today: 1240,
      revenue_today: 89.50,
      uptime: 99.8,
      last_incident: '3 days ago',
      created_at: '2024-01-15',
      rules_count: 8
    },
    {
      id: '2',
      domain_name: 'api.example.com',
      status: 'active',
      ssl_enabled: true,
      cdn_enabled: false,
      protection_level: 'medium',
      requests_today: 8230,
      blocked_today: 156,
      revenue_today: 45.20,
      uptime: 99.9,
      last_incident: '1 week ago',
      created_at: '2024-01-20',
      rules_count: 5
    },
    {
      id: '3',
      domain_name: 'staging.example.com',
      status: 'warning',
      ssl_enabled: true,
      cdn_enabled: false,
      protection_level: 'low',
      requests_today: 1250,
      blocked_today: 45,
      revenue_today: 12.30,
      uptime: 98.5,
      last_incident: '2 hours ago',
      created_at: '2024-02-01',
      rules_count: 3
    }
  ]

  useEffect(() => {
    dispatch(fetchDomains())
  }, [dispatch])

  const filteredDomains = mockDomains.filter(domain =>
    domain.domain_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProtectionLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDeleteDomain = (domainId) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      dispatch(deleteDomain(domainId));
    }
  }

  const handleEditDomain = (domain) => {
    setEditDomainId(domain.id)
    setForm({
      domain_name: domain.domain_name,
      protection_level: domain.protection_level,
      ssl_enabled: domain.ssl_enabled,
      cdn_enabled: domain.cdn_enabled,
    })
    setShowForm(true)
  }

  const handleAddDomain = (e) => {
    e.preventDefault()
    if (form.domain_name.trim()) {
      if (editDomainId) {
        dispatch(updateDomain({ id: editDomainId, ...form }))
      } else {
        dispatch(addDomain(form))
      }
      setForm({
        domain_name: '',
        protection_level: 'medium',
        ssl_enabled: true,
        cdn_enabled: false,
      })
      setShowForm(false)
      setEditDomainId(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Protected Domains - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Protected Domains</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your protected domains and monitor their traffic patterns
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Domains</p>
                <p className="text-2xl font-bold text-gray-900">{mockDomains.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Domains</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockDomains.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockDomains.reduce((sum, domain) => sum + domain.requests_today, 0).toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Blocked Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockDomains.reduce((sum, domain) => sum + domain.blocked_today, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Domains List */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests Today
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDomains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{domain.domain_name}</div>
                          <div className="text-sm text-gray-500">{domain.rules_count} rules active</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                          {domain.status}
                        </span>
                        {domain.ssl_enabled && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" title="SSL Enabled" />
                        )}
                        {domain.cdn_enabled && (
                          <Zap className="h-4 w-4 text-blue-500 ml-1" title="CDN Enabled" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProtectionLevelColor(domain.protection_level)}`}>
                        {domain.protection_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.requests_today.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span>{domain.blocked_today.toLocaleString()}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({((domain.blocked_today / domain.requests_today) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${domain.revenue_today}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={domain.uptime >= 99.5 ? 'text-green-600' : domain.uptime >= 99 ? 'text-yellow-600' : 'text-red-600'}>
                          {domain.uptime}%
                        </span>
                        {domain.uptime < 99.5 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`https://${domain.domain_name}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visit domain"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(domain.domain_name)}
                          className="text-green-600 hover:text-green-900"
                          title="Copy domain"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDomain(domain)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit domain"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete domain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Domain Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editDomainId ? 'Edit Domain' : 'Add New Domain'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddDomain} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    placeholder="example.com"
                    value={form.domain_name}
                    onChange={(e) => setForm({ ...form, domain_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protection Level
                  </label>
                  <select
                    value={form.protection_level}
                    onChange={(e) => setForm({ ...form, protection_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low - Basic bot detection</option>
                    <option value="medium">Medium - Standard protection</option>
                    <option value="high">High - Maximum security</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.ssl_enabled}
                      onChange={(e) => setForm({ ...form, ssl_enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable SSL/TLS</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.cdn_enabled}
                      onChange={(e) => setForm({ ...form, cdn_enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable CDN</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editDomainId ? 'Update Domain' : 'Add Domain'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Domains
