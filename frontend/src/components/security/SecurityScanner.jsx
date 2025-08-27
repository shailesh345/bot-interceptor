import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Shield, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Settings,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'

const SecurityScanner = ({ domains = [] }) => {
  const [scanResults, setScanResults] = useState({})
  const [isScanning, setIsScanning] = useState(false)
  const [selectedScanType, setSelectedScanType] = useState('full')
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [threats, setThreats] = useState([])
  
  useEffect(() => {
    if (domains.length > 0) {
      loadSecurityData()
    }
  }, [domains])
  
  const loadSecurityData = async () => {
    try {
      // Simulate loading security data
      const mockResults = {}
      
      domains.forEach(domain => {
        mockResults[domain.domain_name] = {
          ssl_grade: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)],
          security_headers: Math.floor(Math.random() * 8) + 2,
          vulnerabilities_count: Math.floor(Math.random() * 5),
          threats_count: Math.floor(Math.random() * 3),
          risk_score: Math.floor(Math.random() * 40) + 20, // 20-60
          last_scan: new Date(Date.now() - Math.random() * 86400000 * 7), // Last week
          scan_status: Math.random() > 0.3 ? 'completed' : 'pending'
        }
      })
      
      setScanResults(mockResults)
      
      // Generate mock vulnerabilities
      const mockVulnerabilities = [
        {
          id: 1,
          domain: domains[0]?.domain_name || 'example.com',
          type: 'SQL Injection',
          severity: 'high',
          description: 'Potential SQL injection vulnerability in search form',
          cve_id: 'CVE-2023-1234',
          cvss_score: 8.5,
          status: 'open'
        },
        {
          id: 2,
          domain: domains[0]?.domain_name || 'example.com',
          type: 'XSS',
          severity: 'medium',
          description: 'Cross-site scripting vulnerability in comment system',
          cve_id: 'CVE-2023-5678',
          cvss_score: 6.2,
          status: 'open'
        }
      ]
      
      setVulnerabilities(mockVulnerabilities)
      
      // Generate mock threats
      const mockThreats = [
        {
          id: 1,
          domain: domains[0]?.domain_name || 'example.com',
          type: 'Malware',
          severity: 'high',
          description: 'Domain associated with malware distribution',
          source: 'ThreatFox',
          confidence: 'high',
          status: 'active'
        }
      ]
      
      setThreats(mockThreats)
      
    } catch (error) {
      console.error('Error loading security data:', error)
    }
  }
  
  const startSecurityScan = async (domainId, scanType) => {
    setIsScanning(true)
    
    try {
      // Simulate scan progress
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update scan results
      setScanResults(prev => ({
        ...prev,
        [domains.find(d => d.id === domainId)?.domain_name]: {
          ...prev[domains.find(d => d.id === domainId)?.domain_name],
          scan_status: 'completed',
          last_scan: new Date()
        }
      }))
      
    } catch (error) {
      console.error('Error during security scan:', error)
    } finally {
      setIsScanning(false)
    }
  }
  
  const getSSLGradeColor = (grade) => {
    const colors = {
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    }
    return colors[grade] || 'text-gray-600'
  }
  
  const getSSLGradeBadge = (grade) => {
    const variants = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    }
    return <Badge className={variants[grade] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>
  }
  
  const getSeverityColor = (severity) => {
    const colors = {
      'low': 'text-blue-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'critical': 'text-red-600'
    }
    return colors[severity] || 'text-gray-600'
  }
  
  const getSeverityBadge = (severity) => {
    const variants = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    }
    return <Badge className={variants[severity] || 'bg-gray-100 text-gray-800'}>{severity}</Badge>
  }
  
  const getRiskScoreColor = (score) => {
    if (score < 30) return 'text-green-600'
    if (score < 50) return 'text-yellow-600'
    if (score < 70) return 'text-orange-600'
    return 'text-red-600'
  }
  
  const getRiskScoreBadge = (score) => {
    if (score < 30) return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
    if (score < 50) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
    if (score < 70) return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>
    return <Badge className="bg-red-100 text-red-800">Critical Risk</Badge>
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold">Security Scanner</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={isScanning ? 'default' : 'secondary'}>
            {isScanning ? 'Scanning...' : 'Ready'}
          </Badge>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      {/* Scan Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Scan Type:</span>
            <div className="flex space-x-1">
              {['full', 'ssl', 'web', 'vulnerability', 'threat'].map(type => (
                <Button
                  key={type}
                  variant={selectedScanType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedScanType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(scanResults).map(([domain, data]) => (
          <Card key={domain} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-lg">{domain}</span>
                </CardTitle>
                <Badge variant={data.scan_status === 'completed' ? 'default' : 'secondary'}>
                  {data.scan_status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* SSL Grade */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SSL Grade:</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getSSLGradeColor(data.ssl_grade)}`}>
                    {data.ssl_grade}
                  </span>
                  {getSSLGradeBadge(data.ssl_grade)}
                </div>
              </div>
              
              {/* Security Headers */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Headers:</span>
                <span className="font-semibold">{data.security_headers}/8</span>
              </div>
              
              {/* Vulnerabilities */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vulnerabilities:</span>
                <Badge variant={data.vulnerabilities_count > 0 ? 'destructive' : 'default'}>
                  {data.vulnerabilities_count}
                </Badge>
              </div>
              
              {/* Threats */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Threats:</span>
                <Badge variant={data.threats_count > 0 ? 'destructive' : 'default'}>
                  {data.threats_count}
                </Badge>
              </div>
              
              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Score:</span>
                  <span className={`font-bold ${getRiskScoreColor(data.risk_score)}`}>
                    {data.risk_score}/100
                  </span>
                </div>
                <Progress value={data.risk_score} className="h-2" />
                {getRiskScoreBadge(data.risk_score)}
              </div>
              
              {/* Last Scan */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                Last scan: {data.last_scan.toLocaleDateString()}
              </div>
              
              {/* Scan Button */}
              <Button
                onClick={() => startSecurityScan(domains.find(d => d.domain_name === domain)?.id, selectedScanType)}
                disabled={isScanning}
                className="w-full"
                variant="outline"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Vulnerabilities */}
      {vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Vulnerabilities Found</span>
              <Badge variant="destructive">{vulnerabilities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-orange-800">{vuln.type}</h4>
                        {getSeverityBadge(vuln.severity)}
                        <Badge variant="outline">{vuln.cve_id}</Badge>
                      </div>
                      <p className="text-orange-700 mb-2">{vuln.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-orange-600">
                        <span>Domain: {vuln.domain}</span>
                        <span>CVSS: {vuln.cvss_score}</span>
                        <span>Status: {vuln.status}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Threats */}
      {threats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Security Threats</span>
              <Badge variant="destructive">{threats.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threats.map((threat) => (
                <div key={threat.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-red-800">{threat.type}</h4>
                        {getSeverityBadge(threat.severity)}
                        <Badge variant="outline">{threat.source}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{threat.confidence}</Badge>
                      </div>
                      <p className="text-red-700 mb-2">{threat.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-red-600">
                        <span>Domain: {threat.domain}</span>
                        <span>Status: {threat.status}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-green-600" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Enable HTTPS</h4>
                <p className="text-sm text-green-700">Configure SSL certificates for all domains</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Add Security Headers</h4>
                <p className="text-sm text-yellow-700">Implement X-Frame-Options, CSP, and other security headers</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Fix Vulnerabilities</h4>
                <p className="text-sm text-orange-700">Address identified security vulnerabilities promptly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityScanner
