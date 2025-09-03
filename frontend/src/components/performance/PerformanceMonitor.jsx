import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Settings,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Memory,
  Gauge,
  Target,
  Info,
  X
} from 'lucide-react';
import EnhancedChart from '../charts/EnhancedChart';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    cpu: { current: 0, history: [], alerts: [] },
    memory: { current: 0, history: [], alerts: [] },
    disk: { current: 0, history: [], alerts: [] },
    network: { current: 0, history: [], alerts: [] },
    responseTime: { current: 0, history: [], alerts: [] },
    throughput: { current: 0, history: [], alerts: [] }
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({
    cpu: 80,
    memory: 85,
    disk: 90,
    network: 75,
    responseTime: 1000,
    throughput: 100
  });
  const [showSettings, setShowSettings] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const [performanceScore, setPerformanceScore] = useState(100);
  const intervalRef = useRef(null);

  // Performance thresholds for different levels
  const performanceLevels = {
    excellent: { min: 90, color: 'text-green-600', bgColor: 'bg-green-100' },
    good: { min: 70, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    fair: { min: 50, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    poor: { min: 0, color: 'text-red-600', bgColor: 'bg-red-100' }
  };

  // Get performance level
  const getPerformanceLevel = useCallback((score) => {
    for (const [level, config] of Object.entries(performanceLevels)) {
      if (score >= config.min) {
        return { level, ...config };
      }
    }
    return { level: 'poor', ...performanceLevels.poor };
  }, []);

  // Generate mock performance data
  const generateMetrics = useCallback(() => {
    const now = Date.now();
    
    setMetrics(prev => {
      const newMetrics = { ...prev };
      
      // CPU usage (0-100%)
      const cpuValue = Math.floor(Math.random() * 30) + 20; // 20-50%
      newMetrics.cpu.current = cpuValue;
      newMetrics.cpu.history = [
        ...prev.cpu.history.slice(-59), // Keep last 60 data points
        { timestamp: now, value: cpuValue }
      ];
      
      // Memory usage (0-100%)
      const memoryValue = Math.floor(Math.random() * 40) + 30; // 30-70%
      newMetrics.memory.current = memoryValue;
      newMetrics.memory.history = [
        ...prev.memory.history.slice(-59),
        { timestamp: now, value: memoryValue }
      ];
      
      // Disk usage (0-100%)
      const diskValue = Math.floor(Math.random() * 20) + 60; // 60-80%
      newMetrics.disk.current = diskValue;
      newMetrics.disk.history = [
        ...prev.disk.history.slice(-59),
        { timestamp: now, value: diskValue }
      ];
      
      // Network latency (0-2000ms)
      const networkValue = Math.floor(Math.random() * 100) + 50; // 50-150ms
      newMetrics.network.current = networkValue;
      newMetrics.network.history = [
        ...prev.network.history.slice(-59),
        { timestamp: now, value: networkValue }
      ];
      
      // Response time (0-2000ms)
      const responseValue = Math.floor(Math.random() * 500) + 100; // 100-600ms
      newMetrics.responseTime.current = responseValue;
      newMetrics.responseTime.history = [
        ...prev.responseTime.history.slice(-59),
        { timestamp: now, value: responseValue }
      ];
      
      // Throughput (requests per second)
      const throughputValue = Math.floor(Math.random() * 200) + 800; // 800-1000 req/s
      newMetrics.throughput.current = throughputValue;
      newMetrics.throughput.history = [
        ...prev.throughput.history.slice(-59),
        { timestamp: now, value: throughputValue }
      ];
      
      return newMetrics;
    });
  }, []);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    const newAlerts = [];
    
    Object.entries(metrics).forEach(([metric, data]) => {
      const threshold = alertThresholds[metric];
      if (threshold && data.current > threshold) {
        const alert = {
          id: Date.now() + Math.random(),
          metric,
          value: data.current,
          threshold,
          severity: data.current > threshold * 1.5 ? 'critical' : 'warning',
          timestamp: new Date(),
          message: `${metric.toUpperCase()} usage is ${data.current}% (threshold: ${threshold}%)`
        };
        newAlerts.push(alert);
      }
    });
    
    // Update alerts in metrics
    setMetrics(prev => {
      const updated = { ...prev };
      newAlerts.forEach(alert => {
        if (updated[alert.metric]) {
          updated[alert.metric].alerts = [
            ...updated[alert.metric].alerts.slice(-4), // Keep last 5 alerts
            alert
          ];
        }
      });
      return updated;
    });
  }, [metrics, alertThresholds]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    const scores = Object.entries(metrics).map(([metric, data]) => {
      const current = data.current;
      const threshold = alertThresholds[metric];
      
      if (!threshold) return 100;
      
      // Calculate score based on how close to threshold
      const ratio = current / threshold;
      if (ratio <= 0.5) return 100; // Excellent
      if (ratio <= 0.8) return 80;  // Good
      if (ratio <= 1.0) return 60;  // Fair
      if (ratio <= 1.2) return 40;  // Poor
      return 20; // Critical
    });
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    setPerformanceScore(Math.round(averageScore));
  }, [metrics, alertThresholds]);

  // Generate optimization suggestions
  const generateOptimizationSuggestions = useCallback(() => {
    const suggestions = [];
    
    if (metrics.cpu.current > 70) {
      suggestions.push({
        id: 1,
        type: 'cpu',
        priority: 'high',
        title: 'High CPU Usage',
        description: 'Consider optimizing database queries or scaling horizontally',
        action: 'Review query performance and add caching layers'
      });
    }
    
    if (metrics.memory.current > 80) {
      suggestions.push({
        id: 2,
        type: 'memory',
        priority: 'high',
        title: 'High Memory Usage',
        description: 'Memory usage is approaching critical levels',
        action: 'Implement memory pooling and optimize data structures'
      });
    }
    
    if (metrics.responseTime.current > 500) {
      suggestions.push({
        id: 3,
        type: 'performance',
        priority: 'medium',
        title: 'Slow Response Times',
        description: 'Response times are above optimal levels',
        action: 'Add CDN, optimize images, and implement lazy loading'
      });
    }
    
    if (metrics.disk.current > 85) {
      suggestions.push({
        id: 4,
        type: 'storage',
        priority: 'medium',
        title: 'High Disk Usage',
        description: 'Disk space is running low',
        action: 'Clean up logs, implement log rotation, and consider storage expansion'
      });
    }
    
    setOptimizationSuggestions(suggestions);
  }, [metrics]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    generateMetrics(); // Initial metrics
    
    intervalRef.current = setInterval(() => {
      generateMetrics();
      checkAlerts();
      calculatePerformanceScore();
      generateOptimizationSuggestions();
    }, 2000); // Update every 2 seconds
  }, [isMonitoring, generateMetrics, checkAlerts, calculatePerformanceScore, generateOptimizationSuggestions]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  // Update alert threshold
  const updateThreshold = useCallback((metric, value) => {
    setAlertThresholds(prev => ({
      ...prev,
      [metric]: Number(value)
    }));
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((metricId, alertId) => {
    setMetrics(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        alerts: prev[metricId].alerts.filter(alert => alert.id !== alertId)
      }
    }));
  }, []);

  // Initialize monitoring on mount
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, []);

  // Performance score level
  const scoreLevel = getPerformanceLevel(performanceScore);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Performance Monitor</h1>
              <p className="text-gray-600">Real-time system performance monitoring and optimization</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Performance Score */}
              <div className={`px-4 py-2 rounded-lg ${scoreLevel.bgColor} border-2 border-current`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scoreLevel.color}`}>
                    {performanceScore}
                  </div>
                  <div className={`text-sm font-medium ${scoreLevel.color} capitalize`}>
                    {scoreLevel.level}
                  </div>
                </div>
              </div>
              
              {/* Monitoring Toggle */}
              <button
                onClick={toggleMonitoring}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  isMonitoring
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Stop Monitoring</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Start Monitoring</span>
                  </>
                )}
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 bg-white border-2 border-gray-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4">Alert Thresholds</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(alertThresholds).map(([metric, threshold]) => (
                  <div key={metric}>
                    <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">
                      {metric} Threshold
                    </label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => updateThreshold(metric, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all duration-200"
                      min="0"
                      max={metric === 'responseTime' || metric === 'throughput' ? 10000 : 100}
                      step={metric === 'responseTime' || metric === 'throughput' ? 100 : 1}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* CPU Usage */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">CPU Usage</h3>
                  <p className="text-sm text-gray-600">Processor utilization</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.cpu.current > alertThresholds.cpu ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.cpu.current}%
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.cpu.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting CPU data')}
            />
          </div>

          {/* Memory Usage */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Memory className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Memory Usage</h3>
                  <p className="text-sm text-gray-600">RAM utilization</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.memory.current > alertThresholds.memory ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.memory.current}%
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.memory.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting memory data')}
            />
          </div>

          {/* Response Time */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Response Time</h3>
                  <p className="text-sm text-gray-600">API response latency</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.responseTime.current > alertThresholds.responseTime ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.responseTime.current}ms
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.responseTime.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting response time data')}
            />
          </div>

          {/* Disk Usage */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Disk Usage</h3>
                  <p className="text-sm text-gray-600">Storage utilization</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.disk.current > alertThresholds.disk ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.disk.current}%
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.disk.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting disk data')}
            />
          </div>

          {/* Network Latency */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Network</h3>
                  <p className="text-sm text-gray-600">Latency & throughput</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.network.current > alertThresholds.network ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.network.current}ms
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.network.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting network data')}
            />
          </div>

          {/* Throughput */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Gauge className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Throughput</h3>
                  <p className="text-sm text-gray-600">Requests per second</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                metrics.throughput.current < alertThresholds.throughput ? 'text-red-600' : 'text-green-600'
              }`}>
                {metrics.throughput.current} req/s
              </div>
            </div>
            
            <EnhancedChart
              data={metrics.throughput.history.map(item => ({
                label: new Date(item.timestamp).toLocaleTimeString(),
                value: item.value
              }))}
              type="line"
              height={150}
              onExport={() => console.log('Exporting throughput data')}
            />
          </div>
        </div>

        {/* Alerts and Optimization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {Object.entries(metrics).map(([metricId, metric]) => 
                metric.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-2 ${
                      alert.severity === 'critical' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <p className="font-medium text-black">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(metricId, alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {Object.values(metrics).every(metric => metric.alerts.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems are running normally</p>
                </div>
              )}
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Optimization Suggestions</h3>
            <div className="space-y-3">
              {optimizationSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`p-3 rounded-lg border-2 ${
                    suggestion.priority === 'high' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Target className={`w-5 h-5 mt-1 ${
                      suggestion.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-black">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <div className="bg-white p-2 rounded border">
                        <p className="text-xs text-gray-700">
                          <strong>Action:</strong> {suggestion.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {optimizationSuggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No optimization needed</p>
                  <p className="text-sm">Your system is performing optimally</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
