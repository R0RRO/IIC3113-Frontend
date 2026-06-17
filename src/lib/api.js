const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'mingup_token';

let token = localStorage.getItem(TOKEN_KEY) || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return token;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// El backend guarda lat/lng sueltos; el front usa coordinates = [lat, lng]
const normZone = (z) => ({ ...z, coordinates: [z.lat, z.lng] });
const normReport = (r) => ({
  ...r,
  coordinates: r.lat != null && r.lng != null ? [r.lat, r.lng] : null,
});

export const api = {
  // ---- auth ----
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (data) => request('/auth/register', { method: 'POST', body: data, auth: false }),
  me: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/me', { method: 'PATCH', body: data }),
  myState: () => request('/reports/me/state'),
  setLocation: (lat, lng) => request('/auth/location', { method: 'POST', body: { lat, lng } }),
  updatePreferences: (prefs) => request('/auth/preferences', { method: 'PATCH', body: prefs }),

  // ---- users / perfiles ----
  getUser: (id) => request(`/users/${id}`),
  listUsers: () => request('/users'),
  suspendUser: (id, suspended) => request(`/users/${id}/suspend`, { method: 'PATCH', body: { suspended } }),

  // ---- zones ----
  zones: async () => (await request('/zones', { auth: false })).map(normZone),
  createZone: async (z) => normZone(await request('/zones', { method: 'POST', body: z })),
  updateZone: async (id, z) => normZone(await request(`/zones/${id}`, { method: 'PATCH', body: z })),
  deleteZone: (id) => request(`/zones/${id}`, { method: 'DELETE' }),

  // ---- reports ----
  reports: async () => (await request('/reports', { auth: false })).map(normReport),
  createReport: async (r) => normReport(await request('/reports', { method: 'POST', body: r })),
  updateReport: async (id, r) => normReport(await request(`/reports/${id}`, { method: 'PATCH', body: r })),
  deleteReport: (id) => request(`/reports/${id}`, { method: 'DELETE' }),
  vote: (id, direction, userLat, userLng) =>
    request(`/reports/${id}/vote`, { method: 'POST', body: { direction, userLat, userLng } }),
  enroll: (id) => request(`/reports/${id}/enroll`, { method: 'POST' }),
  unenroll: (id) => request(`/reports/${id}/enroll`, { method: 'DELETE' }),
  complete: (id) => request(`/reports/${id}/complete`, { method: 'POST' }),
  uncomplete: (id) => request(`/reports/${id}/complete`, { method: 'DELETE' }),
  comments: (id) => request(`/reports/${id}/comments`, { auth: false }),
  addComment: (id, body) => request(`/reports/${id}/comments`, { method: 'POST', body: { body } }),
  deleteComment: (id, commentId) => request(`/reports/${id}/comments/${commentId}`, { method: 'DELETE' }),

  // ---- notifications ----
  notifications: () => request('/notifications'),
  markNotifRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  deleteNotif: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  clearNotifs: () => request('/notifications', { method: 'DELETE' }),
};
