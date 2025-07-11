// Comprehensive Mock API for Full SaaS Platform Functionality
import { addDays, subDays, format, startOfMonth, endOfMonth, addHours } from 'date-fns'

// ==================== USER MANAGEMENT ====================
export const generateMockUsers = () => [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acme.com',
    role: 'admin',
    avatar: `https://ui-avatars.com/api/?name=John+Smith&background=3B82F6&color=fff`,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-15T10:30:00Z',
    permissions: ['domains:read', 'domains:write', 'rules:read', 'rules:write', 'analytics:read', 'billing:read'],
    twoFactorEnabled: true,
    loginHistory: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      timestamp: subDays(new Date(), i).toISOString(),
      ip: `192.168.1.${100 + i}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, US',
      success: true
    }))
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@acme.com',
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=Sarah+Wilson&background=10B981&color=fff`,
    status: 'active',
    lastLogin: subDays(new Date(), 1).toISOString(),
    createdAt: '2024-02-20T14:15:00Z',
    permissions: ['domains:read', 'rules:read', 'analytics:read'],
    twoFactorEnabled: false,
    loginHistory: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      timestamp: subDays(new Date(), i * 2).toISOString(),
      ip: `192.168.1.${120 + i}`,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: 'San Francisco, US',
      success: true
    }))
  }
]

// ==================== DOMAIN MANAGEMENT ====================
export const generateMockDomains = () => [
  {
    id: '1',
    name: 'acme.com',
    status: 'verified',
    verificationMethod: 'dns',
    dnsRecord: 'TXT _botinterceptor.acme.com "verification-token-12345"',
    createdAt: '2024-01-15T10:30:00Z',
    verifiedAt: '2024-01-15T11:00:00Z',
    trafficEnabled: true,
    sslEnabled: true,
    cdnEnabled: true,
    rules: 12,
    monthlyRequests: 2847562,
    monthlyBlocked: 89234,
    monthlyRevenue: 15678.50,
    subdomains: ['app.acme.com', 'api.acme.com', 'admin.acme.com'],
    analytics: {
      topBots: [
        { name: 'GPTBot', requests: 45623, blocked: 45623, revenue: 2281.15 },
        { name: 'ClaudeBot', requests: 23451, blocked: 23451, revenue: 1172.55 },
        { name: 'BingBot', requests: 12345, blocked: 0, revenue: 0 }
      ],
      traffic24h: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        requests: Math.floor(Math.random() * 1000) + 500,
        blocked: Math.floor(Math.random() * 200) + 50
      }))
    }
  },
  {
    id: '2',
    name: 'startupxyz.io',
    status: 'pending',
    verificationMethod: 'file',
    verificationFile: 'bot-interceptor-verification.txt',
    createdAt: '2024-12-01T09:15:00Z',
    verifiedAt: null,
    trafficEnabled: false,
    sslEnabled: true,
    cdnEnabled: false,
    rules: 0,
    monthlyRequests: 0,
    monthlyBlocked: 0,
    monthlyRevenue: 0,
    subdomains: [],
    analytics: {
      topBots: [],
      traffic24h: []
    }
  },
  {
    id: '3',
    name: 'globalmedia.com',
    status: 'verified',
    verificationMethod: 'dns',
    dnsRecord: 'TXT _botinterceptor.globalmedia.com "verification-token-67890"',
    createdAt: '2023-08-20T16:45:00Z',
    verifiedAt: '2023-08-20T17:00:00Z',
    trafficEnabled: true,
    sslEnabled: true,
    cdnEnabled: true,
    rules: 8,
    monthlyRequests: 1234567,
    monthlyBlocked: 45678,
    monthlyRevenue: 7890.25,
    subdomains: ['blog.globalmedia.com', 'news.globalmedia.com'],
    analytics: {
      topBots: [
        { name: 'OpenAI GPT', requests: 34567, blocked: 34567, revenue: 1728.35 },
        { name: 'ChatGPT', requests: 8901, blocked: 8901, revenue: 445.05 }
      ],
      traffic24h: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        requests: Math.floor(Math.random() * 800) + 300,
        blocked: Math.floor(Math.random() * 150) + 30
      }))
    }
  }
]

