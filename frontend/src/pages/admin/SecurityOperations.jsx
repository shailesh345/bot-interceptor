import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Shield, AlertTriangle, Eye, Ban, Check, X, 
  Activity, Search, Filter, Download, RefreshCw,
  Clock, MapPin, User, Globe, TrendingUp, TrendingDown
} from 'lucide-react';

const SecurityOperations = () => {
  const [threats, setThreats] = useState([
    {
      id: 'THR-001',
      type: 'DDoS Attack',
      severity: 'critical',
      status: 'blocked',
      source: '192.168.1.100',
      target: 'api.example.com',
      country: 'Unknown',
      timestamp: '2024-12-19 14:32:15',
      description: 'High volume traffic spike detected from suspicious IP',
      actionTaken: 'IP blocked automatically'
    },
    {
      id: 'THR-002',
      type: 'SQL Injection',
      severity: 'high',
      status: 'mitigated',
      source: '10.0.0.45',
      target: '/api/users',
      country: 'Russia',
      timestamp: '2024-12-19 14:15:32',
      description: 'Malicious SQL query detected in API request',
      actionTaken: 'Request filtered and logged'
    },
    {
      id: 'THR-003',
      type: 'Bot Traffic',
      severity: 'medium',
      status: 'monitoring',
      source: '203.45.67.89',
      target: '/login',
      country: 'China',
      timestamp: '2024-12-19 13:58:21',
      description: 'Repeated login attempts with varying credentials',
      actionTaken: 'Rate limiting applied'
    },
    {
      id: 'THR-004',
      type: 'Cross-Site Scripting',
      severity: 'high',
      status: 'blocked',
      source: '172.16.0.22',
      target: '/contact',
      country: 'Brazil',
      timestamp: '2024-12-19 13:42:07',
      description: 'XSS payload detected in form submission',
      actionTaken: 'Request blocked and user warned'
    }
  ]);

  const [securityMetrics, setSecurityMetrics] = useState({
    threatsStopped: 2847,
    activeThreats: 12,
    riskScore: 35,
    uptime: '99.97%',
    avgResponseTime: '0.3s',
    falsePositives: 8
  });

  const [activeFilters, setActiveFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showThreatDetails, setShowThreatDetails] = useState(false);

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.source.includes(searchTerm);
    
    const matchesSeverity = activeFilters.severity === 'all' || threat.severity === activeFilters.severity;
    const matchesStatus = activeFilters.status === 'all' || threat.status === activeFilters.status;
    const matchesType = activeFilters.type === 'all' || threat.type.toLowerCase().includes(activeFilters.type.toLowerCase());

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'mitigated': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'blocked': return <Ban className="h-4 w-4" />;
      case 'mitigated': return <Check className="h-4 w-4" />;
      case 'monitoring': return <Eye className="h-4 w-4" />;
      case 'investigating': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleThreatAction = (threatId, action) => {
    setThreats(threats.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: action }
        : threat
    ));
  };

  const handleViewThreat = (threat) => {
    setSelectedThreat(threat);
    setShowThreatDetails(true);
  };

  return (
    <>
      <Helmet>
        <title>Security Operations Center - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Operations Center</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time threat detection, incident response, and security monitoring
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Security Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Threats Stopped</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.threatsStopped.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Threats</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.activeThreats}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">-8%</span>
              <span className="text-gray-500 ml-1">vs yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.riskScore}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${securityMetrics.riskScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.avgResponseTime}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Average detection time
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.uptime}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last 30 days
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">False Positives</p>
                <p className="text-2xl font-bold text-gray-900">{securityMetrics.falsePositives}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              This week
            </div>
          </div>
        </div>

        {/* Threat Management */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-medium text-gray-900">Active Security Threats</h3>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search threats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={activeFilters.severity}
                  onChange={(e) => setActiveFilters({...activeFilters, severity: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={activeFilters.status}
                  onChange={(e) => setActiveFilters({...activeFilters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="blocked">Blocked</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="investigating">Investigating</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threat ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredThreats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{threat.id}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{threat.type}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{threat.source}</div>
                      {threat.country && <div className="text-xs text-gray-500">{threat.country}</div>}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{threat.target}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(threat.status)}`}>
                        {getStatusIcon(threat.status)}
                        <span className="ml-1">{threat.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {threat.timestamp}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewThreat(threat)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {threat.status !== 'blocked' && (
                          <button
                            onClick={() => handleThreatAction(threat.id, 'blocked')}
                            className="text-red-600 hover:text-red-900"
                            title="Block"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        
                        {threat.status !== 'mitigated' && (
                          <button
                            onClick={() => handleThreatAction(threat.id, 'mitigated')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Mitigated"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threat Details Modal */}
        {showThreatDetails && selectedThreat && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Threat Details - {selectedThreat.id}</h3>
                <button
                  onClick={() => setShowThreatDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Threat Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedThreat.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedThreat.severity)}`}>
                      {selectedThreat.severity}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source IP</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedThreat.source}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedThreat.target}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedThreat.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action Taken</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedThreat.actionTaken}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedThreat.timestamp}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedThreat.status)}`}>
                      {getStatusIcon(selectedThreat.status)}
                      <span className="ml-1">{selectedThreat.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowThreatDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Take Action
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default SecurityOperations;
