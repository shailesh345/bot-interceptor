import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../store/slices/analyticsSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Line } from 'react-chartjs-2'

const Analytics = () => {
  const dispatch = useDispatch()
  const { metrics, loading, error } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalytics())
  }, [dispatch])

  return (
    <>
      <Helmet>
        <title>Analytics - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Deep insights into your traffic patterns and bot behavior.
          </p>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Traffic Analytics</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600">{error}</div>
            ) : metrics && metrics.overview ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className="font-semibold">Total Requests:</div>
                    <div>{metrics.overview.totalRequests}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Bot Traffic:</div>
                    <div>{metrics.overview.botTraffic}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Blocked Requests:</div>
                    <div>{metrics.overview.blockedRequests}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Revenue:</div>
                    <div>${metrics.overview.revenue}</div>
                  </div>
                </div>
                {/* Chart Example */}
                <div className="my-8">
                  <Line
                    data={{
                      labels: metrics.trend.map((d) => d.date),
                      datasets: [
                        {
                          label: 'Total Requests',
                          data: metrics.trend.map((d) => d.totalRequests),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59,130,246,0.1)',
                          fill: true,
                        },
                        {
                          label: 'Bot Requests',
                          data: metrics.trend.map((d) => d.botRequests),
                          borderColor: '#f59e42',
                          backgroundColor: 'rgba(245,158,66,0.1)',
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                    }}
                  />
                </div>
              </>
            ) : (
              <div>No analytics data available.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Analytics
