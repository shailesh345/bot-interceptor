/**
 * Comprehensive Data Validation Utilities
 * Ensures data integrity and prevents frontend crashes
 */

// Data type validators
export const validators = {
  // String validation
  isString: (value) => typeof value === 'string',
  isNonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0,
  isValidEmail: (value) => {
    if (!value || typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value.trim())
  },
  
  // Number validation
  isNumber: (value) => typeof value === 'number' && !isNaN(value),
  isPositiveNumber: (value) => typeof value === 'number' && !isNaN(value) && value > 0,
  isInteger: (value) => Number.isInteger(value),
  
  // Boolean validation
  isBoolean: (value) => typeof value === 'boolean',
  
  // Object validation
  isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  isNonEmptyObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0,
  
  // Array validation
  isArray: (value) => Array.isArray(value),
  isNonEmptyArray: (value) => Array.isArray(value) && value.length > 0,
  
  // Date validation
  isValidDate: (value) => {
    if (!value) return false
    const date = new Date(value)
    return date instanceof Date && !isNaN(date)
  },
  
  // ID validation
  isValidId: (value) => {
    if (!value) return false
    if (typeof value === 'number') return value > 0
    if (typeof value === 'string') return value.trim().length > 0
    return false
  }
}

// Data sanitizers
export const sanitizers = {
  // String sanitization
  sanitizeString: (value, defaultValue = '') => {
    if (typeof value === 'string') {
      const sanitized = value.trim()
      return sanitized.length > 0 ? sanitized : defaultValue
    }
    return defaultValue
  },
  
  // Number sanitization
  sanitizeNumber: (value, defaultValue = 0) => {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return !isNaN(parsed) ? parsed : defaultValue
    }
    return defaultValue
  },
  
  // Array sanitization
  sanitizeArray: (value, defaultValue = []) => {
    if (Array.isArray(value)) return value
    return defaultValue
  },
  
  // Object sanitization
  sanitizeObject: (value, defaultValue = {}) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return value
    }
    return defaultValue
  },
  
  // Date sanitization
  sanitizeDate: (value, defaultValue = null) => {
    if (!value) return defaultValue
    const date = new Date(value)
    if (date instanceof Date && !isNaN(date)) return date
    return defaultValue
  }
}

// Data transformers
export const transformers = {
  // Format numbers with proper formatting
  formatNumber: (num, options = {}) => {
    if (!validators.isNumber(num)) return '0'
    
    const { 
      decimals = 0, 
      thousandsSeparator = ',', 
      decimalSeparator = '.',
      currency = false,
      currencySymbol = '$'
    } = options
    
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num)
    }
    
    const parts = num.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    
    return parts.join(decimalSeparator)
  },
  
  // Format dates
  formatDate: (date, format = 'default') => {
    if (!validators.isValidDate(date)) return 'Invalid Date'
    
    const dateObj = new Date(date)
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString()
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'time':
        return dateObj.toLocaleTimeString()
      case 'datetime':
        return dateObj.toLocaleString()
      default:
        return dateObj.toLocaleDateString()
    }
  },
  
  // Truncate text
  truncateText: (text, maxLength = 50, suffix = '...') => {
    if (!validators.isString(text)) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + suffix
  },
  
  // Capitalize text
  capitalize: (text) => {
    if (!validators.isString(text)) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
}

// Data validators for specific data types
export const dataValidators = {
  // User data validation
  validateUser: (userData) => {
    const errors = []
    
    if (!validators.isNonEmptyString(userData?.firstName)) {
      errors.push('First name is required')
    }
    
    if (!validators.isNonEmptyString(userData?.lastName)) {
      errors.push('Last name is required')
    }
    
    if (!validators.isValidEmail(userData?.email)) {
      errors.push('Valid email is required')
    }
    
    if (userData?.role && !validators.isNonEmptyString(userData.role)) {
      errors.push('Role must be a valid string')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  // Domain data validation
  validateDomain: (domainData) => {
    const errors = []
    
    if (!validators.isNonEmptyString(domainData?.domain)) {
      errors.push('Domain name is required')
    }
    
    if (domainData?.domain && !domainData.domain.includes('.')) {
      errors.push('Domain must be a valid domain name')
    }
    
    if (domainData?.verificationMethod && !['dns', 'html', 'file'].includes(domainData.verificationMethod)) {
      errors.push('Invalid verification method')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  // Rule data validation
  validateRule: (ruleData) => {
    const errors = []
    
    if (!validators.isNonEmptyString(ruleData?.name)) {
      errors.push('Rule name is required')
    }
    
    if (!validators.isNonEmptyString(ruleData?.pattern)) {
      errors.push('Rule pattern is required')
    }
    
    if (ruleData?.action && !['allow', 'block', 'challenge'].includes(ruleData.action)) {
      errors.push('Invalid action type')
    }
    
    if (ruleData?.priority && !validators.isInteger(ruleData.priority)) {
      errors.push('Priority must be an integer')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Safe data access utilities
export const safeAccess = {
  // Safe object property access
  get: (obj, path, defaultValue = null) => {
    if (!obj || typeof obj !== 'object') return defaultValue
    
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue
      }
      current = current[key]
    }
    
    return current !== undefined ? current : defaultValue
  },
  
  // Safe array access
  getArrayItem: (array, index, defaultValue = null) => {
    if (!Array.isArray(array) || !validators.isInteger(index)) return defaultValue
    return array[index] !== undefined ? array[index] : defaultValue
  },
  
  // Safe function execution
  execute: (func, ...args) => {
    if (typeof func === 'function') {
      try {
        return func(...args)
      } catch (error) {
        console.error('Function execution error:', error)
        return null
      }
    }
    return null
  }
}

// Data integrity checker
export const dataIntegrity = {
  // Check if required fields are present
  checkRequiredFields: (data, requiredFields) => {
    const missingFields = []
    
    for (const field of requiredFields) {
      if (!data || data[field] === undefined || data[field] === null) {
        missingFields.push(field)
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  },
  
  // Check data structure
  validateStructure: (data, schema) => {
    const errors = []
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`)
        continue
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`)
        }
        
        if (rules.validator && !rules.validator(value)) {
          errors.push(`${field} failed validation`)
        }
        
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`)
        }
        
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`)
        }
        
        if (rules.min && typeof value === 'number' && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
        
        if (rules.max && typeof value === 'number' && value > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`)
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export default validator
export default {
  validators,
  sanitizers,
  transformers,
  dataValidators,
  safeAccess,
  dataIntegrity
}
