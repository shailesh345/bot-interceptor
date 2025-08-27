import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Bot, Play, Pause, Settings, BarChart3, AlertTriangle } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const MLModelManagement = () => {
  const { user } = useSelector((state) => state.auth)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)

  const mockModels = [
    {
      id: 1,
      name: 'Bot Detection Model v2.1',
      status: 'active',
      accuracy: 94.5,
      lastTrained: '2024-01-15',
      predictions: 15420
    },
    {
      id: 2,
      name: 'Traffic Classification Model',
      status: 'training',
      accuracy: 89.2,
      lastTrained: '2024-01-10',
      predictions: 8760
    },
    {
      id: 3,
      name: 'Anomaly Detection Model',
      status: 'inactive',
      accuracy: 91.8,
      lastTrained: '2024-01-08',
      predictions: 5432
    }
  ]

  useEffect(() => {
    setModels(mockModels)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'training': return 'warning'
      case 'inactive': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'training': return <Settings className="w-3 h-3 animate-spin" />
      case 'inactive': return <Pause className="w-3 h-3" />
      default: return <AlertTriangle className="w-3 h-3" />
    }
  }

  return (
    <>
      <Helmet>
        <title>ML Model Management - BI</title>
        <meta name="description" content="Manage and monitor your machine learning models for bot detection and traffic analysis." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">ML Model Management</h1>
            <p className="text-gray-600">Monitor and manage your AI models for optimal performance</p>
          </div>
          <Button
            variant="primary"
            icon={Bot}
            onClick={() => {
              // TODO: Implement train new model functionality
            }}
          >
            Train New Model
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Models</h3>
                <p className="text-2xl font-bold text-black">
                  {models.filter(m => m.status === 'active').length}
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
                <h3 className="text-sm font-medium text-gray-500">Avg Accuracy</h3>
                <p className="text-2xl font-bold text-black">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Predictions</h3>
                <p className="text-2xl font-bold text-black">
                  {models.reduce((sum, m) => sum + m.predictions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Models Table */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Models</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Trained
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predictions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bot className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-black">{model.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(model.status)} className="flex items-center w-fit">
                        {getStatusIcon(model.status)}
                        <span className="ml-1 capitalize">{model.status}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {model.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.lastTrained}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {model.predictions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view details functionality
                          }}
                        >
                          View
                        </Button>
                        {model.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement pause functionality
                            }}
                          >
                            Pause
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement start functionality
                            }}
                          >
                            Start
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

export default MLModelManagement
