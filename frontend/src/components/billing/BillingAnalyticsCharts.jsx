import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  Activity,
  Zap
} from 'lucide-react';

const BillingAnalyticsCharts = ({ data = {}, timeRange = '12m' }) => {
  // Mock data for demonstration
  const mockRevenueData = [
    { month: 'Jan', revenue: 4200, subscriptions: 42, growth: 12 },
    { month: 'Feb', revenue: 4800, subscriptions: 48, growth: 14 },
    { month: 'Mar', revenue: 5200, subscriptions: 52, growth: 8 },
    { month: 'Apr', revenue: 5800, subscriptions: 58, growth: 12 },
    { month: 'May', revenue: 6200, subscriptions: 62, growth: 7 },
    { month: 'Jun', revenue: 6800, subscriptions: 68, growth: 10 },
    { month: 'Jul', revenue: 7200, subscriptions: 72, growth: 6 },
    { month: 'Aug', revenue: 7800, subscriptions: 78, growth: 8 },
    { month: 'Sep', revenue: 8400, subscriptions: 84, growth: 8 },
    { month: 'Oct', revenue: 9000, subscriptions: 90, growth: 7 },
    { month: 'Nov', revenue: 9600, subscriptions: 96, growth: 7 },
    { month: 'Dec', revenue: 10200, subscriptions: 102, growth: 6 }
  ];

  const mockUsageData = [
    { date: '2024-01', requests: 850000, blocked: 12000, efficiency: 98.6 },
    { date: '2024-02', requests: 920000, blocked: 15000, efficiency: 98.4 },
    { date: '2024-03', requests: 1100000, blocked: 18000, efficiency: 98.4 },
    { date: '2024-04', requests: 1250000, blocked: 22000, efficiency: 98.2 },
    { date: '2024-05', requests: 1400000, blocked: 25000, efficiency: 98.2 },
    { date: '2024-06', requests: 1550000, blocked: 28000, efficiency: 98.2 }
  ];

  const mockPlanDistribution = [
    { name: 'Starter', value: 35, color: '#3B82F6', revenue: 1015 },
    { name: 'Professional', value: 45, color: '#10B981', revenue: 4455 },
    { name: 'Enterprise', value: 20, color: '#8B5CF6', revenue: 5980 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? 
                entry.dataKey === 'revenue' ? `$${entry.value.toLocaleString()}` :
                entry.value.toLocaleString() : 
                entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="space-y-8">
      {/* Revenue Analytics */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Revenue Analytics
            </h3>
            <p className="text-sm text-gray-600 mt-1">Monthly revenue and growth trends</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Growth %</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="growth"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Growth %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Usage Analytics */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Usage Analytics
            </h3>
            <p className="text-sm text-gray-600 mt-1">API requests and security metrics</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Requests</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Blocked</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="requests" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="API Requests"
              />
              <Bar 
                dataKey="blocked" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                name="Blocked Requests"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Plan Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Distribution */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Plan Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">Revenue by subscription plan</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPlanDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPlanDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-sm font-medium text-gray-900">{data.name}</p>
                          <p className="text-sm text-gray-600">{data.value}% of users</p>
                          <p className="text-sm text-green-600">${data.revenue.toLocaleString()} revenue</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {mockPlanDistribution.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: plan.color }}
                  ></div>
                  <span className="text-sm text-gray-900">{plan.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{plan.value}%</div>
                  <div className="text-xs text-gray-500">${plan.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Performance Metrics
            </h3>
            <p className="text-sm text-gray-600 mt-1">System efficiency and uptime</p>
          </div>

          <div className="space-y-6">
            {/* Efficiency Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Security Efficiency</span>
                <span className="text-lg font-bold text-green-600">98.4%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '98.4%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Uptime */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">System Uptime</span>
                <span className="text-lg font-bold text-blue-600">99.97%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '99.97%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>

            {/* Response Time */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                <span className="text-lg font-bold text-purple-600">42ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
            </div>

            {/* Threat Detection Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Threat Detection</span>
                <span className="text-lg font-bold text-red-600">99.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '99.8%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1.2M</div>
              <div className="text-xs text-gray-500">Requests Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">15K</div>
              <div className="text-xs text-gray-500">Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$10.2K</div>
              <div className="text-xs text-gray-500">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">102</div>
              <div className="text-xs text-gray-500">Active Users</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BillingAnalyticsCharts;
