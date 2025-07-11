import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector, useDispatch } from 'react-redux'
import { 
  User, Camera, Mail, Phone, MapPin, Calendar, 
  Edit3, Save, X, Shield, Key, Bell, 
  Activity, BarChart3, Clock, Award,
  Settings, Lock, Eye, EyeOff, Upload
} from 'lucide-react'

const Profile = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showChangePassword, setShowChangePassword] = useState(false)
  
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || 'John',
    lastName: user?.name?.split(' ')[1] || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Developer',
    company: 'Acme Corporation',
    bio: 'Experienced developer with a passion for web security and traffic management solutions.',
    timezone: 'PST (UTC-8)',
    language: 'English',
    avatar: user?.avatar || '/api/placeholder/120/120'
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [activitySettings, setActivitySettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true
  })

  // Mock activity data
  const recentActivity = [
    { id: 1, action: 'Updated security rules', timestamp: '2 hours ago', type: 'security' },
    { id: 2, action: 'Added new domain', timestamp: '1 day ago', type: 'domain' },
    { id: 3, action: 'Generated API key', timestamp: '3 days ago', type: 'api' },
    { id: 4, action: 'Updated billing information', timestamp: '5 days ago', type: 'billing' },
    { id: 5, action: 'Login from new device', timestamp: '1 week ago', type: 'security' }
  ]

  const accountStats = {
    domainsManaged: 12,
    rulesCreated: 48,
    apiCalls: '2.4M',
    uptime: '99.9%'
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'activity', name: 'Activity', icon: Activity },
    { id: 'preferences', name: 'Preferences', icon: Settings }
  ]

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    })
  }

  const handleActivitySettingChange = (setting) => {
    setActivitySettings({
      ...activitySettings,
      [setting]: !activitySettings[setting]
    })
  }

  const handleSaveProfile = () => {
    // Dispatch update profile action
    console.log('Saving profile:', profileData)
    setEditMode(false)
  }

  const handleChangePassword = () => {
    // Dispatch change password action
    console.log('Changing password')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowChangePassword(false)
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'security': return Shield
      case 'domain': return MapPin
      case 'api': return Key
      case 'billing': return BarChart3
      default: return Activity
    }
  }

  return (
    <>
      <Helmet>
        <title>Profile - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your personal information and account preferences
            </p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {editMode && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-gray-600">{profileData.title}</p>
                    <p className="text-gray-500">{profileData.company}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{accountStats.domainsManaged}</div>
                      <div className="text-sm text-gray-500">Domains</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{accountStats.rulesCreated}</div>
                      <div className="text-sm text-gray-500">Rules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{accountStats.apiCalls}</div>
                      <div className="text-sm text-gray-500">API Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{accountStats.uptime}</div>
                      <div className="text-sm text-gray-500">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {editMode ? (
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      {editMode ? (
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {editMode ? (
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    {editMode ? (
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>

                  {editMode && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Overview */}
              <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Account Overview</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Domains</p>
                          <p className="text-2xl font-bold text-blue-600">{accountStats.domainsManaged}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">Rules</p>
                          <p className="text-2xl font-bold text-green-600">{accountStats.rulesCreated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Member Since</span>
                      <span className="text-sm text-gray-900">January 2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Last Login</span>
                      <span className="text-sm text-gray-900">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                </div>
                <div className="px-6 py-4 space-y-6">
                  {/* Change Password */}
                  <div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-600">Keep your account secure with a strong password</p>
                      </div>
                      <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </button>
                    </div>
                    
                    {showChangePassword && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleChangePassword}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowChangePassword(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Enabled
                      </span>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">API Keys</h4>
                        <p className="text-sm text-gray-600">Manage your API access keys</p>
                      </div>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Key className="h-4 w-4 mr-2" />
                        Manage Keys
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="px-6 py-4 flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {Object.entries(activitySettings).map(([setting, enabled]) => (
                  <div key={setting} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleActivitySettingChange(setting)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile
