import api from './api'

// Domain Management API
export const domainAPI = {
  // Get all domains for current user
  getDomains: () => api.get('/api/domains'),
  
  // Get specific domain by ID
  getDomain: (id) => api.get(`/api/domains/${id}`),
  
  // Create new domain
  createDomain: (domainData) => api.post('/api/domains', domainData),
  
  // Update existing domain
  updateDomain: (id, domainData) => api.put(`/api/domains/${id}`, domainData),
  
  // Delete domain
  deleteDomain: (id) => api.delete(`/api/domains/${id}`),
  
  // Verify domain ownership
  verifyDomain: (id, method = 'dns') => api.post(`/api/domains/${id}/verify`, { method }),
  
  // Get domain verification instructions
  getVerificationInstructions: (id) => api.get(`/api/domains/${id}/verification`),
  
  // Get domain statistics
  getDomainStats: (id, timeRange = '30d') => api.get(`/api/domains/${id}/stats?range=${timeRange}`),
  
  // Get domain traffic logs
  getDomainTraffic: (id, params = {}) => api.get(`/api/domains/${id}/traffic`, { params }),
  
  // Get domain analytics
  getDomainAnalytics: (id, params = {}) => api.get(`/api/domains/${id}/analytics`, { params })
}

// Rule Management API
export const ruleAPI = {
  // Get all rules for current user
  getRules: (params = {}) => api.get('/api/rules', { params }),
  
  // Get specific rule by ID
  getRule: (id) => api.get(`/api/rules/${id}`),
  
  // Create new rule
  createRule: (ruleData) => api.post('/api/rules', ruleData),
  
  // Update existing rule
  updateRule: (id, ruleData) => api.put(`/api/rules/${id}`, ruleData),
  
  // Delete rule
  deleteRule: (id) => api.delete(`/api/rules/${id}`),
  
  // Test rule
  testRule: (id, testData) => api.post(`/api/rules/${id}/test`, testData),
  
  // Get rule templates
  getRuleTemplates: () => api.get('/api/rules/templates'),
  
  // Get rule statistics
  getRuleStats: (id, timeRange = '30d') => api.get(`/api/rules/${id}/stats?range=${timeRange}`),
  
  // Attach rule to domain
  attachRuleToDomain: (ruleId, domainId) => api.post(`/api/rules/${ruleId}/domains`, { domain_id: domainId }),
  
  // Detach rule from domain
  detachRuleFromDomain: (ruleId, domainId) => api.delete(`/api/rules/${ruleId}/domains/${domainId}`),
  
  // Get rules for specific domain
  getDomainRules: (domainId) => api.get(`/api/domains/${domainId}/rules`),
  
  // Bulk update rule status
  bulkUpdateRuleStatus: (ruleIds, status) => api.put('/api/rules/bulk-status', { rule_ids: ruleIds, status })
}

// Traffic Monitoring API
export const trafficAPI = {
  // Get real-time traffic data
  getRealTimeTraffic: (domainId) => api.get(`/api/traffic/${domainId}/realtime`),
  
  // Get traffic history
  getTrafficHistory: (domainId, params = {}) => api.get(`/api/traffic/${domainId}/history`, { params }),
  
  // Get bot detection events
  getBotEvents: (domainId, params = {}) => api.get(`/api/traffic/${domainId}/bot-events`, { params }),
  
  // Get blocked requests
  getBlockedRequests: (domainId, params = {}) => api.get(`/api/traffic/${domainId}/blocked`, { params }),
  
  // Get rate limiting events
  getRateLimitEvents: (domainId, params = {}) => api.get(`/api/traffic/${domainId}/rate-limits`, { params }),
  
  // Get traffic analytics
  getTrafficAnalytics: (domainId, params = {}) => api.get(`/api/traffic/${domainId}/analytics`, { params }),
  
  // Export traffic data
  exportTrafficData: (domainId, format = 'csv', params = {}) => 
    api.get(`/api/traffic/${domainId}/export?format=${format}`, { 
      params,
      responseType: 'blob'
    })
}

// Bot Detection API
export const botDetectionAPI = {
  // Get bot detection statistics
  getBotStats: (domainId, params = {}) => api.get(`/api/bot-detection/${domainId}/stats`, { params }),
  
  // Get bot profiles
  getBotProfiles: () => api.get('/api/bot-detection/profiles'),
  
  // Create bot profile
  createBotProfile: (profileData) => api.post('/api/bot-detection/profiles', profileData),
  
  // Update bot profile
  updateBotProfile: (id, profileData) => api.put(`/api/bot-detection/profiles/${id}`, profileData),
  
  // Delete bot profile
  deleteBotProfile: (id) => api.delete(`/api/bot-detection/profiles/${id}`),
  
  // Get bot detection logs
  getBotLogs: (domainId, params = {}) => api.get(`/api/bot-detection/${domainId}/logs`, { params }),
  
  // Get bot detection patterns
  getBotPatterns: () => api.get('/api/bot-detection/patterns'),
  
  // Test bot detection
  testBotDetection: (domainId, testData) => api.post(`/api/bot-detection/${domainId}/test`, testData)
}

