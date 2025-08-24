import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdvancedAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trafficPatterns, setTrafficPatterns] = useState(null);
  const [botIntelligence, setBotIntelligence] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, patternsRes, intelligenceRes, performanceRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?days=${timeRange}`),
        fetch(`/api/analytics/traffic-patterns?days=${timeRange}`),
        fetch(`/api/analytics/bot-intelligence?days=${timeRange}`),
        fetch(`/api/analytics/performance-metrics?hours=${timeRange * 24}`)
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      }

      if (patternsRes.ok) {
        const patternsData = await patternsRes.json();
        setTrafficPatterns(patternsData.traffic_patterns);
      }

      if (intelligenceRes.ok) {
        const intelligenceData = await intelligenceRes.json();
        setBotIntelligence(intelligenceData.bot_intelligence);
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setPerformanceMetrics(performanceData.performance_metrics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const StatCard = ({ label, value, change, changeType = 'positive' }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your traffic patterns and bot activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'traffic', 'bots', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Requests"
              value={analytics.overview.total_requests.toLocaleString()}
              subtitle="All traffic"
              icon={ChartBarIcon}
              color="blue"
            />
            <MetricCard
              title="Bot Requests"
              value={`${analytics.overview.bot_percentage.toFixed(1)}%`}
              subtitle={`${analytics.overview.bot_requests.toLocaleString()} requests`}
              icon={GlobeAltIcon}
              color="yellow"
            />
            <MetricCard
              title="Blocked Requests"
              value={`${analytics.overview.block_percentage.toFixed(1)}%`}
              subtitle={`${analytics.overview.blocked_requests.toLocaleString()} requests`}
              icon={ShieldCheckIcon}
              color="red"
            />
            <MetricCard
              title="Avg Response Time"
              value={`${analytics.performance.avg_response_time.toFixed(2)}ms`}
              subtitle="Performance metric"
              icon={ClockIcon}
              color="green"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Traffic Pattern */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Traffic Pattern</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.hourly_pattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bot Types Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.bot_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.bot_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Domains and IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Domains by Traffic</h3>
              <div className="space-y-3">
                {analytics.top_domains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{domain.domain}</span>
                    <span className="text-sm font-medium text-gray-900">{domain.requests.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top IP Addresses</h3>
              <div className="space-y-3">
                {analytics.top_ips.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{ip.ip}</span>
                    <span className="text-sm font-medium text-gray-900">{ip.requests.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === 'traffic' && trafficPatterns && (
        <div className="space-y-6">
          {/* Daily Traffic Pattern */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Traffic Pattern</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trafficPatterns.daily_pattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_requests" fill="#3B82F6" name="Total Requests" />
                <Bar dataKey="bot_requests" fill="#F59E0B" name="Bot Requests" />
                <Bar dataKey="blocked_requests" fill="#EF4444" name="Blocked Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficPatterns.geographic_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Agent Analysis</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trafficPatterns.user_agent_analysis.map((ua, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate max-w-xs">{ua.user_agent}</span>
                    <span className="text-sm font-medium text-gray-900">{ua.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bots Tab */}
      {activeTab === 'bots' && botIntelligence && (
        <div className="space-y-6">
          {/* Bot Evolution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Evolution Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={botIntelligence.bot_evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_bots" stroke="#3B82F6" strokeWidth={2} name="Total Bots" />
                <Line type="monotone" dataKey="scrapers" stroke="#F59E0B" strokeWidth={2} name="Scrapers" />
                <Line type="monotone" dataKey="botnets" stroke="#EF4444" strokeWidth={2} name="Botnets" />
                <Line type="monotone" dataKey="automation" stroke="#10B981" strokeWidth={2} name="Automation" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Threat Indicators */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Indicators</h3>
            <div className="space-y-4">
              {botIntelligence.threat_indicators.map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{threat.ip}</p>
                    <p className="text-sm text-gray-600">
                      {threat.total_requests} requests, {threat.blocked_requests} blocked
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      threat.threat_score > 50 ? 'bg-red-100 text-red-800' : 
                      threat.threat_score > 25 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {threat.threat_score.toFixed(1)}% threat
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performanceMetrics && (
        <div className="space-y-6">
          {/* Response Time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="P50 Response Time"
              value={`${performanceMetrics.response_time.p50.toFixed(2)}ms`}
            />
            <StatCard
              label="P90 Response Time"
              value={`${performanceMetrics.response_time.p90.toFixed(2)}ms`}
            />
            <StatCard
              label="P95 Response Time"
              value={`${performanceMetrics.response_time.p95.toFixed(2)}ms`}
            />
            <StatCard
              label="P99 Response Time"
              value={`${performanceMetrics.response_time.p99.toFixed(2)}ms`}
            />
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Error Rate</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">
                  {performanceMetrics.error_rate.toFixed(2)}%
                </div>
                <p className="text-gray-600">of requests resulted in errors</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Throughput</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceMetrics.throughput}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
