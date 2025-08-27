import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import TabButton from '../../components/common/TabButton';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, Activity,
  Eye, BarChart3, PieChart as PieChartIcon, Calendar, Filter,
  Download, RefreshCw, AlertTriangle, CheckCircle, Zap,
  ArrowUpRight, ArrowDownRight, Building2, Globe, Clock,
  CreditCard, ShoppingCart, UserCheck, Award, Briefcase
} from 'lucide-react';

const BIDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Comprehensive mock data for Business Intelligence
  const [businessData, setBusinessData] = useState({
    kpis: {
      totalRevenue: 2847500,
      revenueGrowth: 23.5,
      totalCustomers: 1247,
      customerGrowth: 18.2,
      churnRate: 2.1,
      churnChange: -0.8,
      avgCustomerValue: 2284,
      avgValueChange: 12.4,
      monthlyRecurringRevenue: 189500,
      mrrGrowth: 15.7,
      customerLifetimeValue: 14250,
      cltv_change: 8.9
    },
    revenueMetrics: [
      { month: 'Jan', revenue: 245000, customers: 1050, arr: 2940000 },
      { month: 'Feb', revenue: 268000, customers: 1089, arr: 3216000 },
      { month: 'Mar', revenue: 289000, customers: 1134, arr: 3468000 },
      { month: 'Apr', revenue: 312000, customers: 1167, arr: 3744000 },
      { month: 'May', revenue: 334000, customers: 1198, arr: 4008000 },
      { month: 'Jun', revenue: 356000, customers: 1247, arr: 4272000 }
    ],
    customerSegments: [
      { segment: 'Enterprise', customers: 89, revenue: 1425000, percentage: 50.1 },
      { segment: 'SMB', customers: 347, revenue: 854000, percentage: 30.0 },
      { segment: 'Startup', customers: 583, revenue: 398500, percentage: 14.0 },
      { segment: 'Trial', customers: 228, revenue: 170000, percentage: 5.9 }
    ],
    productMetrics: [
      { product: 'Basic Plan', subscribers: 587, revenue: 293500, growth: 12.3 },
      { product: 'Pro Plan', subscribers: 423, revenue: 1057500, growth: 18.7 },
      { product: 'Enterprise', subscribers: 128, revenue: 1280000, growth: 25.4 },
      { product: 'API Access', subscribers: 89, revenue: 216500, growth: 32.1 }
    ],
    cohortAnalysis: [
      { cohort: 'Jan 2024', month0: 100, month1: 92, month2: 87, month3: 83, month4: 79, month5: 76 },
      { cohort: 'Feb 2024', month0: 100, month1: 94, month2: 89, month3: 85, month4: 81, month5: 78 },
      { cohort: 'Mar 2024', month0: 100, month1: 96, month2: 91, month3: 87, month4: 84, month5: 80 },
      { cohort: 'Apr 2024', month0: 100, month1: 95, month2: 90, month3: 86, month4: 82 },
      { cohort: 'May 2024', month0: 100, month1: 97, month2: 93, month3: 89 },
      { cohort: 'Jun 2024', month0: 100, month1: 98, month2: 94 }
    ],
    geographicRevenue: [
      { region: 'North America', revenue: 1423800, percentage: 50.0, customers: 623 },
      { region: 'Europe', revenue: 854280, percentage: 30.0, customers: 374 },
      { region: 'Asia Pacific', revenue: 398020, percentage: 14.0, customers: 187 },
      { region: 'Other', revenue: 171400, percentage: 6.0, customers: 63 }
    ],
    topClients: [
      { name: 'Acme Corp', revenue: 425000, tier: 'Enterprise', growth: 23.5, risk: 'Low' },
      { name: 'TechStart Inc', revenue: 298000, tier: 'Enterprise', growth: 18.2, risk: 'Medium' },
      { name: 'Global Solutions', revenue: 267000, tier: 'Enterprise', growth: 31.7, risk: 'Low' },
      { name: 'Innovation Labs', revenue: 234000, tier: 'Pro', growth: 15.8, risk: 'Low' },
      { name: 'Digital Dynamics', revenue: 198000, tier: 'Pro', growth: 8.9, risk: 'Medium' }
    ]
  });

  useEffect(() => {
    // Simulate data refresh
    if (refreshing) {
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercentage = (value) => `${value}%`;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <>
      <Helmet>
        <title>Business Intelligence Dashboard - Admin Portal</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive business analytics and key performance indicators
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 flex-wrap">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'revenue', name: 'Revenue Analytics', icon: DollarSign },
              { id: 'customers', name: 'Customer Insights', icon: Users },
              { id: 'products', name: 'Product Performance', icon: ShoppingCart },
              { id: 'geographic', name: 'Geographic Analysis', icon: Globe }
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

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(businessData.kpis.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{businessData.kpis.revenueGrowth}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {businessData.kpis.totalCustomers.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{businessData.kpis.customerGrowth}%</span>
                <span className="text-gray-500 ml-1">growth rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Churn Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatPercentage(businessData.kpis.churnRate)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{businessData.kpis.churnChange}%</span>
                <span className="text-gray-500 ml-1">improvement</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Customer Value</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(businessData.kpis.avgCustomerValue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{businessData.kpis.avgValueChange}%</span>
                <span className="text-gray-500 ml-1">increase</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Recurring Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(businessData.kpis.monthlyRecurringRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{businessData.kpis.mrrGrowth}%</span>
                <span className="text-gray-500 ml-1">MRR growth</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Customer Lifetime Value</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(businessData.kpis.customerLifetimeValue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{businessData.kpis.cltv_change}%</span>
                <span className="text-gray-500 ml-1">CLTV growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={businessData.revenueMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' || name === 'arr' ? formatCurrency(value) : value.toLocaleString(),
                      name === 'revenue' ? 'Revenue' : name === 'customers' ? 'Customers' : 'ARR'
                    ]} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Monthly Revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={3} name="Customers" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Customer Segments</h3>
                <PieChartIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={businessData.customerSegments}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                    >
                      {businessData.customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : `${value}%`,
                      name === 'revenue' ? 'Revenue' : 'Percentage'
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={businessData.revenueMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Performance */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businessData.productMetrics.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.subscribers.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="text-green-600 font-medium">+{product.growth}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Customer Cohort Analysis */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Customer Retention Cohort Analysis</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 0</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 1</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 2</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 3</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 4</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Month 5</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businessData.cohortAnalysis.map((cohort, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cohort.cohort}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month0}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month1}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month2}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month3}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month4 || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">{cohort.month5 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businessData.topClients.map((client, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(client.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {client.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="text-green-600 font-medium">+{client.growth}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.risk === 'Low' ? 'bg-green-100 text-green-800' : 
                            client.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Revenue Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue by Region</h3>
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessData.geographicRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Geographic Breakdown Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Breakdown</h3>
              <div className="space-y-4">
                {businessData.geographicRevenue.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{region.region}</h4>
                      <p className="text-sm text-gray-500">{region.customers} customers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(region.revenue)}</p>
                      <p className="text-sm text-gray-500">{region.percentage}% of total</p>
                    </div>
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

export default BIDashboard;
