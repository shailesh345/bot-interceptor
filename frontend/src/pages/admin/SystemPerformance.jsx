import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Activity, Cpu, HardDrive, Wifi, Server, Database,
  Clock, AlertTriangle, TrendingUp, TrendingDown,
  BarChart3, PieChart, Zap, RefreshCw
} from 'lucide-react';

const SystemPerformance = () => {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    cpu: { value: 67, trend: 'up', status: 'warning' },
    memory: { value: 72, trend: 'stable', status: 'normal' },
    disk: { value: 45, trend: 'down', status: 'normal' },
    network: { value: 89, trend: 'up', status: 'critical' },
    latency: { value: 125, trend: 'stable', status: 'normal' },
    throughput: { value: 2847, trend: 'up', status: 'normal' }
  });

  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    uptime: '99.94%',
    requestsPerSecond: 1847,
    activeConnections: 5632,
    errorRate: 0.12,
    responseTime: 145
  });

  const [serverNodes, setServerNodes] = useState([
    { id: 'node-001', name: 'Web Server 1', cpu: 65, memory: 78, disk: 42, status: 'healthy', location: 'US-East' },
    { id: 'node-002', name: 'Web Server 2', cpu: 72, memory: 68, disk: 55, status: 'healthy', location: 'US-West' },
    { id: 'node-003', name: 'Database 1', cpu: 45, memory: 85, disk: 67, status: 'warning', location: 'EU-Central' },
    { id: 'node-004', name: 'Cache Server', cpu: 23, memory: 34, disk: 12, status: 'healthy', location: 'Asia-Pacific' },
    { id: 'node-005', name: 'Load Balancer', cpu: 38, memory: 45, disk: 28, status: 'healthy', location: 'US-East' }
  ]);

  const [performanceAlerts, setPerformanceAlerts] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage on Database 1', time: '2 minutes ago', severity: 'medium' },
    { id: 2, type: 'info', message: 'Network throughput increased by 15%', time: '5 minutes ago', severity: 'low' },
    { id: 3, type: 'warning', message: 'Memory usage approaching 90% on Web Server 2', time: '8 minutes ago', severity: 'medium' },
    { id: 4, type: 'success', message: 'Response time improved by 20ms', time: '12 minutes ago', severity: 'low' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        cpu: { ...prev.cpu, value: Math.max(30, Math.min(90, prev.cpu.value + (Math.random() - 0.5) * 10)) },
        memory: { ...prev.memory, value: Math.max(40, Math.min(95, prev.memory.value + (Math.random() - 0.5) * 8)) },
        network: { ...prev.network, value: Math.max(50, Math.min(100, prev.network.value + (Math.random() - 0.5) * 12)) }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (value, type) => {
    if (type === 'latency') {
      return value > 200 ? 'text-red-600' : value > 150 ? 'text-yellow-600' : 'text-green-600';
    }
    return value > 80 ? 'text-red-600' : value > 60 ? 'text-yellow-600' : 'text-green-600';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressBarColor = (value) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      <Helmet>
        <title>System Performance - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Performance</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time monitoring, APM, and resource utilization dashboard
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Health Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemHealth.requestsPerSecond.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Requests/sec</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemHealth.activeConnections.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Active Connections</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemHealth.errorRate}%</div>
                <div className="text-sm text-gray-500">Error Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemHealth.responseTime}ms</div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${systemHealth.overall === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.overall === 'healthy' ? '✓' : '⚠'}
                </div>
                <div className="text-sm text-gray-500">Overall Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Utilization */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resource Utilization</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* CPU */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cpu className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">CPU Usage</div>
                    <div className="text-xs text-gray-500">Average across all nodes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(realTimeMetrics.cpu.trend)}
                  <span className={`text-lg font-bold ${getMetricColor(realTimeMetrics.cpu.value)}`}>
                    {Math.round(realTimeMetrics.cpu.value)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(realTimeMetrics.cpu.value)}`}
                  style={{ width: `${realTimeMetrics.cpu.value}%` }}
                ></div>
              </div>

              {/* Memory */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HardDrive className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Memory Usage</div>
                    <div className="text-xs text-gray-500">Total system memory</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(realTimeMetrics.memory.trend)}
                  <span className={`text-lg font-bold ${getMetricColor(realTimeMetrics.memory.value)}`}>
                    {Math.round(realTimeMetrics.memory.value)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(realTimeMetrics.memory.value)}`}
                  style={{ width: `${realTimeMetrics.memory.value}%` }}
                ></div>
              </div>

              {/* Network */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Network I/O</div>
                    <div className="text-xs text-gray-500">Bandwidth utilization</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(realTimeMetrics.network.trend)}
                  <span className={`text-lg font-bold ${getMetricColor(realTimeMetrics.network.value)}`}>
                    {Math.round(realTimeMetrics.network.value)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(realTimeMetrics.network.value)}`}
                  style={{ width: `${realTimeMetrics.network.value}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Performance Alerts */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {performanceAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-500" />}
                      {alert.type === 'success' && <TrendingUp className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500">{alert.time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Server Nodes Status */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Server Nodes Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serverNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Server className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{node.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {node.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{node.cpu}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getProgressBarColor(node.cpu)}`}
                          style={{ width: `${node.cpu}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{node.memory}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getProgressBarColor(node.memory)}`}
                          style={{ width: `${node.memory}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{node.disk}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${getProgressBarColor(node.disk)}`}
                          style={{ width: `${node.disk}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(node.status)}`}>
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default SystemPerformance;