// ==================== BOT RULES MANAGEMENT ====================
export const generateMockRules = () => [
  {
    id: '1',
    name: 'Block AI Training Bots',
    description: 'Block AI training bots and charge premium rates',
    type: 'bot_detection',
    status: 'active',
    priority: 1,
    conditions: [
      {
        id: '1',
        field: 'user_agent',
        operator: 'contains',
        value: 'GPTBot',
        connector: 'OR'
      },
      {
        id: '2',
        field: 'user_agent',
        operator: 'contains',
        value: 'ClaudeBot',
        connector: 'OR'
      },
      {
        id: '3',
        field: 'user_agent',
        operator: 'contains',
        value: 'ChatGPT',
        connector: null
      }
    ],
    actions: [
      {
        id: '1',
        type: 'charge_premium',
        value: '$0.05'
      },
      {
        id: '2',
        type: 'block_request',
        value: true
      },
      {
        id: '3',
        type: 'log_event',
        value: 'ai_bot_blocked'
      }
    ],
    domains: ['acme.com', 'app.acme.com'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-01T14:20:00Z',
    createdBy: 'John Smith',
    hits: 125643,
    revenue: 6282.15,
    lastTriggered: new Date().toISOString(),
    analytics: {
      hits7d: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
        hits: Math.floor(Math.random() * 500) + 100,
        revenue: (Math.random() * 50 + 10).toFixed(2)
      }))
    }
  },
  {
    id: '2',
    name: 'Allow Search Engine Bots',
    description: 'Allow legitimate search engine crawlers',
    type: 'whitelist',
    status: 'active',
    priority: 2,
    conditions: [
      {
        id: '1',
        field: 'user_agent',
        operator: 'contains',
        value: 'Googlebot',
        connector: 'OR'
      },
      {
        id: '2',
        field: 'user_agent',
        operator: 'contains',
        value: 'Bingbot',
        connector: 'OR'
      },
      {
        id: '3',
        field: 'ip_range',
        operator: 'in',
        value: '66.249.64.0/19',
        connector: null
      }
    ],
    actions: [
      {
        id: '1',
        type: 'allow_request',
        value: true
      },
      {
        id: '2',
        type: 'log_event',
        value: 'search_bot_allowed'
      }
    ],
    domains: ['acme.com', 'globalmedia.com'],
    createdAt: '2024-01-20T15:45:00Z',
    updatedAt: '2024-11-15T09:30:00Z',
    createdBy: 'Sarah Wilson',
    hits: 45234,
    revenue: 0,
    lastTriggered: addHours(new Date(), -2).toISOString(),
    analytics: {
      hits7d: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
        hits: Math.floor(Math.random() * 200) + 50,
        revenue: 0
      }))
    }
  },
  {
    id: '3',
    name: 'Rate Limit API Endpoints',
    description: 'Rate limit API requests to prevent abuse',
    type: 'rate_limiting',
    status: 'active',
    priority: 3,
    conditions: [
      {
        id: '1',
        field: 'path',
        operator: 'starts_with',
        value: '/api/',
        connector: 'AND'
      },
      {
        id: '2',
        field: 'requests_per_minute',
        operator: 'greater_than',
        value: '100',
        connector: null
      }
    ],
    actions: [
      {
        id: '1',
        type: 'rate_limit',
        value: '100/minute'
      },
      {
        id: '2',
        type: 'return_status',
        value: '429'
      }
    ],
    domains: ['api.acme.com'],
    createdAt: '2024-02-01T11:20:00Z',
    updatedAt: '2024-10-05T16:15:00Z',
    createdBy: 'John Smith',
    hits: 8765,
    revenue: 0,
    lastTriggered: addHours(new Date(), -1).toISOString(),
    analytics: {
      hits7d: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
        hits: Math.floor(Math.random() * 50) + 10,
        revenue: 0
      }))
    }
  }
]

