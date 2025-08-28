import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, ArrowRight, CheckCircle, SkipForward, Globe, Shield, BarChart3, Zap, Users, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

const UserGuide = ({ 
  currentPage = 'dashboard',
  userRole = 'user',
  onComplete,
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [completedSteps, setCompletedSteps] = useState([])

  // Enhanced guide steps with better content and context
  const getGuideSteps = () => {
    const baseSteps = {
      dashboard: [
        {
          id: 'welcome',
          title: 'Welcome to BotInterceptor! 🚀',
          description: 'Your AI-powered traffic protection platform is ready to secure your domains. Let\'s get you started with a quick tour.',
          icon: Shield,
          action: 'Start Tour',
          position: 'center'
        },
        {
          id: 'overview',
          title: 'Dashboard Overview',
          description: 'Monitor real-time traffic, view key security metrics, and track system performance. Your command center for traffic protection.',
          icon: BarChart3,
          action: 'Next',
          position: 'top-right'
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions',
          description: 'Use the sidebar to navigate between features: Domains, Rules, Analytics, and more. Everything you need is just a click away.',
          icon: Settings,
          action: 'Continue',
          position: 'left'
        },
        {
          id: 'next-steps',
          title: 'Next Steps',
          description: 'Ready to get started? Add your first domain and create protection rules to begin securing your traffic.',
          icon: Globe,
          action: 'Get Started',
          position: 'center'
        }
      ],
      domains: [
        {
          id: 'add-domain',
          title: 'Add Your First Domain',
          description: 'Start by adding a domain to begin monitoring and protecting your web traffic. We\'ll guide you through verification.',
          icon: Globe,
          action: 'Add Domain',
          position: 'center'
        },
        {
          id: 'domain-management',
          title: 'Domain Management',
          description: 'Manage multiple domains, configure security settings, and monitor their protection status from one central location.',
          icon: Settings,
          action: 'Next',
          position: 'center'
        }
      ],
      rules: [
        {
          id: 'create-rule',
          title: 'Create Your First Rule',
          description: 'Rules are your traffic control system. Create rules to block malicious bots, allow legitimate traffic, and customize protection.',
          icon: Shield,
          action: 'Create Rule',
          position: 'center'
        },
        {
          id: 'ai-suggestions',
          title: 'AI-Powered Suggestions',
          description: 'Our AI analyzes traffic patterns and suggests optimal rules. Use these suggestions to improve your protection strategy.',
          icon: Zap,
          action: 'Try AI',
          position: 'center'
        }
      ],
      'traffic-interception': [
        {
          id: 'live-monitoring',
          title: 'Live Traffic Monitoring',
          description: 'Monitor real-time traffic and see how your protection rules are performing. Get instant insights into traffic patterns.',
          icon: BarChart3,
          action: 'View Dashboard',
          position: 'center'
        },
        {
          id: 'analytics',
          title: 'Advanced Analytics',
          description: 'Dive deep into traffic patterns, threat intelligence, and performance metrics to optimize your protection strategy.',
          icon: BarChart3,
          action: 'Explore Analytics',
          position: 'center'
        }
      ]
    }

    return baseSteps[currentPage] || baseSteps.dashboard
  }

  const steps = getGuideSteps()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, steps[currentStep].id])
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setCompletedSteps([...completedSteps, steps[currentStep].id])
    toast.success('🎉 Welcome to BotInterceptor! You\'re all set to start protecting your traffic.')
    onComplete?.()
  }

  const handleSkip = () => {
    setIsVisible(false)
    toast.success('You can always access help from the settings menu or by clicking the help icon.')
    onSkip?.()
  }

  const handleAction = () => {
    // Handle specific actions based on current step
    const step = steps[currentStep]
    switch (step.id) {
      case 'add-domain':
        // Trigger add domain modal
        toast.success('Opening domain creation...')
        break
      case 'create-rule':
        // Trigger create rule modal
        toast.success('Opening rule creation...')
        break
      case 'try-ai':
        // Trigger AI suggestions
        toast.success('Opening AI suggestions...')
        break
      default:
        handleNext()
    }
  }

  if (!isVisible || steps.length === 0) return null

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const IconComponent = currentStepData.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Getting Started Guide</h3>
                  <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                title="Skip tutorial"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IconComponent className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                Skip tutorial
              </button>
              
              <div className="flex items-center space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                )}
                
                <button
                  onClick={handleAction}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  {currentStepData.action}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UserGuide
