// src/utils/api.js
/**
 * API utility for making authenticated requests
 */

// Base API URL - automatically adapts to environment
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Debug logging - TEMPORARY
console.log('🔍 API_URL being used:', API_URL);
console.log('🔍 Environment variable:', process.env.REACT_APP_API_URL);
console.log('🔍 All REACT_APP_ env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));

/**
 * Makes an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // Handle both absolute URLs (Railway) and relative URLs (local)
  const url = API_URL.startsWith('http') 
    ? `${API_URL}${endpoint}` 
    : `${API_URL}${endpoint}`;
  
  // Debug the actual URL being called
  console.log('🌐 Making API request to:', url);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle expired token or unauthorized access
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'An error occurred with the request');
    }
    
    // For non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Common API request methods
export const get = (endpoint) => apiRequest(endpoint, { method: 'GET' });

export const post = (endpoint, data) => apiRequest(endpoint, { 
  method: 'POST',
  body: JSON.stringify(data)
});

export const put = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });