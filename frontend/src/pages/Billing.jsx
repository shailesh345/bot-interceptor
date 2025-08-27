import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { 
  CreditCard, Check, X, Star, Download, 
  Calendar, DollarSign, Plus, Edit, Trash2,
  AlertCircle, CheckCircle, Settings, History,
  Receipt, Users, TrendingUp, Shield, Activity,
  BarChart3, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { billingAPI } from '../services/api'
import SubscriptionManagement from '../components/billing/SubscriptionManagement'
import BillingHistory from '../components/billing/BillingHistory'
import ProfessionalBillingCard from '../components/billing/ProfessionalBillingCard'
import BillingAnalyticsCharts from '../components/billing/BillingAnalyticsCharts'
import ProfessionalInput, { useFormValidation, validators } from '../components/billing/ProfessionalFormValidation'
import AdvancedExportUtilities from '../components/billing/AdvancedExportUtilities'
import { BillingEmptyState, InvoicesEmptyState } from '../components/billing/ProfessionalEmptyStates'
import { SkeletonStyles, BillingCardSkeleton, SubscriptionSkeleton } from '../components/common/Skeleton'
import PaymentMethodModal from '../components/billing/PaymentMethodModal'
import PlanSelectionModal from '../components/billing/PlanSelectionModal'

const Billing = () => {
  const { user } = useSelector((state) => state.auth)
  const [billingData, setBillingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      const [subscriptionResponse, invoicesResponse, plansResponse, paymentMethodsResponse, usageResponse] = await Promise.all([
        billingAPI.getSubscription(),
        billingAPI.getInvoices(),
        billingAPI.getPlans(),
        billingAPI.getPaymentMethods(),
        billingAPI.getUsage({ period: 'current' })
      ])

      setBillingData({
        currentPlan: subscriptionResponse.data?.plan || {
          id: 'professional',
          name: 'Professional',
          price: 99
        },
        nextBillingDate: subscriptionResponse.data?.subscription?.current_period_end || 'December 15, 2024',
        invoices: invoicesResponse.data?.invoices || [],
        paymentMethods: paymentMethodsResponse.data?.payment_methods || [],
        usage: {
          requests: usageResponse.data?.requests_current_period || 0,
          blocked: usageResponse.data?.blocked_requests || 0,
          domains: usageResponse.data?.active_domains || 0
        }
      })
    } catch (error) {
      console.error('Failed to load billing data:', error)
      toast.error('Failed to load billing data')
      // Fallback to mock data
      setBillingData({
        currentPlan: { id: 'professional', name: 'Professional', price: 99 },
        nextBillingDate: 'December 15, 2024',
        invoices: [],
        paymentMethods: [],
        usage: { requests: 250000, blocked: 1250, domains: 3 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (planId) => {
    try {
      await billingAPI.updateSubscription({ plan_id: planId })
      toast.success('Plan updated successfully!')
      loadBillingData()
      setShowPlanModal(false)
    } catch (error) {
      console.error('Failed to update plan:', error)
      toast.error('Failed to update plan')
    }
  }

  const handleAddPaymentMethod = async (paymentData) => {
    try {
      await billingAPI.addPaymentMethod({
        card_number: paymentData.cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(paymentData.expMonth),
        exp_year: parseInt(paymentData.expYear),
        cvc: paymentData.cvv,
        name: paymentData.name,
        is_default: paymentData.isDefault
      })
      toast.success('Payment method added successfully!')
      loadBillingData()
      setShowPaymentModal(false)
    } catch (error) {
      console.error('Failed to add payment method:', error)
      toast.error('Failed to add payment method')
    }
  }

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      await billingAPI.deletePaymentMethod(methodId)
      toast.success('Payment method deleted successfully!')
      loadBillingData()
    } catch (error) {
      console.error('Failed to delete payment method:', error)
      toast.error('Failed to delete payment method')
    }
  }

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await billingAPI.getInvoice(invoiceId)
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      features: [
        'Up to 100K requests/month',
        'Basic bot protection',
        'Email support',
        'Dashboard analytics'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      features: [
        'Up to 1M requests/month',
        'Advanced bot protection',
        'Priority support',
        'Advanced analytics',
        'Custom rules',
        'API access'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      features: [
        'Unlimited requests',
        'Enterprise bot protection',
        '24/7 phone support',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee'
      ],
      popular: false
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DollarSign },
    { id: 'subscription', name: 'Subscription', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'history', name: 'Billing History', icon: History },
    { id: 'payment-methods', name: 'Payment Methods', icon: CreditCard }
  ]

  const renderTabContent = () => {
    if (loading) {
      switch (activeTab) {
        case 'subscription':
          return <SubscriptionSkeleton />
        case 'analytics':
          return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <BillingCardSkeleton key={i} />)}</div>
        default:
          return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <BillingCardSkeleton key={i} />)}</div>
      }
    }

    switch (activeTab) {
      case 'subscription':
        return <SubscriptionManagement />
      case 'analytics':
        return <BillingAnalyticsCharts data={billingData} />
      case 'history':
        return <BillingHistory />
      case 'payment-methods':
        return renderPaymentMethods()
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
      <div className="space-y-8">
      {/* Current Plan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProfessionalBillingCard
          title="Current Plan"
          value={billingData?.currentPlan?.name || 'Professional'}
          subtitle={`$${billingData?.currentPlan?.price || 99}/month`}
          icon={CreditCard}
          color="blue"
          onClick={() => setActiveTab('subscription')}
          actionText="Manage Plan"
          gradient={true}
        />

        <ProfessionalBillingCard
          title="Monthly Usage"
          value={`${((billingData?.usage?.requests || 250000) / 1000).toFixed(0)}K`}
          subtitle="of 1M requests"
          icon={Activity}
          color="green"
          trend="up"
          trendValue="+12%"
          onClick={() => setActiveTab('analytics')}
          actionText="View Analytics"
        />

        <ProfessionalBillingCard
          title="Threats Blocked"
          value={(billingData?.usage?.blocked || 1250).toLocaleString()}
          subtitle="This month"
          icon={Shield}
          color="purple"
          trend="up"
          trendValue="+8%"
          onClick={() => setActiveTab('analytics')}
          actionText="Security Report"
        />

        <ProfessionalBillingCard
          title="Next Billing"
          value="Dec 15"
          subtitle="2024"
          icon={Calendar}
          color="orange"
          onClick={() => setActiveTab('history')}
          actionText="View History"
        />
        </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <button
            onClick={() => setShowExportModal(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
                </button>
              </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('subscription')}
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Manage Plan</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('payment-methods')}
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors">
              <CreditCard className="w-5 h-5 text-green-600" />
          </div>
            <span className="text-sm font-medium text-gray-900">Payment Methods</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="bg-purple-100 rounded-lg p-2 mr-3 group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
            <span className="text-sm font-medium text-gray-900">View Analytics</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
          >
            <div className="bg-orange-100 rounded-lg p-2 mr-3 group-hover:bg-orange-200 transition-colors">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Payment</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
        <div className="space-y-6">
              <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                API Requests
              </span>
                  <span className="font-medium">
                {(billingData?.usage?.requests || 250000).toLocaleString()} / 1,000,000
                  </span>
                </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((billingData?.usage?.requests || 250000) / 1000000) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(((billingData?.usage?.requests || 250000) / 1000000) * 100).toFixed(1)}% of monthly limit
                </div>
              </div>
              
              <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Threats Blocked
              </span>
                  <span className="font-medium text-red-600">
                {(billingData?.usage?.blocked || 1250).toLocaleString()}
                  </span>
                </div>
            <div className="text-xs text-gray-500">
              Security efficiency: 98.4%
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Active Domains
              </span>
              <span className="font-medium">
                {billingData?.usage?.domains || 3} / 25
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((billingData?.usage?.domains || 3) / 25) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
              </div>
            <div className="text-xs text-gray-500 mt-1">
              {(((billingData?.usage?.domains || 3) / 25) * 100).toFixed(1)}% of domain limit
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderPaymentMethods = () => (
    <div className="space-y-8">
      {/* Payment Methods Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your payment methods and billing preferences
          </p>
        </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </button>
          </div>

      {/* Payment Methods List */}
            <div className="space-y-4">
        {(billingData?.paymentMethods || []).length > 0 ? (
          (billingData?.paymentMethods || []).map((method) => (
            <div key={method.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center">
                <div className="bg-gray-100 rounded-lg p-3 mr-4">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.brand.toUpperCase()} • Expires {method.expMonth}/{method.expYear}
                      </p>
                    {method.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Default Payment Method
                      </span>
                    )}
                </div>
                  </div>
                  <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
          ))
        ) : (
          <BillingEmptyState
            type="billing"
            onAction={() => setShowPaymentModal(true)}
          />
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Billing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Billing Email:</span>
            <span className="ml-2 text-gray-900">{user?.email || 'user@example.com'}</span>
          </div>
          <div>
            <span className="text-gray-600">Currency:</span>
            <span className="ml-2 text-gray-900">USD</span>
          </div>
          <div>
            <span className="text-gray-600">Tax Rate:</span>
            <span className="ml-2 text-gray-900">8%</span>
            </div>
          <div>
            <span className="text-gray-600">Billing Cycle:</span>
            <span className="ml-2 text-gray-900">Monthly</span>
          </div>
        </div>
      </div>
    </div>
  )



  return (
    <>
      <Helmet>
        <title>Billing - Traffic Interceptor</title>
      </Helmet>
      <SkeletonStyles />
      
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your subscription, billing information, and payment methods
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                      <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                      </button>
                ))}
            </nav>
        </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </motion.div>



        {/* Plan Selection Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPlanModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Choose Your Plan</h3>
                    <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`relative border rounded-lg p-6 ${
                          plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                              Popular
                            </span>
                          </div>
                        )}
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                          <div className="mt-4">
                            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                            <span className="text-gray-500">/month</span>
                          </div>
                        </div>
                        <ul className="mt-6 space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePlanChange(plan.id)}
                          className={`mt-6 w-full py-2 px-4 rounded-md text-sm font-medium ${
                            plan.popular
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {billingData?.currentPlan?.id === plan.id ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Selection Modal */}
        {showPlanModal && (
          <PlanSelectionModal
            plans={plans}
            currentPlan={billingData?.currentPlan}
            onClose={() => setShowPlanModal(false)}
            onSelectPlan={handlePlanChange}
          />
        )}

        {/* Add Payment Method Modal */}
        {showPaymentModal && (
          <PaymentMethodModal
            onClose={() => setShowPaymentModal(false)}
            onSave={handleAddPaymentMethod}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <AdvancedExportUtilities
            data={billingData?.invoices || []}
            title="Billing Data"
            columns={[
              { key: 'number', label: 'Invoice Number' },
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'description', label: 'Description' }
            ]}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </>
  )
}



export default Billing
