import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const mockClients = [
  { id: 1, name: 'Acme Corp', revenue: 12000, usage: 80, geography: 'US', industry: 'Media', stage: 'active' },
  { id: 2, name: 'Beta Inc', revenue: 5000, usage: 40, geography: 'UK', industry: 'E-commerce', stage: 'trial' },
  { id: 3, name: 'Gamma LLC', revenue: 0, usage: 0, geography: 'IN', industry: 'Education', stage: 'prospect' },
];

const stages = ['all', 'prospect', 'trial', 'active', 'at-risk', 'churned'];

const ClientManagement = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockClients : mockClients.filter(c => c.stage === filter);
  return (
    <>
      <Helmet><title>Client Management</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <p>Advanced client database, filtering, segmentation, and lifecycle management UI will be implemented here.</p>
        <div className="flex space-x-2 mb-4">
          {stages.map(s => (
            <button key={s} className={`btn btn-xs ${filter===s?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(s)}>{s}</button>
          ))}
        </div>
        <table className="table w-full">
          <thead>
            <tr><th>Name</th><th>Revenue</th><th>Usage</th><th>Geography</th><th>Industry</th><th>Stage</th></tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>${client.revenue.toLocaleString()}</td>
                <td>{client.usage}%</td>
                <td>{client.geography}</td>
                <td>{client.industry}</td>
                <td>{client.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default ClientManagement;
