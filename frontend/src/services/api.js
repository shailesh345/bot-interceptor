import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8960',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include cookies for CORS
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('🔐 API Request - Token available:', !!token)
    console.log('🔐 API Request - URL:', config.url)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 API Request - Authorization header set')
    } else {
      console.log('🔐 API Request - No token found in localStorage')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    })

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('API 401 error:', error.config?.url)
      
      // Clear invalid tokens and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Redirect to login page
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Please check your permissions.')
    } else if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config?.url)
      // Don't show toast for 404s in development
      if (!import.meta.env.DEV) {
        toast.error('Resource not found.')
      }
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Network connection error:', error.message)
      toast.error('Unable to connect to server. Please check your internet connection.')
    } else if (!error.response) {
      console.error('Network error with no response:', error.message)
      toast.error('Network error. Please check your connection.')
    } else {
      console.error('Unexpected API error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
}

// Domains API (Updated for Phase 2)
export const domainsAPI = {
  getDomains: () => api.get('/api/v1/domains'),
  createDomain: (domainData) => api.post('/api/v1/domains', domainData),
  updateDomain: (id, domainData) => api.put(`/api/v1/domains/${id}`, domainData),
  deleteDomain: (id) => api.delete(`/api/v1/domains/${id}`),
  verifyDomain: (id, method = 'dns') => api.post(`/api/v1/domains/${id}/verify`, { method }),
  getVerificationInstructions: (id) => api.get(`/api/v1/domains/${id}/verification`),
  getDomainStats: (id) => api.get(`/api/v1/domains/${id}/stats`),
  getDomain: (id) => api.get(`/api/v1/domains/${id}`),
  bulkImportDomains: (domains) => api.post('/api/v1/domains/bulk-import', { domains }),
  exportDomains: () => api.get('/api/v1/domains/export'),
  testMonitoring: (id) => api.post(`/api/v1/domains/${id}/test-monitoring`),
  updateDomainMonitoring: (id, config) => api.put(`/api/v1/domains/${id}/monitoring`, config),
}

// Phase 2: Domain Management API
export const domainAPI = {
  // Get all domains
  getDomains: (params = {}) => api.get('/api/v1/domains', { params }),

  // Create new domain
  createDomain: (domainData) => api.post('/api/v1/domains', domainData),

  // Get specific domain
  getDomain: (domainId) => api.get(`/api/v1/domains/${domainId}`),

  // Update domain
  updateDomain: (domainId, domainData) => api.put(`/api/v1/domains/${domainId}`, domainData),

  // Delete domain
  deleteDomain: (domainId) => api.delete(`/api/v1/domains/${domainId}`),

  // Verify domain ownership
  verifyDomain: (domainId) => api.post(`/api/v1/domains/${domainId}/verify`),

  // Get verification instructions
  getVerificationInstructions: (domainId) => api.get(`/api/v1/domains/${domainId}/verification-instructions`),
}

// Rules API (Enhanced for Phase 2)
export const rulesAPI = {
  // Phase 2 enhanced endpoints
  getRules: (params = {}) => api.get('/v1/rules', { params }),
  createRule: (ruleData) => api.post('/v1/rules', ruleData),
  getRule: (ruleId) => api.get(`/v1/rules/${ruleId}`),
  updateRule: (ruleId, ruleData) => api.put(`/v1/rules/${ruleId}`, ruleData),
  deleteRule: (ruleId, ruleData) => api.delete(`/v1/rules/${ruleId}`),
  testRule: (ruleId, sampleRequests) => api.post(`/v1/rules/${ruleId}/test`, { sample_requests: sampleRequests }),
  
  // Legacy endpoints (maintain backward compatibility)
  getRulesByDomain: (domainId) => api.get(`/rules/${domainId}`),
  enableRule: (id) => api.post(`/rules/${id}/enable`),
  disableRule: (id) => api.post(`/rules/${id}/disable`),
  getRuleTemplates: () => api.get('/rules/templates'),
  getGlobalRules: () => api.get('/rules/global'),
  createGlobalRule: (ruleData) => api.post('/rules/global', ruleData),
  updateGlobalRule: (id, ruleData) => api.put(`/rules/global/${id}`, ruleData),
  deleteGlobalRule: (id) => api.delete(`/rules/global/${id}`),
}

// Traffic API (Enhanced for Phase 2)
export const trafficAPI = {
  // Phase 2 enhanced endpoints
  processRequest: (requestData) => api.post('/api/traffic/intercept', requestData),
  getStats: () => api.get('/api/traffic/metrics/realtime'),
  getLogs: (params = {}) => api.get('/api/traffic/logs', { params }),
  
  // Legacy endpoints (maintain backward compatibility)
  getTrafficLogs: (params) => api.get('/api/traffic/logs', { params }),
  getTrafficStats: (params) => api.get('/api/traffic/metrics/realtime', { params }),
  getTrafficSummary: (domainId) => api.get(`/api/traffic/metrics/domain/${domainId}`),
  getTopTraffic: (params) => api.get('/api/traffic/metrics/realtime', { params }),
  exportTrafficData: (params) => api.get('/api/traffic/logs', { params }),
  getTrafficAnalytics: (params) => api.get('/api/analytics/traffic-patterns', { params }),
  getRealTimeTraffic: (domainId) => api.get('/api/real-time/traffic-stream'),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getDashboardStats: (timeRange = '7d') => api.get(`/analytics/dashboard?timeRange=${timeRange}`),
  getTrafficPatterns: (days = 30) => api.get(`/analytics/traffic-patterns?days=${days}`),
  getBotIntelligence: (days = 30) => api.get(`/analytics/bot-intelligence?days=${days}`),
  getPerformanceMetrics: (hours = 24) => api.get(`/analytics/performance-metrics?hours=${hours}`),
  getTrafficLogs: (params = {}) => api.get('/analytics/traffic', { params }),
  getTrafficAnalytics: (params) => api.get('/analytics/traffic', { params }),
  getBotAnalytics: (params = {}) => api.get('/analytics/bots', { params }),
  getPerformanceAnalytics: (params) => api.get('/analytics/performance', { params }),
  getRealTimeAnalytics: (domainId) => api.get(domainId ? `/analytics/realtime/${domainId}` : '/analytics/realtime'),
  getHistoricalAnalytics: (params) => api.get('/analytics/historical', { params }),
  getCustomAnalytics: (params) => api.get('/analytics/custom', { params }),
  exportAnalytics: (params) => api.get('/analytics/export', { params }),
  getGeographicData: (params = {}) => api.get('/analytics/geographic', { params }),
  exportData: (params = {}) => api.get('/analytics/export', { params }),
  getSystemHealth: () => api.get('/analytics/health'),
  getAlerts: () => api.get('/analytics/alerts'),
  createAlert: (alertData) => api.post('/analytics/alerts', alertData),
  updateAlert: (id, alertData) => api.put(`/analytics/alerts/${id}`, alertData),
  deleteAlert: (id) => api.delete(`/analytics/alerts/${id}`),
}

// Billing API
export const billingAPI = {
  getSubscription: () => api.get('/billing/subscription'),
  createSubscription: (planData) => api.post('/billing/subscription', planData),
  updateSubscription: (subscriptionData) => api.put('/billing/subscription', subscriptionData),
  cancelSubscription: () => api.delete('/billing/subscription'),
  getInvoices: () => api.get('/billing/invoices'),
  getPaymentMethods: () => api.get('/billing/payment-methods'),
  addPaymentMethod: (paymentMethodData) => api.post('/billing/payment-methods', paymentMethodData),
  deletePaymentMethod: (id) => api.delete(`/billing/payment-methods/${id}`),
  getUsage: (params) => api.get('/billing/usage', { params }),
  getPlans: () => api.get('/billing/plans'),
  createPaymentMethod: (paymentData) => api.post('/billing/payment-method', paymentData),
  updatePaymentMethod: (id, paymentData) => api.put(`/billing/payment-method/${id}`, paymentData),
  getInvoice: (id) => api.get(`/billing/invoices/${id}`),
  downloadInvoice: (id) => api.get(`/billing/invoices/${id}/download`),
  getUsageHistory: (params) => api.get('/billing/usage-history', { params }),
  getBillingSettings: () => api.get('/billing/settings'),
  updateBillingSettings: (settings) => api.put('/billing/settings', settings),
}

// Admin API
export const adminAPI = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTenants: (params = {}) => api.get('/admin/tenants', { params }),
  createTenant: (tenantData) => api.post('/admin/tenants', tenantData),
  updateTenant: (id, tenantData) => api.put(`/admin/tenants/${id}`, tenantData),
  deleteTenant: (id) => api.delete(`/admin/tenants/${id}`),
  getSystemStats: () => api.get('/clean-admin/system-stats'),
  getSystemHealth: () => api.get('/admin/system-health'),
  getSystemAlerts: () => api.get('/admin/system-alerts'),
  getTableData: (tableName) => api.get(`/clean-admin/database/tables/${tableName}`),
  exportTableData: (tableName) => api.get(`/clean-admin/database/tables/${tableName}/export`),
  backupDatabase: () => api.post('/clean-admin/database/backup'),
  getDatabaseSchema: () => api.get('/admin/database/schema'),
  getDatabaseInfo: () => api.get('/clean-admin/database/info'),
  runDatabaseQuery: (query) => api.post('/admin/database/query', { query }),
  optimizeDatabase: () => api.post('/admin/database/optimize'),
  repairDatabase: () => api.post('/admin/database/repair'),
}

// Bot Profiles API
export const botProfilesAPI = {
  getBotProfiles: () => api.get('/bot-profiles'),
  createBotProfile: (profileData) => api.post('/bot-profiles', profileData),
  updateBotProfile: (id, profileData) => api.put(`/bot-profiles/${id}`, profileData),
  deleteBotProfile: (id) => api.delete(`/bot-profiles/${id}`),
}

// API Keys API
export const apiKeysAPI = {
  getApiKeys: () => api.get('/api-keys'),
  createApiKey: (keyData) => api.post('/api-keys', keyData),
  updateApiKey: (id, keyData) => api.put(`/api-keys/${id}`, keyData),
  deleteApiKey: (id) => api.delete(`/api-keys/${id}`),
}

export default api
