// Extend mockAPI with user profile and admin data
const mockAPI = {
  // ...existing mockAPI methods...
  fetchUserProfile: async () => {
    return {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      organization: 'Acme Corp',
      createdAt: '2024-01-01',
    };
  },
  updateUserProfile: async (profileData) => {
    return { ...profileData };
  },
  fetchAdminData: async () => {
    return {
      users: [
        { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
        { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      ],
      settings: {
        allowSignups: true,
        maxTenants: 10,
      },
    };
  },
};

export default mockAPI;
