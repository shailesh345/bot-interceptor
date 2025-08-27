import React, { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import TabButton from '../components/common/TabButton'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  User, Camera, Mail, Phone, MapPin, Calendar,
  Edit3, Save, X, Shield, Key, Bell,
  Activity, BarChart3, Clock, Award,
  Settings, Lock, Eye, EyeOff, Upload,
  Smartphone, QrCode, CheckCircle2, AlertTriangle,
  Copy, Download, RefreshCw, Globe, Briefcase, Building, FileText
} from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'

const Profile = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [secretKey, setSecretKey] = useState('')
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Generate a default avatar based on user's initials
  const generateDefaultAvatar = () => {
    const firstName = user?.name?.split(' ')[0] || user?.first_name || 'John'
    const lastName = user?.name?.split(' ')[1] || user?.last_name || 'Doe'
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="#000000"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`
  }

  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || user?.first_name || 'John',
    lastName: user?.name?.split(' ')[1] || user?.last_name || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Developer',
    company: 'Acme Corporation',
    bio: 'Experienced developer with a passion for web security and traffic management solutions.',
    timezone: 'PST (UTC-8)',
    language: 'English',
    avatar: user?.avatar || generateDefaultAvatar()
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
    // Validate required fields
    if (!profileData.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    
    if (!profileData.lastName.trim()) {
      toast.error('Last name is required')
      return
    }
    
    if (!profileData.email.trim()) {
      toast.error('Email is required')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    // Validate phone number if provided
    if (profileData.phone && profileData.phone.trim()) {
      const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/
      if (!phoneRegex.test(profileData.phone)) {
        toast.error('Please enter a valid phone number')
        return
      }
    }
    
    try {
      // Save profile data to localStorage for demo
      localStorage.setItem('userProfile', JSON.stringify(profileData))
      toast.success('Profile updated successfully!')
      setEditMode(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleChangePassword = () => {
    // Validate current password
    if (!passwordForm.currentPassword.trim()) {
      toast.error('Current password is required')
      return
    }
    
    // Validate new password
    if (!passwordForm.newPassword.trim()) {
      toast.error('New password is required')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword)
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword)
    const hasNumbers = /\d/.test(passwordForm.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('Password must contain uppercase, lowercase, number, and special character')
      return
    }
    
    // Validate password confirmation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    // Check if new password is different from current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password')
      return
    }
    
    try {
      // Simulate password change
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePassword(false)
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setAvatarLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          avatar: e.target.result
        })
        setAvatarLoading(false)
        toast.success('Avatar uploaded successfully!')
      }
      reader.onerror = () => {
        setAvatarLoading(false)
        toast.error('Failed to upload avatar')
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar load error
  const handleAvatarError = (e) => {
    e.target.src = generateDefaultAvatar()
  }

  const handleEnableTwoFactor = () => {
    // Simulate generating QR code and secret
    const mockSecret = 'JBSWY3DPEHPK3PXP' // This would come from backend
    const mockQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TrafficInterceptor:${profileData.email}?secret=${mockSecret}&issuer=TrafficInterceptor`

    setSecretKey(mockSecret)
    setQrCodeUrl(mockQrUrl)
    setShowTwoFactorSetup(true)
  }

  const handleVerifyTwoFactor = () => {
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    // Simulate verification
    if (twoFactorCode === '123456') { // This would be verified against the TOTP
      setTwoFactorEnabled(true)
      setShowTwoFactorSetup(false)
      setTwoFactorCode('')

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )
      setBackupCodes(codes)

      toast.success('Two-factor authentication enabled successfully!')
    } else {
      toast.error('Invalid verification code. Please try again.')
    }
  }

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false)
    setShowTwoFactorSetup(false)
    setBackupCodes([])
    toast.success('Two-factor authentication disabled')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded!')
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

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-start"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-bold text-black tracking-tight"
            >
              Profile
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-2 text-gray-600 text-lg"
            >
              Manage your personal information and account preferences
            </motion.p>
          </div>
          {!editMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                variant="primary"
                icon={Edit3}
                onClick={() => setEditMode(true)}
                className="glow-effect"
              >
                Edit Profile
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card-premium"
        >
          <div className="px-8 py-8">
            <div className="flex items-center space-x-8">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  {avatarLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-xl flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Camera className="h-8 w-8 text-gray-500" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.img
                      src={profileData.avatar}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      onError={handleAvatarError}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {editMode && !avatarLoading && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Camera className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-start justify-between"
                >
                  <div>
                    <motion.h2
                      className="text-3xl font-bold text-black mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {profileData.firstName} {profileData.lastName}
                    </motion.h2>
                    <motion.div
                      className="space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <p className="text-gray-600 text-lg">{profileData.title}</p>
                      <p className="text-gray-500">{profileData.company}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="success" className="animate-float">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        <Badge variant="info" className="animate-glow">
                          <Globe className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{accountStats.domainsManaged}</div>
                      <div className="text-sm text-blue-600 font-medium">Domains</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">{accountStats.rulesCreated}</div>
                      <div className="text-sm text-green-600 font-medium">Rules</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{accountStats.apiCalls}</div>
                      <div className="text-sm text-purple-600 font-medium">API Calls</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">{accountStats.uptime}</div>
                      <div className="text-sm text-orange-600 font-medium">Uptime</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-2"
        >
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden border-b-2 ${
                    isActive
                      ? 'bg-black text-white shadow-lg border-b-black'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50 border-b-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 rounded-lg"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  )}
                  <Icon className={`h-5 w-5 mr-3 relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="relative z-10">{tab.name}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
                      className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full bg-white rounded-full opacity-60"
                      />
                    </motion.div>
                  )}
                  
                  {/* Hover ripple effect */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-lg"
                  />
                </motion.button>
              )
            })}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card-premium"
              >
                <div className="px-8 py-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-between mb-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-black mb-2 flex items-center">
                        <User className="w-7 h-7 mr-3 text-blue-600" />
                        Personal Information
                      </h3>
                      <p className="text-gray-600 text-lg">Manage your personal details and professional information</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Badge
                        variant={editMode ? 'warning' : 'info'}
                        className={`px-4 py-2 text-sm font-semibold ${
                          editMode ? 'animate-pulse' : 'animate-float'
                        }`}
                      >
                        {editMode ? (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editing Mode
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Mode
                          </>
                        )}
                      </Badge>
                    </motion.div>
                  </motion.div>

                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-black">Basic Information</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            First Name
                          </label>
                          {editMode ? (
                            <motion.input
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              type="text"
                              name="firstName"
                              value={profileData.firstName}
                              onChange={handleInputChange}
                              className="input-enhanced w-full text-lg py-3"
                              placeholder="Enter your first name"
                            />
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <p className="text-gray-900 text-lg font-medium">{profileData.firstName}</p>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Last Name
                          </label>
                          {editMode ? (
                            <motion.input
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              type="text"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleInputChange}
                              className="input-enhanced w-full text-lg py-3"
                              placeholder="Enter your last name"
                            />
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <p className="text-gray-900 text-lg font-medium">{profileData.lastName}</p>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Contact Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-black">Contact Information</h4>
                      </div>

                      <div className="space-y-6">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-green-600" />
                            Email Address
                          </label>
                          {editMode ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative"
                            >
                              <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                className="input-enhanced w-full text-lg py-3 pl-12"
                                placeholder="Enter your email address"
                              />
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Mail className="w-5 h-5 text-green-600 mr-3" />
                              <p className="text-gray-900 text-lg font-medium">{profileData.email}</p>
                              <Badge variant="success" className="ml-auto text-xs">
                                Verified
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-green-600" />
                            Phone Number
                          </label>
                          {editMode ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative"
                            >
                              <input
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                className="input-enhanced w-full text-lg py-3 pl-12"
                                placeholder="Enter your phone number"
                              />
                              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Phone className="w-5 h-5 text-green-600 mr-3" />
                              <p className="text-gray-900 text-lg font-medium">{profileData.phone}</p>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-green-600" />
                            Location
                          </label>
                          {editMode ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative"
                            >
                              <input
                                type="text"
                                name="location"
                                value={profileData.location}
                                onChange={handleInputChange}
                                className="input-enhanced w-full text-lg py-3 pl-12"
                                placeholder="Enter your location"
                              />
                              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <MapPin className="w-5 h-5 text-green-600 mr-3" />
                              <p className="text-gray-900 text-lg font-medium">{profileData.location}</p>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Professional Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-2xl p-6 border border-purple-100"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-black">Professional Information</h4>
                      </div>

                      <div className="space-y-6">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                            Job Title
                          </label>
                          {editMode ? (
                            <motion.input
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              type="text"
                              name="title"
                              value={profileData.title}
                              onChange={handleInputChange}
                              className="input-enhanced w-full text-lg py-3"
                              placeholder="Enter your job title"
                            />
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Briefcase className="w-5 h-5 text-purple-600 mr-3" />
                              <p className="text-gray-900 text-lg font-medium">{profileData.title}</p>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-purple-600" />
                            Company
                          </label>
                          {editMode ? (
                            <motion.input
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              type="text"
                              name="company"
                              value={profileData.company}
                              onChange={handleInputChange}
                              className="input-enhanced w-full text-lg py-3"
                              placeholder="Enter your company"
                            />
                          ) : (
                            <motion.div
                              className="flex items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Building className="w-5 h-5 text-purple-600 mr-3" />
                              <p className="text-gray-900 text-lg font-medium">{profileData.company}</p>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-purple-600" />
                            Professional Bio
                          </label>
                          {editMode ? (
                            <motion.textarea
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              name="bio"
                              value={profileData.bio}
                              onChange={handleInputChange}
                              rows={5}
                              className="input-enhanced w-full resize-none text-lg leading-relaxed"
                              placeholder="Tell us about your professional background, skills, and experience..."
                            />
                          ) : (
                            <motion.div
                              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                              whileHover={{ scale: 1.01 }}
                            >
                              <p className="text-gray-900 text-lg leading-relaxed">{profileData.bio}</p>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    {editMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex justify-end space-x-4 pt-6 border-t-2 border-gradient-to-r from-gray-200 to-gray-300"
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setEditMode(false)}
                            icon={X}
                            className="px-8 py-3"
                          >
                            Cancel Changes
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSaveProfile}
                            icon={Save}
                            className="px-8 py-3 glow-effect"
                          >
                            Save All Changes
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Account Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card-premium"
              >
                <div className="px-8 py-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center justify-between mb-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-black mb-2 flex items-center">
                        <BarChart3 className="w-7 h-7 mr-3 text-orange-600" />
                        Account Overview
                      </h3>
                      <p className="text-gray-600 text-lg">Your account statistics and activity summary</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant="info"
                        className="px-4 py-2 text-sm font-semibold animate-float"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Real-time Data
                      </Badge>
                    </motion.div>
                  </motion.div>

                  <div className="space-y-8">
                    {/* Statistics Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-blue-700 mb-1">Domains Managed</p>
                            <p className="text-4xl font-bold text-blue-600 mb-2">{accountStats.domainsManaged}</p>
                            <div className="flex items-center text-blue-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-xs font-medium">Active Projects</span>
                            </div>
                          </div>
                          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-700 mb-1">Rules Created</p>
                            <p className="text-4xl font-bold text-green-600 mb-2">{accountStats.rulesCreated}</p>
                            <div className="flex items-center text-green-600">
                              <Shield className="w-4 h-4 mr-1" />
                              <span className="text-xs font-medium">Security Rules</span>
                            </div>
                          </div>
                          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Additional Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-purple-700 mb-1">API Calls</p>
                            <p className="text-lg font-bold text-purple-600">{accountStats.apiCalls}</p>
                          </div>
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-orange-700 mb-1">Uptime</p>
                            <p className="text-lg font-bold text-orange-600">{accountStats.uptime}</p>
                          </div>
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-red-700 mb-1">Threats Blocked</p>
                            <p className="text-lg font-bold text-red-600">1,247</p>
                          </div>
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Account Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-black">Account Details</h4>
                      </div>

                      <div className="space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Account Status</span>
                          </div>
                          <Badge variant="success" className="animate-float">
                            Active
                          </Badge>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Member Since</span>
                          </div>
                          <span className="text-sm font-bold text-black">January 2024</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-purple-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Last Login</span>
                          </div>
                          <span className="text-sm font-bold text-black">2 hours ago</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center">
                            <Globe className="w-5 h-5 text-green-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Timezone</span>
                          </div>
                          <span className="text-sm font-bold text-black">{profileData.timezone}</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center">
                            <Settings className="w-5 h-5 text-orange-600 mr-3" />
                            <span className="text-sm font-medium text-gray-700">Language</span>
                          </div>
                          <span className="text-sm font-bold text-black">{profileData.language}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Password Section */}
              <Card className="glow-effect">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2">Password Security</h3>
                      <p className="text-gray-600">Keep your account secure with a strong password</p>
                    </div>
                    <Button
                      variant="outline"
                      icon={showChangePassword ? X : Lock}
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="interactive"
                    >
                      {showChangePassword ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>

                  {showChangePassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.current ? "text" : "password"}
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              className="input-enhanced w-full pr-12"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                              {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.new ? "text" : "password"}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className="input-enhanced w-full pr-12"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                              {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-black mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword.confirm ? "text" : "password"}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className="input-enhanced w-full pr-12"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                              {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleChangePassword}
                          icon={Save}
                        >
                          Update Password
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="glow-effect">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2 flex items-center">
                        <Smartphone className="w-6 h-6 mr-3 text-blue-600" />
                        Two-Factor Authentication
                      </h3>
                      <p className="text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={twoFactorEnabled ? 'success' : 'warning'}
                        className="animate-float"
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Button
                        variant={twoFactorEnabled ? 'danger' : 'success'}
                        icon={twoFactorEnabled ? X : Shield}
                        onClick={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                        className="interactive"
                      >
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </Button>
                    </div>
                  </div>

                  {/* 2FA Setup Modal */}
                  {showTwoFactorSetup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
                    >
                      <div className="text-center mb-6">
                        <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-black mb-2">Set up Two-Factor Authentication</h4>
                        <p className="text-gray-600">Scan the QR code with your authenticator app</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-4">
                            <img
                              src={qrCodeUrl}
                              alt="QR Code"
                              className="w-48 h-48"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Scan this QR code with Google Authenticator, Authy, or similar app
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                              Or enter this code manually:
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={secretKey}
                                readOnly
                                className="input-enhanced flex-1 font-mono text-sm"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Copy}
                                onClick={() => copyToClipboard(secretKey)}
                              >
                                Copy
                              </Button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                              Enter verification code from your app:
                            </label>
                            <input
                              type="text"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="input-enhanced w-full text-center text-2xl font-bold tracking-widest"
                              placeholder="000000"
                              maxLength="6"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setShowTwoFactorSetup(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleVerifyTwoFactor}
                          disabled={twoFactorCode.length !== 6}
                          icon={CheckCircle2}
                        >
                          Verify & Enable
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Backup Codes */}
                  {twoFactorEnabled && backupCodes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-black mb-1">Backup Recovery Codes</h4>
                          <p className="text-gray-600 text-sm">Save these codes in a safe place - you can use them to access your account if you lose your device</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={downloadBackupCodes}
                        >
                          Download
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                            <code className="font-mono text-sm font-bold text-gray-800">{code}</code>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                          <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> Each code can only be used once. Store these codes securely and don't share them with anyone.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Security Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className={`p-4 rounded-lg border-2 ${twoFactorEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center">
                        {twoFactorEnabled ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                        )}
                        <div>
                          <p className="font-semibold text-black">2FA Status</p>
                          <p className={`text-sm ${twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center">
                        <Shield className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <p className="font-semibold text-black">Account Security</p>
                          <p className="text-sm text-blue-600">Strong</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center">
                        <Key className="w-6 h-6 text-purple-600 mr-3" />
                        <div>
                          <p className="font-semibold text-black">Last Login</p>
                          <p className="text-sm text-purple-600">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* API Keys Section */}
              <Card className="glow-effect">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-2 flex items-center">
                        <Key className="w-6 h-6 mr-3 text-purple-600" />
                        API Keys
                      </h3>
                      <p className="text-gray-600">Manage your API access keys and permissions</p>
                    </div>
                    <Button
                      variant="primary"
                      icon={Key}
                      className="interactive"
                    >
                      Generate New Key
                    </Button>
                  </div>

                  <div className="text-center py-8">
                    <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-black mb-2">No API Keys</h4>
                    <p className="text-gray-600 mb-4">Generate your first API key to start integrating with our services</p>
                    <Button variant="outline" icon={Key}>
                      Create Your First API Key
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
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