// Monitoring and Alerts API
export const monitoringAPI = {
  // Get system status
  getSystemStatus: () => api.get('/api/monitoring/status'),
  
  // Get performance metrics
  getPerformanceMetrics: (domainId, params = {}) => api.get(`/api/monitoring/${domainId}/performance`, { params }),
  
  // Get uptime statistics
  getUptimeStats: (domainId, params = {}) => api.get(`/api/monitoring/${domainId}/uptime`, { params }),
  
  // Get response time metrics
  getResponseTimeMetrics: (domainId, params = {}) => api.get(`/api/monitoring/${domainId}/response-time`, { params }),
  
  // Get alerts
  getAlerts: (params = {}) => api.get('/api/monitoring/alerts', { params }),
  
  // Create alert
  createAlert: (alertData) => api.post('/api/monitoring/alerts', alertData),
  
  // Update alert
  updateAlert: (id, alertData) => api.put(`/api/monitoring/alerts/${id}`, alertData),
  
  // Delete alert
  deleteAlert: (id) => api.delete(`/api/monitoring/alerts/${id}`),
  
  // Get alert history
  getAlertHistory: (params = {}) => api.get('/api/monitoring/alerts/history', { params })
}

// WebSocket connection for real-time updates
export const createWebSocketConnection = (domainId, onMessage, onError) => {
  const ws = new WebSocket(`ws://localhost:5002/ws/traffic/${domainId}`)
  
  ws.onopen = () => {
    console.log('WebSocket connected for domain:', domainId)
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    onError?.(error)
  }
  
  ws.onclose = () => {
    console.log('WebSocket disconnected for domain:', domainId)
  }
  
  return ws
}

// Mock data for development/testing
export const mockData = {
  domains: [
    {
      id: '1',
      name: 'shaileshdwivedi.in',
      status: 'active',
      isVerified: true,
      sslEnabled: true,
      cdnEnabled: false,
      trafficEnabled: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastActivity: '2024-12-01T14:20:00Z',
      totalRequests: 125643,
      botRequests: 15420,
      blockedRequests: 12340,
      revenue: 6282.15
    }
  ],
  
  rules: [
    {
      id: '1',
      name: 'AI Training Bot Blocking',
      description: 'Block AI training bots like GPTBot, ClaudeBot, etc.',
      type: 'bot_detection',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'user_agent', operator: 'contains', value: 'GPTBot' },
        { field: 'user_agent', operator: 'contains', value: 'ClaudeBot' }
      ],
      actions: [
        { type: 'block_request', value: true },
        { type: 'log_event', value: 'ai_bot_blocked' }
      ],
      domains: ['shaileshdwivedi.in'],
      hits: 125643,
      revenue: 6282.15,
      lastTriggered: '2024-12-01T14:20:00Z'
    },
    {
      id: '2',
      name: 'Web Scraping Bot Detection',
      description: 'Detect and block web scraping bots',
      type: 'bot_detection',
      status: 'active',
      priority: 2,
      conditions: [
        { field: 'user_agent', operator: 'contains', value: 'scraper' },
        { field: 'user_agent', operator: 'contains', value: 'crawler' }
      ],
      actions: [
        { type: 'block_request', value: true },
        { type: 'challenge', value: 'captcha' }
      ],
      domains: ['shaileshdwivedi.in'],
      hits: 98765,
      revenue: 4938.25,
      lastTriggered: '2024-12-01T13:45:00Z'
    }
  ],
  
  realTimeData: {
    currentRequests: 75,
    requestsPerMinute: 850,
    activeUsers: 35,
    botRequests: 12,
    blockedRequests: 8,
    responseTime: 125.5,
    uptime: 99.95
  },
  
  trafficHistory: Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (30 - i) * 60000),
    requests: Math.floor(Math.random() * 100) + 50,
    bots: Math.floor(Math.random() * 20) + 5
  })),
  
  recentEvents: [
    {
      id: 1,
      message: 'Bot request blocked from IP 192.168.1.100',
      timestamp: new Date(Date.now() - 30000),
      type: 'warning'
    },
    {
      id: 2,
      message: 'Rate limit exceeded for IP 10.0.0.50',
      timestamp: new Date(Date.now() - 60000),
      type: 'warning'
    },
    {
      id: 3,
      message: 'New user session started',
      timestamp: new Date(Date.now() - 90000),
      type: 'info'
    }
  ]
}

// Utility functions
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100'
    case 'pending': return 'text-yellow-600 bg-yellow-100'
    case 'suspended': return 'text-red-600 bg-red-100'
    case 'inactive': return 'text-gray-600 bg-gray-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export default {
  domainAPI,
  ruleAPI,
  trafficAPI,
  botDetectionAPI,
  monitoringAPI,
  createWebSocketConnection,
  mockData,
  formatNumber,
  formatCurrency,
  formatDate,
  getStatusColor
}
