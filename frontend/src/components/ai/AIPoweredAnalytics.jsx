import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const AIPoweredAnalytics = () => {
  const [aiInsights, setAiInsights] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')

  const mockAiInsights = [
    {
      id: 1,
      type: 'anomaly',
      title: 'Traffic Spike Detection',
      description: 'Unusual 300% increase in traffic from region US-East detected',
      confidence: 0.95,
      impact: 'high',
      category: 'security',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: {
        region: 'US-East',
        increase: '300%',
        baseline: '1000 requests/hour',
        current: '4000 requests/hour'
      }
    },
    {
      id: 2,
      type: 'trend',
      title: 'User Behavior Pattern',
      description: 'Users are 40% more likely to convert during evening hours (6-9 PM)',
      confidence: 0.87,
      impact: 'medium',
      category: 'conversion',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      metadata: {
        timeSlot: '6-9 PM',
        conversionRate: '+40%',
        sampleSize: '10,000 users'
      }
    }
  ]

  useEffect(() => {
    initializeAIAnalytics()
  }, [selectedTimeframe])

  const initializeAIAnalytics = async () => {
    setIsAnalyzing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAiInsights(mockAiInsights)
      toast.success('AI analysis completed!')
    } catch (error) {
      toast.error('AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      default:
        return <Brain className="w-5 h-5 text-purple-600" />
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'anomaly':
        return 'border-l-red-500 bg-red-50'
      case 'trend':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-purple-500 bg-purple-50'
    }
  }

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Analytics</h1>
          <p className="text-gray-600">Intelligent insights and predictive analytics powered by AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={initializeAIAnalytics}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Insights</p>
              <p className="text-2xl font-bold text-gray-900">{aiInsights.length}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Predictions</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Accurate</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-2">
            <Badge variant="warning" size="sm">Detected</Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>
        <div className="p-6">
          {aiInsights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No AI insights available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`p-4 border-l-4 rounded-lg ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
                        <Badge variant="info" size="sm">
                          {formatConfidence(insight.confidence)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      
                      {insight.metadata && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(insight.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIPoweredAnalytics
