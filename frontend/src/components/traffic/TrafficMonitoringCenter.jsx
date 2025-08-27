import React, { useState, useEffect, useRef } from 'react';
import { 
  EyeIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  ServerIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrafficMonitoringCenter = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [trafficData, setTrafficData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    botRequests: 0,
    blockedRequests: 0,
    activeConnections: 0,
    requestsPerSecond: 0
  });
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [timeWindow, setTimeWindow] = useState(300); // 5 minutes
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState('chart'); // 'chart', 'table', 'grid'
  const [alertThresholds, setAlertThresholds] = useState({
    botActivity: 80,
    blockedRequests: 50,
    responseTime: 1000
  });
  const [showSettings, setShowSettings] = useState(false);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoring]);

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      intervalRef.current = setInterval(fetchTrafficData, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isMonitoring]);

  const startMonitoring = () => {
    // Initialize WebSocket connection for real-time updates
    if (wsRef.current) {
      wsRef.current.close();
    }

    // For now, simulate real-time data
    fetchTrafficData();
  };

  const stopMonitoring = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchTrafficData = async () => {
    try {
      const response = await fetch('/traffic/metrics/realtime');
      if (response.ok) {
        const data = await response.json();
        updateTrafficData(data);
      }
    } catch (error) {
      console.log('Using fallback traffic data (development mode)');
      // Fallback data for development
      const mockData = {
        metrics: {
          total_requests: 1000 + Math.floor(Math.random() * 500),
          bot_requests: 300 + Math.floor(Math.random() * 200),
          blocked_requests: 50 + Math.floor(Math.random() * 30),
          human_requests: 700 + Math.floor(Math.random() * 300)
        }
      };
      updateTrafficData(mockData);
    }
  };

  const updateTrafficData = (data) => {
    const timestamp = new Date();
    const newDataPoint = {
      timestamp: timestamp.toLocaleTimeString(),
      total: data.metrics.total_requests,
      bots: data.metrics.bot_requests,
      blocked: data.metrics.blocked_requests,
      human: data.metrics.human_requests
    };

    setTrafficData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only last 60 data points (5 minutes at 5-second intervals)
      return updated.slice(-60);
    });

    setStats({
      totalRequests: data.metrics.total_requests,
      botRequests: data.metrics.bot_requests,
      blockedRequests: data.metrics.blocked_requests,
      activeConnections: data.metrics.active_connections || 0,
      requestsPerSecond: data.metrics.requests_per_second || 0
    });

    // Check for alerts
    checkForAlerts(data.metrics);
  };

  const checkForAlerts = (metrics) => {
    const newAlerts = [];

    // High bot activity alert
    if (metrics.bot_requests > metrics.total_requests * (alertThresholds.botActivity / 100)) {
      newAlerts.push({
        id: Date.now() + Math.random(),
        type: 'warning',
        message: 'High bot activity detected',
        details: `${metrics.bot_requests} bot requests detected (${((metrics.bot_requests / metrics.total_requests) * 100).toFixed(1)}%)`,
        timestamp: new Date(),
        category: 'security'
      });
    }

    // High blocked requests alert
    if (metrics.blocked_requests > metrics.total_requests * (alertThresholds.blockedRequests / 100)) {
      newAlerts.push({
        id: Date.now() + Math.random() * 2,
        type: 'danger',
        message: 'High number of blocked requests',
        details: `${metrics.blocked_requests} requests blocked (${((metrics.blocked_requests / metrics.total_requests) * 100).toFixed(1)}%)`,
        timestamp: new Date(),
        category: 'security'
      });
    }

    // Performance alert
    if (metrics.avg_response_time > alertThresholds.responseTime) {
      newAlerts.push({
        id: Date.now() + Math.random() * 3,
        type: 'info',
        message: 'High response time detected',
        details: `Average response time: ${metrics.avg_response_time || alertThresholds.responseTime}ms`,
        timestamp: new Date(),
        category: 'performance'
      });
    }

    // New: Traffic spike alert
    if (metrics.requests_per_second > 50) {
      newAlerts.push({
        id: Date.now() + Math.random() * 4,
        type: 'info',
        message: 'Traffic spike detected',
        details: `${metrics.requests_per_second || 50} requests per second`,
        timestamp: new Date(),
        category: 'traffic'
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20)); // Keep last 20 alerts
    }
  };

  const clearAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 border border-indigo-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Traffic Monitoring Center</h1>
            <p className="text-gray-600">Advanced real-time traffic monitoring with intelligent alerting</p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div className={`flex items-center space-x-2 ${
                isMonitoring ? 'text-green-600' : 'text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span>Monitoring: {isMonitoring ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-gray-500">
                Auto-refresh: {autoRefresh ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Time Window Selector */}
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={900}>15 minutes</option>
              <option value={3600}>1 hour</option>
            </select>
            
            {/* View Mode Selector */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="chart">Chart View</option>
              <option value="table">Table View</option>
              <option value="grid">Grid View</option>
            </select>
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                Auto-refresh
              </label>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              Settings
            </button>

            <button
              onClick={fetchTrafficData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`inline-flex items-center px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                isMonitoring
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? (
                <>
                  <PauseIcon className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Activity (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={alertThresholds.botActivity}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, botActivity: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blocked Requests (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={alertThresholds.blockedRequests}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, blockedRequests: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Time (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={alertThresholds.responseTime}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, responseTime: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <GlobeAltIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Bot Requests</p>
              <p className="text-lg font-semibold text-gray-900">{stats.botRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100">
              <ShieldCheckIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Blocked</p>
              <p className="text-lg font-semibold text-gray-900">{stats.blockedRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <ServerIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-lg font-semibold text-gray-900">{stats.activeConnections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <ClockIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Requests/sec</p>
              <p className="text-lg font-semibold text-gray-900">{stats.requestsPerSecond.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Traffic</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total Requests" />
              <Line type="monotone" dataKey="bots" stroke="#F59E0B" strokeWidth={2} name="Bot Requests" />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} name="Blocked Requests" />
              <Line type="monotone" dataKey="human" stroke="#10B981" strokeWidth={2} name="Human Requests" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Alerts</h3>
            <button
              onClick={() => setAlerts([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShieldCheckIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No alerts at the moment</p>
                <p className="text-sm">System is running smoothly</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => clearAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Traffic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { type: 'Human', requests: stats.totalRequests - stats.botRequests, color: '#10B981' },
              { type: 'Bots', requests: stats.botRequests, color: '#F59E0B' },
              { type: 'Blocked', requests: stats.blockedRequests, color: '#EF4444' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monitoring Status</span>
              <div className={`flex items-center space-x-2 ${
                isMonitoring ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMonitoring ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auto-refresh</span>
              <span className={`text-sm font-medium ${
                autoRefresh ? 'text-green-600' : 'text-gray-500'
              }`}>
                {autoRefresh ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Window</span>
              <span className="text-sm font-medium text-gray-900">
                {timeWindow >= 3600 ? `${timeWindow / 3600}h` : 
                 timeWindow >= 60 ? `${timeWindow / 60}m` : `${timeWindow}s`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Update</span>
              <span className="text-sm text-gray-900">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitoringCenter;
