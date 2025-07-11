import domainsSlice, {
  fetchDomains,
  createDomain,
  setDomains,
  setSelectedDomain,
  setLoading,
  setError
} from '../../store/slices/domainsSlice';
import { configureStore } from '@reduxjs/toolkit';
import mockAPI from '../../services/mockAPI';

// Mock the API
jest.mock('../../services/mockAPI');

describe('domainsSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        domains: domainsSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    test('should have correct initial state', () => {
      const state = store.getState().domains;
      expect(state).toEqual({
        domains: [],
        selectedDomain: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('synchronous actions', () => {
    test('setDomains should update domains array', () => {
      const mockDomains = [
        { id: '1', domain: 'example.com', status: 'verified' },
        { id: '2', domain: 'test.com', status: 'pending' },
      ];

      store.dispatch(setDomains(mockDomains));

      const state = store.getState().domains;
      expect(state.domains).toEqual(mockDomains);
    });

    test('setSelectedDomain should update selected domain', () => {
      const mockDomain = { id: '1', domain: 'example.com', status: 'verified' };

      store.dispatch(setSelectedDomain(mockDomain));

      const state = store.getState().domains;
      expect(state.selectedDomain).toEqual(mockDomain);
    });

    test('setLoading should update loading state', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().domains.loading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().domains.loading).toBe(false);
    });

    test('setError should update error state', () => {
      const errorMessage = 'Something went wrong';
      store.dispatch(setError(errorMessage));

      const state = store.getState().domains;
      expect(state.error).toBe(errorMessage);
    });

    test('setError with null should clear error', () => {
      // Set error first
      store.dispatch(setError('Some error'));
      expect(store.getState().domains.error).toBe('Some error');

      // Clear error
      store.dispatch(setError(null));
      expect(store.getState().domains.error).toBeNull();
    });
  });

  describe('fetchDomains async thunk', () => {
    const mockDomains = [
      {
        id: '1',
        domain: 'example.com',
        status: 'verified',
        trafficCount: 15420,
        botCount: 2341,
        revenue: 4200.50,
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        domain: 'test.com',
        status: 'pending',
        trafficCount: 0,
        botCount: 0,
        revenue: 0,
        createdAt: '2024-01-20T14:15:00Z',
      },
    ];

    test('should handle successful domain fetch', async () => {
      mockAPI.getDomains.mockResolvedValue({
        data: { domains: mockDomains },
      });

      await store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.domains).toEqual(mockDomains);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockAPI.getDomains).toHaveBeenCalledTimes(1);
    });

    test('should handle domain fetch failure', async () => {
      const errorMessage = 'Network error';
      mockAPI.getDomains.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.domains).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    test('should set loading state during fetch', () => {
      mockAPI.getDomains.mockImplementation(() => new Promise(() => {})); // Never resolves

      store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('should handle fetch with default error message', async () => {
      mockAPI.getDomains.mockRejectedValue(new Error()); // Error without message

      await store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.error).toBe('Failed to fetch domains');
    });
  });

  describe('createDomain async thunk', () => {
    const newDomainData = {
      domain: 'newdomain.com',
      category: 'business',
    };

    const createdDomain = {
      id: '3',
      domain: 'newdomain.com',
      status: 'pending',
      trafficCount: 0,
      botCount: 0,
      revenue: 0,
      createdAt: '2024-01-25T10:30:00Z',
    };

    test('should handle successful domain creation', async () => {
      mockAPI.createDomain.mockResolvedValue({
        data: { domain: createdDomain },
      });

      await store.dispatch(createDomain(newDomainData));

      const state = store.getState().domains;
      expect(state.domains).toContainEqual(createdDomain);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockAPI.createDomain).toHaveBeenCalledWith(newDomainData);
    });

    test('should handle domain creation failure', async () => {
      const errorMessage = 'Domain already exists';
      mockAPI.createDomain.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createDomain(newDomainData));

      const state = store.getState().domains;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      
      // Domain should not be added on failure
      expect(state.domains.find(d => d.domain === 'newdomain.com')).toBeUndefined();
    });

    test('should set loading state during creation', () => {
      mockAPI.createDomain.mockImplementation(() => new Promise(() => {})); // Never resolves

      store.dispatch(createDomain(newDomainData));

      const state = store.getState().domains;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('should add new domain to existing domains list', async () => {
      // Set up initial domains
      const existingDomains = [
        { id: '1', domain: 'existing.com', status: 'verified' },
      ];
      store.dispatch(setDomains(existingDomains));

      mockAPI.createDomain.mockResolvedValue({
        data: { domain: createdDomain },
      });

      await store.dispatch(createDomain(newDomainData));

      const state = store.getState().domains;
      expect(state.domains).toHaveLength(2);
      expect(state.domains).toContainEqual(existingDomains[0]);
      expect(state.domains).toContainEqual(createdDomain);
    });

    test('should handle creation with default error message', async () => {
      mockAPI.createDomain.mockRejectedValue(new Error()); // Error without message

      await store.dispatch(createDomain(newDomainData));

      const state = store.getState().domains;
      expect(state.error).toBe('Failed to create domain');
    });
  });

  describe('edge cases and state management', () => {
    test('should handle multiple concurrent fetch requests', async () => {
      const domains1 = [{ id: '1', domain: 'first.com' }];
      const domains2 = [{ id: '2', domain: 'second.com' }];

      mockAPI.getDomains
        .mockResolvedValueOnce({ data: { domains: domains1 } })
        .mockResolvedValueOnce({ data: { domains: domains2 } });

      // Dispatch two fetch requests simultaneously
      const [result1, result2] = await Promise.all([
        store.dispatch(fetchDomains()),
        store.dispatch(fetchDomains()),
      ]);

      expect(result1.type).toBe('domains/fetchDomains/fulfilled');
      expect(result2.type).toBe('domains/fetchDomains/fulfilled');

      // The last resolved request should win
      const state = store.getState().domains;
      expect(state.loading).toBe(false);
    });

    test('should maintain state consistency during error scenarios', async () => {
      // Set initial successful state
      const initialDomains = [{ id: '1', domain: 'success.com' }];
      store.dispatch(setDomains(initialDomains));

      // Trigger an error
      mockAPI.createDomain.mockRejectedValue(new Error('Creation failed'));
      await store.dispatch(createDomain({ domain: 'fail.com' }));

      const state = store.getState().domains;
      expect(state.domains).toEqual(initialDomains); // Should not be modified
      expect(state.error).toBe('Creation failed');
      expect(state.loading).toBe(false);
    });

    test('should clear error when new successful request is made', async () => {
      // Set initial error state
      store.dispatch(setError('Previous error'));
      expect(store.getState().domains.error).toBe('Previous error');

      // Make successful request
      mockAPI.getDomains.mockResolvedValue({
        data: { domains: [{ id: '1', domain: 'success.com' }] },
      });

      await store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.error).toBeNull();
      expect(state.domains).toHaveLength(1);
    });

    test('should handle null/undefined payloads gracefully', () => {
      store.dispatch(setDomains(null));
      expect(store.getState().domains.domains).toBeNull();

      store.dispatch(setSelectedDomain(undefined));
      expect(store.getState().domains.selectedDomain).toBeUndefined();
    });

    test('should handle empty domains array', async () => {
      mockAPI.getDomains.mockResolvedValue({
        data: { domains: [] },
      });

      await store.dispatch(fetchDomains());

      const state = store.getState().domains;
      expect(state.domains).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('action creators', () => {
    test('should create correct action for setDomains', () => {
      const domains = [{ id: '1', domain: 'test.com' }];
      const action = setDomains(domains);

      expect(action).toEqual({
        type: 'domains/setDomains',
        payload: domains,
      });
    });

    test('should create correct action for setSelectedDomain', () => {
      const domain = { id: '1', domain: 'test.com' };
      const action = setSelectedDomain(domain);

      expect(action).toEqual({
        type: 'domains/setSelectedDomain',
        payload: domain,
      });
    });

    test('should create correct action for setLoading', () => {
      const action = setLoading(true);

      expect(action).toEqual({
        type: 'domains/setLoading',
        payload: true,
      });
    });

    test('should create correct action for setError', () => {
      const error = 'Test error';
      const action = setError(error);

      expect(action).toEqual({
        type: 'domains/setError',
        payload: error,
      });
    });
  });
});
