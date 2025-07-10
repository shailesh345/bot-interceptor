import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const Settings = () => {
  const [settings, setSettings] = useState({ theme: 'light', notifications: true });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <>
      <Helmet>
        <title>Settings - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure your account and application settings.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block mb-1">Theme</label>
                <select className="input input-bordered w-full" name="theme" value={settings.theme} onChange={handleChange}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} className="mr-2" />
                  Enable notifications
                </label>
              </div>
              <button className="btn btn-primary" type="button">Save Settings</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings
