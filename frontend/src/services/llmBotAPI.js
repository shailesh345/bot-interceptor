import api from './api';

/**
 * LLM Bot Detection and Credit System API Service
 */

// Credit Packages API
export const creditAPI = {
  // Get available credit packages
  getPackages: async (params = {}) => {
    const response = await api.get('/api/credits/packages', { params });
    return response.data;
  },

  // Purchase credits
  purchaseCredits: async (data) => {
    const response = await api.post('/api/credits/purchase', data);
    return response.data;
  },

  // Get credit balance
  getBalance: async (organizationId) => {
    const response = await api.get(`/api/credits/balance/${organizationId}`);
    return response.data;
  },

  // Get credit usage
  getUsage: async (organizationId, params = {}) => {
    const response = await api.get(`/api/credits/usage/${organizationId}`, { params });
    return response.data;
  },

  // Verify crawl access
  verifyAccess: async (data) => {
    const response = await api.post('/api/credits/verify-access', data);
    return response.data;
  }
};

// Company Outreach API
export const outreachAPI = {
  // Send automated outreach
  sendOutreach: async (data) => {
    const response = await api.post('/api/credits/company-outreach', data);
    return response.data;
  },

  // Get outreach status
  getOutreachStatus: async (params = {}) => {
    const response = await api.get('/api/credits/outreach-status', { params });
    return response.data;
  },

  // Send follow-up
  sendFollowUp: async (outreachId, data) => {
    const response = await api.post(`/api/credits/outreach/${outreachId}/follow-up`, data);
    return response.data;
  }
};

// LLM Bot Detection API
export const llmBotAPI = {
  // Get LLM bot detections
  getDetections: async (params = {}) => {
    const response = await api.get('/interceptor/llm-detections', { params });
    return response.data;
  },

  // Get detection analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/api/analytics/llm-bots', { params });
    return response.data;
  },

  // Test bot detection
  testDetection: async (data) => {
    const response = await api.post('/api/llm-bots/test-detection', data);
    return response.data;
  },

  // Get bot company profiles
  getCompanyProfiles: async () => {
    const response = await api.get('/api/llm-bots/company-profiles');
    return response.data;
  },

  // Update detection rules
  updateDetectionRules: async (rules) => {
    const response = await api.put('/api/llm-bots/detection-rules', rules);
    return response.data;
  }
};

// Analytics API for LLM bot specific analytics
export const llmAnalyticsAPI = {
  // Get dashboard stats
  getDashboardStats: async (timeRange = '7d') => {
    const response = await api.get('/api/analytics/llm-dashboard', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (params = {}) => {
    const response = await api.get('/api/analytics/llm-revenue', { params });
    return response.data;
  },

  // Get conversion funnel
  getConversionFunnel: async (params = {}) => {
    const response = await api.get('/api/analytics/llm-conversion', { params });
    return response.data;
  },

  // Get detection effectiveness
  getDetectionEffectiveness: async (params = {}) => {
    const response = await api.get('/api/analytics/llm-effectiveness', { params });
    return response.data;
  },

  // Export analytics data
  exportData: async (params = {}) => {
    const response = await api.get('/api/analytics/llm-export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Mock data for development
export const mockLLMAnalyticsData = {
  summary: {
    totalDetections: 15234,
    detectionChange: 23.5,
    creditsSold: 125000,
    creditChange: 45.2,
    revenue: 12450.00,
    conversionRate: 8.2,
    conversionChange: 2.1,
    avgResponseTime: 45,
    responseTimeChange: -12.3,
    uniqueCompanies: 8
  },
  timeline: [
    { time: new Date().toISOString(), 'OpenAI/ChatGPT': 45, 'Google AI/Bard': 32, 'Perplexity AI': 28, 'Claude/Anthropic': 15, 'Other AI Bots': 8 },
    // Add more timeline data...
  ],
  revenueByCompany: [
    { name: 'OpenAI/ChatGPT', value: 4500 },
    { name: 'Google AI/Bard', value: 3200 },
    { name: 'Perplexity AI', value: 2800 },
    { name: 'Claude/Anthropic', value: 1500 },
    { name: 'Other AI Bots', value: 450 }
  ],
  detectionMethods: [
    { method: 'User Agent', effectiveness: 95, usage: 100 },
    { method: 'IP Range', effectiveness: 88, usage: 85 },
    { method: 'Behavioral', effectiveness: 82, usage: 75 },
    { method: 'ML Model', effectiveness: 90, usage: 95 },
    { method: 'Super Intelligence', effectiveness: 78, usage: 60 }
  ],
  outreachStatus: [
    { id: 1, name: 'OpenAI', status: 'converted', lastContact: '2024-09-01', response: 'Purchased enterprise package' },
    { id: 2, name: 'Google AI', status: 'responded', lastContact: '2024-09-02', response: 'Evaluating options' },
    { id: 3, name: 'Perplexity AI', status: 'sent', lastContact: '2024-09-03', response: null },
    { id: 4, name: 'Anthropic', status: 'pending', lastContact: '2024-09-03', response: null }
  ],
  topDetections: [
    { company: 'OpenAI/ChatGPT', count: 234, confidence: 98.5, status: 'credited' },
    { company: 'Google AI/Bard', count: 189, confidence: 95.2, status: 'credited' },
    { company: 'Perplexity AI', count: 156, confidence: 92.8, status: 'blocked' },
    { company: 'Claude/Anthropic', count: 98, confidence: 89.4, status: 'blocked' },
    { company: 'Other AI Bots', count: 45, confidence: 78.2, status: 'blocked' }
  ],
  conversionFunnel: [
    { name: 'Detected', value: 15234, rate: 100 },
    { name: 'Redirected', value: 8945, rate: 58.7 },
    { name: 'Viewed Pricing', value: 3456, rate: 38.6 },
    { name: 'Started Purchase', value: 1890, rate: 54.7 },
    { name: 'Completed', value: 1250, rate: 66.1 }
  ]
};
