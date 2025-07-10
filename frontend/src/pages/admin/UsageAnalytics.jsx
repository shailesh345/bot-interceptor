import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockUsage = [
  { resource: 'API Calls', usage: 12000, limit: 20000 },
  { resource: 'Storage (GB)', usage: 80, limit: 100 },
];

const UsageAnalytics = () => (
  <>
    <Helmet><title>Usage Analytics</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Usage Analytics</h1>
      <p>Granular resource utilization, anomaly detection, and optimization UI will be implemented here.</p>
      <table className="table w-full">
        <thead><tr><th>Resource</th><th>Usage</th><th>Limit</th><th>Percent</th></tr></thead>
        <tbody>
          {mockUsage.map(row => (
            <tr key={row.resource}>
              <td>{row.resource}</td>
              <td>{row.usage.toLocaleString()}</td>
              <td>{row.limit.toLocaleString()}</td>
              <td>{Math.round((row.usage/row.limit)*100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
export default UsageAnalytics;
