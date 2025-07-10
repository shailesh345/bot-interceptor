import React from 'react';
import { Helmet } from 'react-helmet-async';

const TenantManagement = () => (
  <>
    <Helmet><title>Tenant Management</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tenant Management</h1>
      <p>Tenant isolation, quota enforcement, and performance management UI will be implemented here.</p>
    </div>
  </>
);
export default TenantManagement;
