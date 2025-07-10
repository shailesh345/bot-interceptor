import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockStats = [
  { metric: 'CPU Usage', value: '45%' },
  { metric: 'Memory Usage', value: '3.2 GB' },
  { metric: 'API Latency', value: '120ms' },
];

const SystemPerformance = () => (
  <>
    <Helmet><title>System Performance</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Performance</h1>
      <p>Real-time monitoring, APM, and resource utilization UI will be implemented here.</p>
      <table className="table w-full mb-6">
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          {mockStats.map(row => (
            <tr key={row.metric}>
              <td>{row.metric}</td><td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Real-time chart will be implemented here</p>
      </div>
    </div>
  </>
);
export default SystemPerformance;
