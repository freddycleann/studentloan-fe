const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TOKEN_KEY = 'sl_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = getToken();
  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
function safeJson(t) { try { return JSON.parse(t); } catch { return null; } }

export const api = {
  health: () => request('/health'),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me'),
  updateMe: (patch) => request('/auth/me', { method: 'PATCH', body: patch }),

  years: {
    list: () => request('/years'),
    create: (year, note, checklist_url, checklist_public_id, checklist_type) => 
      request('/years', { method: 'POST', body: { year, note, checklist_url, checklist_public_id, checklist_type } }),
    get: (id) => request(`/years/${id}`),
    update: (id, patch) => request(`/years/${id}`, { method: 'PATCH', body: patch }),
    remove: (id) => request(`/years/${id}`, { method: 'DELETE' }),
    summary: (id) => request(`/years/${id}/summary`),
  },

  checklist: {
    list: (yearId) => request(`/checklist/year/${yearId}`),
    create: (yearId, item) => request(`/checklist/year/${yearId}`, { method: 'POST', body: item }),
    update: (id, patch) => request(`/checklist/${id}`, { method: 'PATCH', body: patch }),
    remove: (id) => request(`/checklist/${id}`, { method: 'DELETE' }),
    detachFile: (id) => request(`/checklist/${id}/detach-file`, { method: 'POST' }),
    templates: () => request('/checklist/templates'),
    seedTemplate: (yearId, template) =>
      request(`/checklist/year/${yearId}/seed-template`, { method: 'POST', body: { template } }),
    mergeAndDownload: async (yearId) => {
      const token = getToken();
      const res = await fetch(`${BASE}/checklist/year/${yearId}/merge-pdfs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(safeJson(text)?.error || 'Failed to merge');
      }
      return res.blob();
    },
  },

  volunteer: {
    list: (yearId) => request(`/volunteer/year/${yearId}`),
    create: (yearId, entry) => request(`/volunteer/year/${yearId}`, { method: 'POST', body: entry }),
    update: (id, patch) => request(`/volunteer/${id}`, { method: 'PATCH', body: patch }),
    remove: (id) => request(`/volunteer/${id}`, { method: 'DELETE' }),
    mergeAndDownload: async (yearId) => {
      const token = getToken();
      const res = await fetch(`${BASE}/volunteer/year/${yearId}/merge-pdfs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(safeJson(text)?.error || 'Failed to merge');
      }
      return res.blob();
    },
  },

  upload: (file, folder) => {
    const fd = new FormData();
    fd.append('file', file);
    if (folder) fd.append('folder', folder);
    return request('/upload', { method: 'POST', body: fd, isForm: true });
  },

  admin: {
    listUsers: () => request('/admin/users'),
    createUser: (payload) => request('/admin/users', { method: 'POST', body: payload }),
    updateUser: (id, patch) => request(`/admin/users/${id}`, { method: 'PATCH', body: patch }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  },
};
