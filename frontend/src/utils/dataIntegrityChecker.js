/**
 * Comprehensive Data Integrity Checker
 * Validates all data structures and prevents frontend crashes
 */

import { validators, safeAccess } from './dataValidator'

// Data schemas for validation
export const dataSchemas = {
  user: {
    id: { required: true, type: 'number' },
    firstName: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    lastName: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    email: { required: true, type: 'string', validator: validators.isValidEmail },
    role: { required: false, type: 'string' },
    createdAt: { required: false, type: 'string', validator: validators.isValidDate },
    updatedAt: { required: false, type: 'string', validator: validators.isValidDate }
  },
  
  domain: {
    id: { required: true, type: 'number' },
    domain: { required: true, type: 'string', minLength: 3, maxLength: 255 },
    status: { required: false, type: 'string' },
    verificationMethod: { required: false, type: 'string' },
    createdAt: { required: false, type: 'string', validator: validators.isValidDate },
    updatedAt: { required: false, type: 'string', validator: validators.isValidDate }
  },
  
  rule: {
    id: { required: true, type: 'number' },
    name: { required: true, type: 'string', minLength: 1, maxLength: 255 },
    pattern: { required: true, type: 'string', minLength: 1 },
    action: { required: true, type: 'string' },
    priority: { required: false, type: 'number' },
    enabled: { required: false, type: 'boolean' },
    createdAt: { required: false, type: 'string', validator: validators.isValidDate },
    updatedAt: { required: false, type: 'string', validator: validators.isValidDate }
  },
  
  analytics: {
    summary: {
      totalRequests: { required: false, type: 'number' },
      totalBlocked: { required: false, type: 'number' },
      botTraffic: { required: false, type: 'number' },
      revenue: { required: false, type: 'number' }
    },
    trafficData: { required: false, type: 'array' },
    botDistribution: { required: false, type: 'array' },
    recentActivity: { required: false, type: 'array' }
  },
  
  systemHealth: {
    connection: { required: false, type: 'string' },
    performance: { required: false, type: 'string' },
    integrity: { required: false, type: 'string' },
    database: { required: false, type: 'string' }
  }
}

// Data integrity checker class
export class DataIntegrityChecker {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  // Check if data matches expected schema
  validateData(data, schema, context = '') {
    if (!data || !schema) {
      this.addError(`Invalid data or schema provided for ${context}`)
      return false
    }

    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
      const value = safeAccess.get(data, field)
      const fieldPath = context ? `${context}.${field}` : field

      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        this.addError(`Required field missing: ${fieldPath}`)
        isValid = false
        continue
      }

      // Skip validation for undefined/null optional fields
      if (value === undefined || value === null) {
        continue
      }

      // Check data type
      if (rules.type && typeof value !== rules.type) {
        this.addError(`Invalid type for ${fieldPath}: expected ${rules.type}, got ${typeof value}`)
        isValid = false
      }

      // Check custom validation
      if (rules.validator && !rules.validator(value)) {
        this.addError(`Validation failed for ${fieldPath}`)
        isValid = false
      }

