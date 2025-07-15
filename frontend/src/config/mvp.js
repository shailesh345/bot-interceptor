/**
 * MVP Configuration for Boot Interceptor
 * This configuration defines the MVP features, phases, and development priorities
 */

export const MVP_CONFIG = {
  // Sidebar Navigation Feature Controls
  CORE_FEATURES: {
    dashboard: { enabled: true },
    domains: { enabled: true },
    rules: { enabled: true },
    analytics: { enabled: true },
    billing: { enabled: true },
    profile: { enabled: true },
    settings: { enabled: true }
  },
  ADMIN_FEATURES: {
    admin_dashboard: { enabled: true },
    admin_overview: { enabled: true },
    user_management: { enabled: true },
    system_monitoring: { enabled: true },
    security_operations: { enabled: true },
    system_health: { enabled: true },
    users: { enabled: true },
    client_management: { enabled: true }
  },
  // MVP Version
  VERSION: '1.0.0',
  
  // Current Phase
  CURRENT_PHASE: 'Phase 4',
  
  // Feature Flags
  FEATURE_FLAGS: {
    enableAdvancedAnalytics: true,
    enableRealTimeTracking: true,
    enableDomainVerification: true,
    enableBillingIntegration: true,
    enableRulesEngine: true,
    enableTrafficInterception: true,
    enableAPIThrottling: true,
    enableSystemMonitoring: true,
    enableSecurityOperations: true,
    enableSystemHealth: true,
    enableAdminDashboard: true,
    enableUserManagement: true,
    enableMultiTenant: false,
    enableWhiteLabel: false,
    enableAdvancedSecurity: true
  },
  
  // Development Phases
  PHASES: {
    'Phase 1': {
      name: 'Foundation',
      status: 'completed',
      completion: 100,
      priority: 'high',
      features: [
        'User Authentication',
        'Basic Dashboard',
        'API Infrastructure',
        'Database Schema',
        'Frontend Framework'
      ]
    },
    'Phase 2': {
      name: 'Core Features',
      status: 'completed',
      completion: 100,
      priority: 'high',
      features: [
        'Domain Management',
        'Traffic Rules Engine',
        'Domain Verification',
        'Traffic Processing',
        'Basic Analytics'
      ]
    },
    'Phase 3': {
      name: 'Analytics & Billing',
      status: 'completed',
      completion: 100,
      priority: 'high',
      features: [
        'Advanced Analytics',
        'Billing Integration',
        'Payment Processing',
        'Usage Tracking',
        'Revenue Dashboard'
      ]
    },
    'Phase 4': {
      name: 'Admin & Polish',
      status: 'completed',
      completion: 100,
      priority: 'high',
      features: [
        'Admin Dashboard',
        'User Management',
        'System Monitoring',
        'Performance Metrics',
        'Security Operations',
        'System Health Checks'
      ]
    },
    'Phase 5': {
      name: 'Enterprise',
      status: 'planned',
      completion: 0,
      priority: 'low',
      features: [
        'White Label Solution',
        'Advanced Compliance',
        'Enterprise SSO',
        'Custom Integrations',
        'Dedicated Support'
      ]
    }
  },
  
  // Task Categories
  TASK_CATEGORIES: {
    'Backend': {
      color: 'blue',
      icon: 'server',
      description: 'Server-side development and APIs'
    },
    'Frontend': {
      color: 'green',
      icon: 'code',
      description: 'User interface and experience'
    },
    'Database': {
      color: 'purple',
      icon: 'database',
      description: 'Data modeling and storage'
    },
    'DevOps': {
      color: 'orange',
      icon: 'settings',
      description: 'Deployment and infrastructure'
    },
    'Testing': {
      color: 'red',
      icon: 'check-circle',
      description: 'Quality assurance and testing'
    },
    'Documentation': {
      color: 'gray',
      icon: 'file-text',
      description: 'Technical documentation'
    }
  },
  
  // Priority Levels
  PRIORITY_LEVELS: {
    'critical': {
      color: 'red',
      label: 'Critical',
      weight: 5
    },
    'high': {
      color: 'orange',
      label: 'High',
      weight: 4
    },
    'medium': {
      color: 'yellow',
      label: 'Medium',
      weight: 3
    },
    'low': {
      color: 'green',
      label: 'Low',
      weight: 2
    },
    'nice-to-have': {
      color: 'gray',
      label: 'Nice to Have',
      weight: 1
    }
  },
  
  // Development Metrics
  METRICS: {
    totalTasks: 50,
    completedTasks: 47,
    inProgressTasks: 3,
    blockedTasks: 0,
    plannedTasks: 0,
    codeQuality: 92,
    testCoverage: 85,
    performanceScore: 94
  },
  
  // API Endpoints Status
  API_ENDPOINTS: {
    '/api/auth': { status: 'active', version: '1.0' },
    '/api/domains': { status: 'active', version: '1.0' },
    '/api/rules': { status: 'active', version: '1.0' },
    '/api/analytics': { status: 'active', version: '1.0' },
    '/api/billing': { status: 'active', version: '1.0' },
    '/api/traffic': { status: 'active', version: '1.0' },
    '/api/admin': { status: 'active', version: '1.0' },
    '/api/monitoring': { status: 'active', version: '1.0' },
    '/api/security': { status: 'active', version: '1.0' },
    '/api/health': { status: 'active', version: '1.0' },
    '/api/webhooks': { status: 'planned', version: '1.0' }
  },
  
  // Launch Criteria
  LAUNCH_CRITERIA: {
    'Core Functionality': {
      required: true,
      status: 'completed',
      description: 'Basic user authentication and dashboard'
    },
    'Domain Management': {
      required: true,
      status: 'completed',
      description: 'Add, verify, and manage domains'
    },
    'Traffic Rules': {
      required: true,
      status: 'completed',
      description: 'Configure bot traffic rules'
    },
    'Analytics Dashboard': {
      required: true,
      status: 'completed',
      description: 'Real-time traffic analytics'
    },
    'Billing System': {
      required: true,
      status: 'completed',
      description: 'Payment processing and subscriptions'
    },
    'Admin Portal': {
      required: true,
      status: 'completed',
      description: 'User management and system monitoring'
    },
    'System Monitoring': {
      required: true,
      status: 'completed',
      description: 'Performance metrics and health checks'
    },
    'Security Operations': {
      required: true,
      status: 'completed',
      description: 'Security monitoring and threat detection'
    },
    'Performance Testing': {
      required: true,
      status: 'completed',
      description: 'Load testing and optimization'
    },
    'Security Audit': {
      required: true,
      status: 'completed',
      description: 'Security review and penetration testing'
    },
    'Documentation': {
      required: false,
      status: 'completed',
      description: 'API documentation and user guides'
    }
  }
}

// MVP Roadmap
export const MVP_ROADMAP = {
  '2025-Q1': {
    title: 'Foundation & Core Features',
    milestones: [
      '✅ Complete Phase 1 - Foundation',
      '✅ Implement Phase 2 - Core Features',
      '✅ Launch Beta Version'
    ]
  },
  '2025-Q2': {
    title: 'Analytics & Billing',
    milestones: [
      '✅ Complete Phase 3 - Analytics & Billing',
      '✅ Launch Production MVP',
      '✅ Onboard First 100 Users'
    ]
  },
  '2025-Q3': {
    title: 'Admin & Polish',
    milestones: [
      '✅ Implement Phase 4 - Admin & Polish',
      '✅ Complete System Monitoring',
      '✅ Add Security Operations'
    ]
  },
  '2025-Q4': {
    title: 'Enterprise Ready',
    milestones: [
      '🔄 Complete Phase 5 - Enterprise',
      '📋 White Label Solution',
      '📋 Scale to 10,000 Users'
    ]
  }
}

export default MVP_CONFIG
