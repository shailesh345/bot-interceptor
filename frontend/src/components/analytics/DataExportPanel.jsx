import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const DataExportPanel = () => {
  const [exportConfigs, setExportConfigs] = useState({});
  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedExport, setSelectedExport] = useState('traffic');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);

  useEffect(() => {
    fetchExportConfigs();
  }, []);

  const fetchExportConfigs = async () => {
    try {
      const response = await fetch('/api/export/analytics/available-exports');
      if (response.ok) {
        const data = await response.json();
        setExportConfigs(data.export_configs);
        setAvailableDomains(data.available_domains);
      }
    } catch (error) {
      console.error('Error fetching export configs:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        type: selectedExport,
        days: selectedDays,
        domain_id: selectedDomain === 'all' ? null : selectedDomain
      };

      let response;
      if (selectedFormat === 'csv') {
        response = await fetch('/api/export/analytics/csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(exportData)
        });
      } else if (selectedFormat === 'json') {
        response = await fetch('/api/export/analytics/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(exportData)
        });
      } else if (selectedFormat === 'pdf') {
        response = await fetch('/api/export/analytics/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(exportData)
        });
      }

      if (response.ok) {
        if (selectedFormat === 'csv' || selectedFormat === 'pdf') {
          // Handle file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 
                       `${selectedExport}_analytics.${selectedFormat}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Handle JSON response
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedExport}_analytics.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        // Add to export history
        const newExport = {
          id: Date.now(),
          type: selectedExport,
          format: selectedFormat,
          days: selectedDays,
          domain: selectedDomain === 'all' ? 'All Domains' : 
                 availableDomains.find(d => d.id === selectedDomain)?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          status: 'success'
        };
        setExportHistory(prev => [newExport, ...prev.slice(0, 9)]); // Keep last 10 exports
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      // Add failed export to history
      const failedExport = {
        id: Date.now(),
        type: selectedExport,
        format: selectedFormat,
        days: selectedDays,
        domain: selectedDomain === 'all' ? 'All Domains' : 
               availableDomains.find(d => d.id === selectedDomain)?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        status: 'failed'
      };
      setExportHistory(prev => [failedExport, ...prev.slice(0, 9)]);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportIcon = (format) => {
    switch (format) {
      case 'csv':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'json':
        return <DocumentChartBarIcon className="h-5 w-5" />;
      case 'pdf':
        return <DocumentArrowDownIcon className="h-5 w-5" />;
      default:
        return <DocumentArrowDownIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Export</h2>
            <p className="text-gray-600">Export your analytics data in various formats</p>
          </div>
          <DocumentArrowDownIcon className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <select
              value={selectedExport}
              onChange={(e) => setSelectedExport(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(exportConfigs).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
            {exportConfigs[selectedExport] && (
              <p className="text-xs text-gray-500 mt-1">
                {exportConfigs[selectedExport]?.description}
              </p>
            )}
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exportConfigs[selectedExport]?.formats?.map(format => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              )) || []}
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exportConfigs[selectedExport]?.time_ranges?.map(days => (
                <option key={days} value={days}>
                  Last {days} {days === 1 ? 'day' : 'days'}
                </option>
              )) || []}
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Domains</option>
              {availableDomains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full md:w-auto px-6 py-3 rounded-md font-medium text-white ${
              isExporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 inline mr-2 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                {getExportIcon(selectedFormat)}
                <span className="ml-2">Export {exportConfigs[selectedExport]?.name || selectedExport} Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export History</h3>
        
        {exportHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <DocumentArrowDownIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No exports yet</p>
            <p className="text-sm">Your export history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exportHistory.map((export_item) => (
              <div
                key={export_item.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getExportIcon(export_item.format)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {export_item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">
                      {export_item.format.toUpperCase()} • {export_item.days} days • {export_item.domain}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(export_item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getStatusColor(export_item.status)}`}>
                    {export_item.status === 'success' ? '✓ Success' : '✗ Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Formats</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <DocumentTextIcon className="h-4 w-4 text-green-600" />
                <span><strong>CSV:</strong> Comma-separated values for spreadsheet analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <DocumentChartBarIcon className="h-4 w-4 text-blue-600" />
                <span><strong>JSON:</strong> Structured data format for API integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <DocumentArrowDownIcon className="h-4 w-4 text-red-600" />
                <span><strong>PDF:</strong> Formatted reports for sharing and printing</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Export Types</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Traffic Analytics:</strong> Complete traffic logs and patterns</li>
              <li><strong>Bot Detection:</strong> Bot detection results and analysis</li>
              <li><strong>Performance Metrics:</strong> System performance and response times</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportPanel;
