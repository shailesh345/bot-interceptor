import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight, Globe, Shield, BarChart3 } from 'lucide-react'

const WelcomeBanner = ({ user, onDismiss, onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentTip, setCurrentTip] = useState(0)

  const tips = [
    {
      icon: Globe,
      title: 'Add Your First Domain',
      description: 'Start by adding a domain to begin monitoring and protecting your traffic.',
      action: 'Add Domain',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Create Protection Rules',
      description: 'Set up rules to block malicious bots and allow legitimate traffic.',
      action: 'Create Rules',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Monitor Analytics',
      description: 'Track your traffic patterns and security metrics in real-time.',
      action: 'View Analytics',
      color: 'purple'
    }
  ]

  useEffect(() => {
    // Auto-advance tips every 5 seconds
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [tips.length])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleGetStarted = () => {
    onGetStarted?.()
  }

  if (!isVisible) return null

  const currentTipData = tips[currentTip]
  const IconComponent = currentTipData.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Welcome to BotInterceptor, {user?.firstName || 'User'}! 🚀
                </h3>
                <div className="flex space-x-1">
                  {tips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentTip ? 'bg-blue-500' : 'bg-blue-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">
                Let's get you started with protecting your traffic. Here's what you can do:
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${currentTipData.color}-100 rounded-lg`}>
                    <IconComponent className={`w-5 h-5 text-${currentTipData.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currentTipData.title}</p>
                    <p className="text-xs text-gray-600">{currentTipData.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleGetStarted}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>{currentTipData.action}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Dismiss welcome message"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WelcomeBanner
