import React, { useState, useEffect } from 'react';
import { login, apiRequest, isAuthenticated, getCurrentUser, logout } from '../utils/auth';

const TestAuth = () => {
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
      fetchDomains();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await login({
        username: 'admin',
        password: 'admin123'
      });
      setUser(getCurrentUser());
      fetchDomains();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const data = await apiRequest('http://127.0.0.1:9889/api/v1/domains');
      setDomains(data.domains || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setDomains([]);
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Test Authentication
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Click the button below to test login
            </p>
          </div>
          <div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Test Login'}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Authentication Test</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-lg font-medium text-green-800 mb-2">User Information</h3>
              <div className="text-sm text-green-700">
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Domains (API Test)</h3>
            {domains.length > 0 ? (
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div key={domain.id} className="p-3 border border-gray-200 rounded-md">
                    <p className="font-medium">{domain.domain_name}</p>
                    <p className="text-sm text-gray-600">Status: {domain.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No domains found</p>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">✅ Authentication Working!</h3>
            <p className="text-sm text-blue-700">
              The authentication system is working correctly. You can now access protected API endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
