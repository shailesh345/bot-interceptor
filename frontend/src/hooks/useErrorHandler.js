import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { dataIntegrityChecker } from '../utils/dataIntegrityChecker'

/**
 * Comprehensive Error Handling Hook
 * Provides consistent error handling across the application
 */
export const useErrorHandler = (options = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    logToService = false,
    retryCount = 3,
    retryDelay = 1000,
    onError = null,
    onSuccess = null
  } = options

  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([])
    setRetryAttempts(0)
  }, [])

  // Add error to the list
  const addError = useCallback((error, context = '') => {
    const errorObj = {
      id: Date.now() + Math.random(),
      message: error?.message || error?.toString() || 'Unknown error occurred',
      code: error?.code || error?.status || 'UNKNOWN',
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack,
      originalError: error
    }

    setErrors(prev => [...prev, errorObj])

    // Log to console if enabled
    if (logToConsole) {
      console.error('Error caught by useErrorHandler:', errorObj)
    }

    // Show toast if enabled
    if (showToast) {
      const toastMessage = context ? `${context}: ${errorObj.message}` : errorObj.message
      toast.error(toastMessage, {
        duration: 5000,
        position: 'top-right'
      })
    }

    // Call custom error handler if provided
    if (onError && typeof onError === 'function') {
      onError(errorObj)
    }

    return errorObj
  }, [showToast, logToConsole, onError])

  // Handle API errors
  const handleAPIError = useCallback((error, context = '') => {
    let errorMessage = 'An unexpected error occurred'
    let errorCode = 'UNKNOWN'

    if (error?.response) {
      // Axios response error
      const { status, data } = error.response
      errorCode = status
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Bad request - please check your input'
          break
        case 401:
          errorMessage = 'Authentication required - please log in again'
          break
        case 403:
          errorMessage = 'Access denied - you don\'t have permission for this action'
          break
        case 404:
          errorMessage = data?.message || 'Resource not found'
          break
        case 409:
          errorMessage = data?.message || 'Conflict - resource already exists'
          break
        case 422:
          errorMessage = data?.message || 'Validation error - please check your input'
          break
        case 429:
          errorMessage = 'Too many requests - please try again later'
          break
        case 500:
          errorMessage = 'Server error - please try again later'
          break
        case 502:
          errorMessage = 'Bad gateway - service temporarily unavailable'
          break
        case 503:
          errorMessage = 'Service unavailable - please try again later'
          break
        default:
          errorMessage = data?.message || `HTTP ${status} error occurred`
      }
    } else if (error?.request) {
      // Network error
      errorMessage = 'Network error - please check your connection'
      errorCode = 'NETWORK_ERROR'
    } else if (error?.code === 'ECONNABORTED') {
      // Request timeout
      errorMessage = 'Request timeout - please try again'
      errorCode = 'TIMEOUT'
    } else if (error?.message) {
      // Generic error with message
      errorMessage = error.message
      errorCode = error.code || 'GENERIC_ERROR'
    }

    return addError({
      message: errorMessage,
      code: errorCode,
      stack: error?.stack
    }, context)
  }, [addError])

  // Handle validation errors
  const handleValidationError = useCallback((validationResult, context = '') => {
    if (!validationResult || validationResult.isValid) return null

    const errorMessage = validationResult.errors?.join(', ') || 'Validation failed'
    return addError({
      message: errorMessage,
      code: 'VALIDATION_ERROR',
      validationErrors: validationResult.errors
    }, context)
  }, [addError])

  // Handle data integrity errors
  const handleDataIntegrityError = useCallback((data, schema, context = '') => {
    const validationResult = dataIntegrityChecker.validateData(data, schema, context)
    
    if (!validationResult.isValid) {
      const report = dataIntegrityChecker.generateReport()
      return addError({
        message: `Data integrity check failed: ${report.issues.length} issues found`,
        code: 'DATA_INTEGRITY_ERROR',
        integrityReport: report
      }, context)
    }

    return null
  }, [addError])

  // Safe async operation wrapper
  const safeAsync = useCallback(async (asyncFn, context = '') => {
    setIsLoading(true)
    clearErrors()

    try {
      const result = await asyncFn()
      
      // Call success handler if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result)
      }

      return { success: true, data: result, error: null }
    } catch (error) {
      const errorObj = handleAPIError(error, context)
      return { success: false, data: null, error: errorObj }
    } finally {
      setIsLoading(false)
    }
  }, [handleAPIError, onSuccess, clearErrors])

  // Retry mechanism for failed operations
  const retryOperation = useCallback(async (operation, context = '') => {
    let lastError = null

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await operation()
        setRetryAttempts(0)
        
        if (showToast && attempt > 1) {
          toast.success(`Operation succeeded after ${attempt} attempts`)
        }

        return { success: true, data: result, error: null, attempts: attempt }
      } catch (error) {
        lastError = error
        setRetryAttempts(attempt)

        if (attempt < retryCount) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          
          if (showToast) {
            toast.error(`Attempt ${attempt} failed, retrying...`, { duration: 2000 })
          }
        }
      }
    }

    // All retries failed
    const errorObj = handleAPIError(lastError, `${context} (after ${retryCount} attempts)`)
    return { success: false, data: null, error: errorObj, attempts: retryCount }
  }, [retryCount, retryDelay, showToast, handleAPIError])

  // Handle specific error types
  const handleSpecificError = useCallback((error, type, context = '') => {
    switch (type) {
      case 'network':
        return addError({
          message: 'Network connection failed - please check your internet connection',
          code: 'NETWORK_ERROR'
        }, context)
      
      case 'permission':
        return addError({
          message: 'You don\'t have permission to perform this action',
          code: 'PERMISSION_DENIED'
        }, context)
      
      case 'timeout':
        return addError({
          message: 'Operation timed out - please try again',
          code: 'TIMEOUT'
        }, context)
      
      case 'validation':
        return addError({
          message: 'Input validation failed - please check your data',
          code: 'VALIDATION_ERROR'
        }, context)
      
      case 'database':
        return addError({
          message: 'Database operation failed - please try again later',
          code: 'DATABASE_ERROR'
        }, context)
      
      default:
        return addError(error, context)
    }
  }, [addError])

  // Get error summary
  const getErrorSummary = useCallback(() => {
    if (errors.length === 0) return null

    const errorCounts = errors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1
      return acc
    }, {})

    return {
      total: errors.length,
      byCode: errorCounts,
      latest: errors[errors.length - 1],
      hasCriticalErrors: errors.some(e => ['500', 'DATABASE_ERROR', 'NETWORK_ERROR'].includes(e.code))
    }
  }, [errors])

  // Check if there are critical errors
  const hasCriticalErrors = useCallback(() => {
    return errors.some(error => 
      ['500', 'DATABASE_ERROR', 'NETWORK_ERROR', 'TIMEOUT'].includes(error.code)
    )
  }, [errors])

  // Auto-clear old errors
  useEffect(() => {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    setErrors(prev => prev.filter(error => 
      now - new Date(error.timestamp).getTime() < maxAge
    ))
  }, [errors])

  return {
    // State
    errors,
    isLoading,
    retryAttempts,
    
    // Actions
    addError,
    clearErrors,
    handleAPIError,
    handleValidationError,
    handleDataIntegrityError,
    handleSpecificError,
    
    // Utilities
    safeAsync,
    retryOperation,
    getErrorSummary,
    hasCriticalErrors,
    
    // Computed
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    latestError: errors[errors.length - 1]
  }
}

export default useErrorHandler
