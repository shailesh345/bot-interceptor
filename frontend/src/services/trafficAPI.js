import api from './api'

// Traffic Interception API Service
// Integrates with our backend traffic interception endpoints

export const trafficAPI = {
  // Traffic Interception
  interceptTraffic: (trafficData) => api.post('/traffic/intercept', trafficData),
  
  // ML Bot Classification
  classifyTraffic: (classificationData) => api.post('/traffic/classify', classificationData),
  
  // Content Protection
  protectContent: (protectionData) => api.post('/traffic/protect', protectionData),
  
  // Real-time Metrics
  getRealTimeMetrics: () => api.get('/traffic/metrics/realtime'),
  
  // Domain-specific Metrics
  getDomainMetrics: (domainName) => api.get(`/traffic/metrics/domain/${domainName}`),
  
  // Alerts
  getAlerts: () => api.get('/traffic/alerts'),
  
  // Protection Rules
  getProtectionRules: (domain) => api.get('/traffic/rules', { params: { domain } }),
  
  // Health Check
  getHealth: () => api.get('/health'),
}

// Traffic Data Types
export const createTrafficData = (data) => ({
  method: data.method || 'GET',
  url: data.url,
  headers: data.headers || {},
  body: data.body,
  client_ip: data.client_ip || '127.0.0.1',
  user_agent: data.user_agent || 'Mozilla/5.0 (Unknown)',
})

export const createClassificationData = (data) => ({
  user_agent: data.user_agent,
  ip_address: data.ip_address,
  request_headers: data.request_headers || {},
  request_pattern: data.request_pattern || {},
  timestamp: data.timestamp || new Date().toISOString(),
})

export const createProtectionData = (data) => ({
  url: data.url,
  content: data.content,
  domain: data.domain,
  path: data.path,
  user_agent: data.user_agent,
  client_ip: data.client_ip,
  protection_level: data.protection_level || 'standard',
})

// Real-time Data Processing
export const processTrafficData = (rawData) => {
  return {
    timestamp: new Date(rawData.timestamp),
    domain: rawData.domain,
    path: rawData.path,
    method: rawData.method,
    client_ip: rawData.client_ip,
    user_agent: rawData.user_agent,
    is_bot: rawData.is_bot || false,
    bot_type: rawData.bot_type,
    response_status: rawData.response_status,
    processing_time: rawData.processing_time,
    action_taken: rawData.action_taken,
    geo_location: rawData.geo_location,
  }
}

// Analytics Data Processing
export const processAnalyticsData = (rawData) => {
  return {
    total_requests: rawData.total_requests || 0,
    bot_requests: rawData.bot_requests || 0,
    human_requests: rawData.human_requests || 0,
    blocked_requests: rawData.blocked_requests || 0,
    average_response_time: rawData.average_response_time || 0,
    top_domains: rawData.top_domains || [],
    top_ips: rawData.top_ips || [],
    top_user_agents: rawData.top_user_agents || [],
    recent_alerts: rawData.recent_alerts || [],
  }
}

// Error Handling
export const handleTrafficAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    switch (status) {
      case 400:
        return `Bad Request: ${data.error || 'Invalid data provided'}`
      case 401:
        return 'Unauthorized: Please log in again'
      case 403:
        return 'Forbidden: Insufficient permissions'
      case 404:
        return 'Not Found: Resource not available'
      case 429:
        return 'Rate Limited: Too many requests'
      case 500:
        return 'Server Error: Please try again later'
      default:
        return `Error ${status}: ${data.error || 'Unknown error occurred'}`
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network Error: Unable to connect to server'
  } else {
    // Something else happened
    return `Error: ${error.message || 'Unknown error occurred'}`
  }
}

// Utility Functions
export const formatProcessingTime = (timeMs) => {
  if (timeMs < 1000) {
    return `${timeMs.toFixed(2)}ms`
  } else {
    return `${(timeMs / 1000).toFixed(2)}s`
  }
}

export const formatBotType = (botType) => {
  if (!botType) return 'Unknown'
  
  const typeMap = {
    'search_engine': 'Search Engine',
    'scraper': 'Web Scraper',
    'botnet': 'Botnet',
    'malicious': 'Malicious Bot',
    'legitimate': 'Legitimate Bot',
    'unknown': 'Unknown Bot'
  }
  
  return typeMap[botType] || botType
}

export const formatActionTaken = (action) => {
  if (!action) return 'None'
  
  const actionMap = {
    'allow': 'Allowed',
    'block': 'Blocked',
    'challenge': 'Challenge Required',
    'rate_limit': 'Rate Limited',
    'redirect': 'Redirected',
    'modify': 'Content Modified'
  }
  
  return actionMap[action] || action
}

export default trafficAPI
