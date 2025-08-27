import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Activity, 
  Shield, 
  Clock, 
  Globe, 
  Zap, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3
} from 'lucide-react'
import { domainsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

const DomainMonitoringConfig = ({ isOpen, onClose, domain, onSave }) => {
  const [config, setConfig] = useState({
    monitoring_enabled: false,
    monitoring_interval: 60, // minutes
    monitoring_url: '',
    monitoring_content: '',
    monitoring_headers: '',
    security_scan_enabled: false,
    security_scan_interval: 24, // hours
    proxy_interception_enabled: false,
    traffic_analysis_enabled: false,
    uptime_alerts_enabled: false,
    security_alerts_enabled: false
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (domain) {
      setConfig({
        monitoring_enabled: domain.monitoring_enabled || false,
        monitoring_interval: domain.monitoring_interval || 60,
        monitoring_url: domain.monitoring_url || '',
        monitoring_content: domain.monitoring_content || '',
        monitoring_headers: domain.monitoring_headers || '',
        security_scan_enabled: domain.security_scan_enabled || false,
        security_scan_interval: domain.security_scan_interval || 24,
        proxy_interception_enabled: domain.proxy_interception_enabled || false,
        traffic_analysis_enabled: domain.traffic_analysis_enabled || false,
        uptime_alerts_enabled: domain.uptime_alerts_enabled || false,
        security_alerts_enabled: domain.security_alerts_enabled || false
      })
    }
  }, [domain])

  const handleSave = async () => {
    if (!domain) return
    
    setSaving(true)
    try {
      const response = await domainsAPI.updateDomainMonitoring(domain.id, config)
      
      if (response.data.success) {
        toast.success('Monitoring configuration saved successfully!')
        onSave && onSave(response.data.domain)
        onClose()
      } else {
        toast.error(response.data.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving monitoring config:', error)
      toast.error('Failed to save monitoring configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleTestMonitoring = async () => {
    if (!domain) return
    
    setLoading(true)
    try {
      const response = await domainsAPI.testMonitoring(domain.id)
      
      if (response.data.success) {
        toast.success('Monitoring test successful! Check the monitoring dashboard.')
      } else {
        toast.error('Monitoring test failed')
      }
    } catch (error) {
      console.error('Error testing monitoring:', error)
      toast.error('Failed to test monitoring')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Monitoring Configuration
              </h2>
              <p className="text-sm text-gray-600">
                Configure monitoring settings for {domain?.domain_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Monitoring */}
          <div className="space-y-6">
            {/* Basic Monitoring Settings */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Basic Monitoring
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.monitoring_enabled}
                    onChange={(e) => setConfig({ ...config, monitoring_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Enable Website Monitoring
                  </span>
                </label>

                {config.monitoring_enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monitoring Interval (minutes)
                      </label>
                      <select
                        value={config.monitoring_interval}
                        onChange={(e) => setConfig({ ...config, monitoring_interval: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>Every minute</option>
                        <option value={5}>Every 5 minutes</option>
                        <option value={15}>Every 15 minutes</option>
                        <option value={30}>Every 30 minutes</option>
                        <option value={60}>Every hour</option>
                        <option value={120}>Every 2 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Monitoring URL (optional)
                      </label>
                      <input
                        type="url"
                        value={config.monitoring_url}
                        onChange={(e) => setConfig({ ...config, monitoring_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/health"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to monitor the main domain
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Content (optional)
                      </label>
                      <input
                        type="text"
                        value={config.monitoring_content}
                        onChange={(e) => setConfig({ ...config, monitoring_content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="OK"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Text that should appear on the monitored page
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Scanning */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Scanning
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.security_scan_enabled}
                    onChange={(e) => setConfig({ ...config, security_scan_enabled: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Enable Security Scanning
                  </span>
                </label>

                {config.security_scan_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scan Frequency (hours)
                    </label>
                    <select
                      value={config.security_scan_interval}
                      onChange={(e) => setConfig({ ...config, security_scan_interval: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={1}>Every hour</option>
                      <option value={6}>Every 6 hours</option>
                      <option value={12}>Every 12 hours</option>
                      <option value={24}>Daily</option>
                      <option value={168}>Weekly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Advanced Features */}
          <div className="space-y-6">
            {/* Traffic Analysis */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Traffic Analysis
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.traffic_analysis_enabled}
                    onChange={(e) => setConfig({ ...config, traffic_analysis_enabled: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Enable Real-time Traffic Analysis
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.proxy_interception_enabled}
                    onChange={(e) => setConfig({ ...config, proxy_interception_enabled: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Enable Proxy-based Traffic Interception
                  </span>
                </label>

                <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                  <Info className="h-4 w-4 inline mr-1" />
                  Traffic analysis provides real-time insights into visitor behavior, bot detection, and performance metrics.
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alerts & Notifications
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.uptime_alerts_enabled}
                    onChange={(e) => setConfig({ ...config, uptime_alerts_enabled: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Uptime Alerts
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.security_alerts_enabled}
                    onChange={(e) => setConfig({ ...config, security_alerts_enabled: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Security Threat Alerts
                  </span>
                </label>

                <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                  <Info className="h-4 w-4 inline mr-1" />
                  Receive notifications when your website goes down or security threats are detected.
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleTestMonitoring}
                  disabled={loading || !config.monitoring_enabled}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Test Monitoring
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.open('/monitoring', '_blank')}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Monitoring Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default DomainMonitoringConfig
