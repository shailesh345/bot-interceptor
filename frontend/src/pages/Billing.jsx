import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBilling } from '../store/slices/billingSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  Zap, 
  Star, 
  TrendingUp,
  Users,
  Globe,
  Shield,
  Clock,
  FileText,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react'

const Billing = () => {
  const dispatch = useDispatch()
  const { subscription, invoices, loading, error } = useSelector((state) => state.billing)
  const [activeTab, setActiveTab] = useState('overview')
  const [showPlanModal, setShowPlanModal] = useState(false)

  // Mock data for comprehensive billing interface
  const currentPlan = {
    name: 'Professional',
    price: 99,
    billing: 'monthly',
    status: 'active',
    nextBilling: '2024-02-15',
    features: [
      'Up to 10 domains',
      '1M requests/month',
      'Advanced analytics',
      'Email support',
      'Custom rules',
      'API access'
    ]
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      yearlyPrice: 290,
      description: 'Perfect for small websites',
      features: [
        'Up to 3 domains',
        '100K requests/month',
        'Basic analytics',
        'Email support',
        'Standard protection'
      ],
      limits: {
        domains: 3,
        requests: '100K',
        support: 'Email'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      yearlyPrice: 990,
      description: 'Great for growing businesses',
      features: [
        'Up to 10 domains',
        '1M requests/month',
        'Advanced analytics',
        'Priority support',
        'Custom rules',
        'API access'
      ],
      limits: {
        domains: 10,
        requests: '1M',
        support: 'Priority'
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      yearlyPrice: 2990,
      description: 'For large scale operations',
      features: [
        'Unlimited domains',
        '10M requests/month',
        'Real-time analytics',
        '24/7 phone support',
        'Advanced rules engine',
        'Full API access',
        'Custom integrations',
        'Dedicated account manager'
      ],
      limits: {
        domains: 'Unlimited',
        requests: '10M',
        support: '24/7 Phone'
      }
    }
  ]

  const mockInvoices = [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 99.00,
      status: 'paid',
      description: 'Professional Plan - January 2024',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 99.00,
      status: 'paid',
      description: 'Professional Plan - December 2023',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 99.00,
      status: 'paid',
      description: 'Professional Plan - November 2023',
      downloadUrl: '#'
    }
  ]

  const usageData = {
    domains: { current: 7, limit: 10 },
    requests: { current: 750000, limit: 1000000 },
    storage: { current: 2.4, limit: 10 } // GB
  }

  useEffect(() => {
    dispatch(fetchBilling())
  }, [dispatch])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'past_due': return 'text-red-600 bg-red-100'
      case 'canceled': return 'text-gray-600 bg-gray-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const formatUsage = (current, limit) => {
    if (typeof limit === 'string') return `${current.toLocaleString()} / ${limit}`
    return `${current.toLocaleString()} / ${limit.toLocaleString()}`
  }

  const getUsagePercentage = (current, limit) => {
    if (typeof limit === 'string') return 0
    return (current / limit) * 100
  }

  return (
    <>
      <Helmet>
        <title>Billing & Subscription - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your subscription, view usage, and download invoices.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'plans', 'usage', 'invoices'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
                    <p className="mt-1 text-sm text-gray-600">Your subscription details and status</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentPlan.status)}`}>
                    {currentPlan.status}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Plan</p>
                        <p className="text-lg font-bold text-gray-900">{currentPlan.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center">
                      <CreditCard className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                        <p className="text-lg font-bold text-gray-900">${currentPlan.price}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Next Billing</p>
                        <p className="text-lg font-bold text-gray-900">{currentPlan.nextBilling}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Upgrade Plan
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Usage Overview */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usage This Month</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Domains</span>
                      <span>{formatUsage(usageData.domains.current, usageData.domains.limit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageData.domains.current, usageData.domains.limit)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Requests</span>
                      <span>{formatUsage(usageData.requests.current, usageData.requests.limit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageData.requests.current, usageData.requests.limit)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{formatUsage(usageData.storage.current, usageData.storage.limit)} GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${getUsagePercentage(usageData.storage.current, usageData.storage.limit)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Choose Your Plan</h3>
              <p className="mt-2 text-sm text-gray-600">Select the perfect plan for your traffic protection needs</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-white rounded-lg shadow border-2 ${plan.popular ? 'border-blue-500' : 'border-gray-200'} relative`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">Most Popular</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-500">or ${plan.yearlyPrice}/year (save 17%)</p>
                    
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      className={`mt-6 w-full px-4 py-2 rounded-md text-sm font-medium ${
                        plan.id === 'professional' 
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={plan.id === 'professional'}
                    >
                      {plan.id === 'professional' ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Domains</p>
                    <p className="text-2xl font-bold text-gray-900">{usageData.domains.current}</p>
                    <p className="text-sm text-gray-500">of {usageData.domains.limit} allowed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{(usageData.requests.current / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-500">of 1M allowed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage</p>
                    <p className="text-2xl font-bold text-gray-900">{usageData.storage.current} GB</p>
                    <p className="text-sm text-gray-500">of {usageData.storage.limit} GB allowed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Usage Breakdown</h3>
                <div className="space-y-6">
                  {Object.entries(usageData).map(([key, data]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                        <span className="text-sm text-gray-600">
                          {getUsagePercentage(data.current, data.limit).toFixed(1)}% used
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            getUsagePercentage(data.current, data.limit) > 80 ? 'bg-red-500' :
                            getUsagePercentage(data.current, data.limit) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(getUsagePercentage(data.current, data.limit), 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{typeof data.current === 'number' ? data.current.toLocaleString() : data.current}</span>
                        <span>{typeof data.limit === 'number' ? data.limit.toLocaleString() : data.limit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Billing
