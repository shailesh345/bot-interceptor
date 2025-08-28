// Enhanced Mock API for comprehensive SaaS platform
import { addDays, subDays, format, startOfMonth, endOfMonth } from 'date-fns'

// Enhanced Mock Data Generator for Client Management
export const generateMockClients = () => [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    industry: 'Technology',
    size: 'Enterprise',
    country: 'US',
    revenue: 125000,
    mrr: 12500,
    usage: 85,
    healthScore: 92,
    lifecycle: 'active',
    tier: 'premium',
    planName: 'Enterprise Pro',
    onboardedAt: '2024-01-15',
    lastActivityAt: new Date().toISOString(),
    supportTickets: 12,
    integrations: ['Salesforce', 'HubSpot', 'Slack'],
    features: ['Advanced Analytics', 'Custom Rules', 'API Access', 'White Label'],
    contacts: [
      { name: 'John Smith', role: 'CTO', email: 'john@acme.com' },
      { name: 'Sarah Wilson', role: 'DevOps Lead', email: 'sarah@acme.com' }
    ],
    domains: ['acme.com', 'app.acme.com'],
    billing: {
      method: 'invoice',
      nextBilling: '2025-02-01',
      credits: 15000,
      overageThreshold: 20000
    },
    metrics: {
      totalRequests: 2847562,
      botRequests: 425634,
      blockedRequests: 89234,
      revenue: 15678.50
    }
  },
  {
    id: '2',
    name: 'StartupXYZ',
    email: 'team@startupxyz.io',
    industry: 'E-commerce',
    size: 'Startup',
    country: 'UK',
    revenue: 2500,
    mrr: 250,
    usage: 42,
    healthScore: 76,
    lifecycle: 'trial',
    tier: 'basic',
    planName: 'Growth',
    onboardedAt: '2024-11-01',
    lastActivityAt: new Date().toISOString(),
    supportTickets: 3,
    integrations: ['Shopify'],
    features: ['Basic Analytics', 'Standard Rules'],
    contacts: [
      { name: 'Mike Chen', role: 'Founder', email: 'mike@startupxyz.io' }
    ],
    domains: ['startupxyz.io'],
    billing: {
      method: 'card',
      nextBilling: '2025-01-15',
      credits: 2500,
      overageThreshold: 5000
    },
    metrics: {
      totalRequests: 145823,
      botRequests: 23456,
      blockedRequests: 5234,
      revenue: 234.50
    }
  },
  {
    id: '3',
    name: 'Global Media Inc',
    email: 'it@globalmedia.com',
    industry: 'Media',
    size: 'Large',
    country: 'CA',
    revenue: 85000,
    mrr: 8500,
    usage: 95,
    healthScore: 88,
    lifecycle: 'active',
    tier: 'professional',
    planName: 'Professional',
    onboardedAt: '2023-08-20',
    lastActivityAt: new Date().toISOString(),
    supportTickets: 8,
    integrations: ['WordPress', 'Drupal'],
    features: ['Advanced Analytics', 'Custom Rules', 'Priority Support'],
    contacts: [
      { name: 'Emma Thompson', role: 'IT Director', email: 'emma@globalmedia.com' },
      { name: 'David Lee', role: 'Security Lead', email: 'david@globalmedia.com' }
    ],
    domains: ['globalmedia.com', 'news.globalmedia.com', 'blogs.globalmedia.com'],
    billing: {
      method: 'invoice',
      nextBilling: '2025-01-20',
      credits: 12000,
      overageThreshold: 15000
    },
    metrics: {
      totalRequests: 1956743,
      botRequests: 312567,
      blockedRequests: 67234,
      revenue: 9876.25
    }
  },
  {
    id: '4',
    name: 'TechSolutions Ltd',
    email: 'admin@techsolutions.co.uk',
    industry: 'Technology',
    size: 'Medium',
    country: 'UK',
    revenue: 0,
    mrr: 0,
    usage: 15,
    healthScore: 45,
    lifecycle: 'prospect',
    tier: 'trial',
    planName: 'Trial',
    onboardedAt: '2024-12-01',
    lastActivityAt: subDays(new Date(), 3).toISOString(),
    supportTickets: 1,
    integrations: [],
    features: ['Basic Analytics'],
    contacts: [
      { name: 'Robert Taylor', role: 'CTO', email: 'robert@techsolutions.co.uk' }
    ],
    domains: ['techsolutions.co.uk'],
    billing: {
      method: 'card',
      nextBilling: '2025-01-01',
      credits: 1000,
      overageThreshold: 1000
    },
    metrics: {
      totalRequests: 12456,
      botRequests: 1834,
      blockedRequests: 234,
      revenue: 0
    }
  },
  {
    id: '5',
    name: 'FinanceFlow Corp',
    email: 'security@financeflow.com',
    industry: 'Finance',
    size: 'Enterprise',
    country: 'US',
    revenue: 200000,
    mrr: 20000,
    usage: 78,
    healthScore: 35,
    lifecycle: 'at-risk',
    tier: 'enterprise',
    planName: 'Enterprise Plus',
    onboardedAt: '2022-03-10',
    lastActivityAt: subDays(new Date(), 7).toISOString(),
    supportTickets: 25,
    integrations: ['Oracle', 'SAP', 'Azure AD'],
    features: ['Advanced Analytics', 'Custom Rules', 'API Access', 'White Label', 'Compliance Suite'],
    contacts: [
      { name: 'Jennifer Adams', role: 'CISO', email: 'jennifer@financeflow.com' },
      { name: 'Mark Johnson', role: 'IT Manager', email: 'mark@financeflow.com' }
    ],
    domains: ['financeflow.com', 'portal.financeflow.com', 'api.financeflow.com'],
    billing: {
      method: 'invoice',
      nextBilling: '2025-01-10',
      credits: 25000,
      overageThreshold: 98890
    },
    metrics: {
      totalRequests: 4523789,
      botRequests: 789456,
      blockedRequests: 156789,
      revenue: 28456.75
    }
  }
]

