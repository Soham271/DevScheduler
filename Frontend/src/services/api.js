const API_BASE = 'http://localhost:8080';

/**
 * Make a request and parse the JSON response, throwing on errors
 */
const request = async (method, endpoint, data = null, auth = false) => {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found. Please log in.');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
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
    throw new Error((result && result.error) || `API request failed (${response.status})`);
  }

  return result;
};

export const api = {
  // ─── Public (no auth) ──────────────────────
  post: (endpoint, data) => request('POST', endpoint, data, false),
  get: (endpoint) => request('GET', endpoint, null, false),

  // ─── Authenticated ─────────────────────────
  postAuth: (endpoint, data) => request('POST', endpoint, data, true),
  getAuth: (endpoint) => request('GET', endpoint, null, true),
  putAuth: (endpoint, data) => request('PUT', endpoint, data, true),

  // ─── Convenience helpers ───────────────────

  /** Verify a LeetCode username by calling analyze (returns profile data or throws) */
  verifyLeetcodeUser: async (username) => {
    return request('POST', `/analyze/leetcode/${encodeURIComponent(username)}`, null, true);
  },

  /** Save user profile (LeetCode + CodeChef usernames) */
  saveProfile: async (data) => {
    return request('POST', '/user/profile', data, true);
  },

  analyzeUser: async (platform, username) => {
    return request('POST', `/analyze/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`, null, true);
  },

  registerUser: async (platform, username, email) => {
    return request(
      'POST',
      `/register/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`,
      { email },
      true
    );
  },

  scheduleEmail: async (data) => {
    return request('POST', '/schedule-email', data, true);
  },

  sendEmail: async (data) => {
    return request('POST', '/send-email', data, true);
  },

  getRegisteredUsers: async () => {
    return request('GET', '/users', null, false);
  },

  getContests: async (platform = 'all') => {
    return request('GET', `/contests/${encodeURIComponent(platform)}`, null, false);
  },

  checkHealth: async () => {
    return request('GET', '/health', null, false);
  },
};
