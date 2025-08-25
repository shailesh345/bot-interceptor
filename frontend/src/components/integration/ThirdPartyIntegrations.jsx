import React, { useState, useEffect } from 'react'
import { 
  Link, 
  Unlink, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  Activity,
  BarChart3,
  Globe,
  Zap,
  MessageSquare,
  Mail,
  Calendar,
  CreditCard,
  Users,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Play,
  Pause,
  Clock,
  ExternalLink,
  Server,
  Terminal,
  Cpu,
  Wifi,
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const ThirdPartyIntegrations = () => {
  const [integrations, setIntegrations] = useState([])
  const [availableServices, setAvailableServices] = useState([])
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('connected')

  // Mock data
  const mockIntegrations = [
    {
      id: 1,
      name: 'Slack',
      provider: 'Slack',
      status: 'connected',
      type: 'communication',
      description: 'Send notifications and alerts to Slack channels',
      icon: '💬',
      lastSync: '2024-08-25 14:30',
      syncStatus: 'success'
    },
    {
      id: 2,
      name: 'Google Analytics',
      provider: 'Google',
      status: 'connected',
      type: 'analytics',
      description: 'Sync traffic data with Google Analytics',
      icon: '📊',
      lastSync: '2024-08-25 14:25',
      syncStatus: 'success'
    },
    {
      id: 3,
      name: 'Stripe',
      provider: 'Stripe',
      status: 'connected',
      type: 'payment',
      description: 'Process payments and manage subscriptions',
      icon: '💳',
      lastSync: '2024-08-25 14:10',
      syncStatus: 'success'
    }
  ]

  const mockAvailableServices = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: '💬',
      category: 'communication'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Gaming and community chat platform',
      icon: '🎮',
      category: 'communication'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Web analytics and traffic insights',
      icon: '📊',
      category: 'analytics'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and billing',
      icon: '💳',
      category: 'payment'
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIntegrations(mockIntegrations)
      setAvailableServices(mockAvailableServices)
    } catch (error) {
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectService = async (serviceId) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const service = availableServices.find(s => s.id === serviceId)
      const newIntegration = {
        id: Date.now(),
        name: service.name,
        provider: service.name,
        status: 'connected',
        type: service.category,
        description: service.description,
        icon: service.icon,
        lastSync: new Date().toISOString(),
        syncStatus: 'success'
      }
      
      setIntegrations(prev => [...prev, newIntegration])
      setShowConnectModal(false)
      toast.success(`${service.name} connected successfully!`)
    } catch (error) {
      toast.error('Failed to connect service')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectService = async (integrationId) => {
    if (!window.confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'disconnected', syncStatus: 'disconnected' }
            : integration
        )
      )
      toast.success('Integration disconnected successfully!')
    } catch (error) {
      toast.error('Failed to disconnect integration')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'disconnected':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'communication':
        return 'text-blue-600 bg-blue-100'
      case 'analytics':
        return 'text-purple-600 bg-purple-100'
      case 'payment':
        return 'text-indigo-600 bg-indigo-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const connectedIntegrations = integrations.filter(i => i.status === 'connected')
  const disconnectedIntegrations = integrations.filter(i => i.status === 'disconnected')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Third-Party Integrations</h1>
          <p className="text-gray-600">Connect with external services and automate workflows</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Service</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-gray-900">{connectedIntegrations.length}</p>
            </div>
            <Link className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disconnected</p>
              <p className="text-2xl font-bold text-gray-900">{disconnectedIntegrations.length}</p>
            </div>
            <Unlink className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-2">
            <Badge variant="danger" size="sm">Inactive</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{availableServices.length}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Services</Badge>
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Connected Integrations</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : connectedIntegrations.length === 0 ? (
            <div className="text-center py-8">
              <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No connected integrations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedIntegrations.map((integration) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="success" size="sm">Connected</Badge>
                          <Badge 
                            variant="info" 
                            size="sm"
                            className={getTypeColor(integration.type)}
                          >
                            {integration.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedIntegration(integration)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDisconnectService(integration.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connect Service Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Service</h3>
            <p className="text-gray-600 mb-4">
              Choose a service to connect with Traffic Interceptor
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleConnectService(service.id)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">
                    {service.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThirdPartyIntegrations
