// src/utils/api.js - API Helper with Authentication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper to make authenticated requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // If token is expired, remove it and redirect to login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.reload(); // This will show login form
    return;
  }

  return response;
};

// Specific API methods
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response;
  },
  
  verify: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response;
  },
  
  logout: async () => {
    return await apiRequest('/auth/logout', { method: 'POST' });
  }
};

// Fix the washesAPI object in api.js - there's a missing closing brace:

export const washesAPI = {
  getAll: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return await apiRequest(`/washes${queryString ? `?${queryString}` : ''}`);
  },
  
  create: async (washData) => {
    return await apiRequest('/washes', {
      method: 'POST',
      body: JSON.stringify(washData)
    });
  },
  
  update: async (id, updateData) => {
    return await apiRequest(`/washes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },
  
  delete: async (id) => {
    return await apiRequest(`/washes/${id}`, { method: 'DELETE' });
  },
  
  // ✅ MOVED INSIDE the washesAPI object with proper comma
  finish: async (id) => {
    return await apiRequest(`/washes/${id}/finish`, {
      method: 'PATCH'
    });
  }
}; // ✅ ADDED MISSING CLOSING BRACE
export const statsAPI = {
  getDashboard: async () => {
    return await apiRequest('/stats');
  },
  
  getAnalytics: async () => {
    return await apiRequest('/analytics');
  },
  
  getInsights: async () => {
    return await apiRequest('/insights');
  }
};

export const uploadAPI = {
  photos: async (formData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Don't set Content-Type for FormData
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.reload();
      return;
    }
    
    return response;
  }
};

export default apiRequest;