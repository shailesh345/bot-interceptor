import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockThreats = [
  { id: 1, type: 'Bot Attack', status: 'Blocked', time: '2025-07-10 14:00' },
  { id: 2, type: 'SQL Injection', status: 'Mitigated', time: '2025-07-10 13:45' },
];

const SecurityOperations = () => (
  <>
    <Helmet><title>Security Operations Center</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Operations Center</h1>
      <p>Threat detection, incident response, and compliance monitoring UI will be implemented here.</p>
      <table className="table w-full">
        <thead><tr><th>Type</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          {mockThreats.map(row => (
            <tr key={row.id}>
              <td>{row.type}</td><td>{row.status}</td><td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
export default SecurityOperations;
