import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Palette, Monitor, Smartphone, Globe, Upload, Download,
  Eye, Save, RefreshCw, Settings, Image, Type, Layout,
  Code, Brush, Zap, Building2, Shield, Users, Target,
  Copy, ExternalLink, Edit, Trash2, Plus, Search,
  CheckCircle, AlertTriangle, Clock, Star, Filter
} from 'lucide-react';

const WhiteLabel = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [selectedClient, setSelectedClient] = useState('all');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');

  // Mock white-label configurations
  const [brandingConfigs, setBrandingConfigs] = useState([
    {
      id: 1,
      clientName: 'Acme Corporation',
      domain: 'security.acme.com',
      logo: '/logos/acme-logo.png',
      favicon: '/favicons/acme.ico',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      accentColor: '#10B981',
      status: 'active',
      lastUpdated: '2024-07-10',
      customCSS: '.header { background: linear-gradient(135deg, #1E40AF, #3B82F6); }',
      features: ['custom_domain', 'white_label_emails', 'custom_support'],
      usage: {
        pageViews: 45230,
        uniqueVisitors: 12450,
        avgSessionDuration: '4m 32s',
        bounceRate: 23.5
      }
    },
    {
      id: 2,
      clientName: 'TechStart Inc',
      domain: 'monitor.techstart.io',
      logo: '/logos/techstart-logo.png',
      favicon: '/favicons/techstart.ico',
      primaryColor: '#7C3AED',
      secondaryColor: '#A855F7',
      accentColor: '#F59E0B',
      status: 'active',
      lastUpdated: '2024-07-09',
      customCSS: '.sidebar { background: #7C3AED; } .nav-item:hover { background: #A855F7; }',
      features: ['custom_domain', 'white_label_emails'],
      usage: {
        pageViews: 28940,
        uniqueVisitors: 8760,
        avgSessionDuration: '3m 45s',
        bounceRate: 28.1
      }
    },
    {
      id: 3,
      clientName: 'Global Solutions',
      domain: 'platform.globalsol.com',
      logo: '/logos/global-logo.png',
      favicon: '/favicons/global.ico',
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      accentColor: '#059669',
      status: 'pending',
      lastUpdated: '2024-07-08',
      customCSS: '.dashboard-card { border-left: 4px solid #DC2626; }',
      features: ['custom_domain', 'white_label_emails', 'custom_support', 'api_branding'],
      usage: {
        pageViews: 15670,
        uniqueVisitors: 4230,
        avgSessionDuration: '5m 18s',
        bounceRate: 19.8
      }
    }
  ]);

  const [themeTemplates, setThemeTemplates] = useState([
    {
      id: 1,
      name: 'Corporate Blue',
      category: 'Professional',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      previewImage: '/themes/corporate-blue.png',
      isPopular: true,
      usageCount: 23
    },
    {
      id: 2,
      name: 'Dark Matter',
      category: 'Modern',
      primaryColor: '#111827',
      secondaryColor: '#374151',
      previewImage: '/themes/dark-matter.png',
      isPopular: true,
      usageCount: 18
    },
    {
      id: 3,
      name: 'Emerald Clean',
      category: 'Fresh',
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      previewImage: '/themes/emerald-clean.png',
      isPopular: false,
      usageCount: 12
    },
    {
      id: 4,
      name: 'Sunset Orange',
      category: 'Vibrant',
      primaryColor: '#EA580C',
      secondaryColor: '#F97316',
      previewImage: '/themes/sunset-orange.png',
      isPopular: false,
      usageCount: 8
    }
  ]);

  // Analytics data
  const usageAnalytics = [
    { month: 'Jan', activeClients: 18, pageViews: 450000, customizations: 45 },
    { month: 'Feb', activeClients: 22, pageViews: 520000, customizations: 52 },
    { month: 'Mar', activeClients: 26, pageViews: 610000, customizations: 58 },
    { month: 'Apr', activeClients: 31, pageViews: 720000, customizations: 67 },
    { month: 'May', activeClients: 35, pageViews: 898890, customizations: 74 },
    { month: 'Jun', activeClients: 38, pageViews: 890000, customizations: 81 }
  ];

  const featureAdoption = [
    { feature: 'Custom Domain', adoption: 92, clients: 35 },
    { feature: 'Logo Customization', adoption: 87, clients: 33 },
    { feature: 'Color Theming', adoption: 84, clients: 32 },
    { feature: 'White-label Emails', adoption: 76, clients: 29 },
    { feature: 'Custom CSS', adoption: 63, clients: 24 },
    { feature: 'API Branding', adoption: 45, clients: 17 }
  ];

  const clientDistribution = [
    { tier: 'Enterprise', count: 15, percentage: 39.5 },
    { tier: 'Professional', count: 18, percentage: 47.4 },
    { tier: 'Starter', count: 5, percentage: 13.1 }
  ];

  const filteredConfigs = selectedClient === 'all' ? brandingConfigs : 
    brandingConfigs.filter(config => config.id === parseInt(selectedClient));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <>
      <Helmet>
        <title>White-Label Management - Admin Portal</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">White-Label Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Customize branding, themes, and client-specific configurations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Clients</option>
              {brandingConfigs.map(config => (
                <option key={config.id} value={config.id}>{config.clientName}</option>
              ))}
            </select>
            <button
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Configuration
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Clients</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {brandingConfigs.filter(c => c.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Custom Themes</dt>
                    <dd className="text-lg font-medium text-gray-900">{themeTemplates.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Page Views</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {brandingConfigs.reduce((sum, config) => sum + config.usage.pageViews, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Custom Domains</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {brandingConfigs.filter(c => c.features.includes('custom_domain')).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'branding', name: 'Client Branding', icon: Palette },
              { id: 'themes', name: 'Theme Templates', icon: Brush },
              { id: 'analytics', name: 'Usage Analytics', icon: BarChart },
              { id: 'domains', name: 'Domain Management', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Client Branding Configurations */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Branding Configurations</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Preview Device:</span>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-3 py-1 text-xs font-medium border ${
                          previewDevice === 'desktop' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        <Monitor className="h-3 w-3 mr-1" />
                        Desktop
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-3 py-1 text-xs font-medium border-t border-b border-r ${
                          previewDevice === 'mobile' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        <Smartphone className="h-3 w-3 mr-1" />
                        Mobile
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredConfigs.map((config) => (
                    <div key={config.id} className="border rounded-lg overflow-hidden">
                      {/* Preview Header */}
                      <div 
                        className="h-32 p-4 text-white relative"
                        style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                              <Image className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{config.clientName}</h4>
                              <p className="text-sm opacity-90">{config.domain}</p>
                            </div>
                          </div>
                          {getStatusIcon(config.status)}
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            config.status === 'active' ? 'bg-green-100 text-green-800' :
                            config.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {config.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Configuration Details */}
                      <div className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Color Scheme</h5>
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: config.primaryColor }}></div>
                                <span className="text-xs text-gray-500">Primary</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: config.secondaryColor }}></div>
                                <span className="text-xs text-gray-500">Secondary</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: config.accentColor }}></div>
                                <span className="text-xs text-gray-500">Accent</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Features</h5>
                            <div className="flex flex-wrap gap-1">
                              {config.features.map((feature, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {feature.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Usage Stats</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Page Views:</span>
                                <span className="ml-1 font-medium">{config.usage.pageViews.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Visitors:</span>
                                <span className="ml-1 font-medium">{config.usage.uniqueVisitors.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Avg Session:</span>
                                <span className="ml-1 font-medium">{config.usage.avgSessionDuration}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Bounce Rate:</span>
                                <span className="ml-1 font-medium">{config.usage.bounceRate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500">Updated: {config.lastUpdated}</span>
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-900">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Theme Templates */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Theme Templates</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {themeTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 p-4 relative" style={{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})` }}>
                      <div className="absolute top-2 right-2">
                        {template.isPopular && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 text-white">
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm opacity-90">{template.category}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex space-x-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: template.primaryColor }}></div>
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: template.secondaryColor }}></div>
                        </div>
                        <span className="text-sm text-gray-500">{template.usageCount} clients</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Preview
                        </button>
                        <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Usage Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Trends */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Usage Trends</h3>
                  <BarChart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="activeClients" fill="#3B82F6" name="Active Clients" />
                      <Line yAxisId="right" type="monotone" dataKey="pageViews" stroke="#10B981" strokeWidth={3} name="Page Views" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Client Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Distribution</h3>
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ tier, percentage }) => `${tier}: ${percentage}%`}
                      >
                        {clientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Feature Adoption */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Adoption</h3>
              <div className="space-y-4">
                {featureAdoption.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{feature.feature}</span>
                        <span className="text-sm text-gray-500">{feature.adoption}% ({feature.clients} clients)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${feature.adoption}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="space-y-6">
            {/* Domain Management */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Domains</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSL Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNS Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Verified</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {brandingConfigs.map((config) => (
                        <tr key={config.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{config.domain}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Valid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.lastUpdated}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WhiteLabel;
