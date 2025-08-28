// Mock data service for development
import { addDays, subDays, format } from 'date-fns'

// Generate mock traffic data
const generateMockTrafficData = (days = 30) => {
  const data = []
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      botRequests: Math.floor(Math.random() * 9889) + 1000,
      humanRequests: Math.floor(Math.random() * 7000) + 9889,
      blockedRequests: Math.floor(Math.random() * 500) + 100,
      revenue: (Math.random() * 100 + 20).toFixed(2),
    })
  }
  return data
}

// Generate mock bot data
const generateMockBotData = () => [
  {
    id: '1',
    name: 'GoogleBot',
    type: 'search_engine',
    requests: 1247,
    blocked: 0,
    revenue: 0,
    lastSeen: new Date().toISOString(),
    isAllowed: true,
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
  {
    id: '2',
    name: 'OpenAI GPT',
    type: 'ai_trainer',
    requests: 892,
    blocked: 734,
    revenue: 45.67,
    lastSeen: new Date().toISOString(),
    isAllowed: false,
    userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  },
  {
    id: '3',
    name: 'BingBot',
    type: 'search_engine',
    requests: 645,
    blocked: 0,
    revenue: 0,
    lastSeen: new Date().toISOString(),
    isAllowed: true,
    userAgent: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  },
  {
    id: '4',
    name: 'Generic Scraper',
    type: 'scraper',
    requests: 1456,
    blocked: 1456,
    revenue: 0,
    lastSeen: new Date().toISOString(),
    isAllowed: false,
    userAgent: 'python-requests/2.28.1',
  },
  {
    id: '5',
    name: 'Claude Bot',
    type: 'ai_trainer',
    requests: 523,
    blocked: 412,
    revenue: 23.45,
    lastSeen: new Date().toISOString(),
    isAllowed: false,
    userAgent: 'Mozilla/5.0 (compatible; Claude-Web/1.0; +https://claude.ai)',
  },
]

// Generate mock geographic data
const generateMockGeographicData = () => [
  { country: 'United States', code: 'US', requests: 4567, percentage: 35.2 },
  { country: 'United Kingdom', code: 'GB', requests: 2341, percentage: 18.1 },
  { country: 'Germany', code: 'DE', requests: 1876, percentage: 14.5 },
  { country: 'France', code: 'FR', requests: 1234, percentage: 9.5 },
  { country: 'Canada', code: 'CA', requests: 987, percentage: 7.6 },
  { country: 'Australia', code: 'AU', requests: 765, percentage: 5.9 },
  { country: 'Japan', code: 'JP', requests: 654, percentage: 5.1 },
  { country: 'Netherlands', code: 'NL', requests: 543, percentage: 4.2 },
]

// Generate mock domains
const generateMockDomains = () => [
  {
    id: '1',
    name: 'example.com',
    status: 'active',
    isVerified: true,
    sslEnabled: true,
    totalRequests: 12547,
    botRequests: 3456,
    blockedRequests: 234,
    revenue: 567.89,
    createdAt: '2024-01-15T10:30:00Z',
    lastActivity: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'mywebsite.org',
    status: 'active',
    isVerified: true,
    sslEnabled: true,
    totalRequests: 8934,
    botRequests: 2123,
    blockedRequests: 156,
    revenue: 234.56,
    createdAt: '2024-02-20T14:15:00Z',
    lastActivity: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '3',
    name: 'testsite.net',
    status: 'pending',
    isVerified: false,
    sslEnabled: false,
    totalRequests: 0,
    botRequests: 0,
    blockedRequests: 0,
    revenue: 0,
    createdAt: '2024-03-10T09:45:00Z',
    lastActivity: null,
  },
]

// Generate mock rules
const generateMockRules = () => [
  {
    id: '1',
    name: 'Block AI Training Bots',
    description: 'Block all AI training bots and charge access fee',
    type: 'bot_detection',
    isActive: true,
    priority: 1,
    conditions: {
      userAgentPatterns: ['GPTBot', 'Claude-Web', 'ChatGPT'],
      botTypes: ['ai_trainer'],
    },
    actions: {
      action: 'block_and_charge',
      fee: 0.05,
      message: 'AI training access requires payment',
    },
    matchedRequests: 1234,
    revenue: 61.70,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Allow Search Engines',
    description: 'Allow legitimate search engine crawlers',
    type: 'bot_detection',
    isActive: true,
    priority: 2,
    conditions: {
      userAgentPatterns: ['Googlebot', 'bingbot', 'DuckDuckBot'],
      botTypes: ['search_engine'],
    },
    actions: {
      action: 'allow',
      message: 'Search engine crawler allowed',
    },
    matchedRequests: 5678,
    revenue: 0,
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '3',
    name: 'Rate Limit Unknown Bots',
    description: 'Apply rate limiting to unknown bot traffic',
    type: 'rate_limit',
    isActive: true,
    priority: 3,
    conditions: {
      isBot: true,
      isUnknown: true,
    },
    actions: {
      action: 'rate_limit',
      requests_per_minute: 10,
      message: 'Rate limit applied',
    },
    matchedRequests: 892,
    revenue: 0,
    createdAt: '2024-02-01T16:20:00Z',
  },
]

// Generate mock analytics data
const generateMockAnalyticsData = () => ({
  overview: {
    totalRequests: 125432,
    botTraffic: 23456,
    humanTraffic: 101976,
    blockedRequests: 5432,
    revenue: 1234.56,
    averageResponseTime: 245,
    uptime: 99.8,
  },
  timeSeriesData: generateMockTrafficData(30),
  topBots: generateMockBotData(),
  geographicData: generateMockGeographicData(),
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    requests: Math.floor(Math.random() * 1000) + 200,
    bots: Math.floor(Math.random() * 300) + 50,
  })),
  recentActivity: [
    {
      id: '1',
      type: 'blocked',
      message: 'Blocked AI training bot from 192.168.1.1',
      timestamp: new Date().toISOString(),
      details: { ip: '192.168.1.1', userAgent: 'GPTBot/1.0', domain: 'example.com' },
    },
    {
      id: '2',
      type: 'allowed',
      message: 'Allowed GoogleBot to crawl example.com',
      timestamp: subDays(new Date(), 0.1).toISOString(),
      details: { ip: '66.249.66.1', userAgent: 'Googlebot/2.1', domain: 'example.com' },
    },
    {
      id: '3',
      type: 'revenue',
      message: 'Generated $2.50 from AI bot access fee',
      timestamp: subDays(new Date(), 0.2).toISOString(),
      details: { amount: 2.50, domain: 'example.com', bot: 'Claude-Web' },
    },
    {
      id: '4',
      type: 'blocked',
      message: 'Blocked suspicious scraper from 203.0.113.1',
      timestamp: subDays(new Date(), 0.3).toISOString(),
      details: { ip: '203.0.113.1', userAgent: 'python-requests/2.28.1', domain: 'mywebsite.org' },
    },
    {
      id: '5',
      type: 'allowed',
      message: 'Allowed BingBot to crawl mywebsite.org',
      timestamp: subDays(new Date(), 0.4).toISOString(),
      details: { ip: '40.77.167.1', userAgent: 'bingbot/2.0', domain: 'mywebsite.org' },
    },
  ],
})

