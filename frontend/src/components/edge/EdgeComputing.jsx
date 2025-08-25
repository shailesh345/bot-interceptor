import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Server, 
  Globe, 
  Zap, 
  Activity, 
  Cpu, 
  HardDrive,
  Network,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const EdgeComputing = () => {
  const [edgeNodes, setEdgeNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')

  useEffect(() => {
    // Simulate loading edge nodes
    setTimeout(() => {
      setEdgeNodes([
        {
          id: 1,
          name: 'US East - Virginia',
          region: 'us-east',
          status: 'active',
          cpu: 85,
          memory: 72,
          network: 45,
          latency: 12,
          requests: 1250000,
          threats: 45000,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'US West - Oregon',
          region: 'us-west',
          status: 'active',
          cpu: 78,
          memory: 68,
          network: 52,
          latency: 18,
          requests: 980000,
          threats: 32000,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: 3,
          name: 'Europe - Frankfurt',
          region: 'eu-central',
          status: 'active',
          cpu: 82,
          memory: 75,
          network: 48,
          latency: 25,
          requests: 1100000,
          threats: 38000,
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          id: 4,
          name: 'Asia Pacific - Tokyo',
          region: 'ap-northeast',
          status: 'maintenance',
          cpu: 0,
          memory: 0,
          network: 0,
          latency: 0,
          requests: 0,
          threats: 0,
          lastUpdated: '2024-01-15T08:00:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'maintenance': return 'warning'
      case 'error': return 'danger'
      default: return 'default'
    }
  }

  const getPerformanceColor = (value) => {
    if (value >= 80) return '#ef4444'
    if (value >= 60) return '#f59e0b'
    return '#10b981'
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredNodes = selectedRegion === 'all' 
    ? edgeNodes 
    : edgeNodes.filter(node => node.region === selectedRegion)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading edge nodes..." />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Edge Computing - Traffic Interceptor</title>
      </Helmet>
      
      <main className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Edge Computing
            </h1>
            <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Monitor and manage distributed edge nodes for optimal performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Regions</option>
              <option value="us-east">US East</option>
              <option value="us-west">US West</option>
              <option value="eu-central">Europe</option>
              <option value="ap-northeast">Asia Pacific</option>
            </select>
            <Button icon={Activity} variant="primary">
              Deploy Node
            </Button>
          </div>
        </motion.div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card header="Total Nodes" animation="fade-in-up" delay={0.1}>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {edgeNodes.length}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Edge locations
              </p>
            </div>
          </Card>
          
          <Card header="Active Nodes" animation="fade-in-up" delay={0.2}>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#10b981' }}>
                {edgeNodes.filter(n => n.status === 'active').length}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Currently online
              </p>
            </div>
          </Card>
          
          <Card header="Total Requests" animation="fade-in-up" delay={0.3}>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                {formatNumber(edgeNodes.reduce((acc, n) => acc + n.requests, 0))}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Requests processed
              </p>
            </div>
          </Card>
          
          <Card header="Threats Blocked" animation="fade-in-up" delay={0.4}>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>
                {formatNumber(edgeNodes.reduce((acc, n) => acc + n.threats, 0))}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Security threats
              </p>
            </div>
          </Card>
        </div>

        {/* Edge Nodes List */}
        <Card header="Edge Node Status" animation="fade-in-up" delay={0.5}>
          <div className="space-y-4">
            {filteredNodes.map((node) => (
              <motion.div
                key={node.id}
                className="p-6 rounded-lg border transition-all duration-200 hover:shadow-md"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--primary-bg)'
                }}
                whileHover={{ y: -2 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Node Info */}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <Server className="h-6 w-6" style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {node.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(node.status)}>
                            {node.status}
                          </Badge>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {node.region}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>Latency:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {node.latency}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>Requests:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatNumber(node.requests)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>Threats:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatNumber(node.threats)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      Performance Metrics
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>CPU</span>
                          <span style={{ color: getPerformanceColor(node.cpu) }}>{node.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${node.cpu}%`,
                              backgroundColor: getPerformanceColor(node.cpu)
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>Memory</span>
                          <span style={{ color: getPerformanceColor(node.memory) }}>{node.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${node.memory}%`,
                              backgroundColor: getPerformanceColor(node.memory)
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>Network</span>
                          <span style={{ color: getPerformanceColor(node.network) }}>{node.network}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${node.network}%`,
                              backgroundColor: getPerformanceColor(node.network)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col justify-between">
                    <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center justify-end mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Last updated
                      </div>
                      {formatDate(node.lastUpdated)}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="ghost" icon={Activity}>
                        Monitor
                      </Button>
                      <Button size="sm" variant="ghost" icon={Zap}>
                        Deploy
                      </Button>
                      <Button size="sm" variant="ghost" icon={Shield}>
                        Secure
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Network Map */}
        <Card header="Global Network Map" animation="fade-in-up" delay={0.6}>
          <div className="h-64 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>
                Interactive network map visualization
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Shows real-time node locations and connections
              </p>
            </div>
          </div>
        </Card>

        {/* Performance Trends */}
        <Card header="Performance Trends" animation="fade-in-up" delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: '#10b981' }} />
              <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Response Time
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Improving by 15% this month
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Shield className="h-8 w-8 mx-auto mb-2" style={{ color: '#3b82f6' }} />
              <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Security Score
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                98.5% threat detection rate
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Zap className="h-8 w-8 mx-auto mb-2" style={{ color: '#f59e0b' }} />
              <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Uptime
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                99.99% across all nodes
              </p>
            </div>
          </div>
        </Card>
      </main>
    </>
  )
}

export default EdgeComputing
