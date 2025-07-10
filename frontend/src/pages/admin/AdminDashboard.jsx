import React from 'react'
import { Helmet } from 'react-helmet-async'

const AdminDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            System administration and platform management.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <p className="text-center text-gray-500 py-8">
              Admin dashboard will be implemented here
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
