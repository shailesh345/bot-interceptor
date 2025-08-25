import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  Settings, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Key,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Activity,
  BarChart3,
  Database,
  Globe,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const RoleBasedAccessControl = () => {
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('roles')

  // Mock roles data
  const mockRoles = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      level: 10,
      users: 2,
      permissions: ['*'],
      createdAt: '2024-01-01',
      isSystem: true,
      color: 'purple'
    },
    {
      id: 2,
      name: 'Admin',
      description: 'Administrative access with most permissions',
      level: 8,
      users: 5,
      permissions: [
        'dashboard:read',
        'analytics:read',
        'analytics:write',
        'security:read',
        'security:write',
        'users:read',
        'users:write',
        'settings:read',
        'settings:write'
      ],
      createdAt: '2024-01-15',
      isSystem: false,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Team management with limited administrative access',
      level: 6,
      users: 12,
      permissions: [
        'dashboard:read',
        'analytics:read',
        'analytics:write',
        'security:read',
        'users:read',
        'settings:read'
      ],
      createdAt: '2024-02-01',
      isSystem: false,
      color: 'green'
    },
    {
      id: 4,
      name: 'Analyst',
      description: 'Data analysis and reporting access',
      level: 4,
      users: 25,
      permissions: [
        'dashboard:read',
        'analytics:read',
        'reports:read',
        'reports:write'
      ],
      createdAt: '2024-02-15',
      isSystem: false,
      color: 'orange'
    },
    {
      id: 5,
      name: 'Viewer',
      description: 'Read-only access to basic information',
      level: 2,
      users: 45,
      permissions: [
        'dashboard:read',
        'analytics:read'
      ],
      createdAt: '2024-03-01',
      isSystem: false,
      color: 'gray'
    }
  ]

  // Mock users data
  const mockUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2024-08-25 14:30',
      permissions: ['*'],
      twoFactorEnabled: true,
      ipWhitelist: ['192.168.1.0/24']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-08-25 13:45',
      permissions: [
        'dashboard:read',
        'analytics:read',
        'analytics:write',
        'security:read',
        'security:write',
        'users:read',
        'users:write',
        'settings:read',
        'settings:write'
      ],
      twoFactorEnabled: true,
      ipWhitelist: []
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'Manager',
      status: 'active',
      lastLogin: '2024-08-25 12:15',
      permissions: [
        'dashboard:read',
        'analytics:read',
        'analytics:write',
        'security:read',
        'users:read',
        'settings:read'
      ],
      twoFactorEnabled: false,
      ipWhitelist: []
    }
  ]

  // Mock permissions data
  const mockPermissions = [
    {
      category: 'Dashboard',
      permissions: [
        { id: 'dashboard:read', name: 'View Dashboard', description: 'Access to main dashboard' },
        { id: 'dashboard:write', name: 'Modify Dashboard', description: 'Customize dashboard layout' }
      ]
    },
    {
      category: 'Analytics',
      permissions: [
        { id: 'analytics:read', name: 'View Analytics', description: 'Access to analytics data' },
        { id: 'analytics:write', name: 'Modify Analytics', description: 'Create and modify analytics' },
        { id: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data' }
      ]
    },
    {
      category: 'Security',
      permissions: [
        { id: 'security:read', name: 'View Security', description: 'Access to security settings' },
        { id: 'security:write', name: 'Modify Security', description: 'Modify security configurations' },
        { id: 'security:admin', name: 'Security Admin', description: 'Full security administration' }
      ]
    },
    {
      category: 'Users',
      permissions: [
        { id: 'users:read', name: 'View Users', description: 'View user information' },
        { id: 'users:write', name: 'Modify Users', description: 'Create and modify users' },
        { id: 'users:delete', name: 'Delete Users', description: 'Delete user accounts' }
      ]
    },
    {
      category: 'Settings',
      permissions: [
        { id: 'settings:read', name: 'View Settings', description: 'Access to system settings' },
        { id: 'settings:write', name: 'Modify Settings', description: 'Modify system settings' }
      ]
    },
    {
      category: 'Reports',
      permissions: [
        { id: 'reports:read', name: 'View Reports', description: 'Access to reports' },
        { id: 'reports:write', name: 'Create Reports', description: 'Create and modify reports' },
        { id: 'reports:export', name: 'Export Reports', description: 'Export report data' }
      ]
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 1000)),
        new Promise(resolve => setTimeout(resolve, 1200)),
        new Promise(resolve => setTimeout(resolve, 800))
      ])
      
      setRoles(mockRoles)
      setUsers(mockUsers)
      setPermissions(mockPermissions)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async (roleData) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newRole = {
        id: Date.now(),
        ...roleData,
        users: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isSystem: false
      }
      
      setRoles(prev => [...prev, newRole])
      setShowCreateRole(false)
      toast.success('Role created successfully!')
    } catch (error) {
      toast.error('Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (roleId, updates) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRoles(prev => 
        prev.map(role => 
          role.id === roleId ? { ...role, ...updates } : role
        )
      )
      setShowEditRole(false)
      toast.success('Role updated successfully!')
    } catch (error) {
      toast.error('Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId)
    if (role.isSystem) {
      toast.error('Cannot delete system roles')
      return
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRoles(prev => prev.filter(role => role.id !== roleId))
      toast.success('Role deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete role')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (color) => {
    const colors = {
      purple: 'text-purple-600 bg-purple-100',
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      gray: 'text-gray-600 bg-gray-100'
    }
    return colors[color] || colors.gray
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatLastLogin = (lastLogin) => {
    const date = new Date(lastLogin)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
          <p className="text-gray-600">Manage user roles, permissions, and security policies</p>
        </div>
        <button
          onClick={() => setShowCreateRole(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {permissions.reduce((sum, cat) => sum + cat.permissions.length, 0)}
              </p>
            </div>
            <Key className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="warning" size="sm">Granular</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">2FA Enabled</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.twoFactorEnabled).length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Secure</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permissions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Roles Tab */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                            <p className="text-sm text-gray-500">{role.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="info" 
                                size="sm"
                                className={getRoleColor(role.color)}
                              >
                                Level {role.level}
                              </Badge>
                              <Badge variant="info" size="sm">{role.users} users</Badge>
                              {role.isSystem && (
                                <Badge variant="warning" size="sm">System</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRole(role)
                              setShowEditRole(true)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedRole(role)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Permissions Preview */}
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Permissions</h4>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.includes('*') ? (
                            <Badge variant="success" size="sm">All Permissions</Badge>
                          ) : (
                            role.permissions.slice(0, 5).map((permission) => (
                              <Badge key={permission} variant="info" size="sm">
                                {permission}
                              </Badge>
                            ))
                          )}
                          {role.permissions.length > 5 && (
                            <Badge variant="info" size="sm">
                              +{role.permissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="info" size="sm">{user.role}</Badge>
                              <Badge 
                                variant={user.status === 'active' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {user.status}
                              </Badge>
                              {user.twoFactorEnabled && (
                                <Badge variant="success" size="sm">2FA</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Last login: {formatLastLogin(user.lastLogin)}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  {permissions.map((category) => (
                    <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">{category.category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                              <Badge variant="info" size="sm">{permission.id}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">{permission.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Role Modal Placeholder */}
      {(showCreateRole || showEditRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateRole ? 'Create New Role' : 'Edit Role'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showCreateRole 
                ? 'Create a new role with specific permissions.' 
                : 'Update role permissions and settings.'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateRole(false)
                  setShowEditRole(false)
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateRole(false)
                  setShowEditRole(false)
                  toast.success(showCreateRole ? 'Role created!' : 'Role updated!')
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {showCreateRole ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleBasedAccessControl
