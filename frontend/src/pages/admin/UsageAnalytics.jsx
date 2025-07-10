import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const initialUsage = [
  { resource: 'API Calls', usage: 12000, limit: 20000 },
  { resource: 'Storage (GB)', usage: 80, limit: 100 },
];

const UsageAnalytics = () => {
  const [usage, setUsage] = useState(initialUsage);
  const [form, setForm] = useState({ resource: '', usage: '', limit: '' });
  const [editIdx, setEditIdx] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIdx !== null) {
      setUsage((prev) => prev.map((row, idx) => idx === editIdx ? { ...form } : row));
      setEditIdx(null);
    } else {
      setUsage((prev) => [{ ...form }, ...prev]);
    }
    setForm({ resource: '', usage: '', limit: '' });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...usage[idx] });
  };

  const handleDelete = (idx) => {
    setUsage((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <>
      <Helmet><title>Usage Analytics</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usage Analytics</h1>
        <p>Granular resource utilization, anomaly detection, and optimization UI will be implemented here.</p>
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
          <input className="input input-bordered" name="resource" placeholder="Resource" value={form.resource} onChange={handleChange} required />
          <input className="input input-bordered" name="usage" placeholder="Usage" type="number" value={form.usage} onChange={handleChange} required />
          <input className="input input-bordered" name="limit" placeholder="Limit" type="number" value={form.limit} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit">{editIdx !== null ? 'Update' : 'Add'} Resource</button>
          {editIdx !== null && <button className="btn btn-ghost" type="button" onClick={()=>{setEditIdx(null);setForm({ resource: '', usage: '', limit: '' });}}>Cancel</button>}
        </form>
        <table className="table w-full">
          <thead><tr><th>Resource</th><th>Usage</th><th>Limit</th><th>Percent</th><th>Actions</th></tr></thead>
          <tbody>
            {usage.map((row, idx) => (
              <tr key={row.resource}>
                <td>{row.resource}</td>
                <td>{Number(row.usage).toLocaleString()}</td>
                <td>{Number(row.limit).toLocaleString()}</td>
                <td>{row.limit ? Math.round((row.usage/row.limit)*100) : 0}%</td>
                <td>
                  <button className="btn btn-xs btn-secondary mr-1" onClick={()=>handleEdit(idx)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={()=>handleDelete(idx)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default UsageAnalytics;
