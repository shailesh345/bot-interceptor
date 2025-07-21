import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  fetchDomains, 
  createDomain, 
  updateDomain, 
  deleteDomain, 
  verifyDomain,
  setFilters,
  clearError 
} from '../store/slices/domainsSlice'
import toast from 'react-hot-toast'
import { 
  Plus, Search, Globe, Shield, TrendingUp, Activity, 
  Edit, Trash2, Settings, ExternalLink, Copy, CheckCircle,
  AlertTriangle, Clock, Zap, Target, BarChart3, Eye,
  Download, Filter, RefreshCw, Calendar, DollarSign,
  Server, X
} from 'lucide-react'

// Domain Form Modal Component
const DomainFormModal = ({ isOpen, onClose, domain = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: domain?.name || '',
    verificationMethod: domain?.verificationMethod || 'dns',
    sslEnabled: domain?.sslEnabled || true,
    cdnEnabled: domain?.cdnEnabled || false,
    trafficEnabled: domain?.trafficEnabled || true
  })
  
  const [validationError, setValidationError] = useState('')

  const validateDomain = (domainName) => {
    if (!domainName.trim()) {
      setValidationError('')
      return false
    }
    
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domainName)) {
      setValidationError('Please enter a valid domain name (e.g., example.com)')
      return false
    }
    
    setValidationError('')
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Final validation check
    if (!validateDomain(formData.name)) {
      if (!formData.name.trim()) {
        toast.error('Domain name is required')
      }
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
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {domain ? 'Edit Domain' : 'Add New Domain'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value.toLowerCase()
                setFormData({ ...formData, name: value })
                validateDomain(value)
              }}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                validationError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="example.com"
              disabled={!!domain}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Method
            </label>
            <select
              value={formData.verificationMethod}
              onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dns">DNS Record</option>
              <option value="file">File Upload</option>
              <option value="html">HTML Meta Tag</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sslEnabled}
                onChange={(e) => setFormData({ ...formData, sslEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Enable SSL</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cdnEnabled}
                onChange={(e) => setFormData({ ...formData, cdnEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Enable CDN</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.trafficEnabled}
                onChange={(e) => setFormData({ ...formData, trafficEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Traffic Monitoring</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {domain ? 'Update Domain' : 'Add Domain'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Domain Details Modal Component
const DomainDetailsModal = ({ isOpen, onClose, domain }) => {
  if (!isOpen || !domain) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{domain.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domain Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Domain Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    domain.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {domain.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SSL Enabled:</span>
                  <span>{domain.sslEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CDN Enabled:</span>
                  <span>{domain.cdnEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(domain.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {domain.status === 'pending' && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-yellow-800">Verification Required</h3>
                <div className="text-sm text-yellow-700">
                  {domain.verificationMethod === 'dns' && (
                    <div>
                      <p className="mb-2">Add this DNS record:</p>
                      <div className="bg-white p-2 rounded border font-mono text-xs">
                        {domain.dnsRecord}
                      </div>
                    </div>
                  )}
                  {domain.verificationMethod === 'file' && (
                    <div>
                      <p className="mb-2">Upload this file to your domain root:</p>
                      <div className="bg-white p-2 rounded border font-mono text-xs">
                        {domain.verificationFile}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Monthly Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total Requests</div>
                  <div className="text-lg font-semibold">{domain.monthlyRequests?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Blocked Requests</div>
                  <div className="text-lg font-semibold text-red-600">{domain.monthlyBlocked?.toLocaleString() || '0'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Revenue</div>
                  <div className="text-lg font-semibold text-green-600">${domain.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Rules</div>
                  <div className="text-lg font-semibold">{domain.rules || 0}</div>
                </div>
              </div>
            </div>

            {domain.subdomains && domain.subdomains.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Subdomains</h3>
                <div className="space-y-1">
                  {domain.subdomains.map((subdomain, index) => (
                    <div key={index} className="text-sm text-gray-700">{subdomain}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const Domains = () => {
  const dispatch = useDispatch()
  const { domains, loading, error, filters } = useSelector((state) => state.domains)
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  // Local state
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [editingDomain, setEditingDomain] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDomains())
    }
  }, [dispatch, isAuthenticated])

  // Filter domains based on search and status
  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddDomain = (formData) => {
    dispatch(createDomain(formData))
      .unwrap()
      .then(() => {
        toast.success('Domain added successfully!')
        setShowFormModal(false)
      })
      .catch((error) => {
        toast.error(error || 'Failed to add domain')
      })
  }

  const handleEditDomain = (domain) => {
    setEditingDomain(domain)
    setShowFormModal(true)
  }

  const handleUpdateDomain = (formData) => {
    if (!editingDomain) return
    
    dispatch(updateDomain({ id: editingDomain.id, data: formData }))
      .unwrap()
      .then(() => {
        toast.success('Domain updated successfully!')
        setShowFormModal(false)
        setEditingDomain(null)
      })
      .catch((error) => {
        toast.error(error || 'Failed to update domain')
      })
  }

  const handleDeleteDomain = (domain) => {
    if (window.confirm(`Are you sure you want to delete ${domain.name}?`)) {
      dispatch(deleteDomain(domain.id))
        .unwrap()
        .then(() => {
          toast.success('Domain deleted successfully!')
        })
        .catch((error) => {
          toast.error(error || 'Failed to delete domain')
        })
    }
  }

  const handleVerifyDomain = (domain) => {
    dispatch(verifyDomain(domain.id))
      .unwrap()
      .then(() => {
        toast.success('Domain verification started!')
      })
      .catch((error) => {
        toast.error(error || 'Failed to verify domain')
      })
  }

  const handleViewDetails = (domain) => {
    setSelectedDomain(domain)
    setShowDetailsModal(true)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getDomainStats = (domain) => ({
    requests: domain.monthlyRequests || 0,
    blocked: domain.monthlyBlocked || 0,
    revenue: domain.monthlyRevenue || 0,
    blockRate: domain.monthlyRequests ? ((domain.monthlyBlocked / domain.monthlyRequests) * 100).toFixed(1) : 0
  })

  return (
    <>
      <Helmet>
        <title>Domain Management - Traffic Interceptor</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Domain Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your domains and configure bot protection settings.
            </p>
          </div>
          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search domains..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={() => dispatch(fetchDomains())}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => dispatch(clearError())}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  Dismiss
                </button>
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

        {/* Domains Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDomains.map((domain) => {
                const stats = getDomainStats(domain)
                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Domain Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{domain.name}</h3>
                          <div className="flex items-center mt-1">
                            {getStatusBadge(domain.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewDetails(domain)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDomain(domain)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Domain Features */}
                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      {domain.sslEnabled && (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          SSL
                        </div>
                      )}
                      {domain.cdnEnabled && (
                        <div className="flex items-center text-blue-600">
                          <Zap className="h-4 w-4 mr-1" />
                          CDN
                        </div>
                      )}
                      {domain.trafficEnabled && (
                        <div className="flex items-center text-purple-600">
                          <Activity className="h-4 w-4 mr-1" />
                          Monitor
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Monthly Requests</div>
                        <div className="font-semibold">{stats.requests.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Blocked</div>
                        <div className="font-semibold text-red-600">{stats.blocked.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Revenue</div>
                        <div className="font-semibold text-green-600">${stats.revenue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Block Rate</div>
                        <div className="font-semibold">{stats.blockRate}%</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {domain.status === 'pending' && (
                        <button
                          onClick={() => handleVerifyDomain(domain)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
                        >
                          Verify Domain
                        </button>
                      )}
                      {domain.status === 'verified' && (
                        <>
                          <button
                            onClick={() => copyToClipboard(domain.name)}
                            className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100"
                          >
                            <Copy className="h-3 w-3 inline mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => window.open(`https://${domain.name}`, '_blank')}
                            className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100"
                          >
                            <ExternalLink className="h-3 w-3 inline mr-1" />
                            Visit
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDomains.length === 0 && (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No domains found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by adding your first domain.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowFormModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DomainFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingDomain(null)
        }}
        domain={editingDomain}
        onSubmit={editingDomain ? handleUpdateDomain : handleAddDomain}
      />

      <DomainDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDomain(null)
        }}
        domain={selectedDomain}
      />
    </>
  )
}

export default Domains