// Enhanced Revenue Intelligence Data
export const generateRevenueData = () => ({
  mrr: {
    current: 156750,
    previous: 148230,
    growth: 5.75,
    trend: generateTrendData(12, 'monthly')
  },
  arr: {
    current: 1881000,
    projected: 2145000,
    growth: 14.03
  },
  churn: {
    rate: 2.5,
    previous: 3.1,
    improvement: -0.6,
    cohortData: [
      { month: '2024-07', churn: 1.8, revenue: 142000 },
      { month: '2024-08', churn: 2.2, revenue: 145000 },
      { month: '2024-09', churn: 2.8, revenue: 148000 },
      { month: '2024-10', churn: 2.4, revenue: 152000 },
      { month: '2024-11', churn: 2.1, revenue: 154000 },
      { month: '2024-12', churn: 2.5, revenue: 156750 }
    ]
  },
  expansion: {
    rate: 12.5,
    revenue: 19594,
    accounts: 15
  },
  forecast: {
    q1: 485000,
    q2: 542000,
    q3: 598000,
    q4: 656000
  }
})

// Enhanced System Performance Data
export const generateSystemPerformanceData = () => ({
  realTime: {
    cpu: 67,
    memory: 78,
    disk: 45,
    network: 89,
    activeConnections: 2456,
    requestsPerSecond: 1247,
    responseTime: 125,
    errorRate: 0.02
  },
  endpoints: [
    { path: '/api/v1/domains', responseTime: 89, requests: 12547, errors: 12 },
    { path: '/api/v1/rules', responseTime: 156, requests: 8934, errors: 5 },
    { path: '/api/v1/analytics', responseTime: 234, requests: 15672, errors: 8 },
    { path: '/api/v1/billing', responseTime: 67, requests: 3456, errors: 2 }
  ],
  databases: [
    { name: 'Primary PostgreSQL', status: 'healthy', responseTime: 12, connections: 89 },
    { name: 'Redis Cache', status: 'healthy', responseTime: 2, connections: 234 },
    { name: 'Analytics DB', status: 'warning', responseTime: 45, connections: 156 }
  ],
  services: [
    { name: 'Bot Detection Engine', status: 'healthy', uptime: 99.98 },
    { name: 'Analytics Processor', status: 'healthy', uptime: 99.95 },
    { name: 'Billing Service', status: 'healthy', uptime: 99.99 },
    { name: 'Notification Service', status: 'degraded', uptime: 98.67 }
  ]
})

// Enhanced Security Operations Data
export const generateSecurityData = () => ({
  threats: {
    blocked: 15678,
    investigated: 234,
    resolved: 221,
    active: 13
  },
  incidents: [
    {
      id: 'INC-001',
      type: 'Brute Force Attack',
      severity: 'high',
      status: 'investigating',
      detectedAt: new Date().toISOString(),
      source: '192.168.1.100',
      target: 'login endpoint',
      actions: ['IP blocked', 'User notified', 'Logs collected']
    },
    {
      id: 'INC-002',
      type: 'DDoS Attempt',
      severity: 'medium',
      status: 'resolved',
      detectedAt: subDays(new Date(), 1).toISOString(),
      source: 'Multiple IPs',
      target: 'API Gateway',
      actions: ['Rate limits applied', 'CloudFlare activated', 'Traffic rerouted']
    }
  ],
  compliance: {
    gdpr: { status: 'compliant', lastAudit: '2024-11-15', score: 98 },
    soc2: { status: 'compliant', lastAudit: '2024-10-01', score: 96 },
    iso27001: { status: 'in-progress', lastAudit: '2024-09-20', score: 89 }
  },
  vulnerabilities: [
    { cve: 'CVE-2024-1234', severity: 'medium', status: 'patched', component: 'nginx' },
    { cve: 'CVE-2024-5678', severity: 'low', status: 'monitoring', component: 'node.js' }
  ]
})

