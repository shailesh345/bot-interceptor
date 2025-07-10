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
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
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

// Domains API
export const domainsAPI = {
  getDomains: () => api.get('/domains'),
  createDomain: (domainData) => api.post('/domains', domainData),
  updateDomain: (id, domainData) => api.put(`/domains/${id}`, domainData),
  deleteDomain: (id) => api.delete(`/domains/${id}`),
  verifyDomain: (id) => api.post(`/domains/${id}/verify`),
}

// Rules API
export const rulesAPI = {
  getRules: (domainId) => api.get(`/domains/${domainId}/rules`),
  createRule: (domainId, ruleData) => api.post(`/domains/${domainId}/rules`, ruleData),
  updateRule: (domainId, ruleId, ruleData) => api.put(`/domains/${domainId}/rules/${ruleId}`, ruleData),
  deleteRule: (domainId, ruleId) => api.delete(`/domains/${domainId}/rules/${ruleId}`),
  toggleRule: (domainId, ruleId) => api.patch(`/domains/${domainId}/rules/${ruleId}/toggle`),
}

// Analytics API
export const analyticsAPI = {
  getDashboardStats: (timeRange = '7d') => api.get(`/analytics/dashboard?timeRange=${timeRange}`),
  getTrafficLogs: (params = {}) => api.get('/analytics/traffic', { params }),
  getBotAnalytics: (params = {}) => api.get('/analytics/bots', { params }),
  getGeographicData: (params = {}) => api.get('/analytics/geographic', { params }),
  exportData: (params = {}) => api.get('/analytics/export', { params }),
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