// ==================== BILLING & SUBSCRIPTION ====================
export const generateMockBilling = () => ({
  currentPlan: {
    id: 'enterprise-pro',
    name: 'Enterprise Pro',
    price: 999,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited domains',
      'Advanced bot detection',
      'Custom rules engine',
      'Real-time analytics',
      'API access',
      'White-label options',
      'Priority support',
      '99.9% SLA'
    ],
    limits: {
      domains: -1, // unlimited
      rules: -1,
      requests: 10000000,
      storage: 1000 // GB
    }
  },
  usage: {
    domains: 3,
    rules: 12,
    requests: 2847562,
    storage: 245.7,
    requestsPercentage: 28.47,
    storagePercentage: 24.57
  },
  billing: {
    nextBillingDate: '2025-02-01T00:00:00Z',
    billingCycle: 'monthly',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2027
    },
    billingAddress: {
      line1: '123 Business St',
      line2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    }
  },
  invoices: Array.from({ length: 12 }, (_, i) => ({
    id: `inv_${String(i + 1).padStart(6, '0')}`,
    number: `INV-2024-${String(i + 1).padStart(4, '0')}`,
    amount: 999 + Math.floor(Math.random() * 200),
    currency: 'USD',
    status: i === 0 ? 'paid' : i === 1 ? 'pending' : 'paid',
    dueDate: format(subDays(new Date(), i * 30), 'yyyy-MM-dd'),
    paidDate: i === 1 ? null : format(subDays(new Date(), i * 30 - 5), 'yyyy-MM-dd'),
    downloadUrl: `#invoice-${i + 1}`,
    items: [
      {
        description: 'Enterprise Pro Plan',
        quantity: 1,
        unitPrice: 999,
        amount: 999
      },
      {
        description: 'Overage Charges',
        quantity: Math.floor(Math.random() * 100),
        unitPrice: 0.001,
        amount: Math.floor(Math.random() * 200)
      }
    ]
  })),
  credits: {
    balance: 15000,
    currency: 'USD',
    history: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      date: subDays(new Date(), i * 3).toISOString(),
      type: i % 3 === 0 ? 'earned' : i % 3 === 1 ? 'spent' : 'bonus',
      amount: i % 3 === 0 ? Math.floor(Math.random() * 100) + 50 : -(Math.floor(Math.random() * 50) + 10),
      description: i % 3 === 0 ? 'Bot blocking revenue' : i % 3 === 1 ? 'API usage charges' : 'Referral bonus',
      balance: 15000 + Math.floor(Math.random() * 5000)
    }))
  },
  paymentMethods: [
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false
    }
  ]
})

// ==================== ANALYTICS DATA ====================
export const generateMockAnalytics = (days = 30) => {
  const trafficData = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i)
    const totalRequests = Math.floor(Math.random() * 10000) + 5000
    const botRequests = Math.floor(totalRequests * 0.3)
    const blockedRequests = Math.floor(botRequests * 0.6)
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalRequests,
      botRequests,
      humanRequests: totalRequests - botRequests,
      blockedRequests,
      allowedRequests: totalRequests - blockedRequests,
      revenue: (blockedRequests * 0.05).toFixed(2),
      avgResponseTime: Math.floor(Math.random() * 200) + 100,
      uptime: 99.5 + Math.random() * 0.5
    }
  })

  const botData = [
    { name: 'GPTBot', requests: 125643, blocked: 125643, revenue: 6282.15, type: 'AI Training' },
    { name: 'ClaudeBot', requests: 89234, blocked: 89234, revenue: 4461.70, type: 'AI Training' },
    { name: 'ChatGPT', requests: 45678, blocked: 45678, revenue: 2283.90, type: 'AI Training' },
    { name: 'GoogleBot', requests: 234567, blocked: 0, revenue: 0, type: 'Search Engine' },
    { name: 'BingBot', requests: 156789, blocked: 0, revenue: 0, type: 'Search Engine' },
    { name: 'Scrapy', requests: 23456, blocked: 23456, revenue: 1172.80, type: 'Scraper' },
    { name: 'Unknown Bot', requests: 12345, blocked: 8641, revenue: 432.05, type: 'Unknown' }
  ]

  return {
    trafficData,
    botData,
    summary: {
      totalRequests: trafficData.reduce((sum, day) => sum + day.totalRequests, 0),
      totalBlocked: trafficData.reduce((sum, day) => sum + day.blockedRequests, 0),
      totalRevenue: trafficData.reduce((sum, day) => sum + parseFloat(day.revenue), 0),
      avgResponseTime: Math.floor(trafficData.reduce((sum, day) => sum + day.avgResponseTime, 0) / trafficData.length),
      uptime: Math.round((trafficData.reduce((sum, day) => sum + day.uptime, 0) / trafficData.length) * 100) / 100
    },
    realTime: {
      requestsPerSecond: Math.floor(Math.random() * 50) + 10,
      activeConnections: Math.floor(Math.random() * 1000) + 200,
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      errorRate: (Math.random() * 2).toFixed(2)
    }
  }
}

