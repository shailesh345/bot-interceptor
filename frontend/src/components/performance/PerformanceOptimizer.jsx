import React, { useState, useEffect, useRef } from 'react'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  HardDrive, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const PerformanceOptimizer = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    networkLatency: 0
  })
  const [optimizations, setOptimizations] = useState([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoOptimize, setAutoOptimize] = useState(false)
  const observerRef = useRef(null)

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()
    
    // Set up performance observer
    setupPerformanceObserver()
    
    // Start auto-optimization if enabled
    if (autoOptimize) {
      startAutoOptimization()
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [autoOptimize])

  const initializePerformanceMonitoring = () => {
    // Get initial performance metrics
    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    
    const metrics = {
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: navigation?.domInteractive - navigation?.domContentLoadedEventStart || 0,
      bundleSize: getBundleSize(),
      cacheHitRate: getCacheHitRate(),
      memoryUsage: getMemoryUsage(),
      networkLatency: navigation?.responseEnd - navigation?.requestStart || 0
    }
    
    setPerformanceMetrics(metrics)
    
    // Generate initial optimizations
    generateOptimizations(metrics)
  }

  const setupPerformanceObserver = () => {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        setPerformanceMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }))
      })
      
      observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }

  const getBundleSize = () => {
    // Simulate bundle size calculation
    return Math.floor(Math.random() * 2000) + 500 // 500-2500 KB
  }

  const getCacheHitRate = () => {
    // Simulate cache hit rate
    return Math.floor(Math.random() * 40) + 60 // 60-100%
  }

  const getMemoryUsage = () => {
    if ('memory' in performance) {
      return performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return Math.floor(Math.random() * 100) + 50 // 50-150 MB
  }

  const generateOptimizations = (metrics) => {
    const suggestions = []
    
    // Load time optimizations
    if (metrics.loadTime > 3000) {
      suggestions.push({
        id: 'load-time',
        type: 'critical',
        title: 'Reduce Load Time',
        description: 'Page load time is above 3 seconds. Consider code splitting and lazy loading.',
        impact: 'high',
        effort: 'medium',
        action: 'optimize-bundle'
      })
    }
    
    // Bundle size optimizations
    if (metrics.bundleSize > 1500) {
      suggestions.push({
        id: 'bundle-size',
        type: 'warning',
        title: 'Optimize Bundle Size',
        description: 'Bundle size is large. Consider tree shaking and removing unused dependencies.',
        impact: 'medium',
        effort: 'high',
        action: 'analyze-dependencies'
      })
    }
    
    // Cache optimizations
    if (metrics.cacheHitRate < 80) {
      suggestions.push({
        id: 'cache-hit-rate',
        type: 'info',
        title: 'Improve Cache Hit Rate',
        description: 'Cache hit rate is low. Consider implementing better caching strategies.',
        impact: 'medium',
        effort: 'low',
        action: 'optimize-cache'
      })
    }
    
    // Memory optimizations
    if (metrics.memoryUsage > 100) {
      suggestions.push({
        id: 'memory-usage',
        type: 'warning',
        title: 'Reduce Memory Usage',
        description: 'Memory usage is high. Check for memory leaks and optimize data structures.',
        impact: 'medium',
        effort: 'medium',
        action: 'analyze-memory'
      })
    }
    
    setOptimizations(suggestions)
  }

  const startAutoOptimization = () => {
    const interval = setInterval(() => {
      if (performanceMetrics.loadTime > 2000) {
        performOptimization('auto')
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }

  const performOptimization = async (type = 'manual') => {
    setIsOptimizing(true)
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Apply optimizations
      await applyOptimizations()
      
      // Update metrics
      const newMetrics = {
        ...performanceMetrics,
        loadTime: performanceMetrics.loadTime * 0.8, // 20% improvement
        bundleSize: performanceMetrics.bundleSize * 0.9, // 10% improvement
        cacheHitRate: Math.min(100, performanceMetrics.cacheHitRate + 10),
        memoryUsage: performanceMetrics.memoryUsage * 0.85 // 15% improvement
      }
      
      setPerformanceMetrics(newMetrics)
      generateOptimizations(newMetrics)
      
      toast.success(`${type === 'auto' ? 'Auto-' : ''}Optimization completed successfully!`)
    } catch (error) {
      toast.error('Optimization failed. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const applyOptimizations = async () => {
    // Simulate applying various optimizations
    const optimizations = [
      'Code splitting applied',
      'Lazy loading enabled',
      'Image optimization completed',
      'Cache headers updated',
      'Bundle minification applied'
    ]
    
    for (const optimization of optimizations) {
      await new Promise(resolve => setTimeout(resolve, 300))
      // console.log(optimization)
    }
  }

  const getPerformanceScore = () => {
    const scores = {
      loadTime: performanceMetrics.loadTime < 2000 ? 100 : Math.max(0, 100 - (performanceMetrics.loadTime - 2000) / 50),
      bundleSize: performanceMetrics.bundleSize < 1000 ? 100 : Math.max(0, 100 - (performanceMetrics.bundleSize - 1000) / 20),
      cacheHitRate: performanceMetrics.cacheHitRate,
      memoryUsage: performanceMetrics.memoryUsage < 80 ? 100 : Math.max(0, 100 - (performanceMetrics.memoryUsage - 80) / 2)
    }
    
    return Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (score) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <AlertTriangle className="w-5 h-5 text-red-600" />
  }

  const formatMetric = (value, unit = 'ms') => {
    if (unit === 'ms') {
      return `${Math.round(value)}ms`
    }
    if (unit === 'KB') {
      return `${Math.round(value)}KB`
    }
    if (unit === 'MB') {
      return `${Math.round(value)}MB`
    }
    if (unit === '%') {
      return `${Math.round(value)}%`
    }
    return value
  }

  const performanceScore = getPerformanceScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Optimizer</h1>
          <p className="text-gray-600">Monitor and optimize application performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced</span>
          </button>
          <button
            onClick={() => performOptimization()}
            disabled={isOptimizing}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isOptimizing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Now'}</span>
          </button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Score</h2>
          {getPerformanceIcon(performanceScore)}
        </div>
        <div className="flex items-center space-x-4">
          <div className={`text-4xl font-bold ${getPerformanceColor(performanceScore)}`}>
            {performanceScore}
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  performanceScore >= 90 ? 'bg-green-600' : 
                  performanceScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${performanceScore}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {performanceScore >= 90 ? 'Excellent' : 
               performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Load Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMetric(performanceMetrics.loadTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge 
              variant={performanceMetrics.loadTime < 2000 ? 'success' : 'warning'}
              size="sm"
            >
              {performanceMetrics.loadTime < 2000 ? 'Fast' : 'Slow'}
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bundle Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMetric(performanceMetrics.bundleSize, 'KB')}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge 
              variant={performanceMetrics.bundleSize < 1000 ? 'success' : 'warning'}
              size="sm"
            >
              {performanceMetrics.bundleSize < 1000 ? 'Optimized' : 'Large'}
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMetric(performanceMetrics.cacheHitRate, '%')}
              </p>
            </div>
            <Wifi className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge 
              variant={performanceMetrics.cacheHitRate > 80 ? 'success' : 'warning'}
              size="sm"
            >
              {performanceMetrics.cacheHitRate > 80 ? 'Good' : 'Low'}
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMetric(performanceMetrics.memoryUsage, 'MB')}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge 
              variant={performanceMetrics.memoryUsage < 80 ? 'success' : 'warning'}
              size="sm"
            >
              {performanceMetrics.memoryUsage < 80 ? 'Normal' : 'High'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h2>
        </div>
        <div className="p-6">
          {optimizations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">No optimizations needed. Performance is optimal!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {optimizations.map((optimization) => (
                <div key={optimization.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {optimization.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {optimization.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {optimization.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{optimization.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="info" size="sm">Impact: {optimization.impact}</Badge>
                      <Badge variant="warning" size="sm">Effort: {optimization.effort}</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => performOptimization()}
                    className="flex-shrink-0 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-Optimization</p>
                <p className="text-sm text-gray-600">Automatically optimize performance when issues are detected</p>
              </div>
              <input
                type="checkbox"
                checked={autoOptimize}
                onChange={(e) => setAutoOptimize(e.target.checked)}
                className="rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceOptimizer
