import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Shield, Zap, Activity, Bot, Brain, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const EnhancedTrafficInterceptionFlow = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    try {
      const response = await fetch('/api/v1/domains', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDomains(data.domains || [])
      }
    } catch (error) {
      console.error('Failed to load domains:', error)
    }
  }

  const createInterceptionFlow = async (domainId) => {
    try {
      setLoading(true)
      const response = await fetch('/api/enhanced/interception/flow/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain_id: domainId })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        setCurrentStep(2)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create interception flow')
      }
    } catch (error) {
      console.error('Failed to create interception flow:', error)
      toast.error('Failed to create interception flow')
    } finally {
      setLoading(false)
    }
  }

  const Step1DomainSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 1: Select Domain</h2>
        <p className="text-gray-600">Choose a verified domain to set up traffic interception</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.filter(d => d.status === 'verified').map(domain => (
          <div
            key={domain.id}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedDomain?.id === domain.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedDomain(domain)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{domain.domain_name}</h3>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Verified
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>SSL: {domain.ssl_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>CDN: {domain.cdn_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Monitoring: {domain.traffic_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDomain && (
        <div className="text-center">
          <button
            onClick={() => createInterceptionFlow(selectedDomain.id)}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? 'Creating Flow...' : 'Create Interception Flow'}
          </button>
        </div>
      )}
    </div>
  )

  const Step2RuleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 2: Add Rules</h2>
        <p className="text-gray-600">Select ready-to-use rules for your domain</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready-to-Use Rules</h3>
        <p className="text-gray-600">The system will automatically apply recommended security rules based on your domain configuration.</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Bot Protection</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">DDoS Protection</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Content Protection</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">API Security</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Previous
        </button>
        
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next: Configure Interception
        </button>
      </div>
    </div>
  )

  const Step3InterceptionConfig = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 3: Configure Interception</h2>
        <p className="text-gray-600">Set up traffic interception parameters and monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Interception Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="proxy">Proxy Mode</option>
                <option value="reverse_proxy">Reverse Proxy</option>
                <option value="api_gateway">API Gateway</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Features</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Bot Detection</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Content Protection</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">DDoS Protection</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Agents Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">BotHunter</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">TrafficInsight</span>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Previous
        </button>
        
        <button
          onClick={() => setCurrentStep(4)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next: Review & Start
        </button>
      </div>
    </div>
  )

  const Step4ReviewAndStart = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 4: Review & Start</h2>
        <p className="text-gray-600">Review your configuration and start traffic interception</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Domain:</span>
              <span className="font-medium">{selectedDomain?.domain_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium">Proxy</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Bot Detection:</span>
              <span className="font-medium">Enabled</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">AI Agents:</span>
              <span className="font-medium">2 Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start</h3>
          <p className="text-gray-600 mb-4">Your traffic interception system is configured and ready to protect your domain.</p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Domain verified and configured</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Security rules applied</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>AI agents active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setCurrentStep(5)}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
        >
          Start Traffic Interception
        </button>
      </div>

      <div className="flex justify-center pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Previous
        </button>
      </div>
    </div>
  )

  const Step5RealTimeMonitoring = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 5: Real-Time Monitoring</h2>
        <p className="text-gray-600">Monitor your domain's traffic interception in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Requests</h3>
              <p className="text-sm text-gray-600">Real-time traffic</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">1,247</div>
          <div className="text-sm text-green-600">+12% from last hour</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bots Blocked</h3>
              <p className="text-sm text-gray-600">AI detected threats</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600">89</div>
          <div className="text-sm text-red-600">+5% from last hour</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
              <p className="text-sm text-gray-600">Overall protection</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">98.5%</div>
          <div className="text-sm text-green-600">+2.3% from yesterday</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Agent Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">BotHunter</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">TrafficInsight</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Anomaly Detection:</span>
                <span className="font-medium">96.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Control Panel</h3>
        
        <div className="flex space-x-4">
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            Stop Interception
          </button>
          <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
            Pause
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Traffic Interception Flow
          </h1>
          <p className="text-xl text-gray-600">
            Complete workflow for setting up and monitoring traffic interception
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-4 space-x-8">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Select Domain
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Add Rules
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Configure
            </span>
            <span className={`text-sm ${currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Review
            </span>
            <span className={`text-sm ${currentStep >= 5 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Monitor
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {currentStep === 1 && <Step1DomainSelection />}
          {currentStep === 2 && <Step2RuleSelection />}
          {currentStep === 3 && <Step3InterceptionConfig />}
          {currentStep === 4 && <Step4ReviewAndStart />}
          {currentStep === 5 && <Step5RealTimeMonitoring />}
        </div>
      </div>
    </div>
  )
}

export default EnhancedTrafficInterceptionFlow
