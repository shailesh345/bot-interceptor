import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, ArrowRight, CheckCircle, SkipForward } from 'lucide-react'
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

  // Guide steps based on current page and user role
  const getGuideSteps = () => {
    const baseSteps = {
      dashboard: [
        {
          id: 'welcome',
          title: 'Welcome to BotInterceptor',
          description: 'This is your command center for managing bot traffic. Let\'s get you started!',
          action: 'Next',
          position: 'center'
        },
        {
          id: 'overview',
          title: 'Dashboard Overview',
          description: 'Monitor real-time traffic, view key metrics, and track system performance at a glance.',
          action: 'Got it',
          position: 'top-right'
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions',
          description: 'Use the sidebar to navigate between different features and manage your traffic interception.',
          action: 'Continue',
          position: 'left'
        }
      ],
      domains: [
        {
          id: 'add-domain',
          title: 'Add Your First Domain',
          description: 'Start by adding a domain to begin monitoring and protecting your traffic.',
          action: 'Add Domain',
          position: 'center'
        },
        {
          id: 'domain-management',
          title: 'Domain Management',
          description: 'Manage multiple domains, configure settings, and monitor their status.',
          action: 'Next',
          position: 'center'
        }
      ],
      rules: [
        {
          id: 'create-rule',
          title: 'Create Your First Rule',
          description: 'Rules help you control traffic. Create a rule to block unwanted bots or allow legitimate traffic.',
          action: 'Create Rule',
          position: 'center'
        },
        {
          id: 'ai-suggestions',
          title: 'AI-Powered Suggestions',
          description: 'Use AI suggestions to optimize your rules and improve traffic management.',
          action: 'Try AI',
          position: 'center'
        }
      ],
      'traffic-interception': [
        {
          id: 'live-monitoring',
          title: 'Live Traffic Monitoring',
          description: 'Monitor real-time traffic and see how your rules are performing.',
          action: 'View Dashboard',
          position: 'center'
        },
        {
          id: 'analytics',
          title: 'Advanced Analytics',
          description: 'Dive deep into traffic patterns and get insights to improve your protection.',
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
    toast.success('Welcome to BotInterceptor! You\'re all set.')
    onComplete?.()
  }

  const handleSkip = () => {
    setIsVisible(false)
    toast.success('You can always access help from the settings menu.')
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
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-black">Getting Started</h3>
                  <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                title="Skip tutorial"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <h4 className="text-xl font-semibold text-black mb-3">
              {currentStepData.title}
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tutorial
              </button>
              
              <div className="flex items-center space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                )}
                
                <button
                  onClick={handleAction}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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
