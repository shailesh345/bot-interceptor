import React, { useState, useEffect, useRef } from 'react';
import {
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
  WifiIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import websocketService from '../../services/websocketService';

const RealTimeDashboard = () => {
  const [metrics, setMetrics] = useState({
    traffic: {
      total_requests: 0,
      bot_requests: 0,
      human_requests: 0,
      blocked_requests: 0,
      allowed_requests: 0
    },
    performance: {
      avg_response_time: 0,
      error_rate: 0,
      throughput: 0,
      active_connections: 0
    },
    security: {
      threats_blocked: 0,
      suspicious_ips: 0,
      ddos_attempts: 0,
      malware_detected: 0
    },
    system: {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      network_io: 0
    }
  });
  
  const [liveData, setLiveData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    setupWebSocket();
    setupAutoRefresh();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval]);

  const setupWebSocket = () => {
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.connect(token)
        .then(() => {
          console.log('WebSocket connected for real-time dashboard');
          setIsConnected(true);
          
          // Subscribe to various real-time updates
          websocketService.subscribeToTraffic('all', handleTrafficUpdate);
          websocketService.subscribeToAnalytics(handleAnalyticsUpdate);
          websocketService.subscribeToSystemStatus(handleSystemUpdate);
          websocketService.subscribeToBotDetection(handleBotDetection);
          
        })
        .catch(error => {
          console.error('Failed to connect WebSocket:', error);
          setIsConnected(false);
        });
      
      // Listen for connection changes
      websocketService.onConnectionChange((connected) => {
        setIsConnected(connected);
      });
    }
  };

  const setupAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLiveData();
        setLastUpdate(new Date());
      }, refreshInterval);
    }
  };

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analytics) {
          updateMetrics(data.analytics);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/real-time/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.metrics) {
          updateMetrics(data.metrics);
          updateLiveData(data.metrics);
        }
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const updateMetrics = (newMetrics) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics
    }));
  };

  const updateLiveData = (newMetrics) => {
    const timestamp = new Date().toLocaleTimeString();
    setLiveData(prev => {
      const newData = [...prev, { timestamp, ...newMetrics }];
      // Keep only last 50 data points
      return newData.slice(-50);
    });
  };

  // WebSocket event handlers
  const handleTrafficUpdate = (data) => {
    console.log('Received traffic update:', data);
    if (data.metrics) {
      updateMetrics(data.metrics);
      updateLiveData(data.metrics);
    }
  };

  const handleAnalyticsUpdate = (data) => {
    console.log('Received analytics update:', data);
    if (data.metrics) {
      updateMetrics(data.metrics);
    }
  };

  const handleSystemUpdate = (data) => {
    console.log('Received system update:', data);
    if (data.metrics) {
      setMetrics(prev => ({
        ...prev,
        system: { ...prev.system, ...data.metrics }
      }));
    }
  };

  const handleBotDetection = (data) => {
    console.log('Received bot detection:', data);
    // Update security metrics
    setMetrics(prev => ({
      ...prev,
      security: {
        ...prev.security,
        threats_blocked: prev.security.threats_blocked + 1
      }
    }));
  };

  const getStatusColor = (value, threshold) => {
    if (value >= threshold * 0.8) return 'text-red-500';
    if (value >= threshold * 0.6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (value, threshold) => {
    if (value >= threshold * 0.8) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    if (value >= threshold * 0.6) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
  };

  const MetricCard = ({ title, value, icon: Icon, color = 'text-blue-600', subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-blue-100 ${color.replace('text-', 'text-')}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 ml-1">from last hour</span>
        </div>
      )}
    </div>
  );

  const TrafficChart = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={liveData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="total_requests" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="bot_requests" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          <Area type="monotone" dataKey="human_requests" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const PerformanceChart = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={liveData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avg_response_time" stroke="#F59E0B" strokeWidth={2} />
          <Line type="monotone" dataKey="error_rate" stroke="#EF4444" strokeWidth={2} />
          <Line type="monotone" dataKey="throughput" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const SystemStatus = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
                          <CpuChipIcon className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">CPU Usage</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getStatusColor(metrics.system.cpu_usage, 100)}`}
                style={{ width: `${Math.min(metrics.system.cpu_usage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium">{metrics.system.cpu_usage.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ServerIcon className="h-5 w-5 text-green-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Memory Usage</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getStatusColor(metrics.system.memory_usage, 100)}`}
                style={{ width: `${Math.min(metrics.system.memory_usage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium">{metrics.system.memory_usage.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <WifiIcon className="h-5 w-5 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Network I/O</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getStatusColor(metrics.system.network_io, 1000)}`}
                style={{ width: `${Math.min((metrics.system.network_io / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium">{(metrics.system.network_io / 1024).toFixed(1)} MB/s</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <FireIcon className="h-5 w-5 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Active Connections</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getStatusColor(metrics.performance.active_connections, 1000)}`}
                style={{ width: `${Math.min((metrics.performance.active_connections / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium">{metrics.performance.active_connections}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Dashboard</h1>
          <p className="text-gray-600">Live monitoring and analytics for your traffic interceptor</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          
          <button
            onClick={fetchLiveData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleString()}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={metrics.traffic.total_requests.toLocaleString()}
          icon={EyeIcon}
          subtitle="Last 5 minutes"
          trend={5.2}
        />
        <MetricCard
          title="Bot Requests"
          value={metrics.traffic.bot_requests.toLocaleString()}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          subtitle="Last 5 minutes"
          trend={-2.1}
        />
        <MetricCard
          title="Blocked Requests"
          value={metrics.traffic.blocked_requests.toLocaleString()}
          icon={ShieldCheckIcon}
          color="text-orange-600"
          subtitle="Last 5 minutes"
          trend={8.7}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.performance.avg_response_time.toFixed(2)}ms`}
          icon={ClockIcon}
          color="text-green-600"
          subtitle="Last 5 minutes"
          trend={-1.3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart />
        <PerformanceChart />
      </div>

      {/* System Status */}
      <SystemStatus />

      {/* Security Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.security.threats_blocked}</div>
            <div className="text-sm text-gray-600">Threats Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.security.suspicious_ips}</div>
            <div className="text-sm text-gray-600">Suspicious IPs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.security.ddos_attempts}</div>
            <div className="text-sm text-gray-600">DDoS Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.security.malware_detected}</div>
            <div className="text-sm text-gray-600">Malware Detected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
