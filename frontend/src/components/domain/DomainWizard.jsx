import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { createDomain, verifyDomain, updateDomain } from '../../store/slices/domainsSlice'
import toast from 'react-hot-toast'
import {
  Globe, Shield, CheckCircle, AlertTriangle,
  ArrowRight, ArrowLeft, Activity, Settings,
  Copy, X
} from 'lucide-react'

// Move components outside to prevent re-creation on every render
const BasicInfoStep = ({ domainData, onDataChange }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Domain Information</h2>
    <p className="text-gray-600">Enter the basic information about your domain.</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="domain_name" className="block text-sm font-medium text-gray-700">
          Domain Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="domain_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          placeholder="example.com"
          value={domainData.domain_name || ''}
          onChange={(e) => onDataChange('domain_name', e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ssl_enabled"
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          checked={domainData.ssl_enabled}
          onChange={(e) => onDataChange('ssl_enabled', e.target.checked)}
        />
        <label htmlFor="ssl_enabled" className="ml-2 block text-sm text-gray-700">
          SSL Enabled (HTTPS)
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="cdn_enabled"
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          checked={domainData.cdn_enabled}
          onChange={(e) => onDataChange('cdn_enabled', e.target.checked)}
        />
        <label htmlFor="cdn_enabled" className="ml-2 block text-sm text-gray-700">
          CDN Enabled
        </label>
      </div>
    </div>
  </div>
)

const MonitoringStep = ({ domainData, onDataChange }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Monitoring Settings</h2>
    <p className="text-gray-600">Configure how we monitor your domain for traffic and security issues.</p>
    
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="monitoring_enabled"
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          checked={domainData.monitoring_enabled}
          onChange={(e) => onDataChange('monitoring_enabled', e.target.checked)}
        />
        <label htmlFor="monitoring_enabled" className="ml-2 block text-sm text-gray-700">
          Enable Traffic Monitoring
        </label>
      </div>
      
      <div>
        <label htmlFor="monitoring_interval" className="block text-sm font-medium text-gray-700">
          Monitoring Interval (minutes)
        </label>
        <select
          id="monitoring_interval"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          value={domainData.monitoring_interval}
          onChange={(e) => onDataChange('monitoring_interval', parseInt(e.target.value))}
          disabled={!domainData.monitoring_enabled}
        >
          <option value={1}>1 minute</option>
          <option value={5}>5 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="monitoring_url" className="block text-sm font-medium text-gray-700">
          Monitoring URL (optional)
        </label>
        <input
          type="text"
          id="monitoring_url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          placeholder={`https://${domainData.domain_name}/`}
          value={domainData.monitoring_url}
          onChange={(e) => onDataChange('monitoring_url', e.target.value)}
          disabled={!domainData.monitoring_enabled}
        />
        <p className="mt-1 text-sm text-gray-500">
          Leave empty to monitor the domain root
        </p>
      </div>
    </div>
  </div>
)

const VerificationStep = ({ createdDomain, verificationData, onVerify, onComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState('dns')
  
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
          <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Verification Required</h3>
          <p className="mt-2 text-gray-600">Click verify to start the domain verification process.</p>
          <button
            onClick={onVerify}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Verify Domain
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Verify Domain Ownership</h2>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">DNS TXT Record Verification</h3>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">HTML File Verification</h3>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>Download this verification file:
              <div className="mt-2">
                <button 
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  onClick={() => {
                    // Create file content
                    const content = `botinterceptor-verification=${createdDomain.verification_token}`;
                    
                    // Create blob and download link
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `botinterceptor-${createdDomain.verification_token}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Meta Tag Verification</h3>
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
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
          onClick={onVerify}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Verify Domain
        </button>
      </div>
    </div>
  )
}

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

  const [createdDomain, setCreatedDomain] = useState(null)
  const [verificationData, setVerificationData] = useState(null)

  // Memoize handlers to prevent unnecessary re-renders
  const handleDataChange = useCallback((field, value) => {
    setDomainData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleNext = useCallback(() => {
    if (step < 3) setStep(step + 1)
  }, [step])

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1)
  }, [step])

  const handleCreateDomain = useCallback(async () => {
    if (!domainData.domain_name) {
      toast.error('Domain name is required')
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(createDomain(domainData)).unwrap()
      setCreatedDomain(result)
      toast.success('Domain created successfully!')
      setStep(3)
    } catch (error) {
      toast.error(error.message || 'Failed to create domain')
    } finally {
      setLoading(false)
    }
  }, [dispatch, domainData])

  const handleVerify = useCallback(async () => {
    if (!createdDomain) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please log in to verify domains.')
        return
      }

      const response = await fetch(`/api/v1/domains/${createdDomain.id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method: 'dns' })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Domain verified successfully!')
        setVerificationData(data)
        
        // Update the domain status in Redux state immediately
        dispatch(updateDomain({ 
          id: createdDomain.id, 
          data: { 
            status: 'verified', 
            verifiedAt: new Date().toISOString() 
          } 
        }))
      } else {
        // Handle verification failure with detailed instructions
        if (data.details && data.details.instruction) {
          const instruction = data.details.instruction
          const expectedRecord = data.details.expected_record
          const expectedValue = data.details.expected_value
          
          const errorMessage = `DNS verification failed. ${instruction}`
          
          toast.error(errorMessage, {
            duration: 8000,
            action: {
              label: 'Copy TXT Record',
              onClick: () => {
                navigator.clipboard.writeText(`${expectedRecord} TXT ${expectedValue}`)
                toast.success('TXT record copied to clipboard!')
              }
            }
          })
        } else {
          toast.error(data.message || 'Domain verification failed. Please check your settings and try again.')
        }
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast.error('Failed to verify domain')
    } finally {
      setLoading(false)
    }
  }, [createdDomain])

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(createdDomain)
    }
  }, [onComplete, createdDomain])

  // Memoize step components to prevent unnecessary re-renders
  const currentStep = useMemo(() => {
    switch (step) {
      case 1:
        return <BasicInfoStep domainData={domainData} onDataChange={handleDataChange} />
      case 2:
        return <MonitoringStep domainData={domainData} onDataChange={handleDataChange} />
      case 3:
        return (
          <VerificationStep
            createdDomain={createdDomain}
            verificationData={verificationData}
            onVerify={handleVerify}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }, [step, domainData, createdDomain, verificationData, handleDataChange, handleVerify, handleComplete])

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
          {currentStep}
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between">
        <button
          className="px-4 py-2 text-gray-700 hover:text-black flex items-center"
          onClick={step === 1 ? onCancel : handlePrev}
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
        
        {step !== 2 && step !== 3 && (
          <button
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
            onClick={step === 1 ? handleCreateDomain : handleNext}
            disabled={loading || (step === 1 && !domainData.domain_name)}
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
