import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('af_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  me: () => API.get('/auth/me'),
};

export const problemAPI = {
  list: (p) => API.get('/problems', { params: p }),
  get: (slug) => API.get(`/problems/${slug}`),
  categories: () => API.get('/problems/categories'),
};

export const submissionAPI = {
  submit: (d) => API.post('/submissions', d),
  forProblem: (id) => API.get(`/submissions/problem/${id}`),
  detail: (id) => API.get(`/submissions/${id}`),
  mine: (p) => API.get('/submissions/me', { params: p }),
};

export const executeAPI = {
  run: (d) => API.post('/execute/run', d),
};

export const adminAPI = {
  stats: () => API.get('/admin/stats'),
  problems: (p) => API.get('/admin/problems', { params: p }),
  problem: (id) => API.get(`/admin/problems/${id}`),
  createProblem: (d) => API.post('/admin/problems', d),
  updateProblem: (id, d) => API.put(`/admin/problems/${id}`, d),
  deleteProblem: (id) => API.delete(`/admin/problems/${id}`),
  users: (p) => API.get('/admin/users', { params: p }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  submissions: (p) => API.get('/admin/submissions', { params: p }),
};

export default API;
