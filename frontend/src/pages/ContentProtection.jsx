import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { ShieldAlert, Shield, Eye, Lock, AlertTriangle, CheckCircle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ContentProtection = () => {
  const { user } = useSelector((state) => state.auth)
  const [protectionRules, setProtectionRules] = useState([])
  const [loading, setLoading] = useState(false)

  const mockProtectionRules = [
    {
      id: 1,
      name: 'SQL Injection Protection',
      type: 'Injection',
      status: 'active',
      severity: 'high',
      hits: 1247,
      lastTriggered: '2024-01-15 14:30'
    },
    {
      id: 2,
      name: 'XSS Protection',
      type: 'XSS',
      status: 'active',
      severity: 'high',
      hits: 892,
      lastTriggered: '2024-01-15 12:15'
    },
    {
      id: 3,
      name: 'CSRF Protection',
      type: 'CSRF',
      status: 'active',
      severity: 'medium',
      hits: 456,
      lastTriggered: '2024-01-14 09:45'
    },
    {
      id: 4,
      name: 'File Upload Protection',
      type: 'Upload',
      status: 'inactive',
      severity: 'high',
      hits: 23,
      lastTriggered: '2024-01-10 16:20'
    }
  ]

  useEffect(() => {
    setProtectionRules(mockProtectionRules)
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
    return status === 'active' ? 'success' : 'secondary'
  }

  return (
    <>
      <Helmet>
        <title>Content Protection - BI</title>
        <meta name="description" content="Advanced content protection and security measures for your applications." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Content Protection</h1>
            <p className="text-gray-600">Advanced security measures to protect your content and applications</p>
          </div>
          <Button
            variant="primary"
            icon={Shield}
            onClick={() => {
              // TODO: Implement add protection rule functionality
            }}
          >
            Add Protection Rule
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Threats</h3>
                <p className="text-2xl font-bold text-black">
                  {protectionRules.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">High Severity</h3>
                <p className="text-2xl font-bold text-black">
                  {protectionRules.filter(r => r.severity === 'high').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Blocked Attacks</h3>
                <p className="text-2xl font-bold text-black">
                  {protectionRules.reduce((sum, r) => sum + r.hits, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Protection Score</h3>
                <p className="text-2xl font-bold text-black">94%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Protection Rules */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Protection Rules</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Triggered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {protectionRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShieldAlert className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-black">{rule.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{rule.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(rule.status)}>
                        {rule.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getSeverityColor(rule.severity)} className="capitalize">
                        {rule.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {rule.hits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.lastTriggered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit rule functionality
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={rule.status === 'active' ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => {
                            // TODO: Implement toggle rule functionality
                          }}
                        >
                          {rule.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">WAF Configuration</h3>
              <p className="text-gray-600 text-sm mb-4">Configure Web Application Firewall settings</p>
              <Button variant="outline" className="w-full">
                Configure WAF
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Security Monitoring</h3>
              <p className="text-gray-600 text-sm mb-4">Monitor security events and threats</p>
              <Button variant="outline" className="w-full">
                View Monitoring
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Access Control</h3>
              <p className="text-gray-600 text-sm mb-4">Manage access control policies</p>
              <Button variant="outline" className="w-full">
                Manage Policies
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default ContentProtection
