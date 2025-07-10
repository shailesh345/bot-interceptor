import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const initialInvoices = [
  { id: 1, client: 'Acme Corp', amount: 1200, status: 'Paid', date: '2025-07-01' },
  { id: 2, client: 'Beta Inc', amount: 500, status: 'Due', date: '2025-07-05' },
];

const AdvancedBilling = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [form, setForm] = useState({ client: '', amount: '', status: 'Due', date: '' });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setInvoices((prev) => prev.map(inv => inv.id === editId ? { ...form, id: editId } : inv));
      setEditId(null);
    } else {
      setInvoices((prev) => [{ ...form, id: Date.now() }, ...prev]);
    }
    setForm({ client: '', amount: '', status: 'Due', date: '' });
  };

  const handleEdit = (inv) => {
    setEditId(inv.id);
    setForm({ client: inv.client, amount: inv.amount, status: inv.status, date: inv.date });
  };

  const handleDelete = (id) => {
    setInvoices((prev) => prev.filter(inv => inv.id !== id));
    if (editId === id) setEditId(null);
  };

  return (
    <>
      <Helmet><title>Advanced Billing</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Advanced Billing</h1>
        <p>Automated dunning, proration, multi-currency, and tax compliance UI will be implemented here.</p>
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
          <input className="input input-bordered" name="client" placeholder="Client" value={form.client} onChange={handleChange} required />
          <input className="input input-bordered" name="amount" placeholder="Amount" type="number" value={form.amount} onChange={handleChange} required />
          <select className="input input-bordered" name="status" value={form.status} onChange={handleChange}>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>
          <input className="input input-bordered" name="date" placeholder="Date" type="date" value={form.date} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit">{editId ? 'Update' : 'Add'} Invoice</button>
          {editId && <button className="btn btn-ghost" type="button" onClick={()=>{setEditId(null);setForm({ client: '', amount: '', status: 'Due', date: '' });}}>Cancel</button>}
        </form>
        <table className="table w-full">
          <thead><tr><th>Client</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.client}</td>
                <td>${inv.amount}</td>
                <td>{inv.status}</td>
                <td>{inv.date}</td>
                <td>
                  <button className="btn btn-xs btn-secondary mr-1" onClick={()=>handleEdit(inv)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={()=>handleDelete(inv.id)}>Delete</button>
                </td>
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
};
export default AdvancedBilling;
