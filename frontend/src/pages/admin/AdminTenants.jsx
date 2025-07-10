import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const initialTenants = [
  { id: 1, name: 'Acme Corp', domains: 3 },
  { id: 2, name: 'Beta Inc', domains: 1 },
];

const AdminTenants = () => {
  const [tenants, setTenants] = useState(initialTenants);
  const [newTenant, setNewTenant] = useState({ name: '', domains: 0 });
  const [editId, setEditId] = useState(null);
  const [editTenant, setEditTenant] = useState({ name: '', domains: 0 });

  const handleAdd = (e) => {
    e.preventDefault();
    setTenants([...tenants, { ...newTenant, id: Date.now() }]);
    setNewTenant({ name: '', domains: 0 });
  };
  const handleEdit = (tenant) => {
    setEditId(tenant.id);
    setEditTenant(tenant);
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    setTenants(tenants.map(t => t.id === editId ? { ...editTenant, id: editId } : t));
    setEditId(null);
    setEditTenant({ name: '', domains: 0 });
  };
  const handleDelete = (id) => setTenants(tenants.filter(t => t.id !== id));

  return (
    <>
      <Helmet>
        <title>Admin Tenants - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage tenant organizations and their configurations.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleAdd} className="flex space-x-2 mb-4">
              <input className="input input-bordered" placeholder="Tenant Name" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} />
              <input className="input input-bordered" type="number" placeholder="Domains" value={newTenant.domains} onChange={e => setNewTenant({ ...newTenant, domains: Number(e.target.value) })} />
              <button className="btn btn-primary" type="submit">Add</button>
            </form>
            <table className="table w-full">
              <thead>
                <tr><th>Name</th><th>Domains</th><th></th></tr>
              </thead>
              <tbody>
                {tenants.map(tenant => (
                  <tr key={tenant.id}>
                    <td>{editId === tenant.id ? <input className="input input-bordered" value={editTenant.name} onChange={e => setEditTenant({ ...editTenant, name: e.target.value })} /> : tenant.name}</td>
                    <td>{editId === tenant.id ? <input className="input input-bordered" type="number" value={editTenant.domains} onChange={e => setEditTenant({ ...editTenant, domains: Number(e.target.value) })} /> : tenant.domains}</td>
                    <td>
                      {editId === tenant.id ? (
                        <>
                          <button className="btn btn-primary btn-xs mr-2" onClick={handleUpdate}>Save</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-xs mr-2" onClick={() => handleEdit(tenant)}>Edit</button>
                          <button className="btn btn-error btn-xs" onClick={() => handleDelete(tenant.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminTenants
