import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Star, 
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';

const PlanSelectionModal = ({ plans, currentPlan, onClose, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan?.id);
  const [isChanging, setIsChanging] = useState(false);

  const handlePlanSelect = async (planId) => {
    if (planId === currentPlan?.id) return;
    
    setIsChanging(true);
    try {
      await onSelectPlan(planId);
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'starter': return BarChart3;
      case 'professional': return Zap;
      case 'enterprise': return Crown;
      default: return Shield;
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Choose Your Plan</h3>
                <p className="text-gray-600 mt-1">Select the perfect plan for your needs</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const PlanIcon = getPlanIcon(plan.id);
                const isCurrentPlan = plan.id === currentPlan?.id;
                const isSelected = plan.id === selectedPlan;

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      plan.popular 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Current
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                        plan.popular ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        <PlanIcon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan.id);
                      }}
                      disabled={isCurrentPlan || isChanging}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } disabled:opacity-50`}
                    >
                      {isChanging ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        `Select ${plan.name}`
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            {/* Plan Comparison Note */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900">Need a custom plan?</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Contact our sales team for enterprise solutions with custom pricing, 
                    dedicated support, and tailored features for your organization.
                  </p>
                  <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                    Contact Sales →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanSelectionModal;
