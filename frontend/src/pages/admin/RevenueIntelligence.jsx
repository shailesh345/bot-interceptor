import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const initialCohorts = [
  { cohort: '2025-Q1', revenue: 5000, churn: '2%' },
  { cohort: '2025-Q2', revenue: 8000, churn: '1%' },
];

const RevenueIntelligence = () => {
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [form, setForm] = useState({ cohort: '', revenue: '', churn: '' });
  const [editIdx, setEditIdx] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIdx !== null) {
      setCohorts((prev) => prev.map((row, idx) => idx === editIdx ? { ...form } : row));
      setEditIdx(null);
    } else {
      setCohorts((prev) => [{ ...form }, ...prev]);
    }
    setForm({ cohort: '', revenue: '', churn: '' });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...cohorts[idx] });
  };

  const handleDelete = (idx) => {
    setCohorts((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <>
      <Helmet><title>Revenue Intelligence</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Revenue Intelligence</h1>
        <p>Revenue recognition, cohort analysis, churn prediction, and financial reporting UI will be implemented here.</p>
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
          <input className="input input-bordered" name="cohort" placeholder="Cohort (e.g. 2025-Q3)" value={form.cohort} onChange={handleChange} required />
          <input className="input input-bordered" name="revenue" placeholder="Revenue" type="number" value={form.revenue} onChange={handleChange} required />
          <input className="input input-bordered" name="churn" placeholder="Churn (e.g. 2%)" value={form.churn} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit">{editIdx !== null ? 'Update' : 'Add'} Cohort</button>
          {editIdx !== null && <button className="btn btn-ghost" type="button" onClick={()=>{setEditIdx(null);setForm({ cohort: '', revenue: '', churn: '' });}}>Cancel</button>}
        </form>
        <table className="table w-full">
          <thead><tr><th>Cohort</th><th>Revenue</th><th>Churn</th><th>Actions</th></tr></thead>
          <tbody>
            {cohorts.map((row, idx) => (
              <tr key={row.cohort}>
                <td>{row.cohort}</td>
                <td>${row.revenue}</td>
                <td>{row.churn}</td>
                <td>
                  <button className="btn btn-xs btn-secondary mr-1" onClick={()=>handleEdit(idx)}>Edit</button>
                  <button className="btn btn-xs btn-danger" onClick={()=>handleDelete(idx)}>Delete</button>
                </td>
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
};
export default RevenueIntelligence;