// Communication Hub Data
export const generateCommunicationData = () => ({
  campaigns: [
    {
      id: '1',
      name: 'Q1 2025 Product Updates',
      type: 'email',
      status: 'sent',
      sentAt: subDays(new Date(), 2).toISOString(),
      recipients: 1247,
      opened: 892,
      clicked: 234,
      converted: 45
    },
    {
      id: '2',
      name: 'Security Alert - API Changes',
      type: 'in-app',
      status: 'active',
      sentAt: new Date().toISOString(),
      recipients: 2456,
      opened: 1834,
      clicked: 567,
      converted: 89
    }
  ],
  templates: [
    { id: '1', name: 'Welcome Series', type: 'email', category: 'onboarding' },
    { id: '2', name: 'Payment Failed', type: 'email', category: 'billing' },
    { id: '3', name: 'Feature Announcement', type: 'in-app', category: 'product' }
  ],
  automation: [
    {
      id: '1',
      name: 'Trial Expiry Reminder',
      trigger: 'trial_expires_in_3_days',
      actions: ['send_email', 'show_in_app_notification'],
      active: true,
      executed: 23
    },
    {
      id: '2',
      name: 'Onboarding Flow',
      trigger: 'user_registered',
      actions: ['send_welcome_email', 'schedule_demo_call'],
      active: true,
      executed: 156
    }
  ]
})

// Enhanced Usage Analytics Data
export const generateUsageAnalyticsData = () => ({
  resources: [
    {
      name: 'API Requests',
      current: 2456789,
      limit: 5000000,
      percentage: 49.1,
      trend: 'increasing',
      cost: 1234.56
    },
    {
      name: 'Storage (GB)',
      current: 847,
      limit: 2000,
      percentage: 42.4,
      trend: 'stable',
      cost: 169.40
    },
    {
      name: 'Bandwidth (TB)',
      current: 12.4,
      limit: 50,
      percentage: 24.8,
      trend: 'decreasing',
      cost: 248.00
    },
    {
      name: 'Processing Time (hours)',
      current: 1567,
      limit: 4000,
      percentage: 39.2,
      trend: 'increasing',
      cost: 783.50
    }
  ],
  anomalies: [
    {
      id: '1',
      type: 'Usage Spike',
      resource: 'API Requests',
      detectedAt: new Date().toISOString(),
      severity: 'medium',
      description: 'Unusual increase in API requests from client acme.com'
    },
    {
      id: '2',
      type: 'Cost Increase',
      resource: 'Storage',
      detectedAt: subDays(new Date(), 1).toISOString(),
      severity: 'low',
      description: 'Storage usage increased by 15% over last 24 hours'
    }
  ],
  predictions: {
    nextMonth: {
      apiRequests: 2890000,
      storage: 945,
      bandwidth: 14.2,
      estimatedCost: 2789.45
    },
    alerts: [
      'API usage may exceed limit by month-end',
      'Storage growth trending towards limit breach in Q2'
    ]
  }
})

// Enhanced Feature Flags Data
export const generateFeatureFlagsData = () => [
  {
    id: '1',
    name: 'Enhanced Analytics Dashboard',
    key: 'enhanced_analytics_v2',
    description: 'New analytics dashboard with real-time charts and advanced filtering',
    status: 'active',
    rolloutPercentage: 75,
    targeting: {
      userSegments: ['premium', 'enterprise'],
      countries: ['US', 'UK', 'CA'],
      customRules: 'account_age > 30'
    },
    createdAt: '2024-11-01',
    lastModified: '2024-12-15',
    metrics: {
      enabled: 1847,
      conversion: 23.4,
      satisfaction: 4.2
    }
  },
  {
    id: '2',
    name: 'AI-Powered Bot Detection',
    key: 'ai_bot_detection_beta',
    description: 'Machine learning enhanced bot detection with 99% accuracy',
    status: 'testing',
    rolloutPercentage: 15,
    targeting: {
      userSegments: ['beta_testers'],
      countries: ['US'],
      customRules: 'traffic_volume > 100000'
    },
    createdAt: '2024-12-01',
    lastModified: '2024-12-20',
    metrics: {
      enabled: 234,
      conversion: 67.8,
      satisfaction: 4.7
    }
  }
]

