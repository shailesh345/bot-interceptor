import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { 
  CreditCard, Check, X, Star, Download, 
  Calendar, DollarSign, Plus, Edit, Trash2,
  AlertCircle, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { mockAPI } from '../services/comprehensiveMockAPI'

const Billing = () => {
  const { user } = useSelector((state) => state.auth)
  const [billingData, setBillingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      const data = await mockAPI.getBillingInfo()
      setBillingData(data)
    } catch (error) {
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (planId) => {
    try {
      await mockAPI.updateSubscription(planId)
      toast.success('Plan updated successfully!')
      loadBillingData()
      setShowPlanModal(false)
    } catch (error) {
      toast.error('Failed to update plan')
    }
  }

  const handleAddPaymentMethod = async (paymentData) => {
    try {
      await mockAPI.addPaymentMethod(paymentData)
      toast.success('Payment method added successfully!')
      loadBillingData()
      setShowPaymentModal(false)
    } catch (error) {
      toast.error('Failed to add payment method')
    }
  }

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      await mockAPI.deletePaymentMethod(methodId)
      toast.success('Payment method deleted successfully!')
      loadBillingData()
    } catch (error) {
      toast.error('Failed to delete payment method')
    }
  }

  const downloadInvoice = async (invoiceId) => {
    try {
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
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

  return (
    <>
      <Helmet>
        <title>Billing - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your subscription, billing information, and payment methods
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {billingData?.currentPlan?.name || 'Professional'} Plan
                </h3>
                <p className="text-gray-600">
                  ${billingData?.currentPlan?.price || 99}/month
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Next billing date: {billingData?.nextBillingDate || 'December 15, 2024'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change Plan
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage & Billing Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Usage */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Current Usage</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests this month</span>
                  <span className="font-medium">
                    {(billingData?.usage?.requests || 0).toLocaleString()} / 1,000,000
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((billingData?.usage?.requests || 0) / 1000000) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Blocked threats</span>
                  <span className="font-medium text-red-600">
                    {(billingData?.usage?.blocked || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active domains</span>
                  <span className="font-medium">
                    {billingData?.usage?.domains || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Billing Summary</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">${billingData?.currentPlan?.price || 99}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${((billingData?.currentPlan?.price || 99) * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-medium text-gray-900">
                    ${((billingData?.currentPlan?.price || 99) * 1.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </button>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {(billingData?.paymentMethods || []).map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-gray-400 mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.brand.toUpperCase()} • Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-500">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(billingData?.invoices || []).map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => downloadInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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

        {/* Add Payment Method Modal */}
        {showPaymentModal && (
          <PaymentMethodModal
            onClose={() => setShowPaymentModal(false)}
            onSave={handleAddPaymentMethod}
          />
        )}
      </div>
    </>
  )
}

// Payment Method Modal Component
const PaymentMethodModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    isDefault: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate card number (basic Luhn algorithm check would be better)
    const cardNumbers = formData.cardNumber.replace(/\s/g, '')
    if (cardNumbers.length < 13 || cardNumbers.length > 19) {
      toast.error('Please enter a valid card number')
      return
    }
    
    // Validate expiry date
    const [month, year] = formData.expiryDate.split('/')
    if (!month || !year || month < 1 || month > 12) {
      toast.error('Please enter a valid expiry date')
      return
    }
    
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      toast.error('Card has expired')
      return
    }
    
    // Validate CVV
    if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      toast.error('Please enter a valid CVV')
      return
    }
    
    // Validate name
    if (!formData.name.trim()) {
      toast.error('Please enter the cardholder name')
      return
    }
    
    onSave({
      ...formData,
      expMonth: month,
      expYear: `20${year}`,
      last4: formData.cardNumber.slice(-4),
      brand: 'visa' // Simplified for demo
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                      if (value.replace(/\s/g, '').length <= 16) {
                        setFormData({ ...formData, cardNumber: value })
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    maxLength="19"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        // Format expiry date MM/YY
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4)
                        }
                        setFormData({ ...formData, expiryDate: value })
                      }}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => {
                        // Only allow numbers, max 4 digits
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 4) {
                          setFormData({ ...formData, cvv: value })
                        }
                      }}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Set as default payment method
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add Payment Method
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Billing