// Generate mock billing data
const generateMockBillingData = () => ({
  subscription: {
    id: 'sub_1234567890',
    planName: 'Professional',
    status: 'active',
    currentPeriodStart: '2024-03-01T00:00:00Z',
    currentPeriodEnd: '2024-04-01T00:00:00Z',
    amount: 99.00,
    currency: 'USD',
    intervalCount: 1,
    interval: 'month',
    nextBilling: '2024-04-01T00:00:00Z',
    usage: {
      requests: 125432,
      limit: 1000000,
      overageRate: 0.001,
    },
  },
  invoices: [
    {
      id: 'inv_1234567890',
      number: 'INV-2024-001',
      status: 'paid',
      amount: 99.00,
      currency: 'USD',
      created: '2024-03-01T00:00:00Z',
      dueDate: '2024-03-01T00:00:00Z',
      paidDate: '2024-03-01T00:00:00Z',
      description: 'Professional Plan - March 2024',
    },
    {
      id: 'inv_1234567891',
      number: 'INV-2024-002',
      status: 'paid',
      amount: 99.00,
      currency: 'USD',
      created: '2024-02-01T00:00:00Z',
      dueDate: '2024-02-01T00:00:00Z',
      paidDate: '2024-02-01T00:00:00Z',
      description: 'Professional Plan - February 2024',
    },
  ],
  paymentMethods: [
    {
      id: 'pm_1234567890',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
      },
      isDefault: true,
    },
  ],
})

