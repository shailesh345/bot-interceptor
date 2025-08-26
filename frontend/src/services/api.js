import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    if (error.response?.status === 401) {
      // Token expired or invalid - only clear if it's an auth endpoint or critical failure
      console.log('API 401 error:', error.config?.url)
      
      // Don't auto-redirect on every 401, let the app handle it
      // localStorage.removeItem('token')
      // localStorage.removeItem('refreshToken')
      // window.location.href = '/login'
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
  logout: () => axios.post('/auth/logout'),
  refreshToken: () => axios.post('/auth/refresh'),
  getProfile: () => axios.get('/auth/profile'),
  updateProfile: (profileData) => axios.put('/auth/profile', profileData),
  changePassword: (passwordData) => axios.post('/auth/change-password', passwordData),
}

// Domains API (Updated for Phase 2)
export const domainsAPI = {
  getDomains: () => api.get('/v1/domains'),
  createDomain: (domainData) => api.post('/v1/domains', domainData),
  updateDomain: (id, domainData) => api.put(`/v1/domains/${id}`, domainData),
  deleteDomain: (id) => api.delete(`/v1/domains/${id}`),
  verifyDomain: (id) => api.post(`/v1/domains/${id}/verify`),
  getDomainStats: (id) => api.get(`/v1/domains/${id}/stats`),
  getDomain: (id) => api.get(`/v1/domains/${id}`),
  bulkImportDomains: (domains) => api.post('/v1/domains/bulk-import', { domains }),
  exportDomains: () => api.get('/v1/domains/export'),
}

// Phase 2: Domain Management API
export const domainAPI = {
  // Get all domains
  getDomains: (params = {}) => api.get('/v1/domains', { params }),

  // Create new domain
  createDomain: (domainData) => api.post('/v1/domains', domainData),

  // Get specific domain
  getDomain: (domainId) => api.get(`/v1/domains/${domainId}`),

  // Update domain
  updateDomain: (domainId, domainData) => api.put(`/v1/domains/${domainId}`, domainData),

  // Delete domain
  deleteDomain: (domainId) => api.delete(`/v1/domains/${domainId}`),

  // Verify domain ownership
  verifyDomain: (domainId) => api.post(`/v1/domains/${domainId}/verify`),

  // Get verification instructions
  getVerificationInstructions: (domainId) => api.get(`/v1/domains/${domainId}/verification-instructions`),
}

// Rules API (Enhanced for Phase 2)
export const rulesAPI = {
  // Phase 2 enhanced endpoints
  getRules: (params = {}) => api.get('/v1/rules', { params }),
  createRule: (ruleData) => api.post('/v1/rules', ruleData),
  getRule: (ruleId) => api.get(`/v1/rules/${ruleId}`),
  updateRule: (ruleId, ruleData) => api.put(`/v1/rules/${ruleId}`, ruleData),
  deleteRule: (ruleId) => api.delete(`/v1/rules/${ruleId}`),
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
  processRequest: (requestData) => api.post('/v1/traffic/process', requestData),
  getStats: () => api.get('/v1/traffic/stats'),
  getLogs: (params = {}) => api.get('/v1/traffic/logs', { params }),
  
  // Legacy endpoints (maintain backward compatibility)
  getTrafficLogs: (params) => api.get('/traffic/logs', { params }),
  getTrafficStats: (params) => api.get('/traffic/stats', { params }),
  getTrafficSummary: (domainId) => api.get(`/traffic/summary/${domainId}`),
  getTopTraffic: (params) => api.get('/traffic/top', { params }),
  exportTrafficData: (params) => api.get('/traffic/export', { params }),
  getTrafficAnalytics: (params) => api.get('/traffic/analytics', { params }),
  getRealTimeTraffic: (domainId) => api.get(`/traffic/realtime/${domainId}`),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getDashboardStats: (timeRange = '7d') => api.get(`/analytics/dashboard?timeRange=${timeRange}`),
  getTrafficLogs: (params = {}) => api.get('/analytics/traffic', { params }),
  getTrafficAnalytics: (params) => api.get('/analytics/traffic', { params }),
  getBotAnalytics: (params = {}) => api.get('/analytics/bots', { params }),
  getPerformanceAnalytics: (params) => api.get('/analytics/performance', { params }),
  getRealTimeAnalytics: (domainId) => api.get(`/analytics/realtime/${domainId}`),
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
  getSystemStats: () => api.get('/admin/system-stats'),
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
