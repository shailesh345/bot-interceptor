import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Activity, 
  Globe, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react'

const UptimeMonitor = ({ domains = [] }) => {
  const [uptimeData, setUptimeData] = useState({})
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [alerts, setAlerts] = useState([])
  
  useEffect(() => {
    if (domains.length > 0) {
      loadUptimeData()
    }
  }, [domains, selectedTimeframe])
  
  const loadUptimeData = async () => {
    try {
      // Simulate loading uptime data
      const mockData = {}
      
      domains.forEach(domain => {
        mockData[domain.domain_name] = {
          uptime_percentage: Math.random() * 20 + 80, // 80-100%
          avg_response_time: Math.random() * 1000 + 200, // 200-1200ms
          total_checks: Math.floor(Math.random() * 1000) + 100,
          successful_checks: Math.floor(Math.random() * 800) + 80,
          last_check: new Date(Date.now() - Math.random() * 86400000), // Last 24h
          status: Math.random() > 0.1 ? 'online' : 'offline', // 90% online
          recent_checks: generateRecentChecks()
        }
      })
      
      setUptimeData(mockData)
    } catch (error) {
      console.error('Error loading uptime data:', error)
    }
  }
  
  const generateRecentChecks = () => {
    const checks = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000)
      checks.push({
        time: time,
        status: Math.random() > 0.05 ? 'success' : 'failure',
        response_time: Math.random() * 1000 + 100
      })
    }
    
    return checks
  }
  
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }
  
  const getUptimeColor = (percentage) => {
    if (percentage >= 99) return 'text-green-600'
    if (percentage >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getUptimeBadge = (percentage) => {
    if (percentage >= 99) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (percentage >= 95) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (percentage >= 90) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }
  
  const getStatusIcon = (status) => {
    if (status === 'online') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status === 'offline') {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }
  
  const getStatusColor = (status) => {
    if (status === 'online') return 'bg-green-100 text-green-800'
    if (status === 'offline') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }
  
  const getResponseTimeColor = (time) => {
    if (time < 500) return 'text-green-600'
    if (time < 1000) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold">Uptime Monitoring</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
          
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      {/* Timeframe Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            <div className="flex space-x-1">
              {['1h', '24h', '7d', '30d'].map(timeframe => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Uptime Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(uptimeData).map(([domain, data]) => (
          <Card key={domain} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="text-lg">{domain}</span>
                </CardTitle>
                {getStatusIcon(data.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={getStatusColor(data.status)}>
                  {data.status}
                </Badge>
              </div>
              
              {/* Uptime Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime:</span>
                  <span className={`text-lg font-bold ${getUptimeColor(data.uptime_percentage)}`}>
                    {data.uptime_percentage.toFixed(2)}%
                  </span>
                </div>
                <Progress value={data.uptime_percentage} className="h-2" />
                {getUptimeBadge(data.uptime_percentage)}
              </div>
              
              {/* Response Time */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response:</span>
                <span className={`font-semibold ${getResponseTimeColor(data.avg_response_time)}`}>
                  {data.avg_response_time.toFixed(0)}ms
                </span>
              </div>
              
              {/* Check Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {data.successful_checks}
                  </div>
                  <div className="text-xs text-gray-500">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {data.total_checks - data.successful_checks}
                  </div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
              </div>
              
              {/* Last Check */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                Last check: {data.last_check.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Detailed Uptime Chart */}
      {Object.entries(uptimeData).map(([domain, data]) => (
        <Card key={`chart-${domain}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>24-Hour Uptime Chart - {domain}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-24 gap-1 h-16">
              {data.recent_checks.map((check, index) => (
                <div
                  key={index}
                  className={`rounded-sm ${
                    check.status === 'success' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                  title={`${check.time.toLocaleTimeString()}: ${check.status} (${check.response_time.toFixed(0)}ms)`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>24 hours ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium text-red-800">{alert.message}</div>
                      <div className="text-sm text-red-600">{alert.domain}</div>
                    </div>
                  </div>
                  <div className="text-xs text-red-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UptimeMonitor
