import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Ban,
  RefreshCw
} from 'lucide-react'

const AdminUserManagement = () => {
  const { user } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  useEffect(() => {
    // Simulate fetching users
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        status: 'active',
        plan: 'Pro',
        domains: 3,
        lastLogin: '2 hours ago',
        joinDate: '2024-01-15',
        usage: 85,
        revenue: 29.99
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'admin',
        status: 'active',
        plan: 'Business',
        domains: 12,
        lastLogin: '1 day ago',
        joinDate: '2024-01-10',
        usage: 45,
        revenue: 99.99
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@startup.io',
        role: 'user',
        status: 'suspended',
        plan: 'Free',
        domains: 1,
        lastLogin: '1 week ago',
        joinDate: '2024-01-20',
        usage: 120,
        revenue: 0
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@enterprise.com',
        role: 'user',
        status: 'active',
        plan: 'Enterprise',
        domains: 25,
        lastLogin: '30 minutes ago',
        joinDate: '2024-01-05',
        usage: 60,
        revenue: 299.99
      }
    ]

    setUsers(mockUsers)
  }, [])

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'suspended': return <Ban className="w-4 h-4 text-red-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan) => {
    switch(plan) {
      case 'Free': return 'bg-gray-100 text-gray-800'
      case 'Pro': return 'bg-blue-100 text-blue-800'
      case 'Business': return 'bg-green-100 text-green-800'
      case 'Enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleUserAction = (action, userId) => {
    // console.log(`${action} user ${userId}`) // Commented to prevent console logs
    // Implement user actions
  }

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Users className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> {user.name}</div>
                  <div><span className="text-gray-500">Email:</span> {user.email}</div>
                  <div><span className="text-gray-500">Role:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <div><span className="text-gray-500">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Plan:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getPlanColor(user.plan)}`}>
                      {user.plan}
                    </span>
                  </div>
                  <div><span className="text-gray-500">Domains:</span> {user.domains}</div>
                  <div><span className="text-gray-500">Usage:</span> {user.usage}%</div>
                  <div><span className="text-gray-500">Revenue:</span> ${user.revenue}</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Activity Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Last Login:</span> {user.lastLogin}</div>
                <div><span className="text-gray-500">Join Date:</span> {user.joinDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.joinDate.includes('2024-01')).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domains</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(user.plan)}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.domains}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserDetails(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('suspend', user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('delete', user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

export default AdminUserManagement
