import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { safeFilter, ensureArray } from '../utils/safeArray'
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
  Server, X, FileText, Code, Database
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
    
    // More flexible domain regex that handles various cases
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
    
    // Additional checks for edge cases
    if (domainName.includes('..')) {
      setValidationError('Domain cannot contain consecutive dots')
      return false
    }
    
    if (domainName.startsWith('-') || domainName.endsWith('-')) {
      setValidationError('Domain cannot start or end with a hyphen')
      return false
    }
    
    if (domainName.length > 253) {
      setValidationError('Domain name is too long (maximum 253 characters)')
      return false
    }
    
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
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg"
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
        className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{domain.domain_name}</h2>
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

// Domain Verification Modal Component
const DomainVerificationModal = ({ isOpen, onClose, domain }) => {
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('dns')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (isOpen && domain) {
      fetchVerificationData()
    }
  }, [isOpen, domain])

  const fetchVerificationData = async () => {
    setLoading(true)
    try {
      // Fallback to mock data for demo - you can uncomment the real API call when backend is ready
      setVerificationData({
        domain: domain,
        verification_methods: {
          dns: {
            method: 'DNS TXT Record',
            description: 'Add this TXT record to your domain\'s DNS settings',
            instructions: [
              '1. Go to your hosting provider\'s DNS management page (cPanel, Cloudflare, etc.)',
              '2. Find the DNS Zone Editor or DNS Records section',
              '3. Add a new TXT record with these exact details:',
              '   • Record Type: TXT',
              `   • Name/Host: _botinterceptor.${domain.domain_name}`,
              `   • Value/Content: botinterceptor-verification=abc123def456`,
              '   • TTL: 300 (or leave default)',
              '4. Save the DNS record',
              '5. Wait 5-30 minutes for DNS propagation',
              '6. Click "Verify Domain" below to complete verification'
            ],
            copy_values: {
              record_name: `_botinterceptor.${domain.domain_name}`,
              record_value: `botinterceptor-verification=abc123def456`,
              record_type: 'TXT',
              ttl: '300'
            }
          },
          html_file: {
            method: 'HTML File Upload',
            description: 'Upload a verification file to your website',
            file_info: {
              filename: `botinterceptor-abc123def456.txt`,
              content: `botinterceptor-domain-verification=abc123def456`,
              upload_path: `/.well-known/botinterceptor-abc123def456.txt`,
              verification_url: `http://${domain.domain_name}/.well-known/botinterceptor-abc123def456.txt`
            }
          },
          meta_tag: {
            method: 'HTML Meta Tag',
            description: 'Add a meta tag to your website\'s homepage',
            tag_info: {
              tag: `<meta name="botinterceptor-domain-verification" content="abc123def456" />`,
              placement: 'Add to <head> section of your homepage'
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching verification data:', error)
      toast.error('Failed to load verification data')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async (text, label) => {
    try {
      if (!text) {
        toast.error('Nothing to copy')
        return
      }
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard!`)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          toast.success(`${label} copied to clipboard!`)
        } catch (err) {
          toast.error('Failed to copy to clipboard')
        }
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleVerifyDomain = async () => {
    if (!domain?.id) {
      toast.error('Invalid domain. Please refresh and try again.')
      return
    }

    setVerifying(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please log in to verify domains.')
        return
      }

      const result = await fetch(`/api/v1/domains/${domain.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method: selectedMethod })
      })

      if (!result.ok) {
        if (result.status === 404) {
          toast.error('Verification endpoint not found. Please contact support.')
        } else if (result.status === 401) {
          toast.error('Authentication failed. Please log in again.')
        } else if (result.status === 500) {
          toast.error('Server error. Please try again later.')
        } else {
          throw new Error(`HTTP ${result.status}: ${result.statusText}`)
        }
        return
      }

      const data = await result.json()
      
      if (data.success) {
        toast.success(data.message || 'Domain verified successfully!')
        onClose()
        // Trigger a refresh of the domains list
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('refreshDomains'))
        }
      } else {
        const errorMsg = data.error || data.message || 'Verification failed'
        toast.error(errorMsg)
        console.warn('Verification failed:', data)
      }
    } catch (error) {
      console.error('Verification error:', error)
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check if the backend is running.')
      } else if (error.message.includes('CORS')) {
        toast.error('CORS error. Please check server configuration.')
      } else {
        toast.error(`Verification failed: ${error.message}`)
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleDownloadFile = async () => {
    try {
      const response = await fetch(`/api/v1/domains/${domain.id}/verification/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        const filename = verificationData?.verification_methods?.html_file?.file_info?.filename || `botinterceptor-verification-${domain.domain_name}.txt`
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Verification file downloaded!')
      } else {
        toast.error('Failed to download verification file')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download verification file')
    }
  }

  if (!isOpen || !domain) return null

  const dnsData = verificationData?.verification_methods?.dns
  const fileData = verificationData?.verification_methods?.html_file
  const metaData = verificationData?.verification_methods?.meta_tag

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Get TXT String for Hosting</h2>
              <p className="text-sm text-gray-600 mt-1">
                Domain: <span className="font-medium">{domain.domain_name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading verification options...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Method Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'dns', name: 'DNS TXT Record', icon: Database, recommended: true },
                    { id: 'html_file', name: 'HTML File Upload', icon: FileText },
                    { id: 'meta_tag', name: 'Meta Tag', icon: Code }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        selectedMethod === method.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <method.icon className="h-4 w-4" />
                      <span>{method.name}</span>
                      {method.recommended && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* DNS TXT Record Method */}
              {selectedMethod === 'dns' && dnsData && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 Copy These Values to Your Hosting Provider</h3>
                    <p className="text-sm text-blue-800">
                      Add the following TXT record to your domain's DNS settings through your hosting provider.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                        <strong>Dev Mode:</strong> Domain: {domain?.domain_name}, ID: {domain?.id}
                      </div>
                    )}
                  </div>

                  {/* Copy-friendly TXT Record Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={dnsData.copy_values?.record_type || 'TXT'}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(dnsData.copy_values?.record_type || 'TXT', 'Record type')}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name/Host 
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={dnsData.copy_values?.record_name || ''}
                            readOnly
                            className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 text-gray-900 font-mono text-sm font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(dnsData.copy_values?.record_name || '', 'Record name')}
                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors font-semibold"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Value/Content 
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={dnsData.copy_values?.record_value || ''}
                            readOnly
                            className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-md bg-blue-50 text-gray-900 font-mono text-sm font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(dnsData.copy_values?.record_value || '', 'Record value')}
                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors font-semibold"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">TTL (optional)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={dnsData.copy_values?.ttl || '300'}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(dnsData.copy_values?.ttl || '300', 'TTL')}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">📝 Step-by-Step Instructions</h4>
                      <ol className="space-y-2 text-sm text-gray-700">
                        {dnsData.instructions?.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Common Hosting Providers Quick Guide */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">🏗️ Popular Hosting Providers</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p><strong>cPanel:</strong> Zone Editor → Add TXT Record</p>
                      <p><strong>Cloudflare:</strong> DNS Tab → Add Record → TXT</p>
                      <p><strong>GoDaddy:</strong> DNS Management → Add TXT Record</p>
                      <p><strong>Namecheap:</strong> Advanced DNS → Add New Record → TXT</p>
                      <p><strong>AWS Route 53:</strong> Hosted Zones → Create Record → TXT</p>
                    </div>
                  </div>
                </div>
              )}

              {/* HTML File Method */}
              {selectedMethod === 'html_file' && fileData && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">📄 HTML File Upload Verification</h3>
                    <p className="text-sm text-green-800">
                      Upload a verification file to your website's root directory or /.well-known/ folder.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filename</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={fileData.file_info?.filename || ''}
                            readOnly
                            className="flex-1 px-3 py-2 border-2 border-green-300 rounded-md bg-green-50 text-gray-900 font-mono text-sm font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(fileData.file_info?.filename || '', 'Filename')}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File Content 
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <textarea
                            value={fileData.file_info?.content || ''}
                            readOnly
                            rows={2}
                            className="flex-1 px-3 py-2 border-2 border-green-300 rounded-md bg-green-50 text-gray-900 font-mono text-sm resize-none font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(fileData.file_info?.content || '', 'File content')}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors font-semibold"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Path</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={fileData.file_info?.upload_path || ''}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono text-sm"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(fileData.file_info?.upload_path || '', 'Upload path')}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Download File Button */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">📥 Quick Download</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Download the verification file ready to upload to your server.
                        </p>
                        <button
                          onClick={handleDownloadFile}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Verification File
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">📝 Step-by-Step Instructions</h4>
                      <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">1</span>
                          <span>Click "Download Verification File" button above</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">2</span>
                          <span>Upload the downloaded file to your website's <code className="bg-gray-200 px-1 rounded">/.well-known/</code> folder</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">3</span>
                          <span>Alternative: Upload to your website's root directory</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">4</span>
                          <span>Ensure the file is accessible at: <code className="bg-gray-200 px-1 rounded text-xs">{fileData.file_info?.verification_url}</code></span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">5</span>
                          <span>Click "Verify Domain" below to complete verification</span>
                        </li>
                      </ol>
                      
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>💡 Tip:</strong> Most hosting providers allow file uploads via cPanel File Manager, FTP, or SFTP.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Methods */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">🏗️ Popular File Upload Methods</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p><strong>cPanel:</strong> File Manager → public_html → /.well-known/ → Upload File</p>
                      <p><strong>FTP/SFTP:</strong> Connect to server → Navigate to document root → Upload</p>
                      <p><strong>GitHub Pages:</strong> Commit file to repository → Push changes</p>
                      <p><strong>Netlify:</strong> Drag and drop to public folder → Deploy</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Tag Method */}
              {selectedMethod === 'meta_tag' && metaData && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">🏷️ HTML Meta Tag Verification</h3>
                    <p className="text-sm text-purple-800">
                      Add the following meta tag to the &lt;head&gt; section of your website's homepage.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Tag 
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <textarea
                            value={metaData.tag_info?.tag || ''}
                            readOnly
                            rows={3}
                            className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-md bg-purple-50 text-gray-900 font-mono text-sm resize-none font-semibold"
                          />
                          <button
                            onClick={() => handleCopyToClipboard(metaData.tag_info?.tag || '', 'Meta tag')}
                            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors font-semibold"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{metaData.tag_info?.placement}</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">📍 Where to Add This</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p><strong>WordPress:</strong> Appearance → Theme Editor → header.php (in &lt;head&gt; section)</p>
                          <p><strong>HTML Sites:</strong> Add to the &lt;head&gt; section of index.html</p>
                          <p><strong>CMS:</strong> Add to the site's header HTML or meta tags section</p>
                          <p><strong>React/Vue:</strong> Add to public/index.html or App component</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">📝 Step-by-Step Instructions</h4>
                      <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">1</span>
                          <span>Copy the meta tag shown on the left</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">2</span>
                          <span>Access your website's HTML code or CMS</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">3</span>
                          <span>Find the <code className="bg-gray-200 px-1 rounded">&lt;head&gt;</code> section of your homepage</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">4</span>
                          <span>Paste the meta tag anywhere within the <code className="bg-gray-200 px-1 rounded">&lt;head&gt;</code> tags</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">5</span>
                          <span>Save the changes and refresh your homepage</span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">6</span>
                          <span>Click "Verify Domain" below to complete verification</span>
                        </li>
                      </ol>
                      
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>💡 Tip:</strong> You can verify the meta tag was added correctly by viewing your page source (Ctrl+U or Cmd+U).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Tag Examples */}
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">📄 Example HTML Structure</h4>
                    <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
    <meta name="botinterceptor-domain-verification" content="${metaData.tag_info?.tag?.match(/content="([^"]*)"/) ?.[1] || 'your-token'}" />
    <!-- Other meta tags and stylesheets -->
</head>
<body>
    <!-- Your website content -->
</body>
</html>`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleVerifyDomain}
                  disabled={verifying}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Domain
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [editingDomain, setEditingDomain] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDomains())
    }
  }, [dispatch, isAuthenticated])

  // Listen for custom refresh event
  useEffect(() => {
    const handleRefreshDomains = () => {
      if (isAuthenticated) {
        dispatch(fetchDomains())
      }
    }

    window.addEventListener('refreshDomains', handleRefreshDomains)
    return () => {
      window.removeEventListener('refreshDomains', handleRefreshDomains)
    }
  }, [dispatch, isAuthenticated])

  // Debug logging
  useEffect(() => {
    console.log('Domains state:', domains)
    console.log('Domains type:', typeof domains)
    console.log('Is array:', Array.isArray(domains))
  }, [domains])

  // Memoized filtered domains to prevent unnecessary re-calculations
  const filteredDomains = useMemo(() => {
    return safeFilter(domains, domain => {
      const matchesSearch = domain?.domain_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const matchesStatus = statusFilter === 'all' || domain?.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [domains, searchTerm, statusFilter])

  const handleAddDomain = useCallback((formData) => {
    // Transform the form data to match backend API expectations
    const apiData = {
      domain_name: formData.name,
      verification_method: formData.verificationMethod,
      ssl_enabled: formData.sslEnabled,
      cdn_enabled: formData.cdnEnabled,
      traffic_enabled: formData.trafficEnabled
    }
    
    dispatch(createDomain(apiData))
      .unwrap()
      .then(() => {
        toast.success('Domain added successfully!')
        setShowFormModal(false)
      })
      .catch((error) => {
        toast.error(error || 'Failed to add domain')
      })
  }, [dispatch])

  const handleEditDomain = (domain) => {
    setEditingDomain(domain)
    setShowFormModal(true)
  }

  const handleUpdateDomain = (formData) => {
    if (!editingDomain) return
    
    // Transform the form data to match backend API expectations
    const apiData = {
      domain_name: formData.name,
      verification_method: formData.verificationMethod,
      ssl_enabled: formData.sslEnabled,
      cdn_enabled: formData.cdnEnabled,
      traffic_enabled: formData.trafficEnabled
    }
    
    dispatch(updateDomain({ id: editingDomain.id, data: apiData }))
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
    if (window.confirm(`Are you sure you want to delete ${domain.domain_name}?`)) {
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

  const handleVerifyDomain = useCallback((domain) => {
    dispatch(verifyDomain({ id: domain.id, method: 'dns' }))
      .unwrap()
      .then(() => {
        toast.success('Domain verification started!')
      })
      .catch((error) => {
        toast.error(error || 'Failed to verify domain')
      })
  }, [dispatch])

  const handleViewDetails = (domain) => {
    setSelectedDomain(domain)
    setShowDetailsModal(true)
  }

  const handleGetTxtString = (domain) => {
    setSelectedDomain(domain)
    setShowVerificationModal(true)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getStatusBadge = useCallback((status) => {
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
  }, [])

  const getDomainStats = useCallback((domain) => ({
    requests: domain.monthly_requests || 0,
    blocked: domain.monthly_blocked || 0,
    revenue: domain.monthly_revenue || 0,
    blockRate: domain.monthly_requests ? ((domain.monthly_blocked / domain.monthly_requests) * 100).toFixed(1) : 0
  }), [])

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
        <div className="bg-white p-4 rounded-lg shadow-lg">
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
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                  >
                    {/* Domain Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{domain.domain_name}</h3>
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
                      {domain.ssl_enabled && (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          SSL
                        </div>
                      )}
                      {domain.cdn_enabled && (
                        <div className="flex items-center text-blue-600">
                          <Zap className="h-4 w-4 mr-1" />
                          CDN
                        </div>
                      )}
                      {domain.traffic_enabled && (
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
                        <>
                          <button
                            onClick={() => handleGetTxtString(domain)}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100"
                          >
                            <FileText className="h-3 w-3 inline mr-1" />
                            Get TXT String
                          </button>
                          <button
                            onClick={() => handleVerifyDomain(domain)}
                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
                          >
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Verify Domain
                          </button>
                        </>
                      )}
                      {domain.status === 'verified' && (
                        <>
                          <button
                            onClick={() => copyToClipboard(domain.domain_name)}
                            className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100"
                          >
                            <Copy className="h-3 w-3 inline mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => window.open(`https://${domain.domain_name}`, '_blank')}
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

      <DomainVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false)
          setSelectedDomain(null)
        }}
        domain={selectedDomain}
      />
    </>
  )
}

export default Domains
