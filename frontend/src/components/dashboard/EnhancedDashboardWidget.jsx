import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MoreVertical,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share2,
  Maximize2,
  Minimize2
} from 'lucide-react';

const EnhancedDashboardWidget = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'bg-blue-500',
  description,
  data = [],
  chartType = 'line',
  isExpandable = false,
  isRefreshable = true,
  onRefresh,
  onExport,
  onShare,
  className = '',
  priority = 'normal',
  status = 'active'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Priority colors
  const priorityColors = {
    critical: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    normal: 'border-l-blue-500 bg-blue-50',
    low: 'border-l-green-500 bg-green-50'
  };

  // Status indicators
  const statusIndicators = {
    active: { color: 'bg-green-500', label: 'Active' },
    warning: { color: 'bg-yellow-500', label: 'Warning' },
    error: { color: 'bg-red-500', label: 'Error' },
    offline: { color: 'bg-gray-500', label: 'Offline' }
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      // Default export behavior
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_data.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [onExport, data, title]);

  // Handle share
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title}: ${value}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${title}: ${value}`);
    }
  }, [onShare, title, value]);

  // Get change icon and color
  const getChangeDisplay = () => {
    if (!change) return null;
    
    const isPositive = changeType === 'positive';
    const isNegative = changeType === 'negative';
    
    let icon, color;
    if (isPositive) {
      icon = TrendingUp;
      color = 'text-green-600';
    } else if (isNegative) {
      icon = TrendingDown;
      color = 'text-red-600';
    } else {
      icon = Minus;
      color = 'text-gray-600';
    }
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {React.createElement(icon, { className: 'w-3 h-3' })}
        <span className="text-xs font-medium">{change}</span>
      </div>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-20 flex items-center justify-center text-gray-400">
          <span className="text-xs">No data available</span>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <LineChart data={data} />;
      case 'bar':
        return <BarChart data={data} />;
      case 'area':
        return <AreaChart data={data} />;
      default:
        return <LineChart data={data} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${className} ${
        isExpanded ? 'col-span-2 row-span-2' : ''
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b-2 border-gray-200 ${priorityColors[priority]}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${color} text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-black truncate">{title}</h3>
              {description && (
                <p className="text-xs text-gray-600 truncate">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusIndicators[status].color}`} />
              <span className="text-xs text-gray-600">{statusIndicators[status].label}</span>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              {isRefreshable && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title={showDetails ? 'Hide details' : 'Show details'}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {/* Dropdown menu */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-8 w-48 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleExport}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </button>
                        <button
                          onClick={handleShare}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        {isExpandable && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                          >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span>{isExpanded ? 'Minimize' : 'Expand'}</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-black mb-1">{value}</div>
            {getChangeDisplay()}
          </div>
          
          {isExpandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Chart */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {renderChart()}
          </motion.div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Simple chart components
const LineChart = ({ data }) => (
  <div className="h-20 flex items-end justify-between space-x-1">
    {data.map((point, index) => (
      <div
        key={index}
        className="flex-1 bg-blue-200 rounded-t transition-all duration-200 hover:bg-blue-300"
        style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
        title={`${point.label}: ${point.value}`}
      />
    ))}
  </div>
);

const BarChart = ({ data }) => (
  <div className="h-20 flex items-end justify-between space-x-1">
    {data.map((point, index) => (
      <div
        key={index}
        className="flex-1 bg-green-200 rounded-t transition-all duration-200 hover:bg-green-300"
        style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
        title={`${point.label}: ${point.value}`}
      />
    ))}
  </div>
);

const AreaChart = ({ data }) => (
  <div className="h-20 flex items-end justify-between space-x-1">
    {data.map((point, index) => (
      <div
        key={index}
        className="flex-1 bg-purple-200 rounded-t transition-all duration-200 hover:bg-purple-300"
        style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
        title={`${point.label}: ${point.value}`}
      />
    ))}
  </div>
);

export default EnhancedDashboardWidget;
