import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Flag, ToggleLeft, ToggleRight, Users, Target, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Eye,
  Edit, Trash2, Plus, Filter, Download, RefreshCw,
  Settings, Code, Globe, Zap, BarChart3, Calendar,
  UserCheck, Shield, Beaker, Split, Percent
} from 'lucide-react';

const FeatureFlags = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [refreshing, setRefreshing] = useState(false);

  // Mock feature flags data
  const [featureFlags, setFeatureFlags] = useState([
    {
      id: 1,
      name: 'new_dashboard_ui',
      displayName: 'New Dashboard UI',
      description: 'Enable the redesigned dashboard interface with improved analytics',
      status: 'active',
      environment: 'production',
      rolloutPercentage: 75,
      targetUsers: 3420,
      impressions: 45230,
      conversions: 2876,
      conversionRate: 6.35,
      createdAt: '2024-06-01',
      lastModified: '2024-07-10',
      owner: 'UI Team',
      type: 'release',
      conditions: [
        { type: 'user_segment', value: 'beta_users' },
        { type: 'geography', value: 'US,CA,UK' }
      ]
    },
    {
      id: 2,
      name: 'advanced_analytics',
      displayName: 'Advanced Analytics',
      description: 'Premium analytics features for enterprise customers',
      status: 'active',
      environment: 'production',
      rolloutPercentage: 100,
      targetUsers: 856,
      impressions: 12450,
      conversions: 734,
      conversionRate: 5.89,
      createdAt: '2024-05-15',
      lastModified: '2024-07-08',
      owner: 'Analytics Team',
      type: 'experiment',
      conditions: [
        { type: 'subscription_tier', value: 'enterprise,pro' }
      ]
    },
    {
      id: 3,
      name: 'mobile_app_v2',
      displayName: 'Mobile App V2',
      description: 'Next generation mobile application with enhanced performance',
      status: 'testing',
      environment: 'staging',
      rolloutPercentage: 25,
      targetUsers: 156,
      impressions: 2340,
      conversions: 89,
      conversionRate: 3.80,
      createdAt: '2024-07-01',
      lastModified: '2024-07-11',
      owner: 'Mobile Team',
      type: 'release',
      conditions: [
        { type: 'device_type', value: 'mobile' },
        { type: 'app_version', value: '>=2.5.0' }
      ]
    },
    {
      id: 4,
      name: 'ai_recommendations',
      displayName: 'AI Recommendations',
      description: 'Machine learning powered content recommendations',
      status: 'paused',
      environment: 'production',
      rolloutPercentage: 0,
      targetUsers: 0,
      impressions: 8930,
      conversions: 267,
      conversionRate: 2.99,
      createdAt: '2024-06-20',
      lastModified: '2024-07-05',
      owner: 'ML Team',
      type: 'experiment',
      conditions: [
        { type: 'user_activity', value: 'high_engagement' }
      ]
    },
    {
      id: 5,
      name: 'dark_mode',
      displayName: 'Dark Mode Theme',
      description: 'Dark theme option for improved user experience',
      status: 'active',
      environment: 'production',
      rolloutPercentage: 90,
      targetUsers: 7832,
      impressions: 95670,
      conversions: 6234,
      conversionRate: 6.52,
      createdAt: '2024-04-10',
      lastModified: '2024-07-09',
      owner: 'Design Team',
      type: 'killswitch',
      conditions: [
        { type: 'user_preference', value: 'dark_theme_enabled' }
      ]
    },
    {
      id: 6,
      name: 'payment_gateway_v3',
      displayName: 'Payment Gateway V3',
      description: 'Updated payment processing with enhanced security',
      status: 'testing',
      environment: 'staging',
      rolloutPercentage: 15,
      targetUsers: 45,
      impressions: 567,
      conversions: 34,
      conversionRate: 6.00,
      createdAt: '2024-07-05',
      lastModified: '2024-07-11',
      owner: 'Payments Team',
      type: 'release',
      conditions: [
        { type: 'user_tier', value: 'enterprise' },
        { type: 'feature_access', value: 'payment_beta' }
      ]
    }
  ]);

  // Analytics data for charts
  const performanceData = [
    { date: '2024-07-05', impressions: 8500, conversions: 425, conversionRate: 5.0 },
    { date: '2024-07-06', impressions: 9200, conversions: 506, conversionRate: 5.5 },
    { date: '2024-07-07', impressions: 8800, conversions: 475, conversionRate: 5.4 },
    { date: '2024-07-08', impressions: 9600, conversions: 576, conversionRate: 6.0 },
    { date: '2024-07-09', impressions: 10200, conversions: 663, conversionRate: 6.5 },
    { date: '2024-07-10', impressions: 11000, conversions: 770, conversionRate: 7.0 },
    { date: '2024-07-11', impressions: 10800, conversions: 734, conversionRate: 6.8 }
  ];

  const flagTypeDistribution = [
    { type: 'Release Flags', count: 3, percentage: 50 },
    { type: 'Experiments', count: 2, percentage: 33.3 },
    { type: 'Kill Switches', count: 1, percentage: 16.7 }
  ];

  const environmentStats = [
    { environment: 'Production', active: 3, testing: 0, paused: 1 },
    { environment: 'Staging', active: 0, testing: 2, paused: 0 },
    { environment: 'Development', active: 1, testing: 1, paused: 0 }
  ];

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
    const matchesEnvironment = environmentFilter === 'all' || flag.environment === environmentFilter;
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const handleToggleFlag = (flagId) => {
    setFeatureFlags(flags => flags.map(flag => {
      if (flag.id === flagId) {
        const newStatus = flag.status === 'active' ? 'paused' : 'active';
        return { ...flag, status: newStatus, lastModified: new Date().toISOString().split('T')[0] };
      }
      return flag;
    }));
  };

  const openModal = (type, flag = null) => {
    setModalType(type);
    setSelectedFlag(flag);
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing': return <Beaker className="h-4 w-4 text-yellow-500" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'release': return <Flag className="h-4 w-4 text-blue-500" />;
      case 'experiment': return <Split className="h-4 w-4 text-purple-500" />;
      case 'killswitch': return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <>
      <Helmet>
        <title>Feature Flags Management - Admin Portal</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Flags Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Control feature rollouts, A/B testing, and system configurations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Flag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Flags</dt>
                    <dd className="text-lg font-medium text-gray-900">{featureFlags.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Flags</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {featureFlags.filter(f => f.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Users Targeted</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {featureFlags.reduce((sum, flag) => sum + flag.targetUsers, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Percent className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Conversion</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(featureFlags.reduce((sum, flag) => sum + flag.conversionRate, 0) / featureFlags.length).toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Flag Performance Trends</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="impressions" fill="#3B82F6" name="Impressions" />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10B981" strokeWidth={3} name="Conversion Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flag Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Flag Type Distribution</h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flagTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {flagTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="testing">Testing</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        {/* Feature Flags Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Flags</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rollout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFlags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(flag.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{flag.displayName}</div>
                            <div className="text-sm text-gray-500">{flag.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(flag.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            flag.status === 'active' ? 'bg-green-100 text-green-800' :
                            flag.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {flag.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          flag.environment === 'production' ? 'bg-red-100 text-red-800' :
                          flag.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {flag.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${flag.rolloutPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{flag.rolloutPercentage}%</span>
                        </div>
                        <div className="text-xs text-gray-500">{flag.targetUsers.toLocaleString()} users</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{flag.conversionRate}%</div>
                        <div className="text-xs text-gray-500">{flag.conversions.toLocaleString()} conversions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flag.owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleFlag(flag.id)}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                            flag.status === 'active' 
                              ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {flag.status === 'active' ? (
                            <>
                              <ToggleRight className="h-3 w-3 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openModal('edit', flag)}
                          className="text-blue-600 hover:text-blue-900"
                        >
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

        {/* Environment Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {environmentStats.map((env, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{env.environment}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active:</span>
                    <span className="font-medium text-green-600">{env.active}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Testing:</span>
                    <span className="font-medium text-yellow-600">{env.testing}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paused:</span>
                    <span className="font-medium text-red-600">{env.paused}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureFlags;
