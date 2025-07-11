import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  Search, Filter, Plus, Download, Eye, Edit, Trash2, 
  Building, MapPin, DollarSign, TrendingUp, Users, 
  Heart, AlertCircle, CheckCircle, Clock, Star
} from 'lucide-react';
import { generateMockClients } from '../../services/enhancedMockAPI';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  useEffect(() => {
    const clientData = generateMockClients();
    setClients(clientData);
    setFilteredClients(clientData);
  }, []);

  useEffect(() => {
    let filtered = clients;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(client => client.lifecycle === selectedFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  }, [clients, selectedFilter, searchTerm]);

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLifecycleIcon = (lifecycle) => {
    switch (lifecycle) {
      case 'prospect': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'trial': return <Star className="h-4 w-4 text-blue-600" />;
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at-risk': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const lifecycleStats = {
    all: clients.length,
    prospect: clients.filter(c => c.lifecycle === 'prospect').length,
    trial: clients.filter(c => c.lifecycle === 'trial').length,
    active: clients.filter(c => c.lifecycle === 'active').length,
    'at-risk': clients.filter(c => c.lifecycle === 'at-risk').length
  };

  const handleExportClients = () => {
    try {
      const csvData = clients.map(client => 
        `${client.name},${client.email},${client.industry},${client.lifecycle},${client.healthScore},${client.mrr}`
      ).join('\n')
      const blob = new Blob([`Name,Email,Industry,Lifecycle,Health Score,MRR\n${csvData}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Client data exported successfully!')
    } catch (error) {
      toast.error('Failed to export client data')
    }
  }

  const handleAddClient = () => {
    toast.info('Add Client modal would open here - feature coming soon!')
  }

  const handleEditClient = (client) => {
    toast.info(`Edit client ${client.name} - feature coming soon!`)
  }

  const handleDeleteClient = (client) => {
    if (window.confirm(`Are you sure you want to delete client ${client.name}?`)) {
      const updatedClients = clients.filter(c => c.id !== client.id)
      setClients(updatedClients)
      toast.success(`Client ${client.name} deleted successfully`)
    }
  }

  return (
    <>
      <Helmet><title>Client Management - Admin</title></Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage your client portfolio and track health metrics</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleExportClients}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(lifecycleStats).map(([stage, count]) => (
            <div key={stage} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {stage === 'all' ? 'Total Clients' : stage.replace('-', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getLifecycleIcon(stage)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {['all', 'prospect', 'trial', 'active', 'at-risk'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-2 text-sm font-medium rounded-md capitalize ${
                    selectedFilter === filter
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('-', ' ')} ({lifecycleStats[filter]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue & MRR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifecycle Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.industry}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {client.country} • {client.size}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(client.revenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(client.mrr)}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(client.healthScore)}`}>
                        <Heart className="h-3 w-3 mr-1" />
                        {client.healthScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLifecycleIcon(client.lifecycle)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {client.lifecycle.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${client.usage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{client.usage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client)}
                          className="text-red-600 hover:text-red-900"
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

        {/* Client Details Modal */}
        {showClientDetails && selectedClient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
                  <button
                    onClick={() => setShowClientDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Company Name</label>
                        <p className="text-sm text-gray-900">{selectedClient.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{selectedClient.email}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Industry</label>
                        <p className="text-sm text-gray-900">{selectedClient.industry}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Country</label>
                        <p className="text-sm text-gray-900">{selectedClient.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Financial Metrics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <label className="block text-xs font-medium text-gray-500">Total Revenue</label>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedClient.revenue)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <label className="block text-xs font-medium text-gray-500">Monthly Recurring Revenue</label>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedClient.mrr)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <label className="block text-xs font-medium text-gray-500">Health Score</label>
                        <p className={`text-lg font-semibold ${selectedClient.healthScore >= 80 ? 'text-green-600' : selectedClient.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {selectedClient.healthScore}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Contacts</h4>
                    <div className="space-y-2">
                      {selectedClient.contacts?.map((contact, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.role}</p>
                          </div>
                          <p className="text-sm text-blue-600">{contact.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domains & Features */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Domains</h4>
                      <div className="space-y-1">
                        {selectedClient.domains?.map((domain, index) => (
                          <p key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {domain}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                      <div className="space-y-1">
                        {selectedClient.features?.map((feature, index) => (
                          <p key={index} className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                            {feature}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowClientDetails(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    Edit Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientManagement;
