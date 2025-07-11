import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign, CreditCard, Receipt, FileText, TrendingUp,
  Calendar, Download, Upload, Filter, Search, Plus,
  Edit, Trash2, Eye, AlertTriangle, CheckCircle,
  XCircle, Clock, BarChart3, PieChart, Activity,
  Users, Building2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const AdvancedBilling = () => {
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      tenantId: 'TNT-001',
      tenantName: 'Enterprise Corp',
      amount: 24999,
      tax: 2249.91,
      total: 27248.91,
      status: 'paid',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      paidDate: '2024-12-28',
      billingPeriod: '2024-12-01 to 2024-12-31',
      items: [
        { description: 'Enterprise Plan - Monthly', quantity: 1, unitPrice: 19999, total: 19999 },
        { description: 'Additional Users (250)', quantity: 250, unitPrice: 20, total: 5000 }
      ],
      paymentMethod: 'credit_card',
      notes: 'Payment processed successfully'
    },
    {
      id: 'INV-2024-002',
      tenantId: 'TNT-002',
      tenantName: 'TechStart Inc',
      amount: 4999,
      tax: 449.91,
      total: 5448.91,
      status: 'overdue',
      issueDate: '2024-11-01',
      dueDate: '2024-11-30',
      paidDate: null,
      billingPeriod: '2024-11-01 to 2024-11-30',
      items: [
        { description: 'Professional Plan - Monthly', quantity: 1, unitPrice: 4999, total: 4999 }
      ],
      paymentMethod: 'bank_transfer',
      notes: 'Payment overdue - follow up required'
    },
    {
      id: 'INV-2024-003',
      tenantId: 'TNT-003',
      tenantName: 'Global Solutions',
      amount: 9999,
      tax: 899.91,
      total: 10898.91,
      status: 'pending',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      paidDate: null,
      billingPeriod: '2024-12-01 to 2024-12-31',
      items: [
        { description: 'Business Plan - Monthly', quantity: 1, unitPrice: 9999, total: 9999 }
      ],
      paymentMethod: 'credit_card',
      notes: 'Account suspended - payment pending'
    },
    {
      id: 'INV-2024-004',
      tenantId: 'TNT-004',
      tenantName: 'Digital Dynamics',
      amount: 19999,
      tax: 1799.91,
      total: 21798.91,
      status: 'paid',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      paidDate: '2024-12-15',
      billingPeriod: '2024-12-01 to 2024-12-31',
      items: [
        { description: 'Enterprise Plan - Monthly', quantity: 1, unitPrice: 19999, total: 19999 }
      ],
      paymentMethod: 'bank_transfer',
      notes: 'Early payment with discount applied'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'PM-001',
      tenantId: 'TNT-001',
      tenantName: 'Enterprise Corp',
      type: 'credit_card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
      status: 'active'
    },
    {
      id: 'PM-002',
      tenantId: 'TNT-002',
      tenantName: 'TechStart Inc',
      type: 'bank_transfer',
      bankName: 'Chase Bank',
      accountLast4: '1234',
      isDefault: true,
      status: 'active'
    }
  ]);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'SUB-001',
      tenantId: 'TNT-001',
      tenantName: 'Enterprise Corp',
      plan: 'enterprise',
      status: 'active',
      amount: 24999,
      billingCycle: 'monthly',
      nextBilling: '2025-01-01',
      startDate: '2024-01-15',
      trialEnd: null,
      usersIncluded: 1000,
      currentUsers: 1250,
      overage: 250,
      overageRate: 20
    },
    {
      id: 'SUB-002',
      tenantId: 'TNT-002',
      tenantName: 'TechStart Inc',
      plan: 'professional',
      status: 'active',
      amount: 4999,
      billingCycle: 'monthly',
      nextBilling: '2025-01-01',
      startDate: '2024-02-03',
      trialEnd: null,
      usersIncluded: 100,
      currentUsers: 85,
      overage: 0,
      overageRate: 15
    }
  ]);

  const [filteredInvoices, setFilteredInvoices] = useState(invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });

  const [newInvoice, setNewInvoice] = useState({
    tenantName: '',
    amount: '',
    billingPeriod: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: '', total: 0 }]
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const periodStart = new Date();
      
      switch (filterPeriod) {
        case 'current_month':
          periodStart.setMonth(now.getMonth(), 1);
          break;
        case 'last_month':
          periodStart.setMonth(now.getMonth() - 1, 1);
          break;
        case 'quarter':
          periodStart.setMonth(now.getMonth() - 3, 1);
          break;
        default:
          break;
      }

      if (filterPeriod !== 'all') {
        filtered = filtered.filter(invoice => 
          new Date(invoice.issueDate) >= periodStart
        );
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, filterStatus, filterPeriod, sortConfig]);

  // Calculate billing stats
  const billingStats = {
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pendingRevenue: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    overdueRevenue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
    overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleInvoiceAction = (action, invoice) => {
    setSelectedInvoice(invoice);
    setModalMode(action);
    setShowInvoiceModal(true);
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setModalMode('create');
    setShowInvoiceModal(true);
  };

  const handleSubmitInvoice = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const invoice = {
        ...newInvoice,
        id: `INV-${Date.now()}`,
        status: 'pending',
        issueDate: new Date().toISOString().split('T')[0],
        tax: Math.round(newInvoice.amount * 0.09),
        total: Math.round(newInvoice.amount * 1.09),
        paidDate: null,
        paymentMethod: 'credit_card'
      };
      setInvoices([...invoices, invoice]);
      setNewInvoice({
        tenantName: '',
        amount: '',
        billingPeriod: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, unitPrice: '', total: 0 }]
      });
    } else if (modalMode === 'edit') {
      setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? { ...selectedInvoice } : inv));
    }
    setShowInvoiceModal(false);
  };

  return (
    <>
      <Helmet>
        <title>Advanced Billing - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Billing</h1>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive billing management, invoice tracking, and revenue analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </button>
            <button
              onClick={handleCreateInvoice}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingStats.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingStats.paidRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{billingStats.paidInvoices} invoices</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingStats.pendingRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{billingStats.pendingInvoices} invoices</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingStats.overdueRevenue)}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {billingStats.overdueInvoices} invoices
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Subscriptions</h3>
            <p className="mt-1 text-sm text-gray-600">
              Monitor subscription status and billing cycles
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{subscription.tenantName}</h4>
                      <p className="text-sm text-gray-500">{subscription.plan} plan</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Monthly Amount</p>
                      <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Billing</p>
                      <p className="font-medium">{subscription.nextBilling}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Users</p>
                      <p className="font-medium">{subscription.currentUsers}/{subscription.usersIncluded}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Overage</p>
                      <p className="font-medium">{subscription.overage > 0 ? `+${subscription.overage}` : 'None'}</p>
                    </div>
                  </div>
                  
                  {subscription.overage > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                      <p className="text-xs text-yellow-800">
                        Overage charges: {formatCurrency(subscription.overage * subscription.overageRate)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Track and manage all billing invoices
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
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
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="current_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    Invoice
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tenantName')}
                  >
                    Client
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total')}
                  >
                    Amount
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('issueDate')}
                  >
                    Issue Date
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{invoice.billingPeriod}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{invoice.tenantName}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                      <div className="text-sm text-gray-500">+{formatCurrency(invoice.tax)} tax</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.issueDate}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.dueDate}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleInvoiceAction('view', invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleInvoiceAction('edit', invoice)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'create' ? 'Create New Invoice' : 
                   modalMode === 'edit' ? 'Edit Invoice' : 'Invoice Details'}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="px-6 py-4">
                {modalMode === 'view' && selectedInvoice ? (
                  <div className="space-y-6">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedInvoice.id}</h4>
                        <p className="text-sm text-gray-600">{selectedInvoice.billingPeriod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedInvoice.total)}</p>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                          {getStatusIcon(selectedInvoice.status)}
                          <span className="ml-1">{selectedInvoice.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bill To / Dates */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Bill To</h5>
                        <p className="text-sm font-medium text-gray-900">{selectedInvoice.tenantName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Issue Date:</span>
                          <span className="text-sm text-gray-900">{selectedInvoice.issueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Due Date:</span>
                          <span className="text-sm text-gray-900">{selectedInvoice.dueDate}</span>
                        </div>
                        {selectedInvoice.paidDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Paid Date:</span>
                            <span className="text-sm text-gray-900">{selectedInvoice.paidDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-4">Invoice Items</h5>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedInvoice.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Subtotal:</span>
                            <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tax:</span>
                            <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.tax)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="text-base font-medium text-gray-900">Total:</span>
                            <span className="text-base font-medium text-gray-900">{formatCurrency(selectedInvoice.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedInvoice.notes && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Notes</h5>
                        <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitInvoice} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedInvoice?.tenantName || '' : newInvoice.tenantName}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedInvoice({...selectedInvoice, tenantName: e.target.value})
                            : setNewInvoice({...newInvoice, tenantName: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          value={modalMode === 'edit' ? selectedInvoice?.amount || '' : newInvoice.amount}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedInvoice({...selectedInvoice, amount: parseInt(e.target.value)})
                            : setNewInvoice({...newInvoice, amount: parseInt(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedInvoice?.billingPeriod || '' : newInvoice.billingPeriod}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedInvoice({...selectedInvoice, billingPeriod: e.target.value})
                            : setNewInvoice({...newInvoice, billingPeriod: e.target.value})
                          }
                          placeholder="e.g., 2024-12-01 to 2024-12-31"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={modalMode === 'edit' ? selectedInvoice?.dueDate || '' : newInvoice.dueDate}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedInvoice({...selectedInvoice, dueDate: e.target.value})
                            : setNewInvoice({...newInvoice, dueDate: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode === 'view' && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                )}
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSubmitInvoice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Create Invoice' : 'Save Changes'}
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

export default AdvancedBilling;