// Utility function to generate trend data
function generateTrendData(periods, interval = 'daily') {
  const data = []
  for (let i = periods; i >= 0; i--) {
    const date = interval === 'monthly' 
      ? subDays(new Date(), i * 30)
      : subDays(new Date(), i)
    
    data.push({
      date: format(date, interval === 'monthly' ? 'yyyy-MM' : 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 50000) + 100000 + (periods - i) * 2000
    })
  }
  return data
}

// Enhanced Analytics Data with comprehensive metrics
export const generateAdvancedAnalyticsData = () => ({
  traffic: {
    overview: {
      totalRequests: 15678234,
      humanRequests: 11234567,
      botRequests: 4443667,
      blockedRequests: 987456,
      revenue: 78234.50
    },
    hourly: generateHourlyData(),
    daily: generateTrendData(30),
    geographic: [
      { country: 'United States', requests: 5234567, percentage: 33.4 },
      { country: 'United Kingdom', requests: 2345678, percentage: 15.0 },
      { country: 'Germany', requests: 1876543, percentage: 12.0 },
      { country: 'France', requests: 1456789, percentage: 9.3 },
      { country: 'Canada', requests: 1234567, percentage: 7.9 }
    ]
  },
  bots: {
    categories: [
      { name: 'Search Engines', requests: 2345678, percentage: 52.8, revenue: 0 },
      { name: 'AI Trainers', requests: 1234567, percentage: 27.8, revenue: 45678.25 },
      { name: 'Social Media', requests: 567890, percentage: 12.8, revenue: 8934.50 },
      { name: 'Malicious', requests: 295532, percentage: 6.6, revenue: 0 }
    ],
    topBots: [
      { name: 'GoogleBot', requests: 1234567, blocked: 0, revenue: 0 },
      { name: 'GPT-4 Crawler', requests: 567890, blocked: 445678, revenue: 23456.75 },
      { name: 'BingBot', requests: 456789, blocked: 0, revenue: 0 },
      { name: 'Claude Crawler', requests: 234567, blocked: 189045, revenue: 12345.50 }
    ]
  },
  revenue: {
    monthly: generateRevenueData().mrr.trend,
    bySource: [
      { source: 'AI Bot Fees', amount: 45678.25, percentage: 58.4 },
      { source: 'Premium Subscriptions', amount: 23456.75, percentage: 30.0 },
      { source: 'Overage Charges', amount: 8934.50, percentage: 11.4 },
      { source: 'Setup Fees', amount: 165.00, percentage: 0.2 }
    ]
  }
})

function generateHourlyData() {
  const data = []
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      requests: Math.floor(Math.random() * 50000) + 20000,
      bots: Math.floor(Math.random() * 15000) + 5000,
      blocked: Math.floor(Math.random() * 9889) + 500
    })
  }
  return data
}

// Tenant Management Data
export const generateTenantData = () => [
  {
    id: '1',
    name: 'Acme Corporation',
    plan: 'Enterprise',
    status: 'active',
    domains: 15,
    users: 45,
    storage: '2.4 TB',
    bandwidth: '15.7 TB',
    apiCalls: 2456789,
    lastActivity: new Date().toISOString(),
    billing: {
      mrr: 12500,
      nextBilling: '2025-02-01'
    },
    quotas: {
      storage: { used: 2400, limit: 5000, percentage: 48 },
      bandwidth: { used: 15700, limit: 50000, percentage: 31.4 },
      apiCalls: { used: 2456789, limit: 5000000, percentage: 49.1 }
    }
  },
  {
    id: '2',
    name: 'StartupXYZ',
    plan: 'Growth',
    status: 'trial',
    domains: 2,
    users: 3,
    storage: '156 GB',
    bandwidth: '890 GB',
    apiCalls: 145823,
    lastActivity: new Date().toISOString(),
    billing: {
      mrr: 250,
      nextBilling: '2025-01-15'
    },
    quotas: {
      storage: { used: 156, limit: 500, percentage: 31.2 },
      bandwidth: { used: 890, limit: 2000, percentage: 44.5 },
      apiCalls: { used: 145823, limit: 500000, percentage: 29.2 }
    }
  }
]

// Export all generators
export const mockAPI = {
  generateMockClients,
  generateRevenueData,
  generateSystemPerformanceData,
  generateSecurityData,
  generateCommunicationData,
  generateUsageAnalyticsData,
  generateFeatureFlagsData,
  generateAdvancedAnalyticsData,
  generateTenantData
}

export default mockAPI
