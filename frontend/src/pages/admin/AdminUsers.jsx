import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Users, User, Search, Filter, Plus, Edit, Trash2, 
  Eye, Settings, Shield, Mail, Phone, Calendar,
  CheckCircle, XCircle, Clock, AlertTriangle,
  Download, Upload, MoreVertical, Key, Lock
} from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 'USR-001',
      name: 'John Anderson',
      email: 'john.anderson@enterprise.com',
      role: 'admin',
      status: 'active',
      tenant: 'Enterprise Corp',
      department: 'IT Security',
      phone: '+1 (555) 123-4567',
      lastLogin: '2024-12-19 14:30:15',
      createdAt: '2024-01-15',
      permissions: ['read', 'write', 'admin'],
      twoFactorEnabled: true,
      loginAttempts: 0,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 'USR-002',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@techstart.io',
      role: 'user',
      status: 'active',
      tenant: 'TechStart Inc',
      department: 'Engineering',
      phone: '+1 (555) 234-5678',
      lastLogin: '2024-12-19 13:45:22',
      createdAt: '2024-02-03',
      permissions: ['read', 'write'],
      twoFactorEnabled: false,
      loginAttempts: 0,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 'USR-003',
      name: 'Michael Chen',
      email: 'mike.chen@globalsol.net',
      role: 'user',
      status: 'suspended',
      tenant: 'Global Solutions',
      department: 'Operations',
      phone: '+1 (555) 345-6789',
      lastLogin: '2024-12-14 16:20:08',
      createdAt: '2024-01-08',
      permissions: ['read'],
      twoFactorEnabled: true,
      loginAttempts: 3,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 'USR-004',
      name: 'Emily Rodriguez',
      email: 'emily.r@digitaldyn.com',
      role: 'super_admin',
      status: 'active',
      tenant: 'Digital Dynamics',
      department: 'Administration',
      phone: '+1 (555) 456-7890',
      lastLogin: '2024-12-19 15:12:33',
      createdAt: '2024-02-20',
      permissions: ['read', 'write', 'admin', 'super_admin'],
      twoFactorEnabled: true,
      loginAttempts: 0,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 'USR-005',
      name: 'David Thompson',
      email: 'david.t@company.com',
      role: 'user',
      status: 'pending',
      tenant: 'Pending Verification',
      department: 'Sales',
      phone: '+1 (555) 567-8901',
      lastLogin: 'Never',
      createdAt: '2024-12-18',
      permissions: [],
      twoFactorEnabled: false,
      loginAttempts: 0,
      avatar: '/api/placeholder/40/40'
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTenant, setFilterTenant] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    tenant: '',
    department: '',
    phone: '',
    permissions: ['read']
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tenant.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Tenant filter
    if (filterTenant !== 'all') {
      filtered = filtered.filter(user => user.tenant === filterTenant);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus, filterTenant, sortConfig]);

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    setModalMode(action);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u
        ));
        break;
      case 'suspend':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, status: 'suspended' } : u
        ));
        break;
      case 'delete':
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        break;
    }
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(u => u.id)
    );
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const user = {
        ...newUser,
        id: `USR-${Date.now()}`,
        status: 'pending',
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
        twoFactorEnabled: false,
        loginAttempts: 0,
        avatar: '/api/placeholder/40/40'
      };
      setUsers([...users, user]);
      setNewUser({
        name: '',
        email: '',
        role: 'user',
        tenant: '',
        department: '',
        phone: '',
        permissions: ['read']
      });
    } else if (modalMode === 'edit') {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...selectedUser } : u));
    }
    setShowUserModal(false);
  };

  const uniqueTenants = [...new Set(users.map(u => u.tenant))];

  return (
    <>
      <Helmet>
        <title>User Management - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage user accounts, roles, and permissions across all tenants
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleCreateUser}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.suspended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.pending}</p>
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={filterTenant}
                  onChange={(e) => setFilterTenant(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Tenants</option>
                  {uniqueTenants.map(tenant => (
                    <option key={tenant} value={tenant}>{tenant}</option>
                  ))}
                </select>
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{selectedUsers.length} selected</span>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    User
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    Role
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('tenant')}
                  >
                    Tenant
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastLogin')}
                  >
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Security
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.tenant}</div>
                      <div className="text-sm text-gray-500">{user.department}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.twoFactorEnabled ? (
                          <Shield className="h-4 w-4 text-green-600" title="2FA Enabled" />
                        ) : (
                          <Shield className="h-4 w-4 text-gray-400" title="2FA Disabled" />
                        )}
                        {user.loginAttempts > 0 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" title={`${user.loginAttempts} failed attempts`} />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUserAction('view', user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('edit', user)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUsers(users.filter(u => u.id !== user.id));
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
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

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'create' ? 'Create New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitUser} className="px-6 py-4 space-y-4">
                {modalMode === 'view' && selectedUser ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.status}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.tenant}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.department}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Login</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.lastLogin}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.createdAt}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Permissions</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedUser.permissions.map(permission => (
                          <span key={permission} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedUser?.name || '' : newUser.name}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, name: e.target.value})
                            : setNewUser({...newUser, name: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={modalMode === 'edit' ? selectedUser?.email || '' : newUser.email}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, email: e.target.value})
                            : setNewUser({...newUser, email: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={modalMode === 'edit' ? selectedUser?.role || '' : newUser.role}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, role: e.target.value})
                            : setNewUser({...newUser, role: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedUser?.tenant || '' : newUser.tenant}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, tenant: e.target.value})
                            : setNewUser({...newUser, tenant: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={modalMode === 'edit' ? selectedUser?.department || '' : newUser.department}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, department: e.target.value})
                            : setNewUser({...newUser, department: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={modalMode === 'edit' ? selectedUser?.phone || '' : newUser.phone}
                          onChange={(e) => modalMode === 'edit' 
                            ? setSelectedUser({...selectedUser, phone: e.target.value})
                            : setNewUser({...newUser, phone: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSubmitUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminUsers
