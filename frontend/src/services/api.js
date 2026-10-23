// src/services/api.js
// Centralised API client — all fetch logic lives here.
// Reads the backend URL from the Vite environment variable VITE_API_BASE_URL.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  // For 204 No Content
  if (res.status === 204) return { success: true };

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server.');
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) Object.assign(headers, getAuthHeader());

  const config = { method, headers };
  if (body !== null) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, config);
    return handleResponse(res);
  } catch (err) {
    if (err.status) throw err; // Already formatted
    throw new Error('Cannot connect to server. Is the backend running?');
  }
}

// ─── Auth Endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => request('POST', '/api/auth/register', data),
  login:    (data) => request('POST', '/api/auth/login', data),
  me:       ()     => request('GET',  '/api/auth/me', null, true),
};

// ─── Task Endpoints ────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll:   (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request('GET', `/api/tasks${query ? `?${query}` : ''}`, null, true);
  },
  getById:  (id)   => request('GET',    `/api/tasks/${id}`, null, true),
  create:   (data) => request('POST',   '/api/tasks', data, true),
  update:   (id, data) => request('PUT', `/api/tasks/${id}`, data, true),
  delete:   (id)   => request('DELETE', `/api/tasks/${id}`, null, true),
};

// ─── Activity Endpoints ────────────────────────────────────────────────────────
export const activitiesAPI = {
  getRecent: (limit = 15) => request('GET', `/api/activities?limit=${limit}`, null, true),
};

