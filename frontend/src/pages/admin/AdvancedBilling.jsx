import React from 'react';
import { Helmet } from 'react-helmet-async';

const mockInvoices = [
  { id: 1, client: 'Acme Corp', amount: 1200, status: 'Paid', date: '2025-07-01' },
  { id: 2, client: 'Beta Inc', amount: 500, status: 'Due', date: '2025-07-05' },
];

const AdvancedBilling = () => (
  <>
    <Helmet><title>Advanced Billing</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Advanced Billing</h1>
      <p>Automated dunning, proration, multi-currency, and tax compliance UI will be implemented here.</p>
      <table className="table w-full">
        <thead><tr><th>Client</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {mockInvoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.client}</td><td>${inv.amount}</td><td>{inv.status}</td><td>{inv.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <b>Dunning Status:</b> <span className="badge badge-success">No outstanding dunning</span>
      </div>
    </div>
  </>
);
export default AdvancedBilling;
