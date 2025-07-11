import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Building, Building2, Globe, Users, Server, Activity,
  DollarSign, Settings, Shield, Cpu, HardDrive, Database,
  ChevronRight, Plus, Edit, Trash2, Eye, AlertTriangle,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Search, Filter, MoreVertical, Download, Upload
} from 'lucide-react'

const AdminTenants = () => {
  const [tenants, setTenants] = useState([
    {
      id: 'TNT-001',
      name: 'Enterprise Corp',
      domain: 'enterprise-corp.com',
      status: 'active',
      plan: 'enterprise',
      users: 1250,
      maxUsers: 2000,
      storage: 850,
      maxStorage: 1000,
      bandwidth: 2.3,
      maxBandwidth: 5.0,
      monthlyRevenue: 24999,
      createdAt: '2024-01-15',
      lastActivity: '2024-12-19 15:30:22',
      features: ['custom_domain', 'sso', 'api_access', 'advanced_analytics'],
      billingCycle: 'annual',
      supportTier: 'enterprise',
      compliance: ['SOC2', 'GDPR', 'HIPAA'],
      adminContact: {
        name: 'John Anderson',
        email: 'john.anderson@enterprise.com',
        phone: '+1 (555) 123-4567'
      },
      performance: {
        uptime: 99.98,
        responseTime: 145,
        errorRate: 0.02
      }
    },
    {
      id: 'TNT-002',
      name: 'TechStart Inc',
      domain: 'techstart.io',
      status: 'active',
      plan: 'professional',
      users: 85,
      maxUsers: 100,
      storage: 120,
      maxStorage: 250,
      bandwidth: 0.8,
      maxBandwidth: 2.0,
      monthlyRevenue: 4999,
      createdAt: '2024-02-03',
      lastActivity: '2024-12-19 14:45:15',
      features: ['custom_domain', 'api_access'],
      billingCycle: 'monthly',
      supportTier: 'standard',
      compliance: ['GDPR'],
      adminContact: {
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@techstart.io',
        phone: '+1 (555) 234-5678'
      },
      performance: {
        uptime: 99.95,
        responseTime: 230,
        errorRate: 0.05
      }
    },
    {
      id: 'TNT-003',
      name: 'Global Solutions',
      domain: 'globalsol.net',
      status: 'suspended',
      plan: 'business',
      users: 320,
      maxUsers: 500,
      storage: 480,
      maxStorage: 500,
      bandwidth: 1.2,
      maxBandwidth: 3.0,
      monthlyRevenue: 9999,
      createdAt: '2024-01-08',
      lastActivity: '2024-12-14 16:20:08',
      features: ['sso', 'api_access'],
      billingCycle: 'annual',
      supportTier: 'business',
      compliance: ['SOC2', 'GDPR'],
      adminContact: {
        name: 'Michael Chen',
        email: 'mike.chen@globalsol.net',
        phone: '+1 (555) 345-6789'
      },
      performance: {
        uptime: 99.92,
        responseTime: 280,
        errorRate: 0.08
      }
    },
    {
      id: 'TNT-004',
      name: 'Digital Dynamics',
      domain: 'digitaldyn.com',
      status: 'active',
      plan: 'enterprise',
      users: 890,
      maxUsers: 1500,
      storage: 650,
      maxStorage: 1000,
      bandwidth: 1.8,
      maxBandwidth: 4.0,
      monthlyRevenue: 19999,
      createdAt: '2024-02-20',
      lastActivity: '2024-12-19 15:12:33',
      features: ['custom_domain', 'sso', 'api_access', 'advanced_analytics', 'white_label'],
      billingCycle: 'annual',
      supportTier: 'enterprise',
      compliance: ['SOC2', 'GDPR', 'CCPA'],
      adminContact: {
        name: 'Emily Rodriguez',
        email: 'emily.r@digitaldyn.com',
        phone: '+1 (555) 456-7890'
      },
      performance: {
        uptime: 99.99,
        responseTime: 125,
        errorRate: 0.01
      }
    },
    {
      id: 'TNT-005',
      name: 'StartupX',
      domain: 'startupx.com',
      status: 'trial',
      plan: 'starter',
      users: 12,
      maxUsers: 25,
      storage: 15,
      maxStorage: 50,
      bandwidth: 0.2,
      maxBandwidth: 0.5,
      monthlyRevenue: 0,
      createdAt: '2024-12-10',
      lastActivity: '2024-12-19 11:30:45',
      features: [],
      billingCycle: 'trial',
      supportTier: 'basic',
      compliance: [],
      adminContact: {
        name: 'Alex Thompson',
        email: 'alex@startupx.com',
        phone: '+1 (555) 567-8901'
      },
      performance: {
        uptime: 99.90,
        responseTime: 350,
        errorRate: 0.10
      }
    }
  ]);

  const [filteredTenants, setFilteredTenants] = useState(tenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    plan: 'starter',
    maxUsers: 25,
    maxStorage: 50,
    maxBandwidth: 0.5,
    billingCycle: 'monthly',
    supportTier: 'basic',
    adminContact: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = tenants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.adminContact.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === filterStatus);
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(tenant => tenant.plan === filterPlan);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTenants(filtered);
  }, [tenants, searchTerm, filterStatus, filterPlan, sortConfig]);

  const tenantStats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    totalRevenue: tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0),
    totalUsers: tenants.reduce((sum, t) => sum + t.users, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-indigo-100 text-indigo-800';
      case 'starter': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      case 'trial': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getUsagePercentage = (used, max) => {
    return Math.round((used / max) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTenantAction = (action, tenant) => {
    setSelectedTenant(tenant);
    setModalMode(action);
    setShowTenantModal(true);
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setModalMode('create');
    setShowTenantModal(true);
  };

  const handleSubmitTenant = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const tenant = {
        ...newTenant,
        id: `TNT-${Date.now()}`,
        status: 'trial',
        users: 0,
        storage: 0,
        bandwidth: 0,
        monthlyRevenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: 'Never',
        features: [],
        compliance: [],
        performance: {
          uptime: 99.50,
          responseTime: 300,
          errorRate: 0.05
        }
      };
      setTenants([...tenants, tenant]);
      setNewTenant({
        name: '',
        domain: '',
        plan: 'starter',
        maxUsers: 25,
        maxStorage: 50,
        maxBandwidth: 0.5,
        billingCycle: 'monthly',
        supportTier: 'basic',
        adminContact: {
          name: '',
          email: '',
          phone: ''
        }
      });
    } else if (modalMode === 'edit') {
      setTenants(tenants.map(t => t.id === selectedTenant.id ? { ...selectedTenant } : t));
    }
    setShowTenantModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Tenant Management - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage organizations, monitor resource usage, and track performance across all tenants
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleCreateTenant}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </button>
          </div>
        </div>

        {/* Tenant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trial</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.trial}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.suspended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(tenantStats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>

                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Tenant
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('plan')}
                  >
                    Plan
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('monthlyRevenue')}
                  >
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.domain}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                        {getStatusIcon(tenant.status)}
                        <span className="ml-1">{tenant.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Users className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{tenant.users}/{tenant.maxUsers} users</span>
                          <span className={`ml-2 px-1 rounded ${getUsageColor(getUsagePercentage(tenant.users, tenant.maxUsers))}`}>
                            {getUsagePercentage(tenant.users, tenant.maxUsers)}%
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <HardDrive className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{tenant.storage}GB/{tenant.maxStorage}GB</span>
                          <span className={`ml-2 px-1 rounded ${getUsageColor(getUsagePercentage(tenant.storage, tenant.maxStorage))}`}>
                            {getUsagePercentage(tenant.storage, tenant.maxStorage)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-green-600" />
                          <span>{tenant.performance.uptime}% uptime</span>
                        </div>
                        <div className="flex items-center">
                          <Cpu className="h-3 w-3 mr-1 text-blue-600" />
                          <span>{tenant.performance.responseTime}ms</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(tenant.monthlyRevenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.billingCycle}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTenantAction('view', tenant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTenantAction('edit', tenant)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Tenant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTenants(tenants.filter(t => t.id !== tenant.id));
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Tenant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Modal */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'create' ? 'Create New Tenant' : 
                   modalMode === 'edit' ? 'Edit Tenant' : 'Tenant Details'}
                </h3>
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="px-6 py-4">
                {modalMode === 'view' && selectedTenant ? (
                  <div className="space-y-6">
                    {/* Tenant Overview */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Domain</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.domain}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Plan</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.plan}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.status}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.createdAt}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.lastActivity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.billingCycle}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Support Tier</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.supportTier}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Resource Usage</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Users</span>
                            <span className="text-sm text-gray-500">{selectedTenant.users}/{selectedTenant.maxUsers}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${getUsagePercentage(selectedTenant.users, selectedTenant.maxUsers)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Storage</span>
                            <span className="text-sm text-gray-500">{selectedTenant.storage}GB/{selectedTenant.maxStorage}GB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${getUsagePercentage(selectedTenant.storage, selectedTenant.maxStorage)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Bandwidth</span>
                            <span className="text-sm text-gray-500">{selectedTenant.bandwidth}GB/{selectedTenant.maxBandwidth}GB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${getUsagePercentage(selectedTenant.bandwidth, selectedTenant.maxBandwidth)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Contact */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Contact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.adminContact.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.adminContact.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTenant.adminContact.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features & Compliance */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTenant.features.map(feature => (
                            <span key={feature} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {feature.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Compliance</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTenant.compliance.map(cert => (
                            <span key={cert} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTenant} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedTenant?.name || '' : newTenant.name}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, name: e.target.value})
                            : setNewTenant({...newTenant, name: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedTenant?.domain || '' : newTenant.domain}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, domain: e.target.value})
                            : setNewTenant({...newTenant, domain: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select
                          value={modalMode === 'edit' ? selectedTenant?.plan || '' : newTenant.plan}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, plan: e.target.value})
                            : setNewTenant({...newTenant, plan: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="starter">Starter</option>
                          <option value="professional">Professional</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                        <select
                          value={modalMode === 'edit' ? selectedTenant?.billingCycle || '' : newTenant.billingCycle}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, billingCycle: e.target.value})
                            : setNewTenant({...newTenant, billingCycle: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="annual">Annual</option>
                          <option value="trial">Trial</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
                        <input
                          type="number"
                          value={modalMode === 'edit' ? selectedTenant?.maxUsers || 0 : newTenant.maxUsers}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, maxUsers: parseInt(e.target.value)})
                            : setNewTenant({...newTenant, maxUsers: parseInt(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Storage (GB)</label>
                        <input
                          type="number"
                          value={modalMode === 'edit' ? selectedTenant?.maxStorage || 0 : newTenant.maxStorage}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, maxStorage: parseInt(e.target.value)})
                            : setNewTenant({...newTenant, maxStorage: parseInt(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Bandwidth (GB)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={modalMode === 'edit' ? selectedTenant?.maxBandwidth || 0 : newTenant.maxBandwidth}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedTenant({...selectedTenant, maxBandwidth: parseFloat(e.target.value)})
                            : setNewTenant({...newTenant, maxBandwidth: parseFloat(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min="0.1"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Contact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={modalMode === 'edit' ? selectedTenant?.adminContact?.name || '' : newTenant.adminContact.name}
                            onChange={(e) => modalMode === 'edit' 
                              ? setSelectedTenant({...selectedTenant, adminContact: {...selectedTenant.adminContact, name: e.target.value}})
                              : setNewTenant({...newTenant, adminContact: {...newTenant.adminContact, name: e.target.value}})
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={modalMode === 'edit' ? selectedTenant?.adminContact?.email || '' : newTenant.adminContact.email}
                            onChange={(e) => modalMode === 'edit' 
                              ? setSelectedTenant({...selectedTenant, adminContact: {...selectedTenant.adminContact, email: e.target.value}})
                              : setNewTenant({...newTenant, adminContact: {...newTenant.adminContact, email: e.target.value}})
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={modalMode === 'edit' ? selectedTenant?.adminContact?.phone || '' : newTenant.adminContact.phone}
                            onChange={(e) => modalMode === 'edit' 
                              ? setSelectedTenant({...selectedTenant, adminContact: {...selectedTenant.adminContact, phone: e.target.value}})
                              : setNewTenant({...newTenant, adminContact: {...newTenant.adminContact, phone: e.target.value}})
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSubmitTenant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Create Tenant' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTenants;
