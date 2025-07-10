import React from 'react';
import { Helmet } from 'react-helmet-async';

const FeatureFlags = () => (
  <>
    <Helmet><title>Feature Flags</title></Helmet>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feature Flag Management</h1>
      <p>Feature rollout, A/B testing, and adoption analytics UI will be implemented here.</p>
    </div>
  </>
);
export default FeatureFlags;
