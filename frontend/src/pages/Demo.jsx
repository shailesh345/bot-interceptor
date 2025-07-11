import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Play, CheckCircle, AlertCircle, Clock, Database,
  Users, Globe, Shield, BarChart3, CreditCard,
  Settings, User, Building, Activity, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { mockAPI } from '../services/comprehensiveMockAPI'

const Demo = () => {
  const [testResults, setTestResults] = useState({})
  const [runningTests, setRunningTests] = useState(false)
  const [currentTest, setCurrentTest] = useState('')

  const testSuites = [
    {
      name: 'User Management',
      icon: Users,
      color: 'blue',
      tests: [
        { name: 'Get Users', func: () => mockAPI.getUsers() },
        { name: 'Create User', func: () => mockAPI.createUser({ name: 'Test User', email: 'test@example.com', role: 'user' }) },
        { name: 'Update User', func: () => mockAPI.updateUser('1', { name: 'Updated User' }) },
        { name: 'Delete User', func: () => mockAPI.deleteUser('test-id') }
      ]
    },
    {
      name: 'Domain Management',
      icon: Globe,
      color: 'green',
      tests: [
        { name: 'Get Domains', func: () => mockAPI.getDomains() },
        { name: 'Create Domain', func: () => mockAPI.createDomain({ domain: 'test.example.com', verificationMethod: 'dns' }) },
        { name: 'Update Domain', func: () => mockAPI.updateDomain('1', { status: 'verified' }) },
        { name: 'Delete Domain', func: () => mockAPI.deleteDomain('test-id') },
        { name: 'Verify Domain', func: () => mockAPI.verifyDomain('1') }
      ]
    },
    {
      name: 'Rules Engine',
      icon: Shield,
      color: 'red',
      tests: [
        { name: 'Get Rules', func: () => mockAPI.getRules() },
        { name: 'Create Rule', func: () => mockAPI.createRule({ 
          name: 'Test Rule', 
          type: 'bot_detection',
          conditions: [{ field: 'user_agent', operator: 'contains', value: 'bot' }],
          actions: [{ type: 'block_request', value: true }]
        }) },
        { name: 'Update Rule', func: () => mockAPI.updateRule('1', { status: 'active' }) },
        { name: 'Delete Rule', func: () => mockAPI.deleteRule('test-id') },
        { name: 'Test Rule', func: () => mockAPI.testRule('1', { user_agent: 'TestBot/1.0' }) }
      ]
    },
    {
      name: 'Analytics & Reporting',
      icon: BarChart3,
      color: 'purple',
      tests: [
        { name: 'Get Analytics (7 days)', func: () => mockAPI.getAnalytics(7) },
        { name: 'Get Analytics (30 days)', func: () => mockAPI.getAnalytics(30) },
        { name: 'Get Real-time Metrics', func: () => mockAPI.getRealTimeMetrics() },
        { name: 'Export Analytics Data', func: () => mockAPI.exportAnalytics('csv', '30d') }
      ]
    },
    {
      name: 'Billing System',
      icon: CreditCard,
      color: 'yellow',
      tests: [
        { name: 'Get Billing Info', func: () => mockAPI.getBillingInfo() },
        { name: 'Update Subscription', func: () => mockAPI.updateSubscription('professional') },
        { name: 'Add Payment Method', func: () => mockAPI.addPaymentMethod({ 
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '2025',
          cvv: '123',
          name: 'Test User'
        }) },
        { name: 'Delete Payment Method', func: () => mockAPI.deletePaymentMethod('test-id') },
        { name: 'Download Invoice', func: () => mockAPI.downloadInvoice('INV-001') }
      ]
    },
    {
      name: 'Admin Operations',
      icon: Settings,
      color: 'indigo',
      tests: [
        { name: 'Get Clients', func: () => mockAPI.getClients() },
        { name: 'Get System Stats', func: () => mockAPI.getSystemStats() },
        { name: 'Get Audit Logs', func: () => mockAPI.getAuditLogs() },
        { name: 'Update System Config', func: () => mockAPI.updateSystemConfig({ maintenance: false }) }
      ]
    }
  ]

  const runAllTests = async () => {
    setRunningTests(true)
    setTestResults({})
    
    for (const suite of testSuites) {
      for (const test of suite.tests) {
        setCurrentTest(`${suite.name}: ${test.name}`)
        
        try {
          const startTime = Date.now()
          const result = await test.func()
          const endTime = Date.now()
          
          setTestResults(prev => ({
            ...prev,
            [`${suite.name}-${test.name}`]: {
              status: 'success',
              duration: endTime - startTime,
              result: result
            }
          }))
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            [`${suite.name}-${test.name}`]: {
              status: 'error',
              error: error.message
            }
          }))
        }
      }
    }
    
    setRunningTests(false)
    setCurrentTest('')
    toast.success('All tests completed!')
  }

  const runSuiteTests = async (suite) => {
    setRunningTests(true)
    
    for (const test of suite.tests) {
      setCurrentTest(`${suite.name}: ${test.name}`)
      
      try {
        const startTime = Date.now()
        const result = await test.func()
        const endTime = Date.now()
        
        setTestResults(prev => ({
          ...prev,
          [`${suite.name}-${test.name}`]: {
            status: 'success',
            duration: endTime - startTime,
            result: result
          }
        }))
        
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [`${suite.name}-${test.name}`]: {
            status: 'error',
            error: error.message
          }
        }))
      }
    }
    
    setRunningTests(false)
    setCurrentTest('')
    toast.success(`${suite.name} tests completed!`)
  }

  const getTestStatus = (suiteName, testName) => {
    return testResults[`${suiteName}-${testName}`]
  }

  const getSuiteStatus = (suite) => {
    const suiteTests = suite.tests.map(test => getTestStatus(suite.name, test.name))
    const completed = suiteTests.filter(test => test).length
    const successful = suiteTests.filter(test => test?.status === 'success').length
    const failed = suiteTests.filter(test => test?.status === 'error').length
    
    return { completed, successful, failed, total: suite.tests.length }
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0)
  const completedTests = Object.keys(testResults).length
  const successfulTests = Object.values(testResults).filter(test => test.status === 'success').length

  return (
    <>
      <Helmet>
        <title>API Demo & Testing - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Demo & Testing</h1>
            <p className="mt-1 text-sm text-gray-600">
              Test all CRUD operations and API functionality
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={runningTests}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Test Progress</h2>
            <div className="text-sm text-gray-600">
              {completedTests} / {totalTests} tests completed
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTests / totalTests) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{successfulTests}</p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{completedTests - successfulTests}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{totalTests - completedTests}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          
          {runningTests && (
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Currently running: {currentTest}
            </div>
          )}
        </div>

        {/* Test Suites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testSuites.map((suite) => {
            const Icon = suite.icon
            const status = getSuiteStatus(suite)
            
            return (
              <motion.div
                key={suite.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 bg-${suite.color}-100 rounded-lg mr-3`}>
                      <Icon className={`h-5 w-5 text-${suite.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{suite.name}</h3>
                      <p className="text-sm text-gray-600">
                        {status.completed}/{status.total} tests completed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => runSuiteTests(suite)}
                    disabled={runningTests}
                    className={`inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-${suite.color}-600 hover:bg-${suite.color}-700 disabled:opacity-50`}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                  <div 
                    className={`bg-${suite.color}-600 h-1 rounded-full transition-all duration-300`}
                    style={{ width: `${(status.completed / status.total) * 100}%` }}
                  ></div>
                </div>
                
                {/* Test Results */}
                <div className="space-y-2">
                  {suite.tests.map((test) => {
                    const result = getTestStatus(suite.name, test.name)
                    
                    return (
                      <div key={test.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{test.name}</span>
                        <div className="flex items-center">
                          {result ? (
                            <>
                              {result.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {result.duration && (
                                <span className="text-xs text-gray-500">
                                  {result.duration}ms
                                </span>
                              )}
                            </>
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Suite Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">✓ {status.successful} passed</span>
                    <span className="text-red-600">✗ {status.failed} failed</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Features Overview */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Implemented Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'User Authentication', icon: User, status: 'Complete' },
              { name: 'Domain Management', icon: Globe, status: 'Complete' },
              { name: 'Rules Engine', icon: Shield, status: 'Complete' },
              { name: 'Analytics Dashboard', icon: BarChart3, status: 'Complete' },
              { name: 'Billing System', icon: CreditCard, status: 'Complete' },
              { name: 'Admin Panel', icon: Settings, status: 'Complete' },
              { name: 'Real-time Monitoring', icon: Activity, status: 'Complete' },
              { name: 'Client Management', icon: Building, status: 'Complete' },
              { name: 'API Testing', icon: Zap, status: 'Complete' }
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.name} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Icon className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                    <p className="text-xs text-green-600">{feature.status}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Demo
