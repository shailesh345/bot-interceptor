import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { BarChart3, Shield, Users, TrendingUp } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../store/slices/dashboardSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { stats, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading) {
    return <LoadingSpinner size="lg" />
  }
  if (error) {
    return <div className="p-4 bg-red-50 text-red-600">{error}</div>
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening with your traffic.
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalRequests?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bot Traffic
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.botTraffic?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Human Traffic
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.humanTraffic?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-danger-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Blocked Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.blockedRequests?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Traffic Overview</h3>
            </div>
            <div className="card-body">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart will be implemented here</p>
              </div>
            </div>
          </div>
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {/* You can map recent activity from mock data here if needed */}
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Blocked suspicious bot from 192.168.1.1</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Allowed GoogleBot to crawl example.com</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Generated $2.50 from AI bot access</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
