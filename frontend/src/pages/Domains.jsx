import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { safeFilter, ensureArray } from '../utils/safeArray'
import { domainsAPI } from '../services/api'
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
  Server, X, FileText, Code, Database, Info
} from 'lucide-react'
import DomainMonitoringConfig from '../components/monitoring/DomainMonitoringConfig'

// Enhanced Domain Form Modal Component
const DomainFormModal = ({ isOpen, onClose, domain = null, onSubmit }) => {
  // Initialize form data with proper defaults
  const getInitialFormData = () => ({
    name: domain?.domain_name || domain?.name || '',
    verificationMethod: domain?.verification_method || domain?.verificationMethod || 'dns',
    sslEnabled: domain?.ssl_enabled !== undefined ? domain.ssl_enabled : (domain?.sslEnabled !== undefined ? domain.sslEnabled : true),
    cdnEnabled: domain?.cdn_enabled !== undefined ? domain.cdn_enabled : (domain?.cdnEnabled !== undefined ? domain.cdnEnabled : false),
    trafficEnabled: domain?.traffic_enabled !== undefined ? domain.traffic_enabled : (domain?.trafficEnabled !== undefined ? domain.trafficEnabled : true),
    description: domain?.description || '',
    category: domain?.category || 'business',
    priority: domain?.priority || 'medium'
  })

  const [formData, setFormData] = useState(getInitialFormData())
  const [validationError, setValidationError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [domainSuggestions, setDomainSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  const [copiedField, setCopiedField] = useState('')
  const [showTemplates, setShowTemplates] = useState(true)

  // Reset form when domain changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 Modal opened - Edit mode:', !!domain)
      if (domain) {
        console.log('🔧 Domain data for editing:', domain)
      }
      
      const initialData = getInitialFormData()
      console.log('🔧 Initial form data:', initialData)
      
      setFormData(initialData)
      setValidationError('')
      // For editing, start at step 3 (Review) to show current data
      // For adding new domain, start at step 1
      setCurrentStep(domain ? 3 : 1)
      setShowSuggestions(false)
      setDomainSuggestions([])
      setVerificationToken('')
      setCopiedField('')
      setShowTemplates(!domain) // Hide templates when editing
    }
  }, [isOpen, domain])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormData())
      setValidationError('')
      setCurrentStep(1)
      setShowSuggestions(false)
      setDomainSuggestions([])
      setIsSubmitting(false)
      setVerificationToken('')
      setCopiedField('')
      setShowTemplates(true)
    }
  }, [isOpen])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('.domain-suggestions')) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  // Domain templates for quick setup
  const domainTemplates = [
    {
      name: 'E-commerce',
      icon: '🛒',
      settings: { sslEnabled: true, cdnEnabled: true, trafficEnabled: true, priority: 'high' },
      description: 'Optimized for online stores with high security and performance'
    },
    {
      name: 'Blog/Content',
      icon: '📝',
      settings: { sslEnabled: true, cdnEnabled: true, trafficEnabled: true, priority: 'medium' },
      description: 'Perfect for blogs and content websites'
    },
    {
      name: 'Corporate',
      icon: '🏢',
      settings: { sslEnabled: true, cdnEnabled: false, trafficEnabled: true, priority: 'high' },
      description: 'Professional setup for corporate websites'
    },
    {
      name: 'Development',
      icon: '⚙️',
      settings: { sslEnabled: false, cdnEnabled: false, trafficEnabled: false, priority: 'low' },
      description: 'Basic setup for development and testing'
    }
  ]

  const validateDomain = async (domainName) => {
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

    // Check for valid TLD (at least 2 characters)
    const parts = domainName.split('.')
    if (parts.length < 2) {
      setValidationError('Domain must have at least one dot (e.g., example.com)')
      return false
    }
    
    const tld = parts[parts.length - 1]
    if (tld.length < 2) {
      setValidationError('Top-level domain must be at least 2 characters')
      return false
    }
    
    if (!domainRegex.test(domainName)) {
      setValidationError('Please enter a valid domain name (e.g., example.com)')
      return false
    }
    
    // Check if domain already exists
    setIsValidating(true)
    try {
      // Simulate domain availability check
      await new Promise(resolve => setTimeout(resolve, 500))
    setValidationError('')
    return true
    } catch (error) {
      setValidationError('Error checking domain availability')
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleDomainInput = async (value) => {
    const normalizedValue = value.toLowerCase()
    setFormData({ ...formData, name: normalizedValue })
    
    if (normalizedValue.length > 2) {
      // Generate domain suggestions
      const suggestions = generateDomainSuggestions(normalizedValue)
      setDomainSuggestions(suggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
    
    await validateDomain(normalizedValue)
  }

  const generateDomainSuggestions = (input) => {
    const commonTlds = ['.in','.com', '.org', '.net', '.io', '.co', '.app', '.dev']
    const suggestions = []
    
    // Remove TLD if present
    const baseName = input.replace(/\.[a-zA-Z]{2,}$/, '')
    
    commonTlds.forEach(tld => {
      if (baseName + tld !== input) {
        suggestions.push(baseName + tld)
      }
    })
    
    return suggestions.slice(0, 5)
  }

  const handleTemplateSelect = (template) => {
    const updatedFormData = {
      ...formData,
      ...template.settings,
      category: template.name.toLowerCase(),
      description: template.description
    }
    setFormData(updatedFormData)
    
    // Validate the domain name if it exists
    if (updatedFormData.name.trim()) {
      validateDomain(updatedFormData.name)
    }
    
    toast.success(`${template.name} template applied!`)
  }

  const resetForm = () => {
    setFormData(getInitialFormData())
    setValidationError('')
    setCurrentStep(1)
    setShowSuggestions(false)
    setDomainSuggestions([])
    setIsSubmitting(false)
  }

  const handleSubmit = async () => {
    const isEditMode = !!domain
    
    console.log('🚨 FORM SUBMISSION TRIGGERED', { 
      currentStep, 
      formData: formData.name,
      isEditMode,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    })
    
    // Only allow submission on step 3
    if (currentStep !== 3) {
      console.log('❌ Submission blocked - not on step 3')
      toast.error('Please complete all steps before submitting')
      return
    }
    
      if (!formData.name.trim()) {
        toast.error('Domain name is required')
      return
      }
    
    if (!formData.verificationMethod) {
      toast.error('Please select a verification method')
      return
    }
    
    // For edit mode, don't validate domain name changes (it might be the same)
    if (!isEditMode) {
      const isValid = await validateDomain(formData.name)
      if (!isValid) {
        toast.error('Please fix the domain validation errors before submitting')
        return
      }
    }
    
    console.log('✅ Form validation passed, proceeding with submission')
    console.log('📤 Mode:', isEditMode ? 'EDIT' : 'ADD')
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Don't close modal here - let the parent component handle it
      // This allows for better error handling and success feedback
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(isEditMode ? 'Failed to update domain. Please try again.' : 'Failed to submit domain. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    if (currentStep < 3) {
      // Validate current step before proceeding
      if (currentStep === 1) {
        if (!formData.name.trim()) {
          toast.error('Please enter a domain name')
          return
        }
        
        const isValid = await validateDomain(formData.name)
        if (!isValid) {
          toast.error('Please fix the domain validation errors before proceeding')
          return
        }
      }
      
      if (currentStep === 2) {
        if (!formData.verificationMethod) {
          toast.error('Please select a verification method')
          return
        }
        if (!formData.priority) {
          toast.error('Please select a priority level')
          return
        }
      }
      
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Generate verification token
  const generateVerificationToken = useCallback(() => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const domainHash = formData.name ? formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) : 'domain'
    return `botinterceptor-${domainHash}-${timestamp}-${random}`
  }, [formData.name])

  // Initialize token when verification method changes
  useEffect(() => {
    if (formData.verificationMethod && formData.name) {
      setVerificationToken(generateVerificationToken())
    }
  }, [formData.verificationMethod, formData.name, generateVerificationToken])

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast.success(`${fieldName} copied to clipboard!`)
      setTimeout(() => setCopiedField(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Regenerate token
  const regenerateToken = () => {
    const newToken = generateVerificationToken()
    setVerificationToken(newToken)
    toast.success('New verification token generated!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
            {domain ? 'Edit Domain' : 'Add New Domain'}
          </h2>
              <p className="text-sm text-gray-600 mt-1">
                {domain ? 'Update your domain settings' : 'Configure your domain for bot protection'}
              </p>
            </div>
          <button
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
          </button>
        </div>

          {/* Progress Steps */}
          {!domain && (
            <div className="flex items-center mt-4 space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step === 1 && currentStep === 1 && formData.name.trim() && !validationError ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step === 2 && currentStep >= 2 ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : step === 3 && currentStep === 3 ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step <= currentStep ? 'text-black font-medium' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Domain' : step === 2 ? 'Settings' : 'Review'}
                  </span>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 ml-4 ${
                      step < currentStep ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Step 1: Domain Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
          <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Information</h3>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name <span className="text-red-500">*</span>
            </label>
                  <div className="relative">
            <input
              type="text"
              value={formData.name}
                      onChange={(e) => handleDomainInput(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                validationError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="example.com"
              disabled={!!domain}
            />
                    {isValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Domain Suggestions */}
                  {showSuggestions && domainSuggestions.length > 0 && (
                    <div className="domain-suggestions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {domainSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, name: suggestion })
                            setShowSuggestions(false)
                            validateDomain(suggestion)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
            {validationError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {validationError}
                    </p>
                  )}
                  
                  {!validationError && formData.name.trim() && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Domain format is valid
                    </p>
            )}
          </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="Brief description of this domain..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Domain Templates */}
              {!domain && (
          <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Quick Setup Templates</h4>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showTemplates ? (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="grid grid-cols-2 gap-3">
                      {domainTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">{template.icon}</span>
                            <span className="font-medium text-gray-900">{template.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!showTemplates && (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">Templates are hidden</p>
                      <p className="text-xs mt-1">Click "Show" to access quick setup templates</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configuration Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.verificationMethod}
              onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
                  <option value="dns">DNS TXT Record (Recommended)</option>
                  <option value="file">HTML File Upload</option>
              <option value="html">HTML Meta Tag</option>
            </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to verify domain ownership
                </p>
          </div>

              {/* Enhanced Verification Method Setup Guide */}
              {formData.verificationMethod && formData.name && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Verification Setup Guide
                    </h4>
                    <button
                      onClick={regenerateToken}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate Token
                    </button>
                  </div>
                  
                  {formData.verificationMethod === 'dns' && (
                    <div className="text-sm text-blue-800 space-y-3">
                      <p className="font-medium">DNS TXT Record Method:</p>
                      
                      {/* Record Name */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">Record Name:</span>
                          <button
                            onClick={() => copyToClipboard(`_botinterceptor.${formData.name}`, 'Record Name')}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center ${
                              copiedField === 'Record Name' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedField === 'Record Name' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono text-sm">
                          _botinterceptor.{formData.name}
                        </code>
                      </div>
                      
                      {/* Record Value */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">Record Value:</span>
                          <button
                            onClick={() => copyToClipboard(`botinterceptor-verification=${verificationToken}`, 'Record Value')}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center ${
                              copiedField === 'Record Value' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedField === 'Record Value' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono text-sm break-all">
                          botinterceptor-verification={verificationToken}
                        </code>
                      </div>
                      
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Add a TXT record to your domain's DNS settings</p>
                        <p>• TTL: 300 seconds (or leave default)</p>
                        <p>• Wait for DNS propagation (can take up to 24 hours)</p>
                      </div>
                    </div>
                  )}
                  
                  {formData.verificationMethod === 'file' && (
                    <div className="text-sm text-blue-800 space-y-3">
                      <p className="font-medium">HTML File Upload Method:</p>
                      
                      {/* File Path */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">File Path:</span>
                          <button
                            onClick={() => copyToClipboard(`/.well-known/botinterceptor-verification.txt`, 'File Path')}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center ${
                              copiedField === 'File Path' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedField === 'File Path' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono text-sm">
                          /.well-known/botinterceptor-verification.txt
                        </code>
                      </div>
                      
                      {/* File Content */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">File Content:</span>
                          <button
                            onClick={() => copyToClipboard(`botinterceptor-domain-verification=${verificationToken}`, 'File Content')}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center ${
                              copiedField === 'File Content' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedField === 'File Content' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono text-sm break-all">
                          botinterceptor-domain-verification={verificationToken}
                        </code>
                      </div>
                      
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Upload file to your website root directory</p>
                        <p>• Ensure file is publicly accessible via HTTP/HTTPS</p>
                        <p>• Test by visiting the file URL in your browser</p>
                      </div>
                    </div>
                  )}
                  
                  {formData.verificationMethod === 'html' && (
                    <div className="text-sm text-blue-800 space-y-3">
                      <p className="font-medium">HTML Meta Tag Method:</p>
                      
                      {/* Meta Tag */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">Meta Tag:</span>
                          <button
                            onClick={() => copyToClipboard(`<meta name="botinterceptor-domain-verification" content="${verificationToken}" />`, 'Meta Tag')}
                            className={`px-2 py-1 text-xs rounded transition-colors flex items-center ${
                              copiedField === 'Meta Tag' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {copiedField === 'Meta Tag' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono text-sm break-all">
                          &lt;meta name="botinterceptor-domain-verification" content="{verificationToken}" /&gt;
                        </code>
                      </div>
                      
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Add meta tag to your website's &lt;head&gt; section</p>
                        <p>• Place in homepage HTML or CMS header</p>
                        <p>• Ensure tag is visible in page source (View Page Source)</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Token Display */}
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Verification Token:</span>
                      <span className="text-xs text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded">
                        {verificationToken}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      This token is unique to your domain and verification method
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="low">Low - Basic protection</option>
                  <option value="medium">Medium - Standard protection</option>
                  <option value="high">High - Maximum protection</option>
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Security & Performance Features</h4>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sslEnabled}
                onChange={(e) => setFormData({ ...formData, sslEnabled: e.target.checked })}
                      className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-gray-900">Enable SSL/TLS</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Encrypt traffic and improve security ratings
                      </p>
                    </div>
            </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cdnEnabled}
                onChange={(e) => setFormData({ ...formData, cdnEnabled: e.target.checked })}
                      className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">Enable CDN</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Accelerate content delivery and reduce server load
                      </p>
                    </div>
            </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.trafficEnabled}
                onChange={(e) => setFormData({ ...formData, trafficEnabled: e.target.checked })}
                      className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium text-gray-900">Enable Traffic Monitoring</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Monitor traffic patterns and bot activity
                      </p>
                    </div>
            </label>
          </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Domain Name:</span>
                  <span className="text-sm text-gray-900 font-mono">{formData.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Verification Method:</span>
                  <span className="text-sm text-gray-900 capitalize">{formData.verificationMethod}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Priority:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    formData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.priority}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Enabled Features:</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.sslEnabled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        SSL
                      </span>
                    )}
                    {formData.cdnEnabled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <Zap className="h-3 w-3 mr-1" />
                        CDN
                      </span>
                    )}
                    {formData.trafficEnabled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitoring
                      </span>
                    )}
                  </div>
                </div>
                
                {formData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && !domain && (
            <button
              type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
              
              {!domain && currentStep < 3 ? (
            <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.name.trim() || !!validationError || isValidating}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim() || !!validationError || isValidating}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {domain ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
              {domain ? 'Update Domain' : 'Add Domain'}
                    </>
                  )}
            </button>
              )}
          </div>
          </div>

          {/* Form Validation Summary */}
          {!domain && currentStep < 3 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Step {currentStep} of 3</span>
                <span className="text-gray-500">
                  {currentStep === 1 && formData.name.trim() && !validationError ? '✅ Ready for next step' :
                   currentStep === 1 ? '⚠️ Please complete domain information' :
                   currentStep === 2 ? '✅ Ready for review' : '✅ Ready to submit'}
                </span>
              </div>
              {currentStep === 1 && (
                <div className="mt-2 text-xs text-gray-500">
                  {formData.name.trim() ? 
                    `Domain: ${formData.name}` : 
                    'Enter a valid domain name to continue'
                  }
                </div>
              )}
            </div>
          )}

          {/* Edit Mode Step Navigation */}
          {domain && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">Edit Mode - Step {currentStep} of 3</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentStep === 1 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Domain Info
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentStep === 2 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentStep === 3 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Review
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                {currentStep === 1 ? 'Edit domain information' :
                 currentStep === 2 ? 'Modify verification and security settings' :
                 'Review and save changes'}
              </div>
            </div>
          )}
        </div>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
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
                    {import.meta.env.MODE === 'development' && (
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors font-semibold"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors font-semibold"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors font-semibold"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors"
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
                          className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-colors flex items-center justify-center"
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
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-colors font-semibold"
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
                  className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

// Bulk Import Modal Component
const BulkImportModal = ({ isOpen, onClose, onImport }) => {
  const [importData, setImportData] = useState('')
  const [importMethod, setImportMethod] = useState('text')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedDomains, setParsedDomains] = useState([])
  const [errors, setErrors] = useState([])

  const parseDomains = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const domains = []
    const errors = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Try to extract domain from various formats
      let domain = trimmedLine
      
      // Remove common prefixes
      domain = domain.replace(/^https?:\/\//, '')
      domain = domain.replace(/^www\./, '')
      domain = domain.replace(/\/.*$/, '') // Remove paths
      
      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
      
      if (domainRegex.test(domain)) {
        domains.push({
          name: domain.toLowerCase(),
          line: index + 1,
          original: trimmedLine
        })
      } else {
        errors.push({
          line: index + 1,
          content: trimmedLine,
          error: 'Invalid domain format'
        })
      }
    })

    setParsedDomains(domains)
    setErrors(errors)
  }

  const handleTextChange = (e) => {
    const value = e.target.value
    setImportData(value)
    if (value.trim()) {
      parseDomains(value)
    } else {
      setParsedDomains([])
      setErrors([])
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      setImportData(content)
      parseDomains(content)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsedDomains.length === 0) {
      toast.error('No valid domains to import')
      return
    }

    setIsProcessing(true)
    try {
      const importResults = await onImport(parsedDomains)
      toast.success(`Successfully imported ${importResults.success} domains`)
      if (importResults.errors.length > 0) {
        toast.error(`${importResults.errors.length} domains failed to import`)
      }
      onClose()
    } catch (error) {
      toast.error('Import failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Domain Import</h2>
              <p className="text-sm text-gray-600 mt-1">
                Import multiple domains at once from text or file
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Import Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Import Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="text"
                    checked={importMethod === 'text'}
                    onChange={(e) => setImportMethod(e.target.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Paste Text</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={importMethod === 'file'}
                    onChange={(e) => setImportMethod(e.target.value)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Upload File</span>
                </label>
              </div>
            </div>

            {/* Input Area */}
            {importMethod === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain List (one per line)
                </label>
                <textarea
                  value={importData}
                  onChange={handleTextChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="example.com&#10;mysite.org&#10;https://www.another-site.net&#10;subdomain.example.com"
                  rows={8}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter domains one per line. URLs will be automatically cleaned to extract domain names.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.csv"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      TXT or CSV files supported
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Preview Results */}
            {(parsedDomains.length > 0 || errors.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Valid Domains */}
                {parsedDomains.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Valid Domains ({parsedDomains.length})
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {parsedDomains.map((domain, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-mono text-green-800">{domain.name}</span>
                            <span className="text-green-600">✓</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Errors ({errors.length})
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {errors.map((error, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-red-600 font-medium">Line {error.line}:</span>
                            <span className="text-red-800 ml-2">{error.content}</span>
                            <div className="text-red-600 text-xs mt-1">{error.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Import Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• One domain per line</li>
                <li>• URLs will be automatically cleaned (removes http://, www., paths)</li>
                <li>• Invalid domains will be skipped and shown in errors</li>
                <li>• All domains will be imported with default settings</li>
                <li>• You can modify settings after import</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={parsedDomains.length === 0 || isProcessing}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Import {parsedDomains.length} Domains
                </>
              )}
            </button>
          </div>
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [editingDomain, setEditingDomain] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showMonitoringConfigModal, setShowMonitoringConfigModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 Fetching domains - user authenticated')
      dispatch(fetchDomains())
        .unwrap()
        .then((result) => {
          console.log('✅ Domains fetched successfully:', result)
        })
        .catch((error) => {
          console.error('❌ Failed to fetch domains:', error)
          toast.error('Failed to load domains. Please try again.')
        })
    } else {
      console.log('🔍 User not authenticated, skipping domain fetch')
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
    console.log('🔍 Domains state:', domains)
    console.log('🔍 Domains type:', typeof domains)
    console.log('🔍 Is array:', Array.isArray(domains))
    console.log('🔍 Loading state:', loading)
    console.log('🔍 Error state:', error)
    console.log('🔍 Is authenticated:', isAuthenticated)
  }, [domains, loading, error, isAuthenticated])

  // Memoized filtered domains to prevent unnecessary re-calculations
  const filteredDomains = useMemo(() => {
    return safeFilter(domains, domain => {
      const matchesSearch = domain?.domain_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const matchesStatus = statusFilter === 'all' || domain?.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [domains, searchTerm, statusFilter])

  const handleAddDomain = useCallback(async (formData) => {
    console.log('🎯 handleAddDomain called with:', formData)
    
    // Transform the form data to match backend API expectations
    const apiData = {
      domain_name: formData.name,
      verification_method: formData.verificationMethod,
      ssl_enabled: formData.sslEnabled,
      cdn_enabled: formData.cdnEnabled,
      traffic_enabled: formData.trafficEnabled,
      description: formData.description || '',
      category: formData.category || 'business',
      priority: formData.priority || 'medium'
    }
    
    console.log('📤 Sending to API:', apiData)
    
        try {
      const result = await dispatch(createDomain(apiData)).unwrap()
      console.log('✅ Domain created successfully:', result)
      console.log('✅ Created domain result structure:', result)
      
      // Extract the actual domain data from the result
      const createdDomain = result?.domain || result
      console.log('✅ Extracted domain data:', createdDomain)
      
      // Close modal first
      setShowFormModal(false)
      setEditingDomain(null)
      
      // Show success message
      toast.success(`Domain "${createdDomain?.domain_name || apiData.domain_name}" added successfully!`)
      
      // Force refresh the domains list to ensure we get the latest data
      console.log('🔄 Force refreshing domains list after creation...')
      
      // Add a small delay to ensure backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay
      
      try {
        const refreshResult = await dispatch(fetchDomains()).unwrap()
        console.log('🔄 Domains list refreshed successfully:', refreshResult)
        console.log('🔄 Number of domains after refresh:', refreshResult?.domains?.length || refreshResult?.length || 'unknown')
        
        // Verify the domain was actually added
        const domainsList = refreshResult?.domains || refreshResult || []
        console.log('🔍 DETAILED DEBUG - refreshResult structure:', refreshResult)
        console.log('🔍 DETAILED DEBUG - domainsList:', domainsList)
        console.log('🔍 DETAILED DEBUG - domainsList length:', domainsList.length)
        console.log('🔍 DETAILED DEBUG - searching for:', apiData.domain_name)
        
        // Log all domain names in the list
        const domainNames = domainsList.map(d => d.domain_name || d.name || 'NO_NAME')
        console.log('🔍 DETAILED DEBUG - all domain names in list:', domainNames)
        
        const addedDomain = domainsList.find(d => d.domain_name === apiData.domain_name)
        if (addedDomain) {
          console.log('✅ Confirmed: Domain found in refreshed list:', addedDomain)
        } else {
          console.error('❌ Domain not found in refreshed list! Expected:', apiData.domain_name)
          console.error('❌ Available domains:', domainNames)
          
          // Try alternative search methods
          const altSearch1 = domainsList.find(d => d.name === apiData.domain_name)
          const altSearch2 = domainsList.find(d => d.domain === apiData.domain_name)
          console.log('🔍 Alternative search 1 (d.name):', altSearch1)
          console.log('🔍 Alternative search 2 (d.domain):', altSearch2)
          
          // Force a page refresh as a last resort
          console.log('🔄 Forcing page refresh due to sync issue...')
          toast.success('Domain created successfully! Refreshing page to update list...')
          
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } catch (refreshError) {
        console.error('🔄 Failed to refresh domains list:', refreshError)
        toast.error('Domain added but failed to refresh list. Please refresh manually.')
      }
    } catch (error) {
      console.error('❌ Failed to create domain:', error)
      toast.error(error || 'Failed to add domain')
    }
  }, [dispatch])

  const handleBulkImport = useCallback(async (domains) => {
    const results = { success: 0, errors: [] }
    
    for (const domain of domains) {
      try {
        const apiData = {
          domain_name: domain.name,
          verification_method: 'dns',
          ssl_enabled: true,
          cdn_enabled: false,
          traffic_enabled: true,
          priority: 'medium'
        }
        
        await dispatch(createDomain(apiData)).unwrap()
        results.success++
      } catch (error) {
        results.errors.push({
          domain: domain.name,
          error: error.message || 'Failed to import'
        })
      }
    }
    
    return results
  }, [dispatch])

  const handleEditDomain = (domain) => {
    setEditingDomain(domain)
    setShowFormModal(true)
  }

  const handleUpdateDomain = async (formData) => {
    if (!editingDomain) return
    
    console.log('🎯 handleUpdateDomain called with:', formData)
    console.log('🎯 Editing domain:', editingDomain)
    
    // Transform the form data to match backend API expectations
    const apiData = {
      domain_name: formData.name,
      verification_method: formData.verificationMethod,
      ssl_enabled: formData.sslEnabled,
      cdn_enabled: formData.cdnEnabled,
      traffic_enabled: formData.trafficEnabled,
      description: formData.description || '',
      category: formData.category || 'business',
      priority: formData.priority || 'medium'
    }
    
    console.log('📤 Updating domain with:', apiData)
    
    try {
      const result = await dispatch(updateDomain({ id: editingDomain.id, data: apiData })).unwrap()
      console.log('✅ Domain updated successfully:', result)
        toast.success('Domain updated successfully!')
        setShowFormModal(false)
        setEditingDomain(null)
      // Refresh domains list
      dispatch(fetchDomains())
    } catch (error) {
      console.error('❌ Failed to update domain:', error)
        toast.error(error || 'Failed to update domain')
    }
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

  const handleMonitoringConfig = (domain) => {
    setSelectedDomain(domain)
    setShowMonitoringConfigModal(true)
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
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your domains and configure bot protection settings with advanced features.
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                {filteredDomains.length} domains
              </span>
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                {filteredDomains.filter(d => d.status === 'verified').length} verified
              </span>
          </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Bulk Import
            </button>
          <button
            onClick={() => setShowFormModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </button>
          </div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                placeholder="Search domains..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh button clicked')
                console.log('🔄 Authentication state:', isAuthenticated)
                console.log('🔄 Current domains:', domains)
                dispatch(fetchDomains())
                  .unwrap()
                  .then((result) => {
                    console.log('🔄 Manual refresh successful:', result)
                    toast.success('Domains refreshed successfully!')
                  })
                  .catch((error) => {
                    console.error('🔄 Manual refresh failed:', error)
                    toast.error('Failed to refresh domains: ' + error)
                  })
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            
            {/* Debug Button - Remove in production */}
            <button
              onClick={() => {
                console.log('🐛 DEBUG INFO:')
                console.log('🐛 isAuthenticated:', isAuthenticated)
                console.log('🐛 domains state:', domains)
                console.log('🐛 loading state:', loading)
                console.log('🐛 error state:', error)
                console.log('🐛 localStorage token:', localStorage.getItem('token'))
                console.log('🐛 localStorage user:', localStorage.getItem('user'))
                
                // Test API call directly
                const token = localStorage.getItem('token')
                if (token) {
                  fetch('http://localhost:8960/api/v1/domains', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })
                  .then(response => response.json())
                  .then(data => {
                    console.log('🐛 Direct API call result:', data)
                    toast.success('Check console for debug info!')
                  })
                  .catch(error => {
                    console.error('🐛 Direct API call failed:', error)
                    toast.error('Direct API call failed - check console')
                  })
                } else {
                  console.log('🐛 No token found!')
                  toast.error('No authentication token found!')
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
            >
              🐛 Debug
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:border-gray-300"
                  >
                    {/* Domain Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Globe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <h3 className="font-bold text-lg text-gray-900 truncate">{domain.domain_name}</h3>
                          <div className="flex items-center mt-2">
                            {getStatusBadge(domain.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <button
                          onClick={() => handleViewDetails(domain)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDomain(domain)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {domain.status === 'verified' && (
                          <button
                            onClick={() => handleMonitoringConfig(domain)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Configure Monitoring"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Domain Features */}
                    <div className="flex items-center space-x-3 mb-5">
                      {domain.ssl_enabled && (
                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          <Shield className="h-4 w-4 mr-2" />
                          SSL
                        </div>
                      )}
                      {domain.cdn_enabled && (
                        <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                          <Zap className="h-4 w-4 mr-2" />
                          CDN
                        </div>
                      )}
                      {domain.traffic_enabled && (
                        <div className="flex items-center text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm font-medium">
                          <Activity className="h-4 w-4 mr-2" />
                          Monitor
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">Requests</div>
                        <div className="text-lg font-bold text-gray-900">{stats.requests.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">Blocked</div>
                        <div className="text-lg font-bold text-red-600">{stats.blocked.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">Revenue</div>
                        <div className="text-lg font-bold text-green-600">${stats.revenue.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">Block Rate</div>
                        <div className="text-lg font-bold text-blue-600">{stats.blockRate}%</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {domain.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleGetTxtString(domain)}
                            className="flex-1 px-3 py-2 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200"
                          >
                            <FileText className="h-3 w-3 inline mr-1" />
                            Get TXT String
                          </button>
                          <button
                            onClick={() => handleVerifyDomain(domain)}
                            className="flex-1 px-3 py-2 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200"
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
                            className="flex-1 px-3 py-2 bg-gray-50 text-black rounded-md text-sm font-medium hover:bg-gray-100"
                          >
                            <Copy className="h-3 w-3 inline mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => window.open(`https://${domain.domain_name}`, '_blank')}
                            className="flex-1 px-3 py-2 bg-gray-50 text-black rounded-md text-sm font-medium hover:bg-gray-100"
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
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowFormModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </button>
                {error && (
                  <div className="mt-4">
                    <p className="text-sm text-red-600 mb-2">Error loading domains: {error}</p>
                    <button
                      onClick={() => dispatch(fetchDomains())}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                </button>
              </div>
            )}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Domains</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => dispatch(fetchDomains())}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
              <button
                onClick={() => dispatch(clearError())}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
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

      <DomainMonitoringConfig
        isOpen={showMonitoringConfigModal}
        onClose={() => setShowMonitoringConfigModal(false)}
        domain={selectedDomain}
        onSave={(updatedDomain) => {
          // Refresh domains list to show updated monitoring status
          dispatch(fetchDomains())
          setShowMonitoringConfigModal(false)
          setSelectedDomain(null)
        }}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={handleBulkImport}
      />
    </>
  )
}

export default Domains
