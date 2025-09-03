import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Zap,
  Eye,
  Bot,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Brain
} from 'lucide-react';
import EnhancedDashboardWidget from '../components/dashboard/EnhancedDashboardWidget';
import EnhancedDataTable from '../components/ui/EnhancedDataTable';
import EnhancedChart from '../components/charts/EnhancedChart';
import EnhancedNotificationCenter from '../components/notifications/EnhancedNotificationCenter';

const EnhancedComponentsDemo = () => {
  const [activeTab, setActiveTab] = useState('widgets');
  const [selectedData, setSelectedData] = useState([]);

  // Sample data for widgets
  const widgetData = [
    {
      title: 'Active Rules',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-blue-500',
      description: 'Security rules protecting your domains',
      data: [
        { label: 'Mon', value: 20 },
        { label: 'Tue', value: 22 },
        { label: 'Wed', value: 24 },
        { label: 'Thu', value: 23 },
        { label: 'Fri', value: 25 },
        { label: 'Sat', value: 24 },
        { label: 'Sun', value: 24 }
      ],
      chartType: 'line',
      priority: 'normal',
      status: 'active'
    },
    {
      title: 'Protected Domains',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Globe,
      color: 'bg-green-500',
      description: 'Domains under protection',
      data: [
        { label: 'Jan', value: 5 },
        { label: 'Feb', value: 6 },
        { label: 'Mar', value: 7 },
        { label: 'Apr', value: 8 }
      ],
      chartType: 'bar',
      priority: 'low',
      status: 'active'
    },
    {
      title: 'Traffic Blocked',
      value: '2.4K',
      change: '+18%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-orange-500',
      description: 'Malicious requests blocked today',
      data: [
        { label: '00:00', value: 150 },
        { label: '04:00', value: 200 },
        { label: '08:00', value: 300 },
        { label: '12:00', value: 450 },
        { label: '16:00', value: 380 },
        { label: '20:00', value: 280 }
      ],
      chartType: 'area',
      priority: 'high',
      status: 'warning'
    },
    {
      title: 'System Health',
      value: '98%',
      change: '+2%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      description: 'Overall system performance',
      data: [
        { label: 'CPU', value: 85 },
        { label: 'RAM', value: 72 },
        { label: 'Disk', value: 45 },
        { label: 'Network', value: 98 }
      ],
      chartType: 'bar',
      priority: 'normal',
      status: 'active'
    }
  ];

  // Sample data for data table
  const tableData = [
    { id: 1, name: 'example.com', status: 'active', traffic: '1.2M', blocked: 234, lastSeen: '2024-01-15T10:30:00Z' },
    { id: 2, name: 'api.example.com', status: 'active', traffic: '890K', blocked: 156, lastSeen: '2024-01-15T10:25:00Z' },
    { id: 3, name: 'blog.example.com', status: 'inactive', traffic: '450K', blocked: 89, lastSeen: '2024-01-15T09:45:00Z' },
    { id: 4, name: 'shop.example.com', status: 'active', traffic: '2.1M', blocked: 445, lastSeen: '2024-01-15T10:28:00Z' },
    { id: 5, name: 'admin.example.com', status: 'suspended', traffic: '120K', blocked: 67, lastSeen: '2024-01-15T08:15:00Z' }
  ];

  const tableColumns = [
    { key: 'name', label: 'Domain Name', sortable: true, filterable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true, filterable: true },
    { key: 'traffic', label: 'Traffic', sortable: true, filterable: true },
    { key: 'blocked', label: 'Blocked', sortable: true, filterable: true },
    { key: 'lastSeen', label: 'Last Seen', type: 'datetime', sortable: true, filterable: true }
  ];

  // Sample data for charts
  const chartData = [
    { label: 'Bot Traffic', value: 35, color: '#EF4444' },
    { label: 'Human Traffic', value: 45, color: '#10B981' },
    { label: 'API Calls', value: 20, color: '#3B82F6' }
  ];

  const lineChartData = [
    { label: '00:00', value: 1200 },
    { label: '04:00', value: 800 },
    { label: '08:00', value: 2100 },
    { label: '12:00', value: 3500 },
    { label: '16:00', value: 2800 },
    { label: '20:00', value: 1800 },
    { label: '24:00', value: 1100 }
  ];

  // Handle table row click
  const handleRowClick = useCallback((row) => {
    console.log('Row clicked:', row);
  }, []);

  // Handle table selection change
  const handleSelectionChange = useCallback((selectedIds) => {
    setSelectedData(selectedIds);
    console.log('Selected rows:', selectedIds);
  }, []);

  // Handle table export
  const handleTableExport = useCallback((data) => {
    console.log('Exporting data:', data);
  }, []);

  // Handle chart point click
  const handleChartPointClick = useCallback((point) => {
    console.log('Chart point clicked:', point);
  }, []);

  // Handle chart export
  const handleChartExport = useCallback((data) => {
    console.log('Exporting chart data:', data);
  }, []);

  const tabs = [
    { id: 'widgets', label: 'Dashboard Widgets', icon: BarChart3 },
    { id: 'table', label: 'Data Table', icon: LineChart },
    { id: 'charts', label: 'Charts', icon: PieChart },
    { id: 'notifications', label: 'Notifications', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Enhanced Components Demo</h1>
          <p className="text-gray-600">Showcasing the enhanced frontend components with advanced features</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white border-2 border-gray-200 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                {React.createElement(tab.icon, { className: 'w-4 h-4' })}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'widgets' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Enhanced Dashboard Widgets</h2>
                  <p className="text-gray-600 mb-6">
                    Interactive widgets with charts, priority indicators, and expandable details.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {widgetData.map((widget, index) => (
                      <EnhancedDashboardWidget
                        key={index}
                        {...widget}
                        isExpandable={true}
                        onRefresh={() => console.log(`Refreshing ${widget.title}`)}
                        onExport={() => console.log(`Exporting ${widget.title} data`)}
                        onShare={() => console.log(`Sharing ${widget.title}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'table' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Enhanced Data Table</h2>
                  <p className="text-gray-600 mb-6">
                    Advanced data table with sorting, filtering, pagination, and row selection.
                  </p>
                  
                  <EnhancedDataTable
                    data={tableData}
                    columns={tableColumns}
                    pageSize={5}
                    selectable={true}
                    onRowClick={handleRowClick}
                    onSelectionChange={handleSelectionChange}
                    onExport={handleTableExport}
                    onRefresh={() => console.log('Refreshing table data')}
                  />
                  
                  {selectedData.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {selectedData.length} row(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Enhanced Charts</h2>
                  <p className="text-gray-600 mb-6">
                    Interactive charts with multiple types, tooltips, and export capabilities.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EnhancedChart
                      data={chartData}
                      type="pie"
                      title="Traffic Distribution"
                      subtitle="Bot vs Human vs API traffic"
                      height={300}
                      onPointClick={handleChartPointClick}
                      onExport={handleChartExport}
                      onShare={() => console.log('Sharing chart')}
                    />
                    
                    <EnhancedChart
                      data={lineChartData}
                      type="line"
                      title="Traffic Over Time"
                      subtitle="24-hour traffic pattern"
                      height={300}
                      onPointClick={handleChartPointClick}
                      onExport={handleChartExport}
                      onShare={() => console.log('Sharing chart')}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Enhanced Notification Center</h2>
                  <p className="text-gray-600 mb-6">
                    Advanced notification system with filtering, search, and action handling.
                  </p>
                  
                  <div className="flex justify-center">
                    <EnhancedNotificationCenter />
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Features:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time notifications with priority indicators</li>
                      <li>• Advanced filtering by type and status</li>
                      <li>• Search functionality</li>
                      <li>• Action buttons for each notification</li>
                      <li>• Mark as read/unread functionality</li>
                      <li>• Responsive design with animations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Enhanced Components Demo • Built with React, Framer Motion, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComponentsDemo;
