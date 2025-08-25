import React, { useState, useEffect } from 'react'
import { 
  Code, 
  Globe, 
  Zap, 
  Shield, 
  Key, 
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
  Lock,
  Unlock,
  Activity,
  BarChart3,
  Database,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Calendar,
  ExternalLink,
  Link,
  Unlink,
  Webhook,
  Server,
  Terminal,
  FileText,
  Hash,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const APIManagementCenter = () => {
  const [apis, setApis] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [webhooks, setWebhooks] = useState([])
  const [oauthApps, setOauthApps] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('apis')
  const [apiKey, setApiKey] = useState('sk_live_1234567890abcdef')

  // Mock data will be added here
  const mockApis = []
  const mockIntegrations = []
  const mockWebhooks = []
  const mockOauthApps = []

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setApis(mockApis)
      setIntegrations(mockIntegrations)
      setWebhooks(mockWebhooks)
      setOauthApps(mockOauthApps)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const regenerateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 15)
    setApiKey(newKey)
    toast.success('API key regenerated!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Management Center</h1>
          <p className="text-gray-600">Manage APIs, integrations, webhooks, and OAuth applications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
            <p className="text-sm text-gray-600">Your secret API key for authentication</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={regenerateApiKey}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <code className="text-sm font-mono text-gray-800">{apiKey}</code>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total APIs</p>
              <p className="text-2xl font-bold text-gray-900">{apis.length}</p>
            </div>
            <Code className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
            </div>
            <Link className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="success" size="sm">Connected</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Webhooks</p>
              <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
            </div>
            <Webhook className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Badge variant="warning" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OAuth Apps</p>
              <p className="text-2xl font-bold text-gray-900">{oauthApps.length}</p>
            </div>
            <Key className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">Registered</Badge>
          </div>
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">API Management features coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default APIManagementCenter