// ==================== ADMIN DATA ====================
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
    onboardedAt: '2024-01-15T10:30:00Z',
    lastActivityAt: new Date().toISOString(),
    supportTickets: 12,
    integrations: ['Salesforce', 'HubSpot', 'Slack'],
    features: ['Advanced Analytics', 'Custom Rules', 'API Access', 'White Label'],
    contacts: [
      { name: 'John Smith', role: 'CTO', email: 'john@acme.com', phone: '+1-555-0123' },
      { name: 'Sarah Wilson', role: 'DevOps Lead', email: 'sarah@acme.com', phone: '+1-555-0124' }
    ],
    domains: ['acme.com', 'app.acme.com'],
    billing: {
      method: 'invoice',
      nextBilling: '2025-02-01',
      credits: 15000,
      overageThreshold: 20000,
      paymentStatus: 'current',
      lastPayment: '2025-01-01'
    },
    metrics: {
      totalRequests: 2847562,
      botRequests: 425634,
      blockedRequests: 89234,
      revenue: 15678.50,
      uptime: 99.9,
      avgResponseTime: 145
    },
    communications: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      type: i % 3 === 0 ? 'email' : i % 3 === 1 ? 'call' : 'meeting',
      subject: `Communication ${i + 1}`,
      date: subDays(new Date(), i * 5).toISOString(),
      from: 'Support Team',
      status: 'completed',
      notes: `Notes for communication ${i + 1}`
    }))
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
    onboardedAt: '2024-11-01T09:15:00Z',
    lastActivityAt: subDays(new Date(), 1).toISOString(),
    supportTickets: 3,
    integrations: ['Shopify'],
    features: ['Basic Analytics', 'Standard Rules'],
    contacts: [
      { name: 'Mike Chen', role: 'Founder', email: 'mike@startupxyz.io', phone: '+44-20-7946-0958' }
    ],
    domains: ['startupxyz.io'],
    billing: {
      method: 'card',
      nextBilling: '2025-01-15',
      credits: 2500,
      overageThreshold: 5000,
      paymentStatus: 'current',
      lastPayment: '2024-12-15'
    },
    metrics: {
      totalRequests: 145823,
      botRequests: 23456,
      blockedRequests: 5234,
      revenue: 234.50,
      uptime: 99.5,
      avgResponseTime: 230
    },
    communications: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      type: i % 2 === 0 ? 'email' : 'call',
      subject: `Onboarding support ${i + 1}`,
      date: subDays(new Date(), i * 3).toISOString(),
      from: 'Onboarding Team',
      status: 'completed',
      notes: `Onboarding notes ${i + 1}`
    }))
  }
]

// ==================== SYSTEM PERFORMANCE ====================
export const generateSystemMetrics = () => ({
  servers: Array.from({ length: 5 }, (_, i) => ({
    id: `server-${i + 1}`,
    name: `App Server ${i + 1}`,
    region: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'][i],
    status: i === 2 ? 'warning' : 'healthy',
    cpu: Math.floor(Math.random() * 60) + 20,
    memory: Math.floor(Math.random() * 70) + 15,
    disk: Math.floor(Math.random() * 50) + 10,
    network: Math.floor(Math.random() * 80) + 10,
    uptime: 99.9 - Math.random() * 0.5,
    load: (Math.random() * 2 + 0.5).toFixed(2),
    requests: Math.floor(Math.random() * 1000) + 500
  })),
  databases: [
    {
      id: 'db-primary',
      name: 'Primary Database',
      type: 'PostgreSQL',
      status: 'healthy',
      connections: 45,
      maxConnections: 100,
      queryTime: 12.5,
      size: '245.7 GB',
      backup: 'OK'
    },
    {
      id: 'db-replica',
      name: 'Read Replica',
      type: 'PostgreSQL',
      status: 'healthy',
      connections: 23,
      maxConnections: 100,
      queryTime: 8.3,
      size: '245.7 GB',
      backup: 'OK'
    }
  ],
  cache: {
    redis: {
      status: 'healthy',
      memory: '2.1 GB',
      maxMemory: '4 GB',
      hitRate: 94.5,
      connections: 156
    }
  },
  alerts: [
    {
      id: 1,
      level: 'warning',
      message: 'High CPU usage on server-3',
      timestamp: subDays(new Date(), 0.1).toISOString(),
      resolved: false
    },
    {
      id: 2,
      level: 'info',
      message: 'Database backup completed successfully',
      timestamp: subDays(new Date(), 1).toISOString(),
      resolved: true
    }
  ]
})

