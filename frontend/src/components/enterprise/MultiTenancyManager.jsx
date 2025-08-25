import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Settings, 
  Palette, 
  Globe, 
  Shield, 
  Database,
  Activity,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const MultiTenancyManager = () => {
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock tenants data
  const mockTenants = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      domain: 'techcorp.trafficinterceptor.com',
      status: 'active',
      plan: 'enterprise',
      users: 45,
      storage: '2.5GB',
      bandwidth: '500GB',
      createdAt: '2024-01-15',
      customBranding: {
        logo: '/logos/techcorp-logo.png',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        companyName: 'TechCorp Solutions',
        favicon: '/favicons/techcorp-favicon.ico'
      },
      settings: {
        maxUsers: 100,
        maxStorage: '10GB',
        maxBandwidth: '1TB',
        features: ['analytics', 'security', 'api', 'white-label']
      },
      usage: {
        users: 45,
        storage: '2.5GB',
        bandwidth: '500GB',
        apiCalls: 1500000
      }
    },
    {
      id: 2,
      name: 'E-commerce Plus',
      domain: 'ecommerce.trafficinterceptor.com',
      status: 'active',
      plan: 'professional',
      users: 23,
      storage: '1.8GB',
      bandwidth: '300GB',
      createdAt: '2024-02-10',
      customBranding: {
        logo: '/logos/ecommerce-logo.png',
        primaryColor: '#10B981',
        secondaryColor: '#059669',
        companyName: 'E-commerce Plus',
        favicon: '/favicons/ecommerce-favicon.ico'
      },
      settings: {
        maxUsers: 50,
        maxStorage: '5GB',
        maxBandwidth: '500GB',
        features: ['analytics', 'security', 'api']
      },
      usage: {
        users: 23,
        storage: '1.8GB',
        bandwidth: '300GB',
        apiCalls: 800000
      }
    },
    {
      id: 3,
      name: 'StartupXYZ',
      domain: 'startupxyz.trafficinterceptor.com',
      status: 'pending',
      plan: 'starter',
      users: 8,
      storage: '500MB',
      bandwidth: '100GB',
      createdAt: '2024-08-15',
      customBranding: {
        logo: '/logos/startupxyz-logo.png',
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        companyName: 'StartupXYZ',
        favicon: '/favicons/startupxyz-favicon.ico'
      },
      settings: {
        maxUsers: 20,
        maxStorage: '2GB',
        maxBandwidth: '200GB',
        features: ['analytics', 'security']
      },
      usage: {
        users: 8,
        storage: '500MB',
        bandwidth: '100GB',
        apiCalls: 200000
      }
    }
  ]

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTenants(mockTenants)
    } catch (error) {
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTenant = async (tenantData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newTenant = {
        id: Date.now(),
        ...tenantData,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        usage: {
          users: 0,
          storage: '0MB',
          bandwidth: '0GB',
          apiCalls: 0
        }
      }
      
      setTenants(prev => [...prev, newTenant])
      setShowCreateModal(false)
      toast.success('Tenant created successfully!')
    } catch (error) {
      toast.error('Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTenant = async (tenantId, updates) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTenants(prev => 
        prev.map(tenant => 
          tenant.id === tenantId ? { ...tenant, ...updates } : tenant
        )
      )
      setShowEditModal(false)
      toast.success('Tenant updated successfully!')
    } catch (error) {
      toast.error('Failed to update tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId))
      toast.success('Tenant deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete tenant')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'suspended':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'enterprise':
        return 'text-purple-600 bg-purple-100'
      case 'professional':
        return 'text-blue-600 bg-blue-100'
      case 'starter':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getUsagePercentage = (current, max) => {
    const currentNum = parseFloat(current)
    const maxNum = parseFloat(max)
    return Math.round((currentNum / maxNum) * 100)
  }

  const formatStorage = (storage) => {
    return storage.includes('GB') ? storage : `${storage}GB`
  }

  const formatBandwidth = (bandwidth) => {
    return bandwidth.includes('GB') ? bandwidth : `${bandwidth}GB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Tenancy Manager</h1>
          <p className="text-gray-600">Manage tenants, white-labeling, and custom branding</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tenant</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter(t => t.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Running</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.reduce((sum, tenant) => sum + tenant.users, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Across All</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">White-Labeled</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter(t => t.customBranding.logo).length}
              </p>
            </div>
            <Palette className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge variant="warning" size="sm">Custom</Badge>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tenants</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tenants found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {tenant.customBranding.logo ? (
                          <img 
                            src={tenant.customBranding.logo} 
                            alt={tenant.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">{tenant.domain}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={tenant.status === 'active' ? 'success' : tenant.status === 'pending' ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {tenant.status}
                          </Badge>
                          <Badge variant="info" size="sm">{tenant.plan}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{tenant.users} users</p>
                        <p className="text-xs text-gray-500">
                          {getUsagePercentage(tenant.usage.storage, tenant.settings.maxStorage)}% storage
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Usage Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Storage Usage</span>
                      <span>{tenant.usage.storage} / {tenant.settings.maxStorage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${getUsagePercentage(tenant.usage.storage, tenant.settings.maxStorage)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bandwidth Usage</span>
                      <span>{tenant.usage.bandwidth} / {tenant.settings.maxBandwidth}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${getUsagePercentage(tenant.usage.bandwidth, tenant.settings.maxBandwidth)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Tenant Details */}
      {selectedTenant && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTenant.name} - Details
              </h2>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Domain</label>
                    <p className="text-sm font-medium">{selectedTenant.domain}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Plan</label>
                    <p className="text-sm font-medium capitalize">{selectedTenant.plan}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Created</label>
                    <p className="text-sm font-medium">{selectedTenant.createdAt}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <Badge 
                      variant={selectedTenant.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {selectedTenant.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Usage Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Users</label>
                    <p className="text-sm font-medium">
                      {selectedTenant.usage.users} / {selectedTenant.settings.maxUsers}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Storage</label>
                    <p className="text-sm font-medium">
                      {selectedTenant.usage.storage} / {selectedTenant.settings.maxStorage}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Bandwidth</label>
                    <p className="text-sm font-medium">
                      {selectedTenant.usage.bandwidth} / {selectedTenant.settings.maxBandwidth}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">API Calls</label>
                    <p className="text-sm font-medium">
                      {selectedTenant.usage.apiCalls.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Enabled Features</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTenant.settings.features.map((feature) => (
                  <Badge key={feature} variant="info" size="sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Placeholder */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateModal ? 'Create New Tenant' : 'Edit Tenant'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showCreateModal 
                ? 'Create a new tenant with custom branding and settings.' 
                : 'Update tenant settings and branding.'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  toast.success(showCreateModal ? 'Tenant created!' : 'Tenant updated!')
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {showCreateModal ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiTenancyManager
