import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockKPIs = [
  { label: 'MRR', value: '$12,000' },
  { label: 'Active Clients', value: 42 },
  { label: 'Churn Rate', value: '1.2%' },
];

const BIDashboard = () => (
  <>
    <Helmet><title>BI Dashboard</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Business Intelligence Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {mockKPIs.map(kpi => (
          <div key={kpi.label} className="card">
            <div className="card-body text-center">
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-xs text-gray-500">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Custom chart will be implemented here</p>
      </div>
    </div>
  </>
);
export default BIDashboard;
