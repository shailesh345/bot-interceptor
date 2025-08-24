/**
 * Safe array utility functions to prevent runtime errors
 * when dealing with potentially undefined or null array values
 */

/**
 * Safely filter an array
 * @param {Array} array - The array to filter
 * @param {Function} predicate - The filter function
 * @returns {Array} - Filtered array or empty array if input is invalid
 */
export const safeFilter = (array, predicate) => {
  if (!Array.isArray(array)) {
    console.warn('safeFilter: Input is not an array:', array)
    return []
  }
  return array.filter(predicate)
}

/**
 * Safely map over an array
 * @param {Array} array - The array to map over
 * @param {Function} mapper - The mapping function
 * @returns {Array} - Mapped array or empty array if input is invalid
 */
export const safeMap = (array, mapper) => {
  if (!Array.isArray(array)) {
    console.warn('safeMap: Input is not an array:', array)
    return []
  }
  return array.map(mapper)
}

/**
 * Safely get array length
 * @param {Array} array - The array to get length of
 * @returns {number} - Array length or 0 if input is invalid
 */
export const safeLength = (array) => {
  if (!Array.isArray(array)) {
    return 0
  }
  return array.length
}

/**
 * Safely find an item in an array
 * @param {Array} array - The array to search in
 * @param {Function} predicate - The find function
 * @returns {*} - Found item or undefined if input is invalid
 */
export const safeFind = (array, predicate) => {
  if (!Array.isArray(array)) {
    return undefined
  }
  return array.find(predicate)
}

/**
 * Safely check if array includes an item
 * @param {Array} array - The array to check
 * @param {*} item - The item to check for
 * @returns {boolean} - True if found, false otherwise
 */
export const safeIncludes = (array, item) => {
  if (!Array.isArray(array)) {
    return false
  }
  return array.includes(item)
}

/**
 * Safely slice an array
 * @param {Array} array - The array to slice
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {Array} - Sliced array or empty array if input is invalid
 */
export const safeSlice = (array, start, end) => {
  if (!Array.isArray(array)) {
    return []
  }
  return array.slice(start, end)
}

/**
 * Ensure a value is an array
 * @param {*} value - The value to ensure is an array
 * @returns {Array} - The array or empty array if input is invalid
 */
export const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }
  if (value === null || value === undefined) {
    return []
  }
  // If it's an object with a domains property (like API response), extract it
  if (typeof value === 'object' && value.domains) {
    return Array.isArray(value.domains) ? value.domains : []
  }
  // If it's an object with a rules property
  if (typeof value === 'object' && value.rules) {
    return Array.isArray(value.rules) ? value.rules : []
  }
  // If it's an object with a users property
  if (typeof value === 'object' && value.users) {
    return Array.isArray(value.users) ? value.users : []
  }
  return []
}
