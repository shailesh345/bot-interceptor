import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Filter, Plus, Settings, Eye, Edit, Trash2,
  Building2, Users, Database, Activity, Shield, 
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Server, HardDrive, Cpu, BarChart3
} from 'lucide-react';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([
    {
      id: 'tenant-001',
      name: 'Enterprise Corp',
      domain: 'enterprise-corp.com',
      status: 'active',
      plan: 'Enterprise',
      users: 245,
      quota: { used: 1200, limit: 2000, unit: 'GB' },
      performance: { cpu: 65, memory: 72, requests: 15420 },
      created: '2024-01-15',
      lastActive: '2 hours ago',
      billing: { amount: 2840, status: 'paid' }
    },
    {
      id: 'tenant-002', 
      name: 'TechStart Inc',
      domain: 'techstart.io',
      status: 'active',
      plan: 'Professional',
      users: 89,
      quota: { used: 450, limit: 1000, unit: 'GB' },
      performance: { cpu: 45, memory: 58, requests: 8230 },
      created: '2024-02-03',
      lastActive: '30 minutes ago',
      billing: { amount: 890, status: 'paid' }
    },
    {
      id: 'tenant-003',
      name: 'Global Solutions',
      domain: 'globalsol.net',
      status: 'suspended',
      plan: 'Professional',
      users: 156,
      quota: { used: 780, limit: 1000, unit: 'GB' },
      performance: { cpu: 0, memory: 0, requests: 0 },
      created: '2024-01-08',
      lastActive: '5 days ago',
      billing: { amount: 890, status: 'overdue' }
    },
    {
      id: 'tenant-004',
      name: 'Digital Dynamics',
      domain: 'digitaldyn.com',
      status: 'active',
      plan: 'Basic',
      users: 23,
      quota: { used: 120, limit: 500, unit: 'GB' },
      performance: { cpu: 25, memory: 32, requests: 2840 },
      created: '2024-02-20',
      lastActive: '1 hour ago',
      billing: { amount: 290, status: 'paid' }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || tenant.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuotaPercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };

  const getQuotaColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
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

  const tenantStats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
    totalRevenue: tenants.reduce((sum, t) => sum + t.billing.amount, 0)
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
              Manage tenant isolation, quotas, and performance monitoring
            </p>
          </div>
          <button
            onClick={handleCreateTenant}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{tenantStats.suspended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${tenantStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Quota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => {
                  const quotaPercentage = getQuotaPercentage(tenant.quota.used, tenant.quota.limit);
                  
                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.domain}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(tenant.plan)}`}>
                          {tenant.plan}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{tenant.quota.used} {tenant.quota.unit}</span>
                            <span>{tenant.quota.limit} {tenant.quota.unit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getQuotaColor(quotaPercentage)}`}
                              style={{ width: `${quotaPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{quotaPercentage}% used</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center mb-1">
                            <Cpu className="h-3 w-3 text-gray-400 mr-1" />
                            <span>CPU: {tenant.performance.cpu}%</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <HardDrive className="h-3 w-3 text-gray-400 mr-1" />
                            <span>Memory: {tenant.performance.memory}%</span>
                          </div>
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 text-gray-400 mr-1" />
                            <span>{tenant.performance.requests.toLocaleString()} req/h</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">${tenant.billing.amount}</div>
                          <div className={`text-xs ${tenant.billing.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {tenant.billing.status}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTenantAction('view', tenant)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTenantAction('edit', tenant)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTenantAction('settings', tenant)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Details Modal */}
        {showTenantModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'create' ? 'Create New Tenant' : 
                   modalMode === 'edit' ? 'Edit Tenant' : 
                   modalMode === 'settings' ? 'Tenant Settings' : 'Tenant Details'}
                </h3>
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="px-6 py-4">
                {selectedTenant && modalMode === 'view' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                        <div className="space-y-3">
                          <div><strong>Name:</strong> {selectedTenant.name}</div>
                          <div><strong>Domain:</strong> {selectedTenant.domain}</div>
                          <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTenant.status)}`}>{selectedTenant.status}</span></div>
                          <div><strong>Plan:</strong> {selectedTenant.plan}</div>
                          <div><strong>Users:</strong> {selectedTenant.users}</div>
                          <div><strong>Created:</strong> {selectedTenant.created}</div>
                          <div><strong>Last Active:</strong> {selectedTenant.lastActive}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Resource Usage</h4>
                        <div className="space-y-3">
                          <div><strong>Storage:</strong> {selectedTenant.quota.used} / {selectedTenant.quota.limit} {selectedTenant.quota.unit}</div>
                          <div><strong>CPU Usage:</strong> {selectedTenant.performance.cpu}%</div>
                          <div><strong>Memory Usage:</strong> {selectedTenant.performance.memory}%</div>
                          <div><strong>Requests/Hour:</strong> {selectedTenant.performance.requests.toLocaleString()}</div>
                          <div><strong>Monthly Revenue:</strong> ${selectedTenant.billing.amount}</div>
                          <div><strong>Billing Status:</strong> {selectedTenant.billing.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {modalMode === 'create' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                          <option>Basic</option>
                          <option>Professional</option>
                          <option>Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Storage Quota (GB)</label>
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {modalMode !== 'view' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
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
export default TenantManagement;
