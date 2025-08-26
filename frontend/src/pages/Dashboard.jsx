import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { 
  Activity, TrendingUp, Shield, Bot, Users, DollarSign,
  Globe, RefreshCw, ArrowUp, Eye, Server, CheckCircle,
  Clock, Settings, Bell, X, BarChart3, ShieldCheck
} from 'lucide-react'
import { analyticsAPI, domainsAPI, rulesAPI } from '../services/api'
import RealTimeDashboard from '../components/dashboard/RealTimeDashboard'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Skeleton from '../components/common/Skeleton'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('24h')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsResponse, domainsResponse, rulesResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(timeRange),
        domainsAPI.getDomains(),
        rulesAPI.getRules()
      ])
      
      // Transform analytics data from backend format
      const responseData = analyticsResponse.data
      const analytics = responseData.analytics || {}
      const overview = analytics.overview || {}
      
      const domains = domainsResponse.data.domains || domainsResponse.data || []
      const rules = rulesResponse.data.rules || rulesResponse.data || []
      
      // Transform to expected dashboard format
      const transformedData = {
        summary: {
          totalRequests: overview.total_requests || 0,
          totalBlocked: overview.blocked_requests || 0,
          botTraffic: overview.bot_requests || 0,
          revenue: 0 // Calculate from blocked requests if needed
        },
        trafficData: analytics.hourly_pattern || [],
        botDistribution: analytics.bot_types || [],
        recentActivity: [
          {
            id: 1,
            type: 'traffic',
            description: 'Traffic monitoring active',
            time: new Date().toLocaleTimeString(),
            severity: 'info'
          }
        ],
        domains,
        rules
      }
      
      setDashboardData(transformedData)
    } catch (error) {
      console.error('Dashboard loading error:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
      
      // Fallback data to prevent crashes
      setDashboardData({
        summary: {
          totalRequests: 0,
          totalBlocked: 0,
          botTraffic: 0,
          revenue: 0
        },
        trafficData: [],
        botDistribution: [],
        recentActivity: [],
        domains: [],
        rules: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    toast.success('Dashboard refreshed!')
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton type="title" width="300px" />
          <div className="flex space-x-3">
            <Skeleton type="input" width="150px" />
            <Skeleton type="button" width="100px" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} header={<Skeleton type="text" />}>
              <div className="space-y-3">
                <Skeleton type="title" />
                <Skeleton type="text" lines={2} />
              </div>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} header={<Skeleton type="title" />}>
              <Skeleton type="card" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <X className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Failed to load dashboard
        </h3>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <Button onClick={loadDashboardData} variant="primary">
          Try Again
        </Button>
      </Card>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <>
      <Helmet>
        <title>Dashboard - Traffic Interceptor</title>
      </Helmet>
      
      <main role="main" className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening with your traffic protection
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button
              onClick={handleRefresh}
              loading={refreshing}
              icon={RefreshCw}
              variant="primary"
            >
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <Card className="p-0">
          <div className="border-b" style={{ borderColor: 'var(--border-secondary)' }}>
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'realtime', label: 'Real-Time', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-current'
                      : 'border-transparent hover:border-current'
                  }`}
                  style={{ 
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                header="Total Requests"
                animation="fade-in-up"
                delay={0}
                className="text-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatNumber(dashboardData?.summary?.totalRequests)}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <ArrowUp className="h-4 w-4 mr-1" style={{ color: '#10B981' }} />
                      <span className="text-sm" style={{ color: '#10B981' }}>+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <Globe className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                  </div>
                </div>
              </Card>

              <Card 
                header="Threats Blocked"
                animation="fade-in-up"
                delay={0.1}
                className="text-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>
                      {formatNumber(dashboardData?.summary?.totalBlocked)}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <ShieldCheck className="h-4 w-4 mr-1" style={{ color: '#10B981' }} />
                      <Badge variant="success" size="sm">Protected</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                    <Shield className="h-6 w-6" style={{ color: '#EF4444' }} />
                  </div>
                </div>
              </Card>

              <Card 
                header="Bot Traffic"
                animation="fade-in-up"
                delay={0.2}
                className="text-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                      {formatNumber(dashboardData?.summary?.botTraffic)}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <Bot className="h-4 w-4 mr-1" style={{ color: '#F59E0B' }} />
                      <Badge variant="warning" size="sm">Detected</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
                    <Bot className="h-6 w-6" style={{ color: '#F59E0B' }} />
                  </div>
                </div>
              </Card>

              <Card 
                header="Revenue"
                animation="fade-in-up"
                delay={0.3}
                className="text-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-3xl font-bold" style={{ color: '#10B981' }}>
                      {formatCurrency(dashboardData?.summary?.revenue)}
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <DollarSign className="h-4 w-4 mr-1" style={{ color: '#10B981' }} />
                      <span className="text-sm" style={{ color: '#10B981' }}>+8.2%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#D1FAE5' }}>
                    <DollarSign className="h-6 w-6" style={{ color: '#10B981' }} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Chart */}
              <Card header="Traffic Overview" animation="fade-in-up" delay={0.4}>
                <div data-testid="traffic-chart" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData?.trafficData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                      <XAxis dataKey="time" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--primary-bg)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="bots" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Bot Distribution Chart */}
              <Card header="Bot Distribution" animation="fade-in-up" delay={0.5}>
                <div data-testid="bot-distribution-chart" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData?.botDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(dashboardData?.botDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--primary-bg)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card header="Recent Activity" animation="fade-in-up" delay={0.6}>
              <div className="space-y-4">
                {dashboardData?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-opacity-50" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--primary-bg)' }}>
                      {activity.type === 'threat' && <Shield className="h-4 w-4" style={{ color: '#EF4444' }} />}
                      {activity.type === 'traffic' && <Globe className="h-4 w-4" style={{ color: '#3B82F6' }} />}
                      {activity.type === 'bot' && <Bot className="h-4 w-4" style={{ color: '#F59E0B' }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {activity.description}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {activity.time}
                      </p>
                    </div>
                    <Badge variant={activity.severity === 'high' ? 'danger' : activity.severity === 'medium' ? 'warning' : 'info'}>
                      {activity.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'realtime' && (
          <RealTimeDashboard />
        )}
      </main>
    </>
  )
}

export default Dashboard
