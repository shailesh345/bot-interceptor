import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  Globe,
  Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { billingAPI } from '../../services/api';

const SubscriptionManagement = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subResponse, plansResponse, usageResponse] = await Promise.all([
        billingAPI.getSubscription(),
        billingAPI.getPlans(),
        billingAPI.getUsage({ period: 'current' })
      ]);

      setSubscription(subResponse.data?.subscription);
      setPlans(plansResponse.data?.plans || []);
      setUsage(usageResponse.data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpgrade = async (planId) => {
    try {
      setUpgrading(true);
      await billingAPI.updateSubscription({ plan_id: planId });
      toast.success('Plan upgraded successfully!');
      loadSubscriptionData();
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    try {
      await billingAPI.cancelSubscription();
      toast.success('Subscription cancelled successfully');
      loadSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const defaultPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      currency: 'USD',
      features: [
        'Up to 100K requests/month',
        'Basic bot protection',
        'Email support',
        'Dashboard analytics',
        '5 domains'
      ],
      limits: {
        requests: 100000,
        domains: 5,
        rules: 10
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      currency: 'USD',
      popular: true,
      features: [
        'Up to 1M requests/month',
        'Advanced bot protection',
        'Priority support',
        'Advanced analytics',
        'Custom rules',
        'API access',
        '25 domains'
      ],
      limits: {
        requests: 1000000,
        domains: 25,
        rules: 50
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      currency: 'USD',
      features: [
        'Unlimited requests',
        'Enterprise bot protection',
        '24/7 phone support',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Unlimited domains'
      ],
      limits: {
        requests: -1, // Unlimited
        domains: -1,
        rules: -1
      }
    }
  ];

  const currentPlan = plans.find(p => p.id === subscription?.plan_id) || 
                     defaultPlans.find(p => p.id === 'professional');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
            <div className="flex items-center space-x-2">
              {subscription?.status === 'active' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-4 mb-3">
                <CreditCard className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{currentPlan?.name}</h3>
              <p className="text-gray-600">${currentPlan?.price}/month</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-4 mb-3">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {usage?.requests_current_period?.toLocaleString() || '0'}
              </h3>
              <p className="text-gray-600">Requests this month</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-3">
                <Shield className="w-8 h-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {usage?.blocked_requests?.toLocaleString() || '0'}
              </h3>
              <p className="text-gray-600">Threats blocked</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-lg p-4 mb-3">
                <Clock className="w-8 h-8 text-orange-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {subscription?.current_period_end ? 
                  new Date(subscription.current_period_end).toLocaleDateString() : 
                  'Dec 15, 2024'
                }
              </h3>
              <p className="text-gray-600">Next billing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage & Limits</h3>
          
          <div className="space-y-4">
            {/* Requests Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">API Requests</span>
                <span className="font-medium">
                  {(usage?.requests_current_period || 0).toLocaleString()} / {
                    currentPlan?.limits?.requests === -1 ? 'Unlimited' : 
                    (currentPlan?.limits?.requests || 1000000).toLocaleString()
                  }
                </span>
              </div>
              {currentPlan?.limits?.requests !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        ((usage?.requests_current_period || 0) / (currentPlan?.limits?.requests || 1000000)) * 100, 
                        100
                      )}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Domains Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Active Domains</span>
                <span className="font-medium">
                  {usage?.active_domains || 0} / {
                    currentPlan?.limits?.domains === -1 ? 'Unlimited' : 
                    (currentPlan?.limits?.domains || 25)
                  }
                </span>
              </div>
              {currentPlan?.limits?.domains !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        ((usage?.active_domains || 0) / (currentPlan?.limits?.domains || 25)) * 100, 
                        100
                      )}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans.length > 0 ? plans : defaultPlans).map((plan) => (
              <div 
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                } ${plan.id === currentPlan?.id ? 'bg-blue-50' : 'bg-white'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.id === currentPlan?.id && (
                  <div className="absolute top-0 left-0 -translate-y-1/2 translate-x-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.interval || 'month'}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanUpgrade(plan.id)}
                  disabled={plan.id === currentPlan?.id || upgrading}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    plan.id === currentPlan?.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === currentPlan?.id 
                    ? 'Current Plan' 
                    : upgrading 
                    ? 'Upgrading...' 
                    : 'Select Plan'
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subscription Actions */}
      {subscription?.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
              
              <button
                onClick={loadSubscriptionData}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
