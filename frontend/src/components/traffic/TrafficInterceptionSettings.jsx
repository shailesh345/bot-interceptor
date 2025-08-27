import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  BellIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TrafficInterceptionSettings = () => {
  const [settings, setSettings] = useState({
    system: {
      enabled: true,
      max_concurrent_requests: 1000,
      request_timeout: 30,
      log_level: 'info',
      auto_cleanup: true,
      cleanup_interval: 24
    },
    performance: {
      cache_enabled: true,
      cache_size: 1000,
      cache_ttl: 3600,
      compression_enabled: true,
      rate_limiting: true,
      max_requests_per_minute: 1000
    },
    security: {
      ssl_enabled: true,
      ssl_cert_path: '/etc/ssl/certs/traffic_interceptor.crt',
      ssl_key_path: '/etc/ssl/private/traffic_interceptor.key',
      firewall_enabled: true,
      ddos_protection: true,
      ip_whitelist: [],
      ip_blacklist: []
    },
    integrations: {
      webhook_enabled: false,
      webhook_url: '',
      slack_enabled: false,
      slack_webhook: '',
      email_alerts: true,
      email_recipients: ['admin@example.com'],
      api_keys: []
    },
    monitoring: {
      real_time_monitoring: true,
      alert_threshold: 80,
      performance_alerts: true,
      security_alerts: true,
      log_retention_days: 30
    }
  });

  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      console.log('Loading traffic interception settings...');
      // For now, use default settings
    } catch (error) {
      console.log('Using default settings (development mode)');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section, data) => {
    try {
      setLoading(true);
      // In a real app, this would save to API
      console.log(`Saving ${section} settings:`, data);
      
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
      
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = (section) => {
    saveSettings(section, settings[section]);
  };

  const tabs = [
    { id: 'system', name: 'System Configuration', icon: CogIcon },
    { id: 'performance', name: 'Performance Tuning', icon: ChartBarIcon },
    { id: 'security', name: 'Security Settings', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: CloudIcon },
    { id: 'monitoring', name: 'Monitoring', icon: BellIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traffic Interception Settings</h1>
            <p className="text-gray-600 mt-1">Configure system-wide settings for traffic interception, bot detection, and content protection</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* System Configuration Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.system.enabled}
                      onChange={(e) => handleInputChange('system', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Traffic Interception</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Level
                  </label>
                  <select
                    value={settings.system.log_level}
                    onChange={(e) => handleInputChange('system', 'log_level', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Requests
                  </label>
                  <input
                    type="number"
                    value={settings.system.max_concurrent_requests}
                    onChange={(e) => handleInputChange('system', 'max_concurrent_requests', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="100"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.system.request_timeout}
                    onChange={(e) => handleInputChange('system', 'request_timeout', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="5"
                    max="300"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('system')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save System Settings
                </button>
              </div>
            </div>
          )}

          {/* Performance Tuning Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache Enabled
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.performance.cache_enabled}
                      onChange={(e) => handleInputChange('performance', 'cache_enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Response Caching</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache Size (entries)
                  </label>
                  <input
                    type="number"
                    value={settings.performance.cache_size}
                    onChange={(e) => handleInputChange('performance', 'cache_size', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="100"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache TTL (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.performance.cache_ttl}
                    onChange={(e) => handleInputChange('performance', 'cache_ttl', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="60"
                    max="86400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Requests per Minute
                  </label>
                  <input
                    type="number"
                    value={settings.performance.max_requests_per_minute}
                    onChange={(e) => handleInputChange('performance', 'max_requests_per_minute', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="100"
                    max="10000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('performance')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Performance Settings
                </button>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SSL Enabled
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.ssl_enabled}
                      onChange={(e) => handleInputChange('security', 'ssl_enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable SSL/TLS</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DDoS Protection
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.ddos_protection}
                      onChange={(e) => handleInputChange('security', 'ddos_protection', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable DDoS Protection</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SSL Certificate Path
                  </label>
                  <input
                    type="text"
                    value={settings.security.ssl_cert_path}
                    onChange={(e) => handleInputChange('security', 'ssl_cert_path', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="/path/to/certificate.crt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SSL Key Path
                  </label>
                  <input
                    type="text"
                    value={settings.security.ssl_key_path}
                    onChange={(e) => handleInputChange('security', 'ssl_key_path', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="/path/to/private.key"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Enabled
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.integrations.webhook_enabled}
                      onChange={(e) => handleInputChange('integrations', 'webhook_enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Webhook Notifications</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.integrations.webhook_url}
                    onChange={(e) => handleInputChange('integrations', 'webhook_url', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://your-webhook-url.com/endpoint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack Notifications
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.integrations.slack_enabled}
                      onChange={(e) => handleInputChange('integrations', 'slack_enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Slack Notifications</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.integrations.slack_webhook}
                    onChange={(e) => handleInputChange('integrations', 'slack_webhook', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('integrations')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Integration Settings
                </button>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Real-time Monitoring
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.real_time_monitoring}
                      onChange={(e) => handleInputChange('monitoring', 'real_time_monitoring', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Real-time Monitoring</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={settings.monitoring.alert_threshold}
                    onChange={(e) => handleInputChange('monitoring', 'alert_threshold', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performance Alerts
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.performance_alerts}
                      onChange={(e) => handleInputChange('monitoring', 'performance_alerts', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Performance Alerts</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.monitoring.log_retention_days}
                    onChange={(e) => handleInputChange('monitoring', 'log_retention_days', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('monitoring')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Monitoring Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficInterceptionSettings;
