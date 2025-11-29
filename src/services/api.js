/**
 * API Service - HTTP client for REST API
 * Provides methods for making API requests with error handling
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get headers for API requests
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText || 'An error occurred',
    }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  return response.json();
};

/**
 * API request wrapper
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(options.includeAuth !== false),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (name, email, password) => {
    return request('/auth/register', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ name, email, password }),
    });
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ email, password }),
    });
  },
};

/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get all users
   */
  getAll: async () => {
    return request('/users');
  },

  /**
   * Get current authenticated user
   */
  getCurrent: async () => {
    return request('/users/me');
  },

  /**
   * Get user by ID
   */
  getById: async (id) => {
    return request(`/users/${id}`);
  },

  /**
   * Update user
   */
  update: async (id, userData) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   */
  delete: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Health check API
 */
export const healthAPI = {
  /**
   * Check server health
   */
  check: async () => {
    const url = API_URL.replace('/api', '/health');
    const response = await fetch(url);
    return response.json();
  },
};

export default {
  authAPI,
  usersAPI,
  healthAPI,
};

