import mockAPI from '../../services/mockAPI';

describe('mockAPI service', () => {
  test('should have login function', () => {
    expect(typeof mockAPI.login).toBe('function');
  });

  test('should have register function', () => {
    expect(typeof mockAPI.register).toBe('function');
  });

  test('should have getDomains function', () => {
    expect(typeof mockAPI.getDomains).toBe('function');
  });

  test('login should return promise with correct structure', async () => {
    // Use valid demo credentials that match the mockAPI expectations
    const response = await mockAPI.login({ email: 'demo@example.com', password: 'password' });
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('access_token');
    expect(response.data).toHaveProperty('refresh_token');
    expect(response.data).toHaveProperty('user');
  });

  test('register should return promise with correct structure', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password',
      first_name: 'Test',
      last_name: 'User'
    };
    const response = await mockAPI.register(userData);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('access_token');
    expect(response.data).toHaveProperty('user');
  });

  test('getDomains should return array of domains', async () => {
    const response = await mockAPI.getDomains();
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('domains');
    expect(Array.isArray(response.data.domains)).toBe(true);
  });
});
