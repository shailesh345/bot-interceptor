import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const initialUsers = [
  { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
  { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [editId, setEditId] = useState(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', role: 'user' });

  const handleAdd = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: '', email: '', role: 'user' });
  };
  const handleEdit = (user) => {
    setEditId(user.id);
    setEditUser(user);
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editId ? { ...editUser, id: editId } : u));
    setEditId(null);
    setEditUser({ name: '', email: '', role: 'user' });
  };
  const handleDelete = (id) => setUsers(users.filter(u => u.id !== id));

  return (
    <>
      <Helmet>
        <title>Admin Users - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage system users and their permissions.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleAdd} className="flex space-x-2 mb-4">
              <input className="input input-bordered" placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              <input className="input input-bordered" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              <select className="input input-bordered" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn btn-primary" type="submit">Add</button>
            </form>
            <table className="table w-full">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{editId === user.id ? <input className="input input-bordered" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /> : user.name}</td>
                    <td>{editId === user.id ? <input className="input input-bordered" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} /> : user.email}</td>
                    <td>{editId === user.id ? <select className="input input-bordered" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select> : user.role}</td>
                    <td>
                      {editId === user.id ? (
                        <>
                          <button className="btn btn-primary btn-xs mr-2" onClick={handleUpdate}>Save</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-xs mr-2" onClick={() => handleEdit(user)}>Edit</button>
                          <button className="btn btn-error btn-xs" onClick={() => handleDelete(user.id)}>Delete</button>
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

export default AdminUsers
