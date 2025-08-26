import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600">
            An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          
          {import.meta.env.DEV && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={resetErrorBoundary}
              className="btn btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-outline"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
