import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Download,
  Share2,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  MoreHorizontal,
  X
} from 'lucide-react';

const EnhancedChart = ({
  data = [],
  type = 'line',
  title = 'Chart',
  subtitle = '',
  height = 300,
  width = '100%',
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  animate = true,
  responsive = true,
  onPointClick,
  onExport,
  onShare,
  className = '',
  loading = false,
  error = null,
  refreshable = true,
  onRefresh
}) => {
  const [chartType, setChartType] = useState(type);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(new Set());

  // Chart type options
  const chartTypes = [
    { key: 'line', label: 'Line', icon: LineChart },
    { key: 'bar', label: 'Bar', icon: BarChart3 },
    { key: 'pie', label: 'Pie', icon: PieChart },
    { key: 'area', label: 'Area', icon: TrendingUp }
  ];

  // Memoized processed data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Ensure data has required properties
    return data.map((item, index) => ({
      id: item.id || index,
      label: item.label || item.name || `Item ${index + 1}`,
      value: item.value || item.count || 0,
      color: item.color || colors[index % colors.length],
      ...item
    }));
  }, [data, colors]);

  // Calculate chart dimensions
  const chartDimensions = useMemo(() => {
    if (typeof width === 'number') {
      return { width, height };
    }
    return { width: '100%', height };
  }, [width, height]);

  // Handle point click
  const handlePointClick = useCallback((point) => {
    if (onPointClick) {
      onPointClick(point);
    }
    
    // Toggle selection
    const newSelection = new Set(selectedPoints);
    if (newSelection.has(point.id)) {
      newSelection.delete(point.id);
    } else {
      newSelection.add(point.id);
    }
    setSelectedPoints(newSelection);
  }, [onPointClick, selectedPoints]);

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(processedData);
    } else {
      // Default export behavior
      const dataStr = JSON.stringify(processedData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_chart_data.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [onExport, processedData, title]);

  // Handle share
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(processedData);
    } else if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title}: ${processedData.length} data points`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${title}: ${processedData.length} data points`);
    }
  }, [onShare, processedData, title]);

  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <LineChartComponent data={processedData} onPointClick={handlePointClick} onHover={setHoveredPoint} />;
      case 'bar':
        return <BarChartComponent data={processedData} onPointClick={handlePointClick} onHover={setHoveredPoint} />;
      case 'pie':
        return <PieChartComponent data={processedData} onPointClick={handlePointClick} onHover={setHoveredPoint} />;
      case 'area':
        return <AreaChartComponent data={processedData} onPointClick={handlePointClick} onHover={setHoveredPoint} />;
      default:
        return <LineChartComponent data={processedData} onPointClick={handlePointClick} onHover={setHoveredPoint} />;
    }
  };

  // Render legend
  const renderLegend = () => {
    if (!showLegend) return null;
    
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {processedData.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => handlePointClick(item)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-black">{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading chart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600 mb-2">Chart Error</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart type selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {chartTypes.map((chartTypeOption) => (
                <button
                  key={chartTypeOption.key}
                  onClick={() => setChartType(chartTypeOption.key)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    chartType === chartTypeOption.key
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  title={chartTypeOption.label}
                >
                  {React.createElement(chartTypeOption.icon, { className: 'w-4 h-4' })}
                </button>
              ))}
            </div>
            
            {/* Action buttons */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {refreshable && onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Settings"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {/* Settings dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-10 w-48 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10"
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Chart content */}
      <div className="p-4">
        <div style={chartDimensions} className="relative">
          {animate ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderChart()}
            </motion.div>
          ) : (
            renderChart()
          )}
          
          {/* Hover tooltip */}
          {showTooltip && hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-black text-white text-xs rounded-lg px-2 py-1 pointer-events-none z-10"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 40
              }}
            >
              <div className="font-medium">{hoveredPoint.label}</div>
              <div>Value: {hoveredPoint.value}</div>
            </motion.div>
          )}
        </div>

        {/* Legend */}
        {renderLegend()}

        {/* Details panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t-2 border-gray-200"
            >
              <h4 className="text-sm font-medium text-gray-700 mb-3">Chart Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Data Points:</span>
                  <span className="ml-2 font-medium">{processedData.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Value:</span>
                  <span className="ml-2 font-medium">
                    {processedData.reduce((sum, item) => sum + item.value, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Average:</span>
                  <span className="ml-2 font-medium">
                    {(processedData.reduce((sum, item) => sum + item.value, 0) / processedData.length).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Chart Type:</span>
                  <span className="ml-2 font-medium capitalize">{chartType}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Chart components
const LineChartComponent = ({ data, onPointClick, onHover }) => (
  <div className="h-full flex items-end justify-between space-x-1">
    {data.map((point, index) => {
      const maxValue = Math.max(...data.map(d => d.value));
      const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
      
      return (
        <div
          key={point.id}
          className="flex-1 flex flex-col items-center group cursor-pointer"
          onClick={() => onPointClick(point)}
          onMouseEnter={() => onHover({ ...point, x: index * 20, y: height })}
          onMouseLeave={() => onHover(null)}
        >
          <div className="w-full bg-blue-200 rounded-t transition-all duration-200 hover:bg-blue-300 group-hover:bg-blue-400"
               style={{ height: `${height}%` }} />
          <div className="text-xs text-gray-600 mt-1 text-center">{point.label}</div>
        </div>
      );
    })}
  </div>
);

const BarChartComponent = ({ data, onPointClick, onHover }) => (
  <div className="h-full flex items-end justify-between space-x-1">
    {data.map((point, index) => {
      const maxValue = Math.max(...data.map(d => d.value));
      const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
      
      return (
        <div
          key={point.id}
          className="flex-1 flex flex-col items-center group cursor-pointer"
          onClick={() => onPointClick(point)}
          onMouseEnter={() => onHover({ ...point, x: index * 20, y: height })}
          onMouseLeave={() => onHover(null)}
        >
          <div className="w-full bg-green-200 rounded-t transition-all duration-200 hover:bg-green-300 group-hover:bg-green-400"
               style={{ height: `${height}%` }} />
          <div className="text-xs text-gray-600 mt-1 text-center">{point.label}</div>
        </div>
      );
    })}
  </div>
);

const PieChartComponent = ({ data, onPointClick, onHover }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
        {data.map((point, index) => {
          const percentage = total > 0 ? point.value / total : 0;
          const angle = percentage * 360;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const x1 = 100 + 80 * Math.cos(currentAngle * Math.PI / 180);
          const y1 = 100 + 80 * Math.sin(currentAngle * Math.PI / 180);
          const x2 = 100 + 80 * Math.cos((currentAngle + angle) * Math.PI / 180);
          const y2 = 100 + 80 * Math.sin((currentAngle + angle) * Math.PI / 180);
          
          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle += angle;
          
          return (
            <path
              key={point.id}
              d={pathData}
              fill={point.color}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => onPointClick(point)}
              onMouseEnter={() => onHover(point)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </svg>
    </div>
  );
};

const AreaChartComponent = ({ data, onPointClick, onHover }) => (
  <div className="h-full flex items-end justify-between space-x-1">
    {data.map((point, index) => {
      const maxValue = Math.max(...data.map(d => d.value));
      const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
      
      return (
        <div
          key={point.id}
          className="flex-1 flex flex-col items-center group cursor-pointer"
          onClick={() => onPointClick(point)}
          onMouseEnter={() => onHover({ ...point, x: index * 20, y: height })}
          onMouseLeave={() => onHover(null)}
        >
          <div className="w-full bg-purple-200 rounded-t transition-all duration-200 hover:bg-purple-300 group-hover:bg-purple-400"
               style={{ height: `${height}%` }} />
          <div className="text-xs text-gray-600 mt-1 text-center">{point.label}</div>
        </div>
      );
    })}
  </div>
);

export default EnhancedChart;
