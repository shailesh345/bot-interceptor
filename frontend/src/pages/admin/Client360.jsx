import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import TabButton from '../../components/common/TabButton';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import {
  User, Building2, DollarSign, TrendingUp, TrendingDown, Activity,
  Calendar, Clock, Mail, Phone, MapPin, Shield, Zap, Target,
  Users, CreditCard, FileText, MessageSquare, Bell, Settings,
  Eye, Edit, AlertTriangle, CheckCircle, Star, Award,
  BarChart3, PieChart as PieChartIcon, RefreshCw, Download,
  Filter, Search, Plus, ArrowUpRight, ArrowDownRight,
  Globe, Smartphone, Monitor, Headphones, BookOpen, Tag
} from 'lucide-react';

const Client360 = () => {
  const [selectedClient, setSelectedClient] = useState('1');
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock comprehensive client data
  const [clientsData, setClientsData] = useState([
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'admin@acme.com',
      phone: '+1 (555) 123-4567',
      industry: 'Technology',
      size: 'Enterprise',
      tier: 'Enterprise',
      status: 'Active',
      joinDate: '2023-03-15',
      lastActivity: '2024-07-11T10:30:00Z',
      location: 'San Francisco, CA',
      website: 'https://acme.com',
      contactPerson: 'John Smith',
      contractValue: 425000,
      contractEnd: '2025-03-15',
      healthScore: 92,
      riskLevel: 'Low',
      satisfaction: 4.8,
      usage: {
        totalRequests: 2450000,
        dailyAverage: 81666,
        peakHour: '14:00',
        uptime: 99.97,
        errorRate: 0.02,
        bandwidth: 145.7
      },
      billing: {
        mrr: 35416,
        totalSpent: 1275000,
        lastPayment: '2024-07-01',
        nextBilling: '2024-08-01',
        plan: 'Enterprise Pro',
        paymentMethod: 'Credit Card (*4567)'
      },
      support: {
        totalTickets: 23,
        openTickets: 2,
        avgResponseTime: '2.3 hours',
        satisfaction: 4.6,
        lastContact: '2024-07-09'
      },
      features: ['api_access', 'white_label', 'priority_support', 'custom_integrations'],
      integrations: ['Slack', 'Microsoft Teams', 'Salesforce', 'Jira'],
      team: [
        { name: 'John Smith', role: 'Admin', email: 'john@acme.com', lastLogin: '2024-07-11' },
        { name: 'Sarah Johnson', role: 'Developer', email: 'sarah@acme.com', lastLogin: '2024-07-10' },
        { name: 'Mike Wilson', role: 'Manager', email: 'mike@acme.com', lastLogin: '2024-07-08' }
      ]
    },
    {
      id: '2',
      name: 'TechStart Inc',
      email: 'contact@techstart.io',
      phone: '+1 (555) 987-6543',
      industry: 'SaaS',
      size: 'SMB',
      tier: 'Professional',
      status: 'Active',
      joinDate: '2023-08-22',
      lastActivity: '2024-07-11T08:15:00Z',
      location: 'Austin, TX',
      website: 'https://techstart.io',
      contactPerson: 'Emily Chen',
      contractValue: 156000,
      contractEnd: '2024-08-22',
      healthScore: 78,
      riskLevel: 'Medium',
      satisfaction: 4.2,
      usage: {
        totalRequests: 890000,
        dailyAverage: 29666,
        peakHour: '16:00',
        uptime: 99.85,
        errorRate: 0.08,
        bandwidth: 67.3
      },
      billing: {
        mrr: 19889,
        totalSpent: 468000,
        lastPayment: '2024-06-22',
        nextBilling: '2024-07-22',
        plan: 'Professional',
        paymentMethod: 'ACH Transfer'
      },
      support: {
        totalTickets: 45,
        openTickets: 1,
        avgResponseTime: '4.1 hours',
        satisfaction: 4.1,
        lastContact: '2024-07-07'
      },
      features: ['api_access', 'analytics_plus'],
      integrations: ['GitHub', 'Discord', 'Zapier'],
      team: [
        { name: 'Emily Chen', role: 'CEO', email: 'emily@techstart.io', lastLogin: '2024-07-11' },
        { name: 'David Park', role: 'CTO', email: 'david@techstart.io', lastLogin: '2024-07-11' }
      ]
    }
  ]);

  const selectedClientData = clientsData.find(client => client.id === selectedClient) || clientsData[0];

  // Usage analytics data for selected client
  const usageAnalytics = [
    { date: '2024-07-05', requests: 78500, errors: 12, uptime: 99.8 },
    { date: '2024-07-06', requests: 82300, errors: 8, uptime: 99.9 },
    { date: '2024-07-07', requests: 79800, errors: 15, uptime: 99.7 },
    { date: '2024-07-08', requests: 85600, errors: 6, uptime: 100.0 },
    { date: '2024-07-09', requests: 81200, errors: 11, uptime: 99.8 },
    { date: '2024-07-10', requests: 84900, errors: 9, uptime: 99.9 },
    { date: '2024-07-11', requests: 87400, errors: 4, uptime: 100.0 }
  ];

  const revenueHistory = [
    { month: 'Jan', amount: 32000, plan: 'Enterprise Pro' },
    { month: 'Feb', amount: 34500, plan: 'Enterprise Pro' },
    { month: 'Mar', amount: 35416, plan: 'Enterprise Pro' },
    { month: 'Apr', amount: 35416, plan: 'Enterprise Pro' },
    { month: 'May', amount: 37200, plan: 'Enterprise Pro' },
    { month: 'Jun', amount: 35416, plan: 'Enterprise Pro' }
  ];

  const supportTickets = [
    { id: 'T-1234', title: 'API Rate Limit Issues', status: 'Open', priority: 'High', created: '2024-07-10', assignee: 'Sarah Tech' },
    { id: 'T-1235', title: 'Dashboard Loading Slow', status: 'In Progress', priority: 'Medium', created: '2024-07-09', assignee: 'Mike Support' },
    { id: 'T-1236', title: 'Feature Request: Custom Reports', status: 'Closed', priority: 'Low', created: '2024-07-08', assignee: 'Anna Product' },
    { id: 'T-1237', title: 'Billing Question', status: 'Closed', priority: 'Medium', created: '2024-07-07', assignee: 'John Billing' }
  ];

  const healthMetrics = [
    { metric: 'Usage Adoption', value: 92, color: '#10B981' },
    { metric: 'Feature Utilization', value: 78, color: '#3B82F6' },
    { metric: 'Support Satisfaction', value: 88, color: '#F59E0B' },
    { metric: 'Payment Health', value: 95, color: '#8B5CF6' }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <>
      <Helmet>
        <title>Client 360 View - Admin Portal</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">360° Client View</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive client profiles, analytics, and relationship management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {clientsData.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <button
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Client Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClientData.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{selectedClientData.industry}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedClientData.status)}`}>
                      {selectedClientData.status}
                    </span>
                    <span className={`text-sm font-medium ${getRiskColor(selectedClientData.riskLevel)}`}>
                      {selectedClientData.riskLevel} Risk
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthScoreColor(selectedClientData.healthScore)}`}>
                  {selectedClientData.healthScore}
                </div>
                <div className="text-sm text-gray-500">Health Score</div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(selectedClientData.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                    />
                  ))}
                  <span className="ml-1 text-sm text-gray-600">{selectedClientData.satisfaction}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedClientData.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedClientData.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedClientData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a href={selectedClientData.website} className="text-sm text-blue-600 hover:text-blue-800">{selectedClientData.website}</a>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedClientData.contactPerson}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Joined: {selectedClientData.joinDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Contract: ${selectedClientData.contractValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{selectedClientData.tier} Tier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Recurring Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${selectedClientData.billing.mrr.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">+8.5%</span>
                <span className="text-gray-500"> vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Daily Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {selectedClientData.usage.dailyAverage.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{selectedClientData.usage.uptime}%</span>
                <span className="text-gray-500"> uptime</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Support Tickets</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {selectedClientData.support.openTickets} open
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-purple-600 font-medium">{selectedClientData.support.avgResponseTime}</span>
                <span className="text-gray-500"> avg response</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {selectedClientData.team.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-orange-600 font-medium">All active</span>
                <span className="text-gray-500"> users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 flex-wrap">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'usage', name: 'Usage Analytics', icon: Activity },
              { id: 'billing', name: 'Billing & Revenue', icon: CreditCard },
              { id: 'support', name: 'Support History', icon: Headphones },
              { id: 'team', name: 'Team & Access', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm mb-1 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Health Score Breakdown</h3>
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="30%" outerRadius="90%" data={healthMetrics}>
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: metric.color }}></div>
                      <span className="text-sm text-gray-600">{metric.metric}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{metric.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {[
                  { time: '2 hours ago', event: 'API usage spike detected', type: 'info' },
                  { time: '1 day ago', event: 'Payment processed successfully', type: 'success' },
                  { time: '2 days ago', event: 'Support ticket opened', type: 'warning' },
                  { time: '3 days ago', event: 'New team member added', type: 'info' },
                  { time: '5 days ago', event: 'Feature usage increased', type: 'success' },
                  { time: '1 week ago', event: 'Contract renewal discussion', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">{activity.event}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Usage Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Usage Trends</h3>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      name="Requests"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Requests:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Daily Average:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.dailyAverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Peak Hour:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.peakHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Error Rate:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.errorRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Uptime:</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${selectedClientData.usage.uptime}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.uptime}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bandwidth:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.usage.bandwidth} GB</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Integrations</h4>
                <div className="space-y-2">
                  {selectedClientData.integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{integration}</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Revenue History */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue History</h3>
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Current Plan:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.billing.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Monthly Recurring Revenue:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedClientData.billing.mrr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Spent:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedClientData.billing.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Payment:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.billing.lastPayment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Next Billing:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.billing.nextBilling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Method:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.billing.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contract Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contract Value:</span>
                    <span className="text-sm font-medium text-gray-900">${selectedClientData.contractValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contract End:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedClientData.contractEnd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Auto Renewal:</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Support Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Headphones className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{selectedClientData.support.totalTickets}</div>
                    <div className="text-sm text-gray-500">Total Tickets</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{selectedClientData.support.avgResponseTime}</div>
                    <div className="text-sm text-gray-500">Avg Response Time</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{selectedClientData.support.satisfaction}</div>
                    <div className="text-sm text-gray-500">Satisfaction Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tickets */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Support Tickets</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {supportTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{ticket.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.status === 'Open' ? 'bg-red-100 text-red-800' :
                              ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.created}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.assignee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Members */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedClientData.team.map((member, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.lastLogin}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Access & Permissions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedClientData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Client360;
