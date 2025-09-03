import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { createDomain, verifyDomain } from '../../store/slices/domainsSlice'
import toast from 'react-hot-toast'
import {
  Globe, Shield, CheckCircle, AlertTriangle,
  ArrowRight, ArrowLeft, Activity, Settings, X, Copy
} from 'lucide-react'

const DomainWizard = ({ onComplete, onCancel }) => {
  const dispatch = useDispatch()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [domainData, setDomainData] = useState({
    domain_name: '',
    ssl_enabled: true,
    cdn_enabled: false,
    monitoring_enabled: true,
    monitoring_interval: 5,
    monitoring_url: '',
    verification_method: 'dns',
  })

  // Debug: Log state changes
  useEffect(() => {
    console.log('Domain data changed:', domainData);
  }, [domainData]);

  // Debug: Log component render
  useEffect(() => {
    console.log('DomainWizard component rendered');
  });
  const [createdDomain, setCreatedDomain] = useState(null)
  const [verificationData, setVerificationData] = useState(null)

  // Step 1: Basic domain info
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Domain Information</h2>
      <p className="text-gray-600">Enter the basic information about your domain.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="domain_name" className="block text-sm font-medium text-black">
            Domain Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="domain_name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm font-normal transition-all duration-200 bg-white text-black hover:border-gray-400 placeholder-gray-500"
            placeholder="example.com"
            value={domainData.domain_name}
            onChange={(e) => {
              console.log('Input change:', e.target.value); // Debug log
              const newValue = e.target.value;
              console.log('Setting new value:', newValue);
              setDomainData(prev => {
                const newData = {...prev, domain_name: newValue};
                console.log('New data:', newData);
                return newData;
              });
            }}
            onInput={(e) => {
              console.log('Input event:', e.target.value);
            }}
            onKeyDown={(e) => {
              console.log('Key down:', e.key, e.target.value);
            }}
            onKeyUp={(e) => {
              console.log('Key up:', e.key, e.target.value);
            }}
            onFocus={(e) => {
              console.log('Input focused, current value:', e.target.value);
            }}
            onBlur={(e) => {
              console.log('Input blurred, current value:', e.target.value);
            }}
            required
            style={{
              fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
            }}
          />
          
          {/* Debug: Test input field */}
          <div className="mt-4">
            <label htmlFor="test_input" className="block text-sm font-medium text-black">
              Test Input (Debug)
            </label>
            <input
              type="text"
              id="test_input"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm font-normal transition-all duration-200 bg-white text-black hover:border-gray-400 placeholder-gray-500"
              placeholder="Test typing here..."
              onChange={(e) => {
                console.log('Test input change:', e.target.value);
              }}
            />
            
            {/* Debug: State display */}
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p><strong>Current domain_name:</strong> "{domainData.domain_name}"</p>
              <p><strong>Length:</strong> {domainData.domain_name.length}</p>
              <p><strong>Type:</strong> {typeof domainData.domain_name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ssl_enabled"
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            checked={domainData.ssl_enabled}
            onChange={(e) => setDomainData({...domainData, ssl_enabled: e.target.checked})}
          />
          <label htmlFor="ssl_enabled" className="ml-2 block text-sm text-black">
            SSL Enabled (HTTPS)
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cdn_enabled"
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            checked={domainData.cdn_enabled}
            onChange={(e) => setDomainData({...domainData, cdn_enabled: e.target.checked})}
          />
          <label htmlFor="cdn_enabled" className="ml-2 block text-sm text-black">
            CDN Enabled
          </label>
        </div>
      </div>
    </div>
  )

  // Step 2: Domain verification
  const VerificationStep = () => {
    const [selectedMethod, setSelectedMethod] = useState(domainData.verification_method)
    
    if (!createdDomain) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Domain Not Created</h3>
            <p className="mt-2 text-gray-600">Please go back and create the domain first.</p>
          </div>
        </div>
      )
    }
    
    if (!verificationData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification data...</p>
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-black">Verify Domain Ownership</h2>
        <p className="text-gray-600">Prove that you own this domain by completing one of these verification methods.</p>
        
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${selectedMethod === 'dns' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedMethod('dns')}
          >
            DNS TXT Record
          </button>
          <button
            className={`px-4 py-2 rounded-md ${selectedMethod === 'file' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedMethod('file')}
          >
            HTML File
          </button>
          <button
            className={`px-4 py-2 rounded-md ${selectedMethod === 'meta' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedMethod('meta')}
          >
            Meta Tag
          </button>
        </div>
        
        {selectedMethod === 'dns' && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-black mb-4">DNS TXT Record Verification</h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>Access your DNS settings at your domain registrar or DNS provider</li>
              <li>Add a new TXT record with these values:
                <div className="mt-2 bg-white p-4 rounded border border-gray-300">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Name/Host:</p>
                      <p className="font-mono text-sm">_botinterceptor.{createdDomain.domain_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Value/Content:</p>
                      <p className="font-mono text-sm">botinterceptor-verification={createdDomain.verification_token}</p>
                    </div>
                  </div>
                  <button 
                    className="mt-2 text-xs text-gray-600 hover:text-black flex items-center"
                    onClick={() => {
                      navigator.clipboard.writeText(`botinterceptor-verification=${createdDomain.verification_token}`)
                      toast.success('Value copied to clipboard')
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy value
                  </button>
                </div>
              </li>
              <li>Wait for DNS propagation (may take up to 48 hours, but often just minutes)</li>
            </ol>
          </div>
        )}
        
        {selectedMethod === 'file' && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-black mb-4">HTML File Verification</h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>Download this verification file:
                <div className="mt-2">
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm font-medium">
                    Download Verification File
                  </button>
                </div>
              </li>
              <li>Upload the file to your web server at this location:
                <div className="mt-2 bg-white p-4 rounded border border-gray-300">
                  <p className="font-mono text-sm">https://{createdDomain.domain_name}/.well-known/botinterceptor-{createdDomain.verification_token}.txt</p>
                </div>
              </li>
              <li>Make sure the file is accessible at the URL above</li>
            </ol>
          </div>
        )}
        
        {selectedMethod === 'meta' && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-black mb-4">Meta Tag Verification</h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>Add this meta tag to the <code>&lt;head&gt;</code> section of your homepage:
                <div className="mt-2 bg-white p-4 rounded border border-gray-300">
                  <p className="font-mono text-sm overflow-x-auto">&lt;meta name="botinterceptor-verification" content="{createdDomain.verification_token}" /&gt;</p>
                  <button 
                    className="mt-2 text-xs text-gray-600 hover:text-black flex items-center"
                    onClick={() => {
                      navigator.clipboard.writeText(`<meta name="botinterceptor-verification" content="${createdDomain.verification_token}" />`)
                      toast.success('Meta tag copied to clipboard')
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy tag
                  </button>
                </div>
              </li>
              <li>Make sure the meta tag is present on your homepage</li>
            </ol>
          </div>
        )}
        
        <div className="mt-6">
          <button
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center transition-all duration-200 text-sm font-medium"
            onClick={handleVerifyDomain}
            disabled={loading}
            style={{
              fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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
    )
  }

  // Step 3: Monitoring settings
  const MonitoringStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Monitoring Settings</h2>
      <p className="text-gray-600">Configure how we monitor your domain for traffic and security issues.</p>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="monitoring_enabled"
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            checked={domainData.monitoring_enabled}
            onChange={(e) => setDomainData({...domainData, monitoring_enabled: e.target.checked})}
          />
          <label htmlFor="monitoring_enabled" className="ml-2 block text-sm text-black">
            Enable Traffic Monitoring
          </label>
        </div>
        
        <div>
          <label htmlFor="monitoring_interval" className="block text-sm font-medium text-black">
            Monitoring Interval (minutes)
          </label>
          <select
            id="monitoring_interval"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm font-normal transition-all duration-200 bg-white text-black hover:border-gray-400"
            value={domainData.monitoring_interval}
            onChange={(e) => setDomainData({...domainData, monitoring_interval: parseInt(e.target.value)})}
            disabled={!domainData.monitoring_enabled}
            style={{
              fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
            }}
          >
            <option value="1">1 minute</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="monitoring_url" className="block text-sm font-medium text-black">
            Monitoring URL (optional)
          </label>
          <input
            type="text"
            id="monitoring_url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm font-normal transition-all duration-200 bg-white text-black hover:border-gray-400 placeholder-gray-500"
            placeholder={`https://${domainData.domain_name}/`}
            value={domainData.monitoring_url}
            onChange={(e) => setDomainData({...domainData, monitoring_url: e.target.value})}
            disabled={!domainData.monitoring_enabled}
            style={{
              fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
            }}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to monitor the domain root
          </p>
        </div>
      </div>
    </div>
  )

  // Step 4: Rule setup
  const RuleSetupStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">Protection Rules</h2>
      <p className="text-gray-600">Set up initial protection rules for your domain.</p>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="bot_protection"
              className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black"
              defaultChecked
            />
            <div className="ml-3">
              <label htmlFor="bot_protection" className="font-medium text-black">
                Basic Bot Protection
              </label>
              <p className="text-sm text-gray-600">
                Detect and block common malicious bots while allowing legitimate ones (search engines, etc.)
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="rate_limiting"
              className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black"
              defaultChecked
            />
            <div className="ml-3">
              <label htmlFor="rate_limiting" className="font-medium text-black">
                Rate Limiting
              </label>
              <p className="text-sm text-gray-600">
                Limit excessive requests from a single IP address to prevent abuse
              </p>
              <div className="mt-2">
                <label className="text-sm text-black">Requests per minute threshold:</label>
                <select className="ml-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black bg-white text-black hover:border-gray-400 transition-all duration-200">
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="content_protection"
              className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black"
            />
            <div className="ml-3">
              <label htmlFor="content_protection" className="font-medium text-black">
                Content Protection
              </label>
              <p className="text-sm text-gray-600">
                Prevent content scraping and unauthorized access to specific paths
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <a href="/rules" className="text-sm text-black hover:underline">
          Advanced rule configuration available in Rules section →
        </a>
      </div>
    </div>
  )

  // Step 5: Completion
  const CompletionStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-black">Domain Setup Complete!</h2>
      <p className="text-gray-600">
        Your domain has been successfully set up and is now being monitored.
      </p>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left">
        <h3 className="text-lg font-medium text-black mb-2">Next Steps:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>View your domain's traffic dashboard</li>
          <li>Configure additional protection rules</li>
          <li>Set up alerts for suspicious activity</li>
          <li>Add more domains to your account</li>
        </ul>
      </div>
      
      <div className="flex space-x-4 justify-center pt-4">
        <button
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center transition-all duration-200 text-sm font-medium"
          onClick={() => onComplete && onComplete(createdDomain)}
          style={{
            fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
          }}
        >
          <Activity className="h-4 w-4 mr-2" />
          View Dashboard
        </button>
        
        <button
          className="px-6 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50 flex items-center transition-all duration-200 text-sm font-medium"
          onClick={() => onComplete && onComplete()}
          style={{
            fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
          }}
        >
          <Globe className="h-4 w-4 mr-2" />
          Back to Domains
        </button>
      </div>
    </div>
  )

  // Handle domain creation
  const handleCreateDomain = async () => {
    if (!domainData.domain_name) {
      toast.error('Domain name is required')
      return
    }
    
    setLoading(true)
    try {
      const resultAction = await dispatch(createDomain(domainData))
      const domain = resultAction.payload
      setCreatedDomain(domain)
      setStep(2)
      
      // Fetch verification data
      try {
        const response = await fetch(`/api/v1/domains/${domain.uuid}/verification`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setVerificationData(data)
        } else {
          toast.error('Failed to fetch verification data')
        }
      } catch (error) {
        console.error('Error fetching verification data:', error)
        toast.error('Failed to fetch verification data')
      }
    } catch (error) {
      console.error('Error creating domain:', error)
      toast.error('Failed to create domain')
    } finally {
      setLoading(false)
    }
  }

  // Handle domain verification
  const handleVerifyDomain = async () => {
    if (!createdDomain) return
    
    setLoading(true)
    try {
      const resultAction = await dispatch(verifyDomain(createdDomain.uuid))
      const result = resultAction.payload
      
      if (result.is_verified) {
        toast.success('Domain verified successfully!')
        setStep(3)
      } else {
        toast.error('Domain verification failed. Please check your settings and try again.')
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast.error('Failed to verify domain')
    } finally {
      setLoading(false)
    }
  }

  // Handle monitoring settings update
  const handleUpdateMonitoring = async () => {
    if (!createdDomain) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/domains/${createdDomain.uuid}/monitoring`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          monitoring_enabled: domainData.monitoring_enabled,
          monitoring_interval: domainData.monitoring_interval,
          monitoring_url: domainData.monitoring_url || null
        })
      })
      
      if (response.ok) {
        toast.success('Monitoring settings updated')
        setStep(4)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update monitoring settings')
      }
    } catch (error) {
      console.error('Error updating monitoring settings:', error)
      toast.error('Failed to update monitoring settings')
    } finally {
      setLoading(false)
    }
  }

  // Handle rule setup
  const handleSetupRules = async () => {
    // In a real implementation, we would create the selected rules here
    // For now, we'll just move to the completion step
    setStep(5)
  }

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1: return <BasicInfoStep />
      case 2: return <VerificationStep />
      case 3: return <MonitoringStep />
      case 4: return <RuleSetupStep />
      case 5: return <CompletionStep />
      default: return <BasicInfoStep />
    }
  }

  // Handle next step
  const handleNext = () => {
    if (step === 1) {
      handleCreateDomain()
    } else if (step === 2) {
      // Verification is handled by the Verify button in the step
    } else if (step === 3) {
      handleUpdateMonitoring()
    } else if (step === 4) {
      handleSetupRules()
    } else {
      onComplete && onComplete(createdDomain)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="bg-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
              <Globe className="h-4 w-4" />
            </div>
            <span className={step >= 1 ? 'text-black' : 'text-gray-500'}>Domain</span>
          </div>
          
          <div className="h-px bg-gray-300 flex-1 mx-2"></div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className={step >= 2 ? 'text-black' : 'text-gray-500'}>Verify</span>
          </div>
          
          <div className="h-px bg-gray-300 flex-1 mx-2"></div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
              <Activity className="h-4 w-4" />
            </div>
            <span className={step >= 3 ? 'text-black' : 'text-gray-500'}>Monitor</span>
          </div>
          
          <div className="h-px bg-gray-300 flex-1 mx-2"></div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
              <Shield className="h-4 w-4" />
            </div>
            <span className={step >= 4 ? 'text-black' : 'text-gray-500'}>Rules</span>
          </div>
          
          <div className="h-px bg-gray-300 flex-1 mx-2"></div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
              <Settings className="h-4 w-4" />
            </div>
            <span className={step >= 5 ? 'text-black' : 'text-gray-500'}>Complete</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between">
        <button
          className="px-4 py-2 text-black hover:text-gray-800 flex items-center transition-all duration-200"
          onClick={step === 1 ? onCancel : handlePrevious}
          disabled={loading}
        >
          {step === 1 ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </>
          )}
        </button>
        
        {step !== 2 && step !== 5 && (
                  <button
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center transition-all duration-200 text-sm font-medium"
          onClick={handleNext}
          disabled={loading || (step === 1 && !domainData.domain_name)}
          style={{
            fontFamily: 'Yandex Sans Display, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
          }}
        >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default DomainWizard
