import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockCohorts = [
  { cohort: '2025-Q1', revenue: 5000, churn: '2%' },
  { cohort: '2025-Q2', revenue: 8000, churn: '1%' },
];

const RevenueIntelligence = () => (
  <>
    <Helmet><title>Revenue Intelligence</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenue Intelligence</h1>
      <p>Revenue recognition, cohort analysis, churn prediction, and financial reporting UI will be implemented here.</p>
      <table className="table w-full">
        <thead><tr><th>Cohort</th><th>Revenue</th><th>Churn</th></tr></thead>
        <tbody>
          {mockCohorts.map(row => (
            <tr key={row.cohort}>
              <td>{row.cohort}</td><td>${row.revenue}</td><td>{row.churn}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <b>Churn Prediction:</b> <span className="badge badge-warning">Low risk</span>
      </div>
    </div>
  </>
);
export default RevenueIntelligence;
