import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react'
import Button from './Button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Log error to console for debugging
    console.error('Error Boundary Caught Error:', {
      error,
      errorInfo,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // In production, you could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, errorId)
    }
  }

  logErrorToService = async (error, errorInfo, errorId) => {
    try {
      // Send error to your error tracking service
      // Example: Sentry, LogRocket, etc.
      console.log('Error logged to service:', errorId)
    } catch (logError) {
      console.error('Failed to log error to service:', logError)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleGoBack = () => {
    window.history.back()
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state
    const errorReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      componentStack: errorInfo?.componentStack || '',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please send this to support.')
      })
      .catch(() => {
        // Fallback: show error report in alert
        alert(`Error Report (ID: ${errorId}):\n\n${JSON.stringify(errorReport, null, 2)}`)
      })
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          >
            {/* Error Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Bug className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                We've encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Error Details</h3>
                <span className="text-xs text-gray-500">ID: {errorId}</span>
              </div>
              <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
                {error?.message || 'Unknown error occurred'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button
                onClick={this.handleReload}
                icon={RefreshCw}
                variant="primary"
                className="w-full"
              >
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                icon={Home}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button
                onClick={this.handleGoBack}
                icon={ArrowLeft}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                onClick={this.handleReportError}
                icon={AlertTriangle}
                variant="outline"
                className="w-full"
              >
                Report Error
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                If this problem persists, please contact support.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>Error ID: {errorId}</span>
                <span>•</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Development Error Stack (only in development) */}
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Component Stack Trace (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-64">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