// Generate mock user data
const generateMockUserData = () => ({
  id: 'user_1234567890',
  email: 'john.doe@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin',
  isVerified: true,
  createdAt: '2024-01-15T10:30:00Z',
  lastLogin: new Date().toISOString(),
  tenant: {
    id: 'tenant_1234567890',
    name: "John's Organization",
    slug: 'johndoe-org',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
})

// User profile and admin mock data
const mockAPI = {
  // Dashboard
  getDashboardStats: async (timeRange = '7d') => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    return { data: generateMockAnalyticsData().overview }
  },

  // Domains
  getDomains: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { data: { domains: generateMockDomains() } }
  },

  createDomain: async (domainData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newDomain = {
      id: Date.now().toString(),
      name: domainData.domain_name,
      status: 'pending',
      isVerified: false,
      sslEnabled: false,
      totalRequests: 0,
      botRequests: 0,
      blockedRequests: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      lastActivity: null,
    }
    return { data: { domain: newDomain } }
  },

  // Rules
  getRules: async (domainId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { data: { rules: generateMockRules() } }
  },

  createRule: async (domainId, ruleData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newRule = {
      id: Date.now().toString(),
      name: ruleData.name,
      description: ruleData.description,
      type: ruleData.type,
      isActive: true,
      priority: ruleData.priority || 1,
      conditions: ruleData.conditions,
      actions: ruleData.actions,
      matchedRequests: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
    }
    return { data: { rule: newRule } }
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { data: generateMockAnalyticsData() }
  },

  // Billing
  getBilling: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { data: generateMockBillingData() }
  },

  // User
  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { data: { user: generateMockUserData() } }
  },

  // Authentication
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Allow both demo and admin logins
    if (
      (credentials.email === 'demo@example.com' && credentials.password === 'password') ||
      (credentials.email === 'admin@example.com' && credentials.password === 'password')
    ) {
      // Return super_admin for admin@example.com, admin for demo@example.com
      const role = credentials.email === 'admin@example.com' ? 'super_admin' : 'admin';
      return {
        data: {
          user: {
            ...generateMockUserData(),
            email: credentials.email,
            role,
            firstName: role === 'super_admin' ? 'Super' : 'John',
            lastName: role === 'super_admin' ? 'Admin' : 'Doe',
          },
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
        }
      }
    }
    throw new Error('Invalid credentials')
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newUser = {
      ...generateMockUserData(),
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
    }
    return {
      data: {
        user: newUser,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }
    }
  },

  // User profile and admin mock data
  fetchUserProfile: async () => {
    return {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      organization: 'Acme Corp',
      createdAt: '2024-01-01',
    }
  },
  updateUserProfile: async (profileData) => {
    return { ...profileData }
  },
  fetchAdminData: async () => {
    return {
      users: [
        { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
        { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      ],
      settings: {
        allowSignups: true,
        maxTenants: 10,
      },
    }
  },
}

export default mockAPI