// ==================== FEATURE FLAGS ====================
export const generateFeatureFlags = () => [
  {
    id: '1',
    name: 'advanced_analytics_v2',
    description: 'New advanced analytics dashboard with real-time metrics',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'production',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-01T14:20:00Z',
    createdBy: 'Engineering Team',
    targeting: {
      userSegments: ['enterprise', 'premium'],
      countries: ['US', 'UK', 'CA'],
      percentage: 100
    }
  },
  {
    id: '2',
    name: 'ai_bot_detection_ml',
    description: 'Machine learning based AI bot detection',
    enabled: false,
    rolloutPercentage: 25,
    environment: 'staging',
    createdAt: '2024-11-01T09:15:00Z',
    updatedAt: '2024-12-10T16:45:00Z',
    createdBy: 'ML Team',
    targeting: {
      userSegments: ['beta_testers'],
      countries: ['US'],
      percentage: 25
    }
  },
  {
    id: '3',
    name: 'realtime_notifications',
    description: 'Real-time push notifications for critical events',
    enabled: true,
    rolloutPercentage: 75,
    environment: 'production',
    createdAt: '2024-10-01T12:00:00Z',
    updatedAt: '2024-11-15T09:30:00Z',
    createdBy: 'Product Team',
    targeting: {
      userSegments: ['premium', 'enterprise'],
      countries: ['ALL'],
      percentage: 75
    }
  }
]

// Export comprehensive API functions
export const mockAPI = {
  // User Management
  getUsers: () => Promise.resolve(generateMockUsers()),
  getUser: (id) => Promise.resolve(generateMockUsers().find(u => u.id === id)),
  createUser: (userData) => Promise.resolve({ id: Date.now().toString(), ...userData }),
  updateUser: (id, userData) => Promise.resolve({ id, ...userData }),
  deleteUser: (id) => Promise.resolve({ id }),

  // Domain Management
  getDomains: () => Promise.resolve(generateMockDomains()),
  getDomain: (id) => Promise.resolve(generateMockDomains().find(d => d.id === id)),
  createDomain: (domainData) => Promise.resolve({ id: Date.now().toString(), ...domainData }),
  updateDomain: (id, domainData) => Promise.resolve({ id, ...domainData }),
  deleteDomain: (id) => Promise.resolve({ id }),
  verifyDomain: (id) => Promise.resolve({ id, verified: true }),

  // Rules Management
  getRules: () => Promise.resolve(generateMockRules()),
  getRule: (id) => Promise.resolve(generateMockRules().find(r => r.id === id)),
  createRule: (ruleData) => Promise.resolve({ id: Date.now().toString(), ...ruleData }),
  updateRule: (id, ruleData) => Promise.resolve({ id, ...ruleData }),
  deleteRule: (id) => Promise.resolve({ id }),
  testRule: (ruleData) => Promise.resolve({ 
    matches: Math.floor(Math.random() * 100),
    samples: Array.from({ length: 5 }, (_, i) => ({
      userAgent: 'Sample User Agent ' + (i + 1),
      ip: `192.168.1.${i + 1}`,
      path: '/api/endpoint',
      matched: Math.random() > 0.5
    }))
  }),

  // Analytics
  getAnalytics: (days = 30) => Promise.resolve(generateMockAnalytics(days)),
  getDashboardData: () => Promise.resolve({
    ...generateMockAnalytics(7),
    alerts: [
      { id: 1, type: 'warning', message: 'High bot traffic detected', timestamp: new Date().toISOString() },
      { id: 2, type: 'info', message: 'Daily report generated', timestamp: subDays(new Date(), 1).toISOString() }
    ]
  }),

  // Billing
  getBilling: () => Promise.resolve(generateMockBilling()),
  updatePaymentMethod: (methodData) => Promise.resolve({ id: Date.now().toString(), ...methodData }),
  downloadInvoice: (invoiceId) => Promise.resolve({ url: `#invoice-${invoiceId}` }),

  // Admin
  getClients: () => Promise.resolve(generateMockClients()),
  getClient: (id) => Promise.resolve(generateMockClients().find(c => c.id === id)),
  updateClient: (id, clientData) => Promise.resolve({ id, ...clientData }),
  getSystemMetrics: () => Promise.resolve(generateSystemMetrics()),
  getFeatureFlags: () => Promise.resolve(generateFeatureFlags()),
  updateFeatureFlag: (id, flagData) => Promise.resolve({ id, ...flagData })
}

export default mockAPI
