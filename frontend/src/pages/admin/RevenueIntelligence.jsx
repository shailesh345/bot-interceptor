import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
  Users, Calendar, Target, ArrowUpRight, ArrowDownRight,
  Filter, Download, RefreshCw, AlertTriangle, CheckCircle,
  CreditCard, Building2, Zap, Activity, Clock, Eye
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';

const RevenueIntelligence = () => {
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [cohortView, setCohortView] = useState('monthly');

  // Mock revenue data
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan 2024', revenue: 45000, growth: 12.5, customers: 125, arpu: 360 },
    { month: 'Feb 2024', revenue: 52000, growth: 15.6, customers: 142, arpu: 366 },
    { month: 'Mar 2024', revenue: 48000, growth: -7.7, customers: 138, arpu: 348 },
    { month: 'Apr 2024', revenue: 58000, growth: 20.8, customers: 156, arpu: 372 },
    { month: 'May 2024', revenue: 61000, growth: 5.2, customers: 162, arpu: 377 },
    { month: 'Jun 2024', revenue: 67000, growth: 9.8, customers: 175, arpu: 383 },
    { month: 'Jul 2024', revenue: 72000, growth: 7.5, customers: 185, arpu: 389 },
    { month: 'Aug 2024', revenue: 75000, growth: 4.2, customers: 192, arpu: 391 },
    { month: 'Sep 2024', revenue: 82000, growth: 9.3, customers: 208, arpu: 394 },
    { month: 'Oct 2024', revenue: 88000, growth: 7.3, customers: 218, arpu: 404 },
    { month: 'Nov 2024', revenue: 94000, growth: 6.8, customers: 230, arpu: 409 },
    { month: 'Dec 2024', revenue: 102000, growth: 8.5, customers: 245, arpu: 416 }
  ]);

  const [cohortData, setCohortData] = useState([
    {
      cohort: 'Jan 2024',
      month0: 100,
      month1: 85,
      month2: 78,
      month3: 72,
      month4: 68,
      month5: 65,
      month6: 62,
      ltv: 2400,
      customers: 45
    },
    {
      cohort: 'Feb 2024',
      month0: 100,
      month1: 88,
      month2: 82,
      month3: 76,
      month4: 72,
      month5: 69,
      month6: 66,
      ltv: 2580,
      customers: 52
    },
    {
      cohort: 'Mar 2024',
      month0: 100,
      month1: 82,
      month2: 75,
      month3: 69,
      month4: 64,
      month5: 60,
      month6: 57,
      ltv: 2150,
      customers: 38
    },
    {
      cohort: 'Apr 2024',
      month0: 100,
      month1: 90,
      month2: 85,
      month3: 80,
      month4: 76,
      month5: 73,
      month6: 70,
      ltv: 2850,
      customers: 68
    },
    {
      cohort: 'May 2024',
      month0: 100,
      month1: 87,
      month2: 81,
      month3: 75,
      month4: 71,
      month5: 68,
      month6: null,
      ltv: 2620,
      customers: 58
    },
    {
      cohort: 'Jun 2024',
      month0: 100,
      month1: 89,
      month2: 83,
      month3: 78,
      month4: 74,
      month5: null,
      month6: null,
      ltv: 2750,
      customers: 72
    }
  ]);

  const [revenueSegments, setRevenueSegments] = useState([
    { name: 'Enterprise', value: 450000, percentage: 65.2, color: '#8884d8' },
    { name: 'Professional', value: 180000, percentage: 26.1, color: '#82ca9d' },
    { name: 'Business', value: 60000, percentage: 8.7, color: '#ffc658' }
  ]);

  const [kpiMetrics, setKpiMetrics] = useState({
    totalRevenue: 1024000,
    monthlyGrowth: 8.5,
    customerCount: 245,
    churnRate: 3.2,
    arpu: 416,
    ltv: 2650,
    cac: 180,
    ltvCacRatio: 14.7,
    mrr: 85333,
    arr: 1024000
  });

  const [forecastData, setForecastData] = useState([
    { month: 'Jan 2025', actual: null, forecast: 110000, confidence: 95 },
    { month: 'Feb 2025', actual: null, forecast: 118000, confidence: 92 },
    { month: 'Mar 2025', actual: null, forecast: 125000, confidence: 88 },
    { month: 'Apr 2025', actual: null, forecast: 132000, confidence: 85 },
    { month: 'May 2025', actual: null, forecast: 138000, confidence: 82 },
    { month: 'Jun 2025', actual: null, forecast: 145000, confidence: 78 }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getCohortColor = (retention) => {
    if (retention >= 80) return 'bg-green-500';
    if (retention >= 70) return 'bg-yellow-500';
    if (retention >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGrowthIndicator = (value) => {
    if (value > 0) return { icon: TrendingUp, color: 'text-green-600' };
    if (value < 0) return { icon: TrendingDown, color: 'text-red-600' };
    return { icon: Activity, color: 'text-gray-600' };
  };

  return (
    <>
      <Helmet>
        <title>Revenue Intelligence - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Intelligence</h1>
            <p className="mt-1 text-sm text-gray-600">
              Advanced revenue analytics, forecasting, and business intelligence insights
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiMetrics.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {formatPercentage(kpiMetrics.monthlyGrowth)} vs last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">MRR</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiMetrics.mrr)}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Monthly Recurring
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">ARPU</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiMetrics.arpu)}</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  Per user/month
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">LTV:CAC</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.ltvCacRatio}:1</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy ratio
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{kpiMetrics.churnRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Below 5% target
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Growth Trend</h3>
              <p className="mt-1 text-sm text-gray-600">
                Monthly revenue progression with growth indicators
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : 
                    name === 'growth' ? formatPercentage(value) : value,
                    name
                  ]} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" 
                        stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#ff7300" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue by Plan</h3>
              <p className="mt-1 text-sm text-gray-600">
                Revenue distribution across subscription plans
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={revenueSegments}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {revenueSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {revenueSegments.map((segment) => (
                  <div key={segment.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{segment.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatCurrency(segment.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Cohort Retention Analysis</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Customer retention rates by acquisition cohort
                </p>
              </div>
              <select
                value={cohortView}
                onChange={(e) => setCohortView(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly Cohorts</option>
                <option value="quarterly">Quarterly Cohorts</option>
              </select>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cohort</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customers</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 0</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 1</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 2</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 3</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 4</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 5</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Month 6</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">LTV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cohortData.map((cohort) => (
                  <tr key={cohort.cohort} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{cohort.cohort}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{cohort.customers}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cohort.month0}%
                      </span>
                    </td>
                    {[cohort.month1, cohort.month2, cohort.month3, cohort.month4, cohort.month5, cohort.month6].map((retention, index) => (
                      <td key={index} className="py-3 px-4 text-center">
                        {retention !== null ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCohortColor(retention)}`}>
                            {retention}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(cohort.ltv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue Forecast</h3>
            <p className="mt-1 text-sm text-gray-600">
              AI-powered revenue predictions with confidence intervals
            </p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...revenueData.slice(-6), ...forecastData]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  name="Actual Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#ff7300" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Forecasted Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Customer Metrics</h4>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="text-sm font-medium text-gray-900">{kpiMetrics.customerCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer LTV</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(kpiMetrics.ltv)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CAC</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(kpiMetrics.cac)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payback Period</span>
                <span className="text-sm font-medium text-gray-900">4.3 months</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Growth Metrics</h4>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Growth</span>
                <span className="text-sm font-medium text-green-600">{formatPercentage(kpiMetrics.monthlyGrowth)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annual Growth</span>
                <span className="text-sm font-medium text-green-600">+142.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Revenue Retention</span>
                <span className="text-sm font-medium text-green-600">118%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expansion Revenue</span>
                <span className="text-sm font-medium text-green-600">22%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Health Indicators</h4>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Health Score</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-600 mr-2">92/100</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Churn Risk</span>
                <span className="text-sm font-medium text-yellow-600">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Forecast Accuracy</span>
                <span className="text-sm font-medium text-blue-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Quality</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueIntelligence;
