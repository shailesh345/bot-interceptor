import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { PieChart, BarChart3, FileText, Download, Share2, Calendar, Filter } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AdvancedReporting = () => {
  const { user } = useSelector((state) => state.auth)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const mockReports = [
    {
      id: 1,
      name: 'Monthly Traffic Analysis',
      type: 'Traffic',
      status: 'completed',
      createdAt: '2024-01-15',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Security Incident Report',
      type: 'Security',
      status: 'processing',
      createdAt: '2024-01-14',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 3,
      name: 'Performance Metrics Q1',
      type: 'Performance',
      status: 'completed',
      createdAt: '2024-01-10',
      size: '3.2 MB',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'User Behavior Analysis',
      type: 'Analytics',
      status: 'failed',
      createdAt: '2024-01-08',
      size: '0 MB',
      format: 'PDF'
    }
  ]

  useEffect(() => {
    setReports(mockReports)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'warning'
      case 'failed': return 'danger'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Traffic': return 'blue'
      case 'Security': return 'red'
      case 'Performance': return 'green'
      case 'Analytics': return 'purple'
      default: return 'gray'
    }
  }

  return (
    <>
      <Helmet>
        <title>Advanced Reporting - BI</title>
        <meta name="description" content="Generate and manage advanced reports for traffic analysis, security, and performance metrics." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Advanced Reporting</h1>
            <p className="text-gray-600">Generate comprehensive reports and analytics</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => {
                // TODO: Implement filter functionality
              }}
            >
              Filter
            </Button>
            <Button
              variant="primary"
              icon={FileText}
              onClick={() => {
                // TODO: Implement create report functionality
              }}
            >
              Create Report
            </Button>
          </div>
        </div>

        {/* Report Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                <p className="text-2xl font-bold text-black">
                  {reports.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-2xl font-bold text-black">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                <p className="text-2xl font-bold text-black">
                  {reports.filter(r => r.createdAt.startsWith('2024-01')).length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
                <p className="text-2xl font-bold text-black">247</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Traffic Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Website traffic and user behavior analysis</p>
              <Button variant="outline" className="w-full">
                Generate Traffic Report
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <PieChart className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Security Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Security incidents and threat analysis</p>
              <Button variant="outline" className="w-full">
                Generate Security Report
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Performance Reports</h3>
              <p className="text-gray-600 text-sm mb-4">System performance and optimization metrics</p>
              <Button variant="outline" className="w-full">
                Generate Performance Report
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">Custom Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Build custom reports with specific metrics</p>
              <Button variant="outline" className="w-full">
                Create Custom Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Generated Reports</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-black">{report.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getTypeColor(report.type)} className="capitalize">
                        {report.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(report.status)} className="capitalize">
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.format}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {report.status === 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Download}
                              onClick={() => {
                                // TODO: Implement download functionality
                              }}
                            >
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Share2}
                              onClick={() => {
                                // TODO: Implement share functionality
                              }}
                            >
                              Share
                            </Button>
                          </>
                        )}
                        {report.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement retry functionality
                            }}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

export default AdvancedReporting
