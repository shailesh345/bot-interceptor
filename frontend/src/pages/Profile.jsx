import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const Profile = () => {
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: 'Jane Doe', email: 'jane@example.com', organization: 'Acme Corp' });

  const handleEdit = () => setEditProfile(true);
  const handleCancel = () => setEditProfile(false);
  const handleChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    setEditProfile(false);
  };

  return (
    <>
      <Helmet>
        <title>Profile - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your personal information and account preferences.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {editProfile ? (
              <form onSubmit={handleSave} className="space-y-4 max-w-md mx-auto">
                <input className="input input-bordered w-full" name="name" value={profileForm.name} onChange={handleChange} />
                <input className="input input-bordered w-full" name="email" value={profileForm.email} onChange={handleChange} />
                <input className="input input-bordered w-full" name="organization" value={profileForm.organization} onChange={handleChange} />
                <div className="flex space-x-2">
                  <button className="btn btn-primary" type="submit">Save</button>
                  <button className="btn btn-ghost" type="button" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-center">
                <div><b>Name:</b> {profileForm.name}</div>
                <div><b>Email:</b> {profileForm.email}</div>
                <div><b>Organization:</b> {profileForm.organization}</div>
                <button className="btn btn-ghost mt-4" onClick={handleEdit}>Edit Profile</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
