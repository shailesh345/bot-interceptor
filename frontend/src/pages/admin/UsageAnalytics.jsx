import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Activity, BarChart3, TrendingUp, TrendingDown, Users, Server,
  Cpu, HardDrive, Database, Globe, Zap, Clock, AlertTriangle,
  CheckCircle, Filter, Download, RefreshCw, Search, Calendar,
  Monitor, Wifi, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';

const UsageAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('requests');
  const [filterTenant, setFilterTenant] = useState('all');

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 1248,
    requestsPerSecond: 342,
    responseTime: 145,
    errorRate: 0.02,
    bandwidth: 2.4,
    cpuUsage: 68,
    memoryUsage: 72,
    diskUsage: 45
  });

  const [usageData, setUsageData] = useState([
    { time: '00:00', requests: 15420, users: 892, bandwidth: 1.2, errors: 3 },
    { time: '04:00', requests: 8930, users: 421, bandwidth: 0.8, errors: 1 },
    { time: '08:00', requests: 24680, users: 1456, bandwidth: 2.1, errors: 5 },
    { time: '12:00', requests: 32150, users: 1823, bandwidth: 2.8, errors: 8 },
    { time: '16:00', requests: 28900, users: 1634, bandwidth: 2.5, errors: 6 },
    { time: '20:00', requests: 21340, users: 1234, bandwidth: 1.9, errors: 4 }
  ]);

  const [tenantUsage, setTenantUsage] = useState([
    {
      id: 'TNT-001',
      name: 'Enterprise Corp',
      requests: 156780,
      requestsLimit: 200000,
      bandwidth: 12.4,
      bandwidthLimit: 20.0,
      storage: 850,
      storageLimit: 1000,
      users: 1250,
      usersLimit: 2000,
      apiCalls: 89342,
      apiLimit: 100000,
      status: 'normal'
    },
    {
      id: 'TNT-002',
      name: 'TechStart Inc',
      requests: 42150,
      requestsLimit: 50000,
      bandwidth: 3.2,
      bandwidthLimit: 5.0,
      storage: 245,
      storageLimit: 250,
      users: 85,
      usersLimit: 100,
      apiCalls: 23456,
      apiLimit: 98890,
      status: 'warning'
    },
    {
      id: 'TNT-003',
      name: 'Global Solutions',
      requests: 78920,
      requestsLimit: 100000,
      bandwidth: 6.8,
      bandwidthLimit: 10.0,
      storage: 480,
      storageLimit: 500,
      users: 320,
      usersLimit: 500,
      apiCalls: 45123,
      apiLimit: 60000,
      status: 'critical'
    },
    {
      id: 'TNT-004',
      name: 'Digital Dynamics',
      requests: 124560,
      requestsLimit: 150000,
      bandwidth: 9.2,
      bandwidthLimit: 15.0,
      storage: 650,
      storageLimit: 1000,
      users: 890,
      usersLimit: 1500,
      apiCalls: 67890,
      apiLimit: 80000,
      status: 'normal'
    }
  ]);

  const [resourceAlerts, setResourceAlerts] = useState([
    {
      id: 'ALT-001',
      tenant: 'TechStart Inc',
      resource: 'Storage',
      usage: 98,
      threshold: 90,
      severity: 'critical',
      timestamp: '2024-12-19 15:30:22'
    },
    {
      id: 'ALT-002',
      tenant: 'Global Solutions',
      resource: 'Bandwidth',
      usage: 85,
      threshold: 80,
      severity: 'warning',
      timestamp: '2024-12-19 14:45:15'
    },
    {
      id: 'ALT-003',
      tenant: 'Enterprise Corp',
      resource: 'API Calls',
      usage: 92,
      threshold: 90,
      severity: 'warning',
      timestamp: '2024-12-19 13:20:08'
    }
  ]);

  const [topEndpoints, setTopEndpoints] = useState([
    { endpoint: '/api/v1/authenticate', requests: 45230, avgResponse: 120, errors: 12 },
    { endpoint: '/api/v1/users', requests: 34560, avgResponse: 85, errors: 8 },
    { endpoint: '/api/v1/traffic/analyze', requests: 28940, avgResponse: 340, errors: 15 },
    { endpoint: '/api/v1/rules/validate', requests: 23450, avgResponse: 95, errors: 3 },
    { endpoint: '/api/v1/billing/invoice', requests: 18760, avgResponse: 180, errors: 7 }
  ]);

  const [geographicData, setGeographicData] = useState([
    { region: 'North America', requests: 142350, percentage: 45.2, users: 892 },
    { region: 'Europe', requests: 98760, percentage: 31.4, users: 612 },
    { region: 'Asia Pacific', requests: 56420, percentage: 17.9, users: 324 },
    { region: 'South America', requests: 12480, percentage: 4.0, users: 89 },
    { region: 'Africa', requests: 4670, percentage: 1.5, users: 34 }
  ]);

  const getUsageColor = (usage, limit) => {
    const percentage = (usage / limit) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getUsagePercentage = (usage, limit) => {
    return Math.round((usage / limit) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <>
      <Helmet>
        <title>Usage Analytics - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive usage monitoring, resource tracking, and performance analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% from last hour
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Requests/sec</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.requestsPerSecond}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.responseTime}ms</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -12ms from baseline
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.errorRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Below threshold
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Usage Trends</h3>
              <p className="mt-1 text-sm text-gray-600">
                Real-time usage patterns and traffic analysis
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="requests" stackId="1" 
                        stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Line yAxisId="right" type="monotone" dataKey="users" stroke="#ff7300" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
              <p className="mt-1 text-sm text-gray-600">
                Usage patterns by geographic region
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {geographicData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{region.region}</p>
                        <p className="text-xs text-gray-500">{region.users} active users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatNumber(region.requests)}</p>
                      <p className="text-xs text-gray-500">{region.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Usage Overview */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Tenant Usage Overview</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Resource consumption by tenant organization
                </p>
              </div>
              <select
                value={filterTenant}
                onChange={(e) => setFilterTenant(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tenants</option>
                <option value="enterprise">Enterprise Only</option>
                <option value="warning">Above Threshold</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bandwidth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantUsage.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.id}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(tenant.requests)}/{formatNumber(tenant.requestsLimit)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getUsageColor(tenant.requests, tenant.requestsLimit).includes('red') ? 'bg-red-500' : 
                            getUsageColor(tenant.requests, tenant.requestsLimit).includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${getUsagePercentage(tenant.requests, tenant.requestsLimit)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getUsagePercentage(tenant.requests, tenant.requestsLimit)}% used
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.bandwidth}GB/{tenant.bandwidthLimit}GB
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getUsageColor(tenant.bandwidth, tenant.bandwidthLimit).includes('red') ? 'bg-red-500' : 
                            getUsageColor(tenant.bandwidth, tenant.bandwidthLimit).includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${getUsagePercentage(tenant.bandwidth, tenant.bandwidthLimit)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getUsagePercentage(tenant.bandwidth, tenant.bandwidthLimit)}% used
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.storage}GB/{tenant.storageLimit}GB
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getUsageColor(tenant.storage, tenant.storageLimit).includes('red') ? 'bg-red-500' : 
                            getUsageColor(tenant.storage, tenant.storageLimit).includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${getUsagePercentage(tenant.storage, tenant.storageLimit)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getUsagePercentage(tenant.storage, tenant.storageLimit)}% used
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.users}/{tenant.usersLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getUsageColor(tenant.users, tenant.usersLimit).includes('red') ? 'bg-red-500' : 
                            getUsageColor(tenant.users, tenant.usersLimit).includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${getUsagePercentage(tenant.users, tenant.usersLimit)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getUsagePercentage(tenant.users, tenant.usersLimit)}% used
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Configure Limits">
                        <Monitor className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resource Alerts & Top Endpoints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resource Alerts</h3>
              <p className="mt-1 text-sm text-gray-600">
                Current usage alerts and threshold warnings
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {resourceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.tenant} - {alert.resource}
                      </p>
                      <p className="text-sm text-gray-600">
                        Usage at {alert.usage}% (threshold: {alert.threshold}%)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top API Endpoints</h3>
              <p className="mt-1 text-sm text-gray-600">
                Most frequently accessed endpoints
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topEndpoints.map((endpoint, index) => (
                  <div key={endpoint.endpoint} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{endpoint.endpoint}</p>
                        <p className="text-xs text-gray-500">{formatNumber(endpoint.requests)} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{endpoint.avgResponse}ms</p>
                      <p className="text-xs text-red-600">{endpoint.errors} errors</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
            <p className="mt-1 text-sm text-gray-600">
              Real-time system resource utilization
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray={`${realTimeMetrics.cpuUsage}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">{realTimeMetrics.cpuUsage}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                  <p className="text-xs text-gray-500">8 cores available</p>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-20 h-20 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={`${realTimeMetrics.memoryUsage}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">{realTimeMetrics.memoryUsage}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Memory</p>
                  <p className="text-xs text-gray-500">32GB total</p>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-20 h-20 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeDasharray={`${realTimeMetrics.diskUsage}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">{realTimeMetrics.diskUsage}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Disk Usage</p>
                  <p className="text-xs text-gray-500">2TB SSD</p>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-20 h-20 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeDasharray={`${(realTimeMetrics.bandwidth / 10) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-900">{realTimeMetrics.bandwidth}GB</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">Bandwidth</p>
                  <p className="text-xs text-gray-500">10GB/s capacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsageAnalytics;
