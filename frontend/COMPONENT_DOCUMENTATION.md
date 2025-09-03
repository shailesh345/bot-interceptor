# 🚀 Enhanced Frontend Components Documentation

This document provides comprehensive documentation for all enhanced frontend components, including usage examples, props, and best practices.

## 📋 Table of Contents

1. [Enhanced Notification Center](#enhanced-notification-center)
2. [Enhanced Dashboard Widget](#enhanced-dashboard-widget)
3. [Enhanced Data Table](#enhanced-data-table)
4. [Enhanced Chart](#enhanced-chart)
5. [Advanced Analytics Dashboard](#advanced-analytics-dashboard)
6. [Theme Switcher](#theme-switcher)
7. [Performance Monitor](#performance-monitor)
8. [WebSocket Service](#websocket-service)

---

## 🔔 Enhanced Notification Center

A comprehensive notification system with advanced filtering, search, and action handling.

### Features
- **Real-time notifications** with priority indicators
- **Advanced filtering** by type and status
- **Search functionality** across notification content
- **Action buttons** for each notification
- **Read/unread management** with bulk operations
- **Responsive design** with smooth animations

### Usage

```jsx
import EnhancedNotificationCenter from '../components/notifications/EnhancedNotificationCenter';

function App() {
  return (
    <div>
      <EnhancedNotificationCenter />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onNotificationAction` | `function` | - | Callback for notification actions |
| `onMarkAsRead` | `function` | - | Callback when marking as read |
| `onDelete` | `function` | - | Callback when deleting notification |

### Notification Types

- `security` - Security alerts and threats
- `performance` - Performance issues and warnings
- `system` - System updates and maintenance
- `success` - Successful operations
- `warning` - General warnings
- `info` - Informational messages

---

## 📊 Enhanced Dashboard Widget

Interactive dashboard widgets with charts, priority indicators, and expandable details.

### Features
- **Interactive charts** (line, bar, area) with hover effects
- **Priority and status indicators** with visual feedback
- **Expandable/collapsible** functionality
- **Export and share** capabilities
- **Refresh functionality** with loading states
- **Multiple chart types** and data visualization

### Usage

```jsx
import EnhancedDashboardWidget from '../components/dashboard/EnhancedDashboardWidget';
import { Shield, TrendingUp } from 'lucide-react';

function Dashboard() {
  const widgetData = {
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
      { label: 'Wed', value: 24 }
    ],
    chartType: 'line',
    priority: 'normal',
    status: 'active'
  };

  return (
    <EnhancedDashboardWidget
      {...widgetData}
      isExpandable={true}
      onRefresh={() => console.log('Refreshing widget')}
      onExport={() => console.log('Exporting data')}
      onShare={() => console.log('Sharing widget')}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Widget title |
| `value` | `string` | - | Main value display |
| `change` | `string` | - | Change indicator |
| `changeType` | `'positive' \| 'negative' \| 'neutral'` | `'neutral'` | Type of change |
| `icon` | `Component` | - | Icon component |
| `color` | `string` | `'bg-blue-500'` | Background color class |
| `description` | `string` | - | Widget description |
| `data` | `Array` | `[]` | Chart data array |
| `chartType` | `'line' \| 'bar' \| 'area'` | `'line'` | Chart type |
| `priority` | `'critical' \| 'high' \| 'normal' \| 'low'` | `'normal'` | Priority level |
| `status` | `'active' \| 'warning' \| 'error' \| 'offline'` | `'active'` | Status indicator |
| `isExpandable` | `boolean` | `false` | Enable expand/collapse |
| `isRefreshable` | `boolean` | `true` | Enable refresh button |
| `onRefresh` | `function` | - | Refresh callback |
| `onExport` | `function` | - | Export callback |
| `onShare` | `function` | - | Share callback |

---

## 📋 Enhanced Data Table

Advanced data table with sorting, filtering, pagination, and row selection.

### Features
- **Advanced sorting** with visual indicators
- **Column filtering** with search inputs
- **Pagination** with configurable page sizes
- **Row selection** with bulk operations
- **Export functionality** (CSV, JSON)
- **Search across all columns**
- **Responsive design** with horizontal scrolling

### Usage

```jsx
import EnhancedDataTable from '../components/ui/EnhancedDataTable';

function DataTableExample() {
  const data = [
    { id: 1, name: 'example.com', status: 'active', traffic: '1.2M' },
    { id: 2, name: 'api.example.com', status: 'active', traffic: '890K' }
  ];

  const columns = [
    { key: 'name', label: 'Domain Name', sortable: true, filterable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'traffic', label: 'Traffic', sortable: true, filterable: true }
  ];

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  const handleSelectionChange = (selectedIds) => {
    console.log('Selected rows:', selectedIds);
  };

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      pageSize={10}
      selectable={true}
      onRowClick={handleRowClick}
      onSelectionChange={handleSelectionChange}
      onExport={(data) => console.log('Exporting:', data)}
      onRefresh={() => console.log('Refreshing table')}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | `[]` | Table data array |
| `columns` | `Array` | `[]` | Column definitions |
| `pageSize` | `number` | `10` | Items per page |
| `searchable` | `boolean` | `true` | Enable search |
| `filterable` | `boolean` | `true` | Enable filtering |
| `sortable` | `boolean` | `true` | Enable sorting |
| `selectable` | `boolean` | `false` | Enable row selection |
| `onRowClick` | `function` | - | Row click callback |
| `onSelectionChange` | `function` | - | Selection change callback |
| `onExport` | `function` | - | Export callback |
| `onRefresh` | `function` | - | Refresh callback |

### Column Types

- `'string'` - Default text column
- `'number'` - Numeric column with proper sorting
- `'date'` - Date column with formatting
- `'datetime'` - DateTime column with formatting
- `'boolean'` - Boolean column with toggle display
- `'status'` - Status column with color coding

---

## 📈 Enhanced Chart

Interactive charts with multiple types, tooltips, and export capabilities.

### Features
- **Multiple chart types**: Line, Bar, Pie, Area
- **Interactive tooltips** on hover
- **Chart type switching** with visual controls
- **Export and share** functionality
- **Responsive design** with proper scaling
- **Customizable colors** and themes

### Usage

```jsx
import EnhancedChart from '../components/charts/EnhancedChart';

function ChartExample() {
  const data = [
    { label: 'Bot Traffic', value: 35, color: '#EF4444' },
    { label: 'Human Traffic', value: 45, color: '#10B981' },
    { label: 'API Calls', value: 20, color: '#3B82F6' }
  ];

  const handlePointClick = (point) => {
    console.log('Chart point clicked:', point);
  };

  return (
    <EnhancedChart
      data={data}
      type="pie"
      title="Traffic Distribution"
      subtitle="Bot vs Human vs API traffic"
      height={300}
      onPointClick={handlePointClick}
      onExport={(data) => console.log('Exporting chart data:', data)}
      onShare={() => console.log('Sharing chart')}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array` | `[]` | Chart data array |
| `type` | `'line' \| 'bar' \| 'pie' \| 'area'` | `'line'` | Chart type |
| `title` | `string` | `'Chart'` | Chart title |
| `subtitle` | `string` | `''` | Chart subtitle |
| `height` | `number` | `300` | Chart height |
| `width` | `string \| number` | `'100%'` | Chart width |
| `colors` | `Array` | `['#3B82F6', '#10B981', '#F59E0B']` | Color palette |
| `showLegend` | `boolean` | `true` | Show legend |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showTooltip` | `boolean` | `true` | Show tooltips |
| `animate` | `boolean` | `true` | Enable animations |
| `onPointClick` | `function` | - | Point click callback |
| `onExport` | `function` | - | Export callback |
| `onShare` | `function` | - | Share callback |

---

## 📊 Advanced Analytics Dashboard

Comprehensive data analysis with real-time updates and multiple chart types.

### Features
- **Real-time data updates** via WebSocket
- **Multiple time ranges** (1h, 24h, 7d, 30d, 90d)
- **Configurable metrics** selection
- **Interactive charts** with export capabilities
- **Performance scoring** and optimization suggestions
- **Responsive grid layout**

### Usage

```jsx
import AdvancedAnalyticsDashboard from '../components/analytics/AdvancedAnalyticsDashboard';

function AnalyticsPage() {
  return <AdvancedAnalyticsDashboard />;
}
```

### WebSocket Integration

The dashboard automatically connects to WebSocket service for real-time updates:

- `traffic_update` - Real-time traffic data
- `security_update` - Security metrics updates
- `performance_update` - Performance metrics updates

---

## 🎨 Theme Switcher

Comprehensive theme switching system with multiple themes and custom color support.

### Features
- **Multiple themes**: Light, Dark, System, High Contrast, Custom
- **System preference detection** for automatic switching
- **Custom color editor** with live preview
- **Theme preview** on hover
- **Persistent storage** of theme preferences
- **Accessibility support** with high contrast mode

### Usage

```jsx
import ThemeSwitcher from '../components/ui/ThemeSwitcher';

function Header() {
  const handleThemeChange = (themeId, themeData) => {
    console.log('Theme changed to:', themeId, themeData);
    // Apply theme to your application
  };

  return (
    <ThemeSwitcher onThemeChange={handleThemeChange} />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onThemeChange` | `function` | - | Theme change callback |
| `className` | `string` | `''` | Additional CSS classes |

### Available Themes

- **Light** - Clean white background with dark text
- **Dark** - Dark background with light text
- **System** - Follows system preference
- **High Contrast** - Maximum contrast for accessibility
- **Custom** - User-defined color scheme

---

## ⚡ Performance Monitor

Real-time system performance monitoring with alerts and optimization suggestions.

### Features
- **Real-time metrics** collection and display
- **Configurable alert thresholds** for all metrics
- **Performance scoring** with visual indicators
- **Optimization suggestions** based on current performance
- **Historical data tracking** with charts
- **Alert management** with severity levels

### Usage

```jsx
import PerformanceMonitor from '../components/performance/PerformanceMonitor';

function PerformancePage() {
  return <PerformanceMonitor />;
}
```

### Monitored Metrics

- **CPU Usage** - Processor utilization percentage
- **Memory Usage** - RAM utilization percentage
- **Disk Usage** - Storage utilization percentage
- **Network Latency** - Network response time
- **Response Time** - API response latency
- **Throughput** - Requests per second

### Alert Thresholds

All thresholds are configurable through the settings panel:

- CPU: 80% (default)
- Memory: 85% (default)
- Disk: 90% (default)
- Network: 75ms (default)
- Response Time: 1000ms (default)
- Throughput: 100 req/s (default)

---

## 🌐 WebSocket Service

Real-time communication service for live data updates and notifications.

### Features
- **Automatic reconnection** with exponential backoff
- **Event-based architecture** for easy integration
- **Authentication support** with token-based auth
- **Message handling** for different data types
- **Error handling** and logging
- **Connection status** monitoring

### Usage

```jsx
import webSocketService from '../services/websocket';

// Connect to WebSocket
webSocketService.connect();

// Subscribe to events
webSocketService.on('traffic_update', (data) => {
  console.log('Traffic update:', data);
});

webSocketService.on('notification', (notification) => {
  console.log('New notification:', notification);
});

// Send messages
webSocketService.send('request', { type: 'performance_metrics' });

// Subscribe to data streams
webSocketService.subscribe('traffic', { domain: 'example.com' });

// Get connection status
const status = webSocketService.getStatus(); // 'connected', 'connecting', 'disconnected'
```

### Event Types

- `connected` - WebSocket connection established
- `disconnected` - WebSocket connection lost
- `error` - WebSocket error occurred
- `notification` - New notification received
- `traffic_update` - Traffic data update
- `security_update` - Security metrics update
- `performance_update` - Performance metrics update
- `system_alert` - System alert received

### Message Types

- `auth` - Authentication message
- `request` - Data request
- `subscribe` - Subscribe to data stream
- `unsubscribe` - Unsubscribe from data stream

---

## 🎯 Best Practices

### 1. **Performance Optimization**
- Use `React.memo` for expensive components
- Implement `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Lazy load components when possible

### 2. **Accessibility**
- Provide proper ARIA labels
- Ensure keyboard navigation support
- Use semantic HTML elements
- Maintain color contrast ratios

### 3. **Responsive Design**
- Use Tailwind CSS responsive classes
- Test on multiple screen sizes
- Implement mobile-first design
- Use flexible layouts and grids

### 4. **Error Handling**
- Implement error boundaries
- Provide user-friendly error messages
- Log errors for debugging
- Graceful degradation for failures

### 5. **State Management**
- Use local state for component-specific data
- Implement proper loading states
- Handle async operations gracefully
- Provide optimistic updates when possible

---

## 🔧 Configuration

### Environment Variables

```bash
# WebSocket Configuration
REACT_APP_WS_URL=ws://localhost:8960/ws

# API Configuration
REACT_APP_API_URL=http://localhost:8960/api

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

### Theme Configuration

Themes can be customized by modifying the CSS custom properties:

```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-text: #111827;
  --color-border: #E5E7EB;
}
```

---

## 📚 Examples

### Complete Dashboard Example

```jsx
import React from 'react';
import EnhancedDashboardWidget from '../components/dashboard/EnhancedDashboardWidget';
import EnhancedChart from '../components/charts/EnhancedChart';
import EnhancedDataTable from '../components/ui/EnhancedDataTable';

function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedDashboardWidget
          title="Active Users"
          value="1,234"
          change="+12%"
          changeType="positive"
          icon={Users}
          color="bg-green-500"
          data={[/* chart data */]}
        />
        {/* More widgets... */}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedChart
          data={[/* traffic data */]}
          type="line"
          title="Traffic Over Time"
          height={300}
        />
        <EnhancedChart
          data={[/* user data */]}
          type="pie"
          title="User Distribution"
          height={300}
        />
      </div>

      {/* Data Table */}
      <EnhancedDataTable
        data={[/* table data */]}
        columns={[/* column definitions */]}
        pageSize={10}
        selectable={true}
      />
    </div>
  );
}
```

---

## 🚀 Future Enhancements

### Planned Features
1. **Advanced Chart Types** - Candlestick, radar, scatter plots
2. **Real-time Collaboration** - Multi-user editing and sharing
3. **Advanced Filtering** - Complex query builders
4. **Export Formats** - PDF, Excel, image export
5. **Mobile Apps** - React Native components
6. **Plugin System** - Extensible component architecture

### Contributing

To contribute to these components:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Ensure accessibility compliance
5. Test on multiple browsers and devices

---

## 📞 Support

For questions, issues, or contributions:

- **Documentation**: This file and inline code comments
- **Examples**: Check the demo pages and component files
- **Issues**: Report bugs and feature requests
- **Contributions**: Submit pull requests with improvements

---

*Last updated: January 2024*
*Version: 2.0.0*
