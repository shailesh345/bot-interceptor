import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Globe, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Zap,
  Eye,
  Bot,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Brain
} from 'lucide-react'

const EnhancedDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Active Rules',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-blue-500',
      description: 'Security rules protecting your domains'
    },
    {
      title: 'Protected Domains',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Globe,
      color: 'bg-green-500',
      description: 'Domains under protection'
    },
    {
      title: 'Traffic Blocked',
      value: '2.4K',
      change: '+18%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-orange-500',
      description: 'Malicious requests blocked today'
    },
    {
      title: 'System Health',
      value: '98%',
      change: '+2%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      description: 'Overall system performance'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'rule_created',
      message: 'New rate limiting rule created for example.com',
      time: '2 minutes ago',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'threat_detected',
      message: 'Bot attack detected and blocked from 192.168.1.100',
      time: '5 minutes ago',
      icon: Bot,
      color: 'text-red-600'
    },
    {
      id: 3,
      type: 'traffic_spike',
      message: 'Unusual traffic spike detected on api.example.com',
      time: '12 minutes ago',
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      id: 4,
      type: 'ml_update',
      message: 'ML model updated with new threat patterns',
      time: '1 hour ago',
      icon: Brain,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      title: 'Create Rule',
      description: 'Add new security rule',
      icon: Shield,
      href: '/rules',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add Domain',
      description: 'Protect new domain',
      icon: Globe,
      href: '/domains',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Check traffic patterns',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'System Status',
      description: 'Monitor health',
      icon: Activity,
      href: '/monitoring',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const StatCard = ({ stat }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          <p className="text-3xl font-bold text-black mt-2">{stat.value}</p>
          <div className="flex items-center mt-2">
            {stat.changeType === 'positive' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ml-1 ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
          </div>
        </div>
        <div className={`${stat.color} p-3 rounded-lg`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">{stat.description}</p>
    </motion.div>
  )

  const ActivityItem = ({ activity }) => (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className={`${activity.color} p-2 rounded-lg`}>
        <activity.icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </motion.div>
  )

  const QuickActionCard = ({ action }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className={`${action.color} p-3 rounded-lg w-fit mb-3`}>
        <action.icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-medium text-black mb-1">{action.title}</h3>
      <p className="text-sm text-gray-600">{action.description}</p>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor your traffic interception system and security status
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ActivityItem activity={activity} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <QuickActionCard action={action} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Traffic</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Blocked</span>
            </div>
          </div>
        </div>
        
        {/* Placeholder for chart */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
