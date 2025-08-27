import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Shield, AlertTriangle, Eye, Lock, Key, UserCheck, Activity } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SecurityManagement = () => {
  const { user } = useSelector((state) => state.auth)
  const [securityMetrics, setSecurityMetrics] = useState({})
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  const mockSecurityMetrics = {
    totalThreats: 1247,
    blockedAttacks: 892,
    activeUsers: 1543,
    securityScore: 94,
    uptime: '99.9%'
  }

  const mockRecentAlerts = [
    {
      id: 1,
      type: 'Suspicious Login',
      severity: 'medium',
      message: 'Multiple failed login attempts from IP 192.168.1.100',
      timestamp: '2024-01-15 14:30:00',
      status: 'new'
    },
    {
      id: 2,
      type: 'SQL Injection Attempt',
      severity: 'high',
      message: 'SQL injection attempt blocked on /api/users endpoint',
      timestamp: '2024-01-15 14:25:00',
      status: 'resolved'
    },
    {
      id: 3,
      type: 'Unusual Traffic',
      severity: 'low',
      message: 'High traffic volume detected from bot network',
      timestamp: '2024-01-15 14:20:00',
      status: 'investigating'
    }
  ]

  useEffect(() => {
    setSecurityMetrics(mockSecurityMetrics)
    setRecentAlerts(mockRecentAlerts)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'danger'
      case 'investigating': return 'warning'
      case 'resolved': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <>
      <Helmet>
        <title>Security Management - BI</title>
        <meta name="description" content="Comprehensive security management and monitoring dashboard." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Security Management</h1>
            <p className="text-gray-600">Monitor and manage your security posture</p>
          </div>
          <Button
            variant="primary"
            icon={Shield}
            onClick={() => {
              // TODO: Implement security scan functionality
            }}
          >
            Run Security Scan
          </Button>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Threats</h3>
                <p className="text-2xl font-bold text-black">
                  {securityMetrics.totalThreats?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Blocked Attacks</h3>
                <p className="text-2xl font-bold text-black">
                  {securityMetrics.blockedAttacks?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="text-2xl font-bold text-black">
                  {securityMetrics.activeUsers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Security Score</h3>
                <p className="text-2xl font-bold text-black">
                  {securityMetrics.securityScore || 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Key className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">System Uptime</h3>
                <p className="text-2xl font-bold text-black">
                  {securityMetrics.uptime || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Security Alerts */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-black">Recent Security Alerts</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className={`w-5 h-5 mr-3 ${
                        alert.severity === 'high' ? 'text-red-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <div>
                        <h4 className="text-sm font-medium text-black">{alert.type}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                        {alert.severity}
                      </Badge>
                      <Badge variant={getStatusColor(alert.status)} className="capitalize">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </div>
          </Card>

          {/* Security Actions */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-black">Security Actions</h3>
            </div>

            <div className="p-6 space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Shield}
                onClick={() => {
                  // TODO: Implement security settings
                }}
              >
                Security Settings
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Eye}
                onClick={() => {
                  // TODO: Implement audit logs
                }}
              >
                View Audit Logs
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Lock}
                onClick={() => {
                  // TODO: Implement access control
                }}
              >
                Access Control
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Key}
                onClick={() => {
                  // TODO: Implement encryption management
                }}
              >
                Encryption Management
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                icon={UserCheck}
                onClick={() => {
                  // TODO: Implement user sessions
                }}
              >
                User Sessions
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Firewall Status</h3>
              <Badge variant="success" className="mb-2">Active</Badge>
              <p className="text-gray-600 text-sm">All traffic is being monitored</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Lock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Encryption</h3>
              <Badge variant="success" className="mb-2">Enabled</Badge>
              <p className="text-gray-600 text-sm">All data is encrypted at rest and in transit</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Activity className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Monitoring</h3>
              <Badge variant="success" className="mb-2">Real-time</Badge>
              <p className="text-gray-600 text-sm">24/7 security monitoring active</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default SecurityManagement
