import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  User, 
  Clock, 
  MapPin, 
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Search,
  Download,
  Bell,
  Settings
} from 'lucide-react'

const SecurityOperations = () => {
  const [securityMetrics, setSecurityMetrics] = useState({
    totalThreats: 0,
    blockedAttacks: 0,
    activeAlerts: 0,
    securityScore: 0
  })

  const [threatLog, setThreatLog] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSecurityData()
    const interval = setInterval(fetchSecurityData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchSecurityData = async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      setSecurityMetrics({
        totalThreats: Math.floor(Math.random() * 150) + 50,
        blockedAttacks: Math.floor(Math.random() * 120) + 30,
        activeAlerts: Math.floor(Math.random() * 10) + 1,
        securityScore: Math.floor(Math.random() * 20) + 80
      })

      setThreatLog([
        {
          id: 1,
          type: 'SQL Injection',
          severity: 'high',
          ip: '192.168.1.100',
          location: 'US, New York',
          timestamp: '2 minutes ago',
          status: 'blocked',
          details: 'Attempted SQL injection on login form'
        },
        {
          id: 2,
          type: 'Brute Force',
          severity: 'medium',
          ip: '10.0.0.45',
          location: 'CN, Beijing',
          timestamp: '5 minutes ago',
          status: 'monitoring',
          details: 'Multiple failed login attempts'
        },
        {
          id: 3,
          type: 'XSS Attack',
          severity: 'high',
          ip: '172.16.0.23',
          location: 'RU, Moscow',
          timestamp: '8 minutes ago',
          status: 'blocked',
          details: 'Cross-site scripting attempt detected'
        },
        {
          id: 4,
          type: 'DDoS',
          severity: 'critical',
          ip: '203.0.113.5',
          location: 'Unknown',
          timestamp: '12 minutes ago',
          status: 'mitigated',
          details: 'Distributed denial of service attack'
        },
        {
          id: 5,
          type: 'Malware',
          severity: 'high',
          ip: '198.51.100.14',
          location: 'BR, São Paulo',
          timestamp: '15 minutes ago',
          status: 'quarantined',
          details: 'Malicious file upload attempt'
        }
      ])

      setSecurityEvents([
        {
          id: 1,
          event: 'Security policy updated',
          user: 'Admin',
          timestamp: '1 hour ago',
          type: 'policy'
        },
        {
          id: 2,
          event: 'Firewall rule added',
          user: 'Security Team',
          timestamp: '2 hours ago',
          type: 'firewall'
        },
        {
          id: 3,
          event: 'Access denied to restricted area',
          user: 'john.doe@example.com',
          timestamp: '3 hours ago',
          type: 'access'
        },
        {
          id: 4,
          event: 'SSL certificate renewed',
          user: 'System',
          timestamp: '1 day ago',
          type: 'certificate'
        }
      ])

      setIsRefreshing(false)
    }, 1000)
  }

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'low': return <AlertTriangle className="w-4 h-4 text-green-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'blocked': return <XCircle className="w-4 h-4 text-red-600" />
      case 'monitoring': return <Eye className="w-4 h-4 text-yellow-600" />
      case 'mitigated': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'quarantined': return <Lock className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'blocked': return 'bg-red-100 text-red-800'
      case 'monitoring': return 'bg-yellow-100 text-yellow-800'
      case 'mitigated': return 'bg-green-100 text-green-800'
      case 'quarantined': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredThreats = threatLog.filter(threat => {
    const matchesFilter = filterType === 'all' || threat.severity === filterType
    const matchesSearch = threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.ip.includes(searchTerm) ||
                         threat.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Operations</h1>
          <p className="text-gray-600">Monitor and manage security threats in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchSecurityData}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Total Threats</h3>
            </div>
            <span className="text-2xl font-bold text-red-600">{securityMetrics.totalThreats}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
            <span className="text-sm text-red-600">+12% from last hour</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Blocked Attacks</h3>
            </div>
            <span className="text-2xl font-bold text-green-600">{securityMetrics.blockedAttacks}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">+8% from last hour</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{securityMetrics.activeAlerts}</span>
          </div>
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">-2 from last hour</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
            </div>
            <span className="text-2xl font-bold text-blue-600">{securityMetrics.securityScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${securityMetrics.securityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Threat Log */}
      <div className="bg-white rounded-lg shadow border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Threat Log</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredThreats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSeverityIcon(threat.severity)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{threat.type}</div>
                          <div className="text-sm text-gray-500">{threat.details}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {threat.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {threat.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(threat.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                          {threat.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {threat.timestamp}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.event}</div>
                    <div className="text-sm text-gray-500">by {event.user}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityOperations
