import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const initialKPIs = [
  { label: 'MRR', value: '$12,000' },
  { label: 'Active Clients', value: 42 },
  { label: 'Churn Rate', value: '1.2%' },
];

const BIDashboard = () => {
  const [kpis, setKpis] = useState(initialKPIs);
  const [form, setForm] = useState({ label: '', value: '' });
  const [editIdx, setEditIdx] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIdx !== null) {
      setKpis((prev) => prev.map((row, idx) => idx === editIdx ? { ...form } : row));
      setEditIdx(null);
    } else {
      setKpis((prev) => [{ ...form }, ...prev]);
    }
    setForm({ label: '', value: '' });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...kpis[idx] });
  };

  const handleDelete = (idx) => {
    setKpis((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <>
      <Helmet><title>BI Dashboard</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Business Intelligence Dashboard</h1>
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
          <input className="input input-bordered" name="label" placeholder="KPI Label" value={form.label} onChange={handleChange} required />
          <input className="input input-bordered" name="value" placeholder="Value" value={form.value} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit">{editIdx !== null ? 'Update' : 'Add'} KPI</button>
          {editIdx !== null && <button className="btn btn-ghost" type="button" onClick={()=>{setEditIdx(null);setForm({ label: '', value: '' });}}>Cancel</button>}
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {kpis.map((kpi, idx) => (
            <div key={kpi.label} className="card">
              <div className="card-body text-center">
                <div className="text-lg font-bold">{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
                <div className="mt-2 flex justify-center gap-2">
                  <button className="btn btn-xs btn-secondary" onClick={()=>handleEdit(idx)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={()=>handleDelete(idx)}>Delete</button>
                </div>
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
};
export default BIDashboard;
