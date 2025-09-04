import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import LiveTrafficStream from '../components/monitoring/LiveTrafficStream'
import UptimeMonitor from '../components/monitoring/UptimeMonitor'
import SecurityScanner from '../components/security/SecurityScanner'
import DomainSelector from '../components/monitoring/DomainSelector'
import { domainsAPI } from '../services/api'
import { toast } from 'react-hot-toast'

const Monitoring = () => {
  const location = useLocation()
  const { domains } = useSelector((state) => state.domains)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview')
  const [selectedDomain, setSelectedDomain] = useState(location.state?.selectedDomain || null)
  const [selectedDomains, setSelectedDomains] = useState([])
  const [globalMonitoring, setGlobalMonitoring] = useState(false)
  const [testResults, setTestResults] = useState(null)

  // Calculate overview stats from domains
  const calculateOverviewStats = () => {
    const totalDomains = domains.length
    const monitoredDomains = domains.filter(d => d.monitoring_enabled).length
    const secureDomains = domains.filter(d => d.security_scan_enabled).length
    
    return {
      totalDomains,
      monitoredDomains,
      secureDomains,
      uptime: 99.8, // Mock uptime percentage
      activeThreats: 0, // Mock active threats
      lastScan: new Date().toLocaleDateString()
    }
  }

  const overviewStats = calculateOverviewStats()

  // Initialize selected domains when domains are loaded
  useEffect(() => {
    if (domains.length > 0 && selectedDomains.length === 0) {
      // Debug: Log domain structure
      console.log('🔍 Monitoring - All domains from Redux:', domains)
      console.log('🔍 Monitoring - First domain structure:', domains[0])
      console.log('🔍 Monitoring - First domain keys:', domains[0] ? Object.keys(domains[0]) : 'No domains')
      
      // Auto-select verified domains by default
      const verifiedDomains = domains.filter(d => {
        const isVerified = d.is_verified || d.status === 'verified' || d.status === 'active'
        console.log(`🔍 Monitoring - Domain ${d.domain_name}: is_verified=${d.is_verified}, status=${d.status}, willSelect=${isVerified}`)
        return isVerified
      })
      
      console.log('🔍 Monitoring - Verified domains:', verifiedDomains)
      if (verifiedDomains.length > 0) {
        console.log('🔍 Monitoring - Setting selectedDomains to:', verifiedDomains)
        setSelectedDomains(verifiedDomains)
      }
    }
  }, [domains, selectedDomains.length])

  // Handle domain selection change
  const handleDomainSelectionChange = (newSelectedDomains) => {
    console.log('🔍 Monitoring - Domain selection changed:', newSelectedDomains)
    console.log('🔍 Monitoring - New selected domains length:', newSelectedDomains.length)
    setSelectedDomains(newSelectedDomains)
  }

  const handleTestMonitoring = async () => {
    if (domains.length === 0) {
      toast.error('No domains available for testing')
      return
    }

    try {
      const domain = domains[0] // Use first domain for testing
      const response = await domainsAPI.testMonitoring(domain.id)
      
      if (response.data.success) {
        setTestResults(response.data)
        toast.success('Monitoring test successful! Check the Live Traffic Stream tab.')
      } else {
        toast.error('Monitoring test failed')
      }
    } catch (error) {
      console.error('Monitoring test error:', error)
      toast.error('Failed to test monitoring features')
    }
  }

  const Tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      component: (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🌐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Domains</p>
                  <p className="text-2xl font-semibold text-gray-900">{overviewStats.totalDomains}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monitored</p>
                  <p className="text-2xl font-semibold text-gray-900">{overviewStats.monitoredDomains}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Secure</p>
                  <p className="text-2xl font-semibold text-gray-900">{overviewStats.secureDomains}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Monitoring Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Monitoring Features</h3>
            <p className="text-gray-600 mb-4">
              Test the monitoring features to ensure they are working correctly. This will send test traffic data to the Live Traffic Stream.
            </p>
            <button
              onClick={handleTestMonitoring}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Monitoring
            </button>
            
            {testResults && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">Test Results</h4>
                <p className="text-green-700 text-sm">{testResults.message}</p>
                <details className="mt-2">
                  <summary className="text-green-700 text-sm cursor-pointer">View Test Data</summary>
                  <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.test_data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('traffic')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mr-3">📊</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Live Traffic</p>
                  <p className="text-sm text-gray-600">Monitor real-time website traffic</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('uptime')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mr-3">⏱️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Check Uptime</p>
                  <p className="text-sm text-gray-600">Monitor website availability</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mr-3">🔒</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Security Scan</p>
                  <p className="text-sm text-gray-600">Run security analysis</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('traffic')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mr-3">⚡</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Proxy Settings</p>
                  <p className="text-sm text-gray-600">Configure traffic interception</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'domains',
      label: 'Select Domains',
      icon: '🌐',
      component: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Domain Selection</h2>
            <p className="text-gray-600">
              Choose which domains you want to monitor. Only verified domains can be actively monitored.
            </p>
          </div>
          <DomainSelector
            domains={domains}
            selectedDomains={selectedDomains}
            onSelectionChange={handleDomainSelectionChange}
            showFilters={true}
          />
        </div>
      )
    },
    {
      id: 'traffic',
      label: 'Live Traffic',
      icon: '📊',
      component: (() => {
        console.log('🔍 Monitoring - Passing to LiveTrafficStream:', selectedDomains)
        console.log('🔍 Monitoring - selectedDomains type:', typeof selectedDomains)
        console.log('🔍 Monitoring - selectedDomains is array:', Array.isArray(selectedDomains))
        return <LiveTrafficStream domains={selectedDomains} />
      })()
    },
    {
      id: 'uptime',
      label: 'Uptime',
      icon: '⏱️',
      component: <UptimeMonitor domains={selectedDomains} />
    },
    {
      id: 'security',
      label: 'Security',
      icon: '🔒',
      component: <SecurityScanner domains={selectedDomains} />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Monitor your websites in real-time with advanced traffic analysis, uptime tracking, and security scanning.
          </p>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
            <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
            <p className="text-sm text-yellow-700">Total domains: {domains.length}</p>
            <p className="text-sm text-yellow-700">Selected domains: {selectedDomains.length}</p>
            {domains.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-yellow-700">First domain structure:</p>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(domains[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Global Monitoring Toggle */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={globalMonitoring}
              onChange={(e) => setGlobalMonitoring(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Enable global monitoring for all domains</span>
          </label>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {Tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {Tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  )
}

export default Monitoring
