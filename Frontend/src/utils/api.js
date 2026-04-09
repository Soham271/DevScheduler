const API_BASE = 'http://localhost:8080';

export const api = {
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Check if the response is JSON, sometimes servers return string (like Gin can do c.String()) 
    // but the task assumes typical JSON endpoints.
    let result;
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error((result && result.error) || 'API request failed');
    }

    return result;
  },

  postAuth: async (endpoint, data) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    let result;
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error((result && result.error) || 'API request failed');
    }
    return result;
  }
};