      // Check string length constraints
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        this.addError(`Field ${fieldPath} too short: minimum ${rules.minLength} characters`)
        isValid = false
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        this.addError(`Field ${fieldPath} too long: maximum ${rules.maxLength} characters`)
        isValid = false
      }

      // Check numeric constraints
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        this.addError(`Field ${fieldPath} below minimum: ${value} < ${rules.min}`)
        isValid = false
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        this.addError(`Field ${fieldPath} above maximum: ${value} > ${rules.max}`)
        isValid = false
      }

      // Recursively validate nested objects
      if (rules.schema && typeof value === 'object' && !Array.isArray(value)) {
        const nestedValid = this.validateData(value, rules.schema, fieldPath)
        if (!nestedValid) {
          isValid = false
        }
      }

      // Validate array items
      if (rules.itemSchema && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const itemValid = this.validateData(value[i], rules.itemSchema, `${fieldPath}[${i}]`)
          if (!itemValid) {
            isValid = false
          }
        }
      }
    }

    return isValid
  }

  // Check array data integrity
  validateArray(array, itemSchema, context = '') {
    if (!Array.isArray(array)) {
      this.addError(`Expected array for ${context}, got ${typeof array}`)
      return false
    }

    let isValid = true
    for (let i = 0; i < array.length; i++) {
      const itemValid = this.validateData(array[i], itemSchema, `${context}[${i}]`)
      if (!itemValid) {
        isValid = false
      }
    }

    return isValid
  }

  // Check object data integrity
  validateObject(obj, requiredFields = [], context = '') {
    if (!validators.isObject(obj)) {
      this.addError(`Expected object for ${context}, got ${typeof obj}`)
      return false
    }

    let isValid = true
    for (const field of requiredFields) {
      if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
        this.addError(`Required field missing: ${context}.${field}`)
        isValid = false
      }
    }

    return isValid
  }

  // Check database response integrity
  validateDatabaseResponse(response, expectedStructure) {
    if (!response || typeof response !== 'object') {
      this.addError('Invalid database response: not an object')
      return false
    }

    // Check for common database response patterns
    const hasData = 'data' in response
    const hasSuccess = 'success' in response
    const hasError = 'error' in response

    if (hasError && response.error) {
      this.addWarning(`Database response contains error: ${response.error}`)
    }

    if (expectedStructure && hasData) {
      return this.validateData(response.data, expectedStructure, 'response.data')
    }

    return true
  }

  // Check API response integrity
  validateAPIResponse(response, expectedData = null) {
    if (!response || typeof response !== 'object') {
      this.addError('Invalid API response: not an object')
      return false
    }

    // Check for common API response patterns
    const hasData = 'data' in response
    const hasStatus = 'status' in response
    const hasMessage = 'message' in response

    if (hasStatus && response.status >= 400) {
      this.addWarning(`API response indicates error: ${response.status}`)
    }

    if (expectedData && hasData) {
      return this.validateData(response.data, expectedData, 'response.data')
    }

    return true
  }

  // Add error to the checker
  addError(message) {
    this.errors.push({
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    })
  }

  // Add warning to the checker
  addWarning(message) {
    this.warnings.push({
      type: 'warning',
      message,
      timestamp: new Date().toISOString()
    })
  }

  // Get all errors
  getErrors() {
    return this.errors
  }

  // Get all warnings
  getWarnings() {
    return this.warnings
  }

  // Get all issues (errors + warnings)
  getAllIssues() {
    return [...this.errors, ...this.warnings]
  }

  // Check if there are any critical errors
  hasErrors() {
    return this.errors.length > 0
  }

  // Check if there are any warnings
  hasWarnings() {
    return this.warnings.length > 0
  }

  // Check if there are any issues
  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0
  }

  // Clear all issues
  clear() {
    this.errors = []
    this.warnings = []
  }

  // Generate integrity report
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      totalIssues: this.getAllIssues().length,
      errors: this.errors.length,
      warnings: this.warnings.length,
      issues: this.getAllIssues(),
      summary: this.hasErrors() ? 'Data integrity check failed' : 'Data integrity check passed'
    }
  }
}

// Utility functions for common data integrity checks
export const dataIntegrityUtils = {
  // Check if all required fields are present
  checkRequiredFields: (data, requiredFields) => {
    const missing = []
    for (const field of requiredFields) {
      if (!data || data[field] === undefined || data[field] === null) {
        missing.push(field)
      }
    }
    return {
      isValid: missing.length === 0,
      missingFields: missing
    }
  },

  // Check if data structure is valid
  checkDataStructure: (data, expectedKeys) => {
    if (!data || typeof data !== 'object') {
      return { isValid: false, message: 'Data is not an object' }
    }

    const actualKeys = Object.keys(data)
    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key))
    const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key))

    return {
      isValid: missingKeys.length === 0,
      missingKeys,
      extraKeys,
      message: missingKeys.length > 0 
        ? `Missing keys: ${missingKeys.join(', ')}`
        : extraKeys.length > 0 
          ? `Extra keys: ${extraKeys.join(', ')}`
          : 'Structure is valid'
    }
  },

  // Check if array contains valid items
  checkArrayIntegrity: (array, validator) => {
    if (!Array.isArray(array)) {
      return { isValid: false, message: 'Not an array' }
    }

    const invalidItems = []
    for (let i = 0; i < array.length; i++) {
      if (!validator(array[i])) {
        invalidItems.push({ index: i, item: array[i] })
      }
    }

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
      message: invalidItems.length > 0 
        ? `${invalidItems.length} invalid items found`
        : 'All array items are valid'
    }
  },

  // Check if nested object paths exist
  checkNestedPaths: (obj, paths) => {
    const missing = []
    for (const path of paths) {
      if (!safeAccess.get(obj, path)) {
        missing.push(path)
      }
    }

    return {
      isValid: missing.length === 0,
      missingPaths: missing
    }
  }
}

// Export default checker instance
export default new DataIntegrityChecker()
